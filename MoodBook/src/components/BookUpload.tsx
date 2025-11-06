import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface BookUploadProps {
  onBack: () => void;
}

interface AnalysisResult {
  ocr_text: string;
  emotions: Record<string, number>;
  tags: string[];
  summary: string;
  book_id?: string;
  analysis_id?: string;
}

export const BookUpload = ({ onBack }: BookUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "파일 형식 오류",
          description: "이미지 파일만 업로드 가능합니다.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `book-covers/${fileName}`;

    const { data, error } = await supabase.storage
      .from('book-covers')
      .upload(filePath, file);

    if (error) {
      throw new Error(`이미지 업로드 실패: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const analyzeBookCover = async () => {
    if (!selectedFile || !user || !session) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Step 1: Upload image to Supabase Storage
      setProgress(25);
      const imageUrl = await uploadImageToSupabase(selectedFile);

      // Step 2: Call analysis edge function
      setProgress(50);
      const { data, error } = await supabase.functions.invoke('analyze_book_cover_2025_11_06_07_09', {
        body: {
          imageUrl,
          bookTitle: bookTitle || undefined,
          author: author || undefined
        }
      });

      setProgress(75);

      if (error) {
        throw new Error(error.message || '분석 중 오류가 발생했습니다.');
      }

      if (!data.success) {
        throw new Error(data.error || '분석에 실패했습니다.');
      }

      setProgress(100);
      setAnalysisResult(data.analysis);

      toast({
        title: "분석 완료",
        description: "책 표지 분석이 성공적으로 완료되었습니다.",
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 실패",
        description: error.message || "분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'text-yellow-600 bg-yellow-100';
      case 'sad': return 'text-blue-600 bg-blue-100';
      case 'calm': return 'text-green-600 bg-green-100';
      case 'excited': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEmotionLabel = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '행복';
      case 'sad': return '우울';
      case 'calm': return '평온';
      case 'excited': return '흥미진진';
      default: return emotion;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              책 표지 분석 기능을 사용하려면 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onBack} variant="outline">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="text-purple-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
            <h1 className="text-2xl font-bold text-purple-800">책 표지 분석</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!analysisResult ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-purple-600" />
                    이미지 업로드
                  </CardTitle>
                  <CardDescription>
                    분석할 책 표지 이미지를 업로드해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-600">
                          다른 이미지를 선택하려면 클릭하세요
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Image className="h-12 w-12 mx-auto text-purple-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-700">
                            이미지를 드래그하거나 클릭하여 업로드
                          </p>
                          <p className="text-sm text-gray-500">
                            JPG, PNG 파일 지원
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Book Info Section */}
              <Card>
                <CardHeader>
                  <CardTitle>도서 정보 (선택사항)</CardTitle>
                  <CardDescription>
                    더 정확한 분석을 위해 도서 정보를 입력해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="책 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">저자</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="저자명을 입력하세요"
                    />
                  </div>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-600">분석 중...</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}

                  <Button
                    onClick={analyzeBookCover}
                    disabled={!selectedFile || isAnalyzing}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        분석 시작
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Analysis Results */
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    분석 완료
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Image and OCR */}
                    <div className="space-y-4">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Analyzed book cover"
                          className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                        />
                      )}
                      {analysisResult.ocr_text && (
                        <div>
                          <h4 className="font-semibold mb-2">추출된 텍스트:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {analysisResult.ocr_text}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Emotions and Analysis */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">감정 분석 결과:</h4>
                        <div className="space-y-2">
                          {Object.entries(analysisResult.emotions).map(([emotion, score]) => (
                            <div key={emotion} className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getEmotionColor(emotion)}`}>
                                {getEmotionLabel(emotion)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(score as number) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                  {Math.round((score as number) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {analysisResult.tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">감정 태그:</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysisResult.summary && (
                        <div>
                          <h4 className="font-semibold mb-2">분석 요약:</h4>
                          <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                            {analysisResult.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 mt-8">
                    <Button
                      onClick={() => {
                        setAnalysisResult(null);
                        setSelectedFile(null);
                        setImagePreview(null);
                        setBookTitle('');
                        setAuthor('');
                      }}
                      variant="outline"
                    >
                      다시 분석하기
                    </Button>
                    <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
                      홈으로 돌아가기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};