import { LayoutConfig, ColorScheme } from './types';

export const LAYOUTS: LayoutConfig[] = [
  {
    id: 'minimal-grid',
    name: 'Minimal Grid',
    fonts: {
      display: "'Pretendard', sans-serif",
      body: "'Pretendard', sans-serif"
    }
  },
  {
    id: 'diva-luxe',
    name: 'Diva Luxe',
    fonts: {
      display: "'Nanum Myeongjo', serif",
      body: "'Pretendard', sans-serif"
    }
  },
  {
    id: 'artistic-dark',
    name: 'Artistic Dark',
    fonts: {
      display: "'Gmarket Sans', sans-serif",
      body: "'Pretendard', sans-serif"
    }
  },
  {
    id: 'friendly-vibrant',
    name: 'Friendly Vibrant',
    fonts: {
      display: "'Nanum Gothic', sans-serif",
      body: "'Pretendard', sans-serif"
    }
  },
  {
    id: 'pop-star',
    name: 'Pop Star',
    fonts: {
      display: "'Gmarket Sans', sans-serif",
      body: "'Pretendard', sans-serif"
    }
  },
  {
    id: 'standard-modern',
    name: 'Standard Modern',
    fonts: {
      display: "'Pretendard', sans-serif",
      body: "'Pretendard', sans-serif"
    }
  },
  {
    id: 'curated-atelier',
    name: 'Curated Atelier',
    fonts: {
      display: "'Noto Serif', serif",
      body: "'Work Sans', sans-serif"
    }
  }
];

export const KOREAN_FONTS = [
  { name: 'Pretendard (Standard)', value: "'Pretendard', sans-serif" },
  { name: 'Gmarket Sans (Trendy)', value: "'Gmarket Sans', sans-serif" },
  { name: 'Nanum Gothic (Classic)', value: "'Nanum Gothic', sans-serif" },
  { name: 'Nanum Myeongjo (Serif)', value: "'Nanum Myeongjo', serif" },
  { name: 'Chosun Centenary (Sophisticated)', value: "'Chosun Centenary', serif" },
  { name: 'Inter (Sans)', value: "'Inter', sans-serif" },
  { name: 'Space Grotesk (Modern)', value: "'Space Grotesk', sans-serif" },
  { name: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { name: 'JetBrains Mono (Mono)', value: "'JetBrains Mono', monospace" }
];

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'elegant-white',
    name: 'Elegant White',
    colors: {
      bg: '#FFFFFF',
      text: '#1A1A1A',
      accent: '#000000',
      secondary: '#F5F5F5',
      card: '#FFFFFF',
      border: '#E5E5E5'
    }
  },
  {
    id: 'classic-black',
    name: 'Classic Black',
    colors: {
      bg: '#0A0A0A',
      text: '#FFFFFF',
      accent: '#D4AF37',
      secondary: '#1A1A1A',
      card: '#1A1A1A',
      border: '#333333'
    }
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    colors: {
      bg: '#FFF5F7',
      text: '#4A1D24',
      accent: '#FF4D6D',
      secondary: '#FFE3E8',
      card: '#FFFFFF',
      border: '#FFCCD5'
    }
  },
  {
    id: 'sky-blue',
    name: 'Sky Blue',
    colors: {
      bg: '#F0F9FF',
      text: '#0C4A6E',
      accent: '#0EA5E9',
      secondary: '#E0F2FE',
      card: '#FFFFFF',
      border: '#BAE6FD'
    }
  },
  {
    id: 'marble-luxe',
    name: 'Marble Luxe',
    colors: {
      bg: '#F8F9FA',
      text: '#212529',
      accent: '#6C757D',
      secondary: '#E9ECEF',
      card: '#FFFFFF',
      border: '#DEE2E6'
    }
  },
  {
    id: 'natural-green',
    name: 'Natural Green',
    colors: {
      bg: '#F0FDF4',
      text: '#14532D',
      accent: '#22C55E',
      secondary: '#DCFCE7',
      card: '#FFFFFF',
      border: '#BBF7D0'
    }
  },
  {
    id: 'warm-coral',
    name: 'Warm Coral',
    colors: {
      bg: '#FFF7ED',
      text: '#7C2D12',
      accent: '#F97316',
      secondary: '#FFEDD5',
      card: '#FFFFFF',
      border: '#FED7AA'
    }
  }
];
