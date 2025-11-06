import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Heart, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

type EmotionType = 'happy' | 'sad' | 'calm' | 'excited';

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

interface BookRecommendationsProps {
  emotion: EmotionType;
  emotionScore: number;
  onBack: () => void;
}

export const BookRecommendations = ({ emotion, emotionScore, onBack }: BookRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmotion, setUserEmotion] = useState<any>(null);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const getEmotionInfo = (emotion: EmotionType) => {
    switch (emotion) {
      case 'happy':
        return { label: '행복', emoji: '😊', color: 'from-yellow-400 to-orange-500', bgColor: 'bg-yellow-50' };
      case 'sad':
        return { label: '우울', emoji: '😔', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50' };
      case 'calm':
        return { label: '평온', emoji: '😌', color: 'from-green-400 to-teal-500', bgColor: 'bg-green-50' };
      case 'excited':
        return { label: '긴장/흥미진진', emoji: '😮', color: 'from-pink-400 to-red-500', bgColor: 'bg-pink-50' };
      default:
        return { label: emotion, emoji: '😐', color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const fetchRecommendations = async () => {
    if (!user || !session) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('recommend_books_2025_11_06_07_09', {
        body: {
          emotion,
          emotionScore,
          limit: 10
        }
      });

      if (error) {
        throw new Error(error.message || '추천 중 오류가 발생했습니다.');
      }

      if (!data.success) {
        throw new Error(data.error || '추천에 실패했습니다.');
      }

      setRecommendations(data.recommendations || []);
      setUserEmotion(data.user_emotion);

    } catch (error: any) {
      console.error('Recommendation error:', error);
      toast({
        title: "추천 실패",
        description: error.message || "추천 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [emotion, emotionScore]);

  const emotionInfo = getEmotionInfo(emotion);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              도서 추천 기능을 사용하려면 로그인해주세요.
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="text-purple-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Button>
              <h1 className="text-2xl font-bold text-purple-800">도서 추천</h1>
            </div>
            <Button
              onClick={fetchRecommendations}
              variant="outline"
              disabled={isLoading}
              className="text-purple-600 border-purple-200"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              새로고침
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Emotion Summary */}
          <Card className={`mb-8 ${emotionInfo.bgColor} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <div className={`p-3 rounded-full bg-gradient-to-r ${emotionInfo.color} text-white mr-4`}>
                  <Heart className="h-6 w-6" />
                </div>
                {emotionInfo.emoji} {emotionInfo.label} 감정 기반 추천
              </CardTitle>
              <CardDescription className="text-lg">
                감정 강도: <span className="font-semibold text-purple-600">{emotionScore}/10</span>
                {userEmotion?.history && userEmotion.history.length > 0 && (
                  <span className="ml-4 text-sm text-gray-600">
                    최근 선택한 감정: {userEmotion.history.slice(0, 3).map((h: any) => h.emotion_type).join(', ')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">당신의 감정에 맞는 책을 찾고 있습니다...</p>
              </div>
            </div>
          )}

          {/* No Recommendations */}
          {!isLoading && recommendations.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">추천할 책이 없습니다</h3>
                <p className="text-gray-600 mb-4">
                  현재 감정에 맞는 책을 찾지 못했습니다. 다른 감정을 선택해보세요.
                </p>
                <Button onClick={onBack} variant="outline">
                  다른 감정 선택하기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Grid */}
          {!isLoading && recommendations.length > 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  {recommendations.length}권의 책을 추천합니다
                </h2>
                <p className="text-gray-600">
                  감정 유사도가 높은 순서로 정렬되었습니다
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((book) => (
                  <Card key={book.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 group-hover:text-purple-600 transition-colors">
                            {book.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {book.author}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-100 text-purple-700 font-semibold"
                        >
                          {Math.round(book.similarity_score * 100)}% 일치
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {book.description && (
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {book.description}
                        </p>
                      )}

                      {/* Emotion Scores */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-gray-700">감정 분포:</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(book.emotions).map(([emotionKey, score]) => {
                            const emotionLabel = getEmotionInfo(emotionKey as EmotionType).label;
                            return (
                              <div key={emotionKey} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{emotionLabel}</span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${(score as number) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-gray-500 w-8 text-right">
                                    {Math.round((score as number) * 100)}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Emotion Tags */}
                      {book.emotion_tags.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-gray-700">태그:</h5>
                          <div className="flex flex-wrap gap-1">
                            {book.emotion_tags.slice(0, 4).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {book.emotion_tags.length > 4 && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5 text-gray-500">
                                +{book.emotion_tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  onClick={onBack}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  다른 감정으로 다시 추천받기
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};