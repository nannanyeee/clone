import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Camera, Heart, Brain, Zap, Waves } from 'lucide-react';
import { EmotionSelector } from '@/components/EmotionSelector';
import { BookUpload } from '@/components/BookUpload';
import { BookRecommendations } from '@/components/BookRecommendations';
import { EmotionHistory } from '@/components/EmotionHistory';
import { AuthProvider } from '@/components/AuthProvider';

type EmotionType = 'happy' | 'sad' | 'calm' | 'excited';

const Index = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'recommendations' | 'history'>('home');
  const [emotionScore, setEmotionScore] = useState(5);

  const handleEmotionSelect = (emotion: EmotionType, score: number) => {
    setSelectedEmotion(emotion);
    setEmotionScore(score);
    setCurrentView('recommendations');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return <BookUpload onBack={() => setCurrentView('home')} />;
      case 'recommendations':
        return (
          <BookRecommendations 
            emotion={selectedEmotion!} 
            emotionScore={emotionScore}
            onBack={() => setCurrentView('home')}
          />
        );
      case 'history':
        return <EmotionHistory onBack={() => setCurrentView('home')} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      MoodBook
                    </h1>
                  </div>
                  <nav className="flex space-x-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentView('history')}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      내 기록
                    </Button>
                  </nav>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                  지금 당신의 기분은 어떤가요?
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  감정에 맞는 완벽한 책을 찾아보세요. 표지의 색감과 분위기를 분석하여 당신의 마음에 딱 맞는 책을 추천해드립니다.
                </p>
              </div>

              {/* Emotion Selection */}
              <div className="mb-16">
                <EmotionSelector onEmotionSelect={handleEmotionSelect} />
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Card className="group hover:shadow-lg transition-all duration-300 border-purple-100 hover:border-purple-200">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-purple-800">감정 분석</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      AI가 책 표지의 색상, 디자인, 분위기를 분석하여 감정을 읽어냅니다.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 border-blue-100 hover:border-blue-200">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Heart className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-blue-800">맞춤 추천</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      당신의 현재 감정과 가장 잘 어울리는 책들을 추천해드립니다.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setCurrentView('upload')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  책 표지 업로드하기
                </Button>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-white/50 backdrop-blur-sm border-t border-purple-100 mt-20">
              <div className="container mx-auto px-4 py-8">
                <div className="text-center text-gray-600">
                  <p>© 2024 MoodBook. 감정으로 책을 찾는 새로운 경험.</p>
                </div>
              </div>
            </footer>
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      {renderCurrentView()}
    </AuthProvider>
  );
};

export default Index;
