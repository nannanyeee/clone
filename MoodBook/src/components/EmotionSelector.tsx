import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Heart, Frown, Waves, Zap } from 'lucide-react';

type EmotionType = 'happy' | 'sad' | 'calm' | 'excited';

interface EmotionSelectorProps {
  onEmotionSelect: (emotion: EmotionType, score: number) => void;
}

const emotions = [
  {
    type: 'happy' as EmotionType,
    label: '행복',
    emoji: '😊',
    icon: Heart,
    description: '기쁘고 밝은 기분',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    borderColor: 'border-yellow-200 hover:border-yellow-300',
    textColor: 'text-yellow-700'
  },
  {
    type: 'sad' as EmotionType,
    label: '우울',
    emoji: '😔',
    icon: Frown,
    description: '슬프고 차분한 기분',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200 hover:border-blue-300',
    textColor: 'text-blue-700'
  },
  {
    type: 'calm' as EmotionType,
    label: '평온',
    emoji: '😌',
    icon: Waves,
    description: '차분하고 안정된 기분',
    color: 'from-green-400 to-teal-500',
    bgColor: 'bg-green-50 hover:bg-green-100',
    borderColor: 'border-green-200 hover:border-green-300',
    textColor: 'text-green-700'
  },
  {
    type: 'excited' as EmotionType,
    label: '긴장',
    emoji: '😮',
    icon: Zap,
    description: '흥미진진하고 역동적인 기분',
    color: 'from-pink-400 to-red-500',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    borderColor: 'border-pink-200 hover:border-pink-300',
    textColor: 'text-pink-700'
  }
];

export const EmotionSelector = ({ onEmotionSelect }: EmotionSelectorProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [emotionScore, setEmotionScore] = useState([5]);

  const handleEmotionClick = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
  };

  const handleConfirm = () => {
    if (selectedEmotion) {
      onEmotionSelect(selectedEmotion, emotionScore[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2 text-gray-800">감정을 선택해주세요</h3>
        <p className="text-gray-600">현재 기분에 가장 가까운 감정을 골라보세요</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {emotions.map((emotion) => {
          const Icon = emotion.icon;
          const isSelected = selectedEmotion === emotion.type;
          
          return (
            <Card
              key={emotion.type}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isSelected 
                  ? `ring-2 ring-purple-500 ${emotion.bgColor} ${emotion.borderColor}` 
                  : `${emotion.bgColor} ${emotion.borderColor} hover:shadow-lg`
              }`}
              onClick={() => handleEmotionClick(emotion.type)}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${emotion.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className={`text-lg ${emotion.textColor}`}>
                  {emotion.emoji} {emotion.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-sm">
                  {emotion.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedEmotion && (
        <div className="bg-white rounded-lg p-6 shadow-lg border border-purple-100">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-800">
              감정 강도를 조절해주세요
            </h4>
            <p className="text-gray-600 text-sm">
              1 (약함) ~ 10 (강함)
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>약함</span>
              <span className="font-semibold text-purple-600">
                {emotionScore[0]}
              </span>
              <span>강함</span>
            </div>
            <Slider
              value={emotionScore}
              onValueChange={setEmotionScore}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="text-center">
            <Button
              onClick={handleConfirm}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              이 감정으로 책 추천받기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};