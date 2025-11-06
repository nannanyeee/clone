import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

interface RecommendationRequest {
  emotion: string; // 'happy', 'sad', 'calm', 'excited'
  emotionScore?: number; // 1-10 scale
  limit?: number;
}

interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  emotions: Record<string, number>;
  emotion_tags: string[];
  similarity_score: number;
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

    const { emotion, emotionScore = 5, limit = 10 }: RecommendationRequest = await req.json();

    if (!emotion || !['happy', 'sad', 'calm', 'excited'].includes(emotion)) {
      throw new Error('Valid emotion is required (happy, sad, calm, excited)');
    }

    // Record user's emotion selection
    const { error: recordError } = await supabase
      .from('emotion_records_2025_11_06_07_09')
      .insert({
        user_id: user.id,
        emotion_type: emotion,
        emotion_score: emotionScore
      });

    if (recordError) {
      console.error('Error recording emotion:', recordError);
    }

    // Get all books from database
    const { data: books, error: booksError } = await supabase
      .from('books_2025_11_06_07_09')
      .select('*');

    if (booksError) {
      throw new Error(`Failed to fetch books: ${booksError.message}`);
    }

    if (!books || books.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          recommendations: [],
          message: 'No books found in database'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Calculate similarity scores based on emotion
    const recommendations: BookRecommendation[] = books
      .map(book => {
        const bookEmotions = book.emotions || {};
        const targetEmotionScore = bookEmotions[emotion] || 0;
        
        // Calculate similarity score
        // Higher score for books that match the target emotion
        // Also consider overall emotional balance
        let similarityScore = targetEmotionScore * 0.7; // Primary emotion weight
        
        // Add bonus for complementary emotions
        if (emotion === 'happy') {
          similarityScore += (bookEmotions.excited || 0) * 0.2;
          similarityScore += (bookEmotions.calm || 0) * 0.1;
        } else if (emotion === 'sad') {
          similarityScore += (bookEmotions.calm || 0) * 0.2;
          similarityScore -= (bookEmotions.happy || 0) * 0.1; // Reduce happy books for sad mood
        } else if (emotion === 'calm') {
          similarityScore += (bookEmotions.happy || 0) * 0.1;
          similarityScore -= (bookEmotions.excited || 0) * 0.1; // Reduce exciting books for calm mood
        } else if (emotion === 'excited') {
          similarityScore += (bookEmotions.happy || 0) * 0.2;
          similarityScore -= (bookEmotions.sad || 0) * 0.1; // Reduce sad books for excited mood
        }

        // Normalize score to 0-1 range
        similarityScore = Math.max(0, Math.min(1, similarityScore));

        return {
          id: book.id,
          title: book.title,
          author: book.author || '작가 미상',
          description: book.description || '',
          cover_url: book.cover_url || '',
          emotions: bookEmotions,
          emotion_tags: book.emotion_tags || [],
          similarity_score: Math.round(similarityScore * 100) / 100 // Round to 2 decimal places
        };
      })
      .filter(book => book.similarity_score > 0.1) // Filter out very low matches
      .sort((a, b) => b.similarity_score - a.similarity_score) // Sort by similarity score
      .slice(0, limit); // Limit results

    // Get user's emotion history for additional context
    const { data: emotionHistory } = await supabase
      .from('emotion_records_2025_11_06_07_09')
      .select('emotion_type, emotion_score, selected_at')
      .eq('user_id', user.id)
      .order('selected_at', { ascending: false })
      .limit(10);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        user_emotion: {
          current: emotion,
          score: emotionScore,
          history: emotionHistory || []
        },
        recommendation_info: {
          total_books: books.length,
          matched_books: recommendations.length,
          emotion_criteria: emotion
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in recommend_books:', error);
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