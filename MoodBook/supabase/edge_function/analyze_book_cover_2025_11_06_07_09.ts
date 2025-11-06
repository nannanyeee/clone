import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

interface AnalysisRequest {
  imageUrl: string;
  bookTitle?: string;
  author?: string;
}

interface EmotionAnalysis {
  happy: number;
  sad: number;
  calm: number;
  excited: number;
  tags: string[];
  summary: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { imageUrl, bookTitle, author }: AnalysisRequest = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze the book cover using OpenAI GPT-4 Vision
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `이 책 표지 이미지를 분석해주세요. 다음 정보를 JSON 형태로 제공해주세요:

1. OCR: 표지에서 읽을 수 있는 모든 텍스트 (제목, 저자명, 기타 텍스트)
2. 감정 분석: 표지의 색상, 디자인, 분위기를 바탕으로 다음 감정들의 점수를 0-1 사이로 평가
   - happy (행복, 기쁨, 밝음)
   - sad (슬픔, 우울, 어둠)
   - calm (평온, 차분, 안정)
   - excited (흥미진진, 역동적, 에너지)
3. 감정 태그: 이 책이 주는 감정적 느낌을 나타내는 한국어 태그들 (최대 5개)
4. 요약: 이 책 표지가 주는 전체적인 감정적 인상

응답은 반드시 다음 JSON 형식으로만 제공해주세요:
{
  "ocr_text": "추출된 텍스트",
  "emotions": {
    "happy": 0.0,
    "sad": 0.0,
    "calm": 0.0,
    "excited": 0.0
  },
  "tags": ["태그1", "태그2", "태그3"],
  "summary": "감정적 인상 요약"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    const analysisText = openaiResult.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis result from OpenAI');
    }

    // Parse the JSON response from OpenAI
    let analysisData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisText);
      throw new Error('Failed to parse analysis result');
    }

    // Find or create book in database
    let bookId = null;
    
    if (bookTitle) {
      // Try to find existing book
      const { data: existingBooks } = await supabase
        .from('books_2025_11_06_07_09')
        .select('id')
        .ilike('title', `%${bookTitle}%`)
        .limit(1);

      if (existingBooks && existingBooks.length > 0) {
        bookId = existingBooks[0].id;
      } else {
        // Create new book
        const { data: newBook, error: bookError } = await supabase
          .from('books_2025_11_06_07_09')
          .insert({
            title: bookTitle,
            author: author || null,
            cover_url: imageUrl,
            emotions: analysisData.emotions,
            emotion_tags: analysisData.tags
          })
          .select('id')
          .single();

        if (bookError) {
          console.error('Error creating book:', bookError);
        } else {
          bookId = newBook?.id;
        }
      }
    }

    // Save analysis result
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('book_analysis_2025_11_06_07_09')
      .insert({
        user_id: user.id,
        book_id: bookId,
        cover_image_url: imageUrl,
        ocr_text: analysisData.ocr_text,
        detected_emotions: analysisData.emotions,
        analysis_result: analysisData.summary
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error saving analysis:', analysisError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          ocr_text: analysisData.ocr_text,
          emotions: analysisData.emotions,
          tags: analysisData.tags,
          summary: analysisData.summary,
          book_id: bookId,
          analysis_id: analysisRecord?.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in analyze_book_cover:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});