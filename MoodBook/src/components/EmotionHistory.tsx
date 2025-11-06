import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, TrendingUp, Heart, BarChart3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

type EmotionType = 'happy' | 'sad' | 'calm' | 'excited';

interface EmotionRecord {
  id: string;
  emotion_type: EmotionType;
  emotion_score: number;
  selected_at: string;
}

interface EmotionHistoryProps {
  onBack: () => void;
}

export const EmotionHistory = ({ onBack }: EmotionHistoryProps) => {
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { user, session } = useAuth();

  const getEmotionInfo = (emotion: EmotionType) => {
    switch (emotion) {
      case 'happy':
        return { label: '행복', emoji: '😊', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'sad':
        return { label: '우울', emoji: '😔', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'calm':
        return { label: '평온', emoji: '😌', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'excited':
        return { label: '긴장/흥미진진', emoji: '😮', color: 'bg-pink-100 text-pink-700 border-pink-200' };
      default:
        return { label: emotion, emoji: '😐', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const fetchEmotionHistory = async () => {
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
      const { data, error } = await supabase
        .from('emotion_records_2025_11_06_07_09')
        .select('*')
        .eq('user_id', user.id)
        .order('selected_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(error.message);
      }

      setEmotionRecords(data || []);

      // Calculate emotion statistics
      const stats: Record<string, number> = {};
      data?.forEach((record) => {
        stats[record.emotion_type] = (stats[record.emotion_type] || 0) + 1;
      });
      setEmotionStats(stats);

    } catch (error: any) {
      console.error('Fetch emotion history error:', error);
      toast({
        title: "기록 조회 실패",
        description: error.message || "감정 기록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmotionHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '오늘';
    } else if (diffDays === 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const getTotalRecords = () => emotionRecords.length;
  const getMostFrequentEmotion = () => {
    if (Object.keys(emotionStats).length === 0) return null;
    return Object.entries(emotionStats).reduce((a, b) => emotionStats[a[0]] > emotionStats[b[0]] ? a : b)[0] as EmotionType;
  };

  const getAverageScore = () => {
    if (emotionRecords.length === 0) return 0;
    const total = emotionRecords.reduce((sum, record) => sum + record.emotion_score, 0);
    return Math.round((total / emotionRecords.length) * 10) / 10;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              감정 기록을 보려면 로그인해주세요.
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
            <h1 className="text-2xl font-bold text-purple-800">나의 감정 기록</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">감정 기록을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Statistics Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-purple-700">
                      <Calendar className="h-5 w-5 mr-2" />
                      총 기록
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-800">
                      {getTotalRecords()}
                    </div>
                    <p className="text-sm text-purple-600">번의 감정 선택</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-blue-700">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      평균 강도
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-800">
                      {getAverageScore()}
                    </div>
                    <p className="text-sm text-blue-600">/ 10</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-green-700">
                      <Heart className="h-5 w-5 mr-2" />
                      주요 감정
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getMostFrequentEmotion() ? (
                      <div>
                        <div className="text-2xl font-bold text-green-800 mb-1">
                          {getEmotionInfo(getMostFrequentEmotion()!).emoji} {getEmotionInfo(getMostFrequentEmotion()!).label}
                        </div>
                        <p className="text-sm text-green-600">
                          {emotionStats[getMostFrequentEmotion()!]}번 선택
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-500">기록 없음</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Emotion Distribution */}
              {Object.keys(emotionStats).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                      감정 분포
                    </CardTitle>
                    <CardDescription>
                      지금까지 선택한 감정들의 분포입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(emotionStats)
                        .sort(([,a], [,b]) => b - a)
                        .map(([emotion, count]) => {
                          const emotionInfo = getEmotionInfo(emotion as EmotionType);
                          const percentage = Math.round((count / getTotalRecords()) * 100);
                          
                          return (
                            <div key={emotion} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{emotionInfo.emoji}</span>
                                  <span className="font-medium">{emotionInfo.label}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">{count}번</span>
                                  <span className="text-sm font-semibold text-purple-600">{percentage}%</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Records */}
              <Card>
                <CardHeader>
                  <CardTitle>최근 감정 기록</CardTitle>
                  <CardDescription>
                    최근 50개의 감정 선택 기록입니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {emotionRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">아직 기록이 없습니다</h3>
                      <p className="text-gray-600 mb-4">
                        감정을 선택하여 책을 추천받으면 기록이 저장됩니다.
                      </p>
                      <Button onClick={onBack} variant="outline">
                        감정 선택하러 가기
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emotionRecords.map((record) => {
                        const emotionInfo = getEmotionInfo(record.emotion_type);
                        
                        return (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">{emotionInfo.emoji}</div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {emotionInfo.label}
                                </div>
                                <div className="text-sm text-gray-600">
                                  강도: {record.emotion_score}/10
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={emotionInfo.color}>
                                {formatDate(record.selected_at)}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};