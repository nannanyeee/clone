-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create books table
CREATE TABLE IF NOT EXISTS public.books_2025_11_06_07_09 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    cover_url TEXT,
    description TEXT,
    emotions JSONB DEFAULT '{}', -- Store emotion scores as JSON
    emotion_tags TEXT[] DEFAULT '{}', -- Array of emotion tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create emotion_records table for user emotion history
CREATE TABLE IF NOT EXISTS public.emotion_records_2025_11_06_07_09 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    emotion_type TEXT NOT NULL, -- 'happy', 'sad', 'calm', 'excited'
    emotion_score INTEGER DEFAULT 5, -- 1-10 scale
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create book_analysis table for OCR and emotion analysis results
CREATE TABLE IF NOT EXISTS public.book_analysis_2025_11_06_07_09 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books_2025_11_06_07_09(id) ON DELETE CASCADE,
    cover_image_url TEXT,
    ocr_text TEXT,
    detected_emotions JSONB DEFAULT '{}',
    analysis_result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS public.user_profiles_2025_11_06_07_09 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT,
    emotion_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.books_2025_11_06_07_09 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_records_2025_11_06_07_09 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_analysis_2025_11_06_07_09 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles_2025_11_06_07_09 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books (public read, authenticated users can contribute)
CREATE POLICY "Books are viewable by everyone" ON public.books_2025_11_06_07_09
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert books" ON public.books_2025_11_06_07_09
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for emotion_records (users can only see their own records)
CREATE POLICY "Users can view own emotion records" ON public.emotion_records_2025_11_06_07_09
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotion records" ON public.emotion_records_2025_11_06_07_09
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for book_analysis (users can only see their own analysis)
CREATE POLICY "Users can view own book analysis" ON public.book_analysis_2025_11_06_07_09
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own book analysis" ON public.book_analysis_2025_11_06_07_09
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_profiles (users can only see and modify their own profile)
CREATE POLICY "Users can view own profile" ON public.user_profiles_2025_11_06_07_09
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles_2025_11_06_07_09
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles_2025_11_06_07_09
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample books data
INSERT INTO public.books_2025_11_06_07_09 (title, author, description, emotions, emotion_tags) VALUES
('해리 포터와 마법사의 돌', 'J.K. 롤링', '마법 세계의 모험과 우정을 그린 판타지 소설', '{"happy": 0.8, "excited": 0.9, "calm": 0.3, "sad": 0.1}', ARRAY['모험', '판타지', '우정', '마법']),
('노르웨이의 숲', '무라카미 하루키', '청춘의 사랑과 상실을 그린 소설', '{"sad": 0.7, "calm": 0.6, "happy": 0.2, "excited": 0.1}', ARRAY['사랑', '청춘', '상실', '그리움']),
('미움받을 용기', '기시미 이치로', '아들러 심리학을 바탕으로 한 자기계발서', '{"calm": 0.8, "happy": 0.6, "excited": 0.4, "sad": 0.1}', ARRAY['자기계발', '심리학', '용기', '성장']),
('82년생 김지영', '조남주', '한국 여성의 현실을 그린 소설', '{"sad": 0.6, "calm": 0.4, "happy": 0.2, "excited": 0.1}', ARRAY['현실', '여성', '사회', '공감']),
('코스모스', '칼 세이건', '우주와 과학에 대한 경이로운 탐험', '{"excited": 0.8, "calm": 0.7, "happy": 0.6, "sad": 0.1}', ARRAY['과학', '우주', '탐험', '경이']);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_emotions ON public.books_2025_11_06_07_09 USING GIN (emotions);
CREATE INDEX IF NOT EXISTS idx_emotion_records_user_id ON public.emotion_records_2025_11_06_07_09 (user_id);
CREATE INDEX IF NOT EXISTS idx_book_analysis_user_id ON public.book_analysis_2025_11_06_07_09 (user_id);