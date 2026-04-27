import React, { useState, useEffect } from 'react';
import { Page, Language, PageContent, LayoutConfig, ColorScheme, PortfolioItem, TextAlign } from '../../types';
import { LAYOUTS, COLOR_SCHEMES } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Instagram, Youtube, MessageCircle, Globe, Loader2, ChevronDown, Sparkles, Phone, Video, BookOpen, Link as LinkIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GoogleGenAI } from "@google/genai";
import { getTranslation } from '../../lib/i18n';

import { Rnd } from 'react-rnd';

interface PRPageProps {
  page: Page;
  onSelectElement?: (elementId: string, currentStyle?: any) => void;
  onUpdateStyle?: (elementId: string, updates: any) => void;
  selectedElementId?: string;
  isMobile?: boolean;
}

const PRPage: React.FC<PRPageProps> = ({ page, onSelectElement, onUpdateStyle, selectedElementId, isMobile }) => {
  const [currentLang, setCurrentLang] = useState<Language>('ko');
  const t = (key: string) => getTranslation(currentLang, key);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<PageContent>(page.content);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const layout = LAYOUTS.find(l => l.id === page.layout) || LAYOUTS[0];
  const colorScheme = COLOR_SCHEMES.find(c => c.id === page.colorScheme) || COLOR_SCHEMES[0];
  const content = translatedContent;

  const getStyle = (elementId: string, defaultStyle: React.CSSProperties = {}) => {
    const override = page.styleOverrides?.[elementId];
    const isSelected = selectedElementId === elementId;
    
    // Helper to scale font size for mobile
    const scaleFontSize = (size: string | number | undefined) => {
      if (!size) return undefined;
      if (!isMobile) return size;
      
      if (typeof size === 'string') {
        if (size.endsWith('rem')) {
          const val = parseFloat(size);
          return `${Math.max(val * 0.5, 1.5)}rem`;
        }
        if (size.endsWith('vw')) {
          const val = parseFloat(size);
          return `${val * 0.8}vw`;
        }
        if (size.endsWith('px')) {
          const val = parseFloat(size);
          return `${val * 0.6}px`;
        }
      }
      if (typeof size === 'number') {
        return size * 0.6;
      }
      return size;
    };

    const baseStyle = {
      ...defaultStyle,
      fontSize: override?.fontSize ? scaleFontSize(override.fontSize) : scaleFontSize(defaultStyle.fontSize),
      color: override?.color || defaultStyle.color,
      fontFamily: override?.fontFamily || defaultStyle.fontFamily,
      textAlign: override?.textAlign || defaultStyle.textAlign,
      fontWeight: override?.fontWeight || defaultStyle.fontWeight,
      letterSpacing: override?.letterSpacing || defaultStyle.letterSpacing,
      lineHeight: override?.lineHeight || defaultStyle.lineHeight,
      marginTop: override?.marginTop !== undefined ? override.marginTop : defaultStyle.marginTop,
      marginBottom: override?.marginBottom !== undefined ? override.marginBottom : defaultStyle.marginBottom,
    };

    if (onSelectElement) {
      return {
        ...baseStyle,
        cursor: 'pointer',
        outline: isSelected ? '2px solid #3b82f6' : '1px dashed rgba(59, 130, 246, 0.3)',
        outlineOffset: '4px',
        position: 'relative' as const,
      };
    }

    return baseStyle;
  };

  const Clickable = ({ id, children, className, style, defaultStyle }: { id: string, children: React.ReactNode, className?: string, style?: React.CSSProperties, defaultStyle?: any }) => {
    if (!onSelectElement) return <div className={className} style={style}>{children}</div>;
    return (
      <div 
        className={`${className} group`} 
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          // Pass current computed style back to builder
          const computedStyle = getStyle(id, defaultStyle || {});
          
          // Get actual rendered styles if not explicitly set
          const domStyle = window.getComputedStyle(e.currentTarget);
          
          if (!computedStyle.fontFamily) {
            // Clean up font family string (e.g. "Inter", sans-serif -> Inter)
            const firstFont = domStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
            computedStyle.fontFamily = firstFont;
          }
          
          if (!computedStyle.fontSize) {
            // Convert px to rem (assuming 16px base)
            const px = parseFloat(domStyle.fontSize);
            if (!isNaN(px)) {
              computedStyle.fontSize = `${px / 16}rem`;
            } else {
              computedStyle.fontSize = domStyle.fontSize;
            }
          }
          
          if (!computedStyle.fontWeight) {
            computedStyle.fontWeight = parseInt(domStyle.fontWeight) || 400;
          }
          
          if (!computedStyle.color) computedStyle.color = domStyle.color;
          if (!computedStyle.textAlign) computedStyle.textAlign = domStyle.textAlign as TextAlign;
          if (!computedStyle.letterSpacing) computedStyle.letterSpacing = domStyle.letterSpacing;
          if (!computedStyle.lineHeight) computedStyle.lineHeight = domStyle.lineHeight;

          onSelectElement(id, computedStyle);
        }}
      >
        {children}
        {onSelectElement && (
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50">
            {id}
          </div>
        )}
      </div>
    );
  };

  const DraggableImage = ({ id, src, className, style, defaultStyle, ...props }: any) => {
    const override = page.styleOverrides?.[id];
    const isSelected = selectedElementId === id;
    
    const width = override?.width;
    const height = override?.height;
    const x = override?.x || 0;
    const y = override?.y || 0;

    if (!onSelectElement) {
      return (
        <div style={{ transform: `translate(${x}px, ${y}px)`, width: width || '100%', height: height || '100%', position: 'relative' }} className={className}>
          <img src={src} className="w-full h-full object-cover" style={style} {...props} />
        </div>
      );
    }

    return (
      <Rnd
        size={{ width: width || '100%', height: height || '100%' }}
        position={{ x, y }}
        onDragStop={(e, d) => {
          if (onUpdateStyle) {
            onUpdateStyle(id, { x: d.x, y: d.y });
          }
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          if (onUpdateStyle) {
            onUpdateStyle(id, {
              width: ref.style.width,
              height: ref.style.height,
              ...position,
            });
          }
        }}
        disableDragging={!isSelected}
        enableResizing={isSelected}
        className={`${className} ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'}`}
        style={{ zIndex: isSelected ? 50 : 1, position: 'relative' as any }}
        onClick={(e: any) => {
          e.stopPropagation();
          if (onSelectElement) {
            onSelectElement(id, getStyle(id, defaultStyle || {}));
          }
        }}
      >
        <img src={src} className="w-full h-full object-cover pointer-events-none" style={style} {...props} />
        {isSelected && (
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded pointer-events-none z-50">
            {id}
          </div>
        )}
      </Rnd>
    );
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'vi', label: 'Tiếng Việt' },
  ];

  useEffect(() => {
    if (currentLang === 'ko') {
      setTranslatedContent(page.content);
      return;
    }

    if (page.content.translations && page.content.translations[currentLang]) {
      // Merge the translated content with the base content
      // This ensures any missing fields in the translation fallback to the base content
      const translation = page.content.translations[currentLang];
      setTranslatedContent({
        ...page.content,
        ...translation,
        hero: { ...page.content.hero, ...(translation?.hero || {}) },
        about: { ...page.content.about, ...(translation?.about || {}) },
        contact: { ...page.content.contact, ...(translation?.contact || {}) },
      } as PageContent);
    } else {
      // Fallback to default language if no translation exists
      setTranslatedContent(page.content);
    }
  }, [currentLang, page.content]);

  const sectionStyle = {
    backgroundColor: colorScheme.colors.bg,
    color: colorScheme.colors.text,
    fontFamily: layout.fonts.body,
  };

  const displayFont = { fontFamily: layout.fonts.display };

  // Theme-specific layout adjustments
  const isMinimal = page.layout === 'minimal-grid';
  const isDiva = page.layout === 'diva-luxe';
  const isArtistic = page.layout === 'artistic-dark';
  const isFriendly = page.layout === 'friendly-vibrant';
  const isPop = page.layout === 'pop-star';
  const isStandard = page.layout === 'standard-modern';

  const renderHero = () => {
    if (isMinimal) {
      return (
        <section className={`relative flex flex-col border-b-2 ${isMobile ? 'min-h-screen' : 'h-screen'}`} style={{ borderColor: colorScheme.colors.accent }}>
          <div className={`flex-1 flex ${isMobile ? 'flex-col' : ''}`}>
            <div className={`${isMobile ? 'w-full border-b-2' : 'w-1/2 border-r-2'} p-8 md:p-12 flex flex-col justify-end`} style={{ borderColor: colorScheme.colors.accent }}>
              {content.hero.label && (
                <Clickable id="hero-label">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs md:text-sm uppercase tracking-widest mb-4"
                    style={getStyle('hero-label', { color: colorScheme.colors.accent, fontFamily: 'monospace' })}
                  >
                    {content.hero.label}
                  </motion.p>
                </Clickable>
              )}
              <Clickable id="hero-name">
                <motion.h1 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '4rem' : '8rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 })}
                >
                  {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
                </motion.h1>
              </Clickable>
            </div>
            <div className={`${isMobile ? 'w-full h-96' : 'w-1/2'} overflow-hidden`}>
              <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className={`${isMobile ? 'h-auto py-6' : 'h-24'} flex flex-col md:flex-row items-center px-8 md:px-12 justify-between font-mono uppercase tracking-widest text-xs md:text-sm gap-4`}>
            <Clickable id="hero-tagline">
              <span style={getStyle('hero-tagline')}>{content.hero.tagline}</span>
            </Clickable>
            <span>{t('est')} {new Date(page.createdAt).getFullYear()}</span>
          </div>
        </section>
      );
    }

    if (isDiva) {
      return (
        <section className="relative h-screen flex items-center justify-center" style={{ backgroundColor: colorScheme.colors.bg }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${colorScheme.colors.bg}88, ${colorScheme.colors.bg})` }} />
          </motion.div>
          <div className="relative z-10 text-center px-4">
            <Clickable id="hero-label">
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="uppercase tracking-[0.5em] md:tracking-[1em] mb-4 md:mb-8 text-xs md:text-sm font-light" style={getStyle('hero-label', { color: colorScheme.colors.accent })}>{content.hero.label || t('theIconic')}</motion.p>
            </Clickable>
            <Clickable id="hero-name">
              <motion.h1 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.2 }}
                style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '18vw' : '15vw', lineHeight: 1, fontStyle: 'italic', color: colorScheme.colors.text })}
              >
                {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
              </motion.h1>
            </Clickable>
          </div>
        </section>
      );
    }

    if (isPop) {
      return (
        <section className="relative h-screen flex items-center overflow-hidden" style={{ backgroundColor: colorScheme.colors.accent }}>
          <div className="absolute top-0 left-0 w-full h-full skew-y-[-5deg] origin-top-left z-0 transform translate-y-[-20%]" style={{ backgroundColor: colorScheme.colors.secondary }} />
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`absolute right-0 top-0 h-full ${isMobile ? 'w-full opacity-40' : 'w-2/3'} z-10`}
          >
            <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          <div className={`relative z-20 ${isMobile ? 'px-8 w-full text-center' : 'pl-20 w-1/2'}`}>
            <Clickable id="hero-label">
              <motion.p 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="inline-block px-3 py-1 text-sm font-bold uppercase mb-4"
                style={getStyle('hero-label', { backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg })}
              >
                {content.hero.label || t('theIconic')}
              </motion.p>
            </Clickable>
            <Clickable id="hero-name">
              <motion.h1 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '20vw' : '12vw', fontWeight: 900, color: colorScheme.colors.bg, lineHeight: 0.8, textTransform: 'uppercase' })}
                className="drop-shadow-[5px_5px_0px_rgba(0,0,0,0.5)] md:drop-shadow-[10px_10px_0px_rgba(0,0,0,0.5)]"
              >
                {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
              </motion.h1>
            </Clickable>
            <Clickable id="hero-tagline">
              <div className="mt-8 inline-block px-4 md:px-6 py-2 text-lg md:text-2xl font-bold skew-x-[-10deg]" style={getStyle('hero-tagline', { backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg })}>
                {content.hero.tagline}
              </div>
            </Clickable>
          </div>
        </section>
      );
    }

    if (isFriendly) {
      return (
        <section className={`relative flex items-center justify-center p-6 md:p-20 overflow-hidden ${isMobile ? 'min-h-screen' : 'h-screen'}`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className={`max-w-7xl w-full h-full flex flex-col ${isMobile ? '' : 'md:flex-row'} items-center gap-8 md:gap-12`}>
            <div className={`w-full ${isMobile ? 'h-96' : 'md:w-1/2 md:h-full'} relative`}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-full h-full ${isMobile ? 'rounded-[40px]' : 'md:rounded-[60px]'} overflow-hidden shadow-2xl`}
              >
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
              <div className={`absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 ${isMobile ? 'w-20 h-20' : 'w-32 h-32'} rounded-full flex items-center justify-center text-white shadow-xl animate-bounce`} style={{ backgroundColor: colorScheme.colors.accent }}>
                <Sparkles size={isMobile ? 32 : 48} />
              </div>
            </div>
            <div className={`w-full ${isMobile ? 'text-center' : 'md:w-1/2 md:text-right'}`}>
              <Clickable id="hero-label">
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-lg md:text-2xl font-bold mb-2"
                  style={getStyle('hero-label', { color: colorScheme.colors.text, opacity: 0.5 })}
                >
                  {content.hero.label || t('theIconic')}
                </motion.p>
              </Clickable>
              <Clickable id="hero-name">
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '3.5rem' : '6rem', fontWeight: 900, color: colorScheme.colors.accent })}
                  className="mb-4 md:mb-6"
                >
                  {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
                </motion.h1>
              </Clickable>
              <Clickable id="hero-tagline">
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={getStyle('hero-tagline', { fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 500, opacity: 0.6 })}
                >
                  {content.hero.tagline}
                </motion.p>
              </Clickable>
            </div>
          </div>
        </section>
      );
    }

    if (isArtistic) {
      return (
        <section className={`relative flex items-start justify-start p-8 md:p-24 overflow-hidden ${isMobile ? 'min-h-screen' : 'h-screen'}`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-0"
          >
            <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover grayscale contrast-125" referrerPolicy="no-referrer" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top right, ${colorScheme.colors.bg}, transparent, ${colorScheme.colors.accent}33)` }} />
          </motion.div>
            <div className="relative z-10 max-w-4xl">
            <Clickable id="hero-label">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs md:text-sm uppercase tracking-widest mb-4"
                style={getStyle('hero-label', { color: colorScheme.colors.accent })}
              >
                {content.hero.label || t('theIconic')}
              </motion.p>
            </Clickable>
            <Clickable id="hero-name">
                <motion.h1 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '5rem' : '12rem', fontWeight: 700, color: colorScheme.colors.text, lineHeight: 1, letterSpacing: '-0.05em' })}
                  className="mb-6 md:mb-8"
                >
                  {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
                </motion.h1>
              </Clickable>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 1, duration: 1 }}
              className="h-1 mb-6 md:mb-8"
              style={{ backgroundColor: colorScheme.colors.accent }}
            />
            <Clickable id="hero-tagline">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={getStyle('hero-tagline', { fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 300, color: colorScheme.colors.text, opacity: 0.7, fontStyle: 'italic' })}
              >
                {content.hero.tagline}
              </motion.p>
            </Clickable>
          </div>
        </section>
      );
    }

    if (isStandard) {
      return (
        <section className={`relative flex items-end justify-end p-8 md:p-24 overflow-hidden ${isMobile ? 'min-h-screen' : 'h-screen'}`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to left, ${colorScheme.colors.bg}, ${colorScheme.colors.bg}cc, transparent)` }} />
            <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className={`relative z-20 ${isMobile ? 'text-center w-full' : 'text-right max-w-2xl'}`}>
            <Clickable id="hero-label">
              <motion.p 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-sm md:text-lg font-medium uppercase tracking-widest mb-2"
                style={getStyle('hero-label', { color: colorScheme.colors.accent })}
              >
                {content.hero.label || t('theIconic')}
              </motion.p>
            </Clickable>
            <Clickable id="hero-name">
              <motion.h1 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '4rem' : '9rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1 })}
                className="mb-4 md:mb-6"
              >
                {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
              </motion.h1>
            </Clickable>
            <Clickable id="hero-tagline">
              <motion.p 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={getStyle('hero-tagline', { fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 300, opacity: 0.6 })}
              >
                {content.hero.tagline}
              </motion.p>
            </Clickable>
          </div>
        </section>
      );
    }

    // Default Hero (Standard / Fallback)
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={content.hero.photoUrl} 
            alt={content.hero.nameKo}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-4">
          <Clickable id="hero-label">
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-sm md:text-lg font-medium uppercase tracking-widest mb-4 opacity-80"
              style={getStyle('hero-label', { color: colorScheme.colors.accent })}
            >
              {content.hero.label || t('theIconic')}
            </motion.p>
          </Clickable>
          <Clickable id="hero-name">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={getStyle('hero-name', displayFont)}
              className="text-6xl md:text-8xl font-bold mb-4 tracking-tight"
            >
              {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
            </motion.h1>
          </Clickable>
          <Clickable id="hero-tagline">
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={getStyle('hero-tagline')}
              className="text-xl md:text-2xl font-light opacity-90"
            >
              {content.hero.tagline}
            </motion.p>
          </Clickable>
        </div>
      </section>
    );
  };

  const translateLabel = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel === 'height' || lowerLabel === '키') return t('height');
    if (lowerLabel === 'location' || lowerLabel === '위치') return t('location');
    if (lowerLabel === 'education' || lowerLabel === '학력') return t('education');
    return label;
  };

  const normalizedDetails = Array.isArray(content.about.details) 
    ? content.about.details.map(detail => ({ ...detail, label: translateLabel(detail.label) }))
    : content.about.details 
      ? Object.entries(content.about.details).map(([key, val], idx) => ({ 
          id: String(idx), 
          label: translateLabel(key), 
          value: String(val) 
        }))
      : [];

  const visibleSections = page.visibleSections || {
    career: true,
    portfolio: true,
    strengths: true
  };

  const renderAbout = () => {
    if (isMinimal) {
      return (
        <section className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-12'} border-b-2`} style={{ borderColor: colorScheme.colors.accent, backgroundColor: colorScheme.colors.bg }}>
          <div className={`${isMobile ? 'w-full' : 'md:col-span-4'} border-r-2 p-8 md:p-12`} style={{ borderColor: colorScheme.colors.accent }}>
            <Clickable id="about-title">
              <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em' })} className="mb-2">
                {content.about.title || '01. Profile'}
              </h2>
            </Clickable>
            {content.about.subtitle && (
              <Clickable id="about-subtitle">
                <p style={getStyle('about-subtitle', { fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '1.5rem' })}>
                  {content.about.subtitle}
                </p>
              </Clickable>
            )}
            <div className="aspect-[3/4] border-2 overflow-hidden" style={{ borderColor: colorScheme.colors.accent }}>
              <DraggableImage id="about-photo" src={content.about.profilePhotoUrl} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className={`${isMobile ? 'w-full' : 'md:col-span-8'} p-8 md:p-12 flex flex-col justify-center`}>
            <Clickable id="about-bio">
              <div 
                style={getStyle('about-bio', { fontSize: isMobile ? '1.1rem' : '1.5rem', fontFamily: 'monospace', lineHeight: 1.2 })} 
                className="mb-8 md:mb-12 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content.about.bio }}
              />
            </Clickable>
            <div className="grid grid-cols-2 gap-6 md:gap-8 font-mono uppercase text-xs md:text-sm">
              {normalizedDetails.map((detail) => (
                <div key={detail.id} className="border-t pt-4" style={{ borderColor: colorScheme.colors.accent }}>
                  <span className="opacity-50 block mb-2">{detail.label}</span>
                  <span className="font-bold">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isDiva) {
      return (
        <section className={`py-16 md:py-32 px-4`} style={{ backgroundColor: colorScheme.colors.card, color: colorScheme.colors.text }}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              whileInView={{ scale: 1, opacity: 1 }}
              initial={{ scale: 0.9, opacity: 0 }}
              className="mb-12 md:mb-16 inline-block relative"
            >
              <div className="absolute -inset-4 border rounded-full animate-spin-slow" style={{ borderColor: `${colorScheme.colors.accent}44` }} />
              <DraggableImage id="about-photo" src={content.about.profilePhotoUrl} className={`${isMobile ? 'w-48 h-48' : 'w-64 h-64'} rounded-full object-cover border-4 shadow-2xl relative z-10`} style={{ borderColor: colorScheme.colors.bg }} referrerPolicy="no-referrer" />
            </motion.div>
            <Clickable id="about-title">
              <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '2rem' : '3rem', fontStyle: 'italic' })} className="mb-2">{content.about.title || t('theEssence')}</h2>
            </Clickable>
            {content.about.subtitle && (
              <Clickable id="about-subtitle">
                <p style={getStyle('about-subtitle', { fontSize: '0.9rem', opacity: 0.5, fontStyle: 'italic', marginBottom: '2rem' })}>
                  {content.about.subtitle}
                </p>
              </Clickable>
            )}
            <Clickable id="about-bio">
              <div 
                style={getStyle('about-bio', { fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 300, lineHeight: 1.6, fontStyle: 'italic' })} 
                className="mb-12 px-4 md:px-8 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content.about.bio }}
              />
            </Clickable>
            <div className={`flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60`}>
              {normalizedDetails.map((detail) => (
                <div key={detail.id} className="flex flex-col gap-1 md:gap-2">
                  <span>{detail.label}</span>
                  <span className="font-bold" style={{ color: colorScheme.colors.text }}>{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isPop) {
      return (
        <section className="py-16 md:py-24 px-4 relative" style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className={`max-w-6xl mx-auto flex flex-col ${isMobile ? '' : 'md:flex-row'} gap-12 items-center`}>
            <div className={`w-full ${isMobile ? '' : 'md:w-1/2'} relative`}>
              <div className="absolute -top-4 -left-4 w-full h-full z-0" style={{ backgroundColor: colorScheme.colors.accent }} />
              <div className="absolute -bottom-4 -right-4 w-full h-full z-0" style={{ backgroundColor: colorScheme.colors.secondary }} />
              <DraggableImage id="about-photo" src={content.about.profilePhotoUrl} className="relative z-10 w-full aspect-square object-cover border-8 shadow-[10px_10px_0px_rgba(0,0,0,0.5)] md:shadow-[20px_20px_0px_rgba(0,0,0,0.5)]" style={{ borderColor: colorScheme.colors.text }} referrerPolicy="no-referrer" />
            </div>
            <div className={`w-full ${isMobile ? '' : 'md:w-1/2'}`}>
              <motion.div 
                whileInView={{ x: 0, opacity: 1 }}
                initial={{ x: 50, opacity: 0 }}
                className="p-8 md:p-12 shadow-[10px_10px_0px_rgba(0,0,0,0.3)] md:shadow-[20px_20px_0px_rgba(0,0,0,0.3)]"
                style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg }}
              >
                <Clickable id="about-title">
                  <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic' })} className="mb-2">{content.about.title || t('myVibe')}</h2>
                </Clickable>
                {content.about.subtitle && (
                  <Clickable id="about-subtitle">
                    <p style={getStyle('about-subtitle', { fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.5rem', color: colorScheme.colors.accent })}>
                      {content.about.subtitle}
                    </p>
                  </Clickable>
                )}
                <Clickable id="about-bio">
                  <div 
                    style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.25rem', lineHeight: 1.6 })} 
                    className="mb-6 md:mb-8 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.about.bio }}
                  />
                </Clickable>
                <div className="grid grid-cols-2 gap-4">
                  {normalizedDetails.map((detail) => (
                    <div key={detail.id} className="p-3 md:p-4 font-bold uppercase text-[10px] md:text-xs" style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
                      <span className="block opacity-50 mb-1">{detail.label}</span>
                      {detail.value}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      );
    }

    if (isArtistic) {
      return (
        <section className="py-16 md:py-32 px-4 relative overflow-hidden text-white" style={{ backgroundColor: colorScheme.colors.secondary }}>
          <div className={`max-w-6xl mx-auto flex flex-col ${isMobile ? '' : 'md:flex-row'} gap-12 md:gap-20 items-center`}>
            <div className={`relative w-full ${isMobile ? '' : 'md:w-1/2'}`}>
              <motion.div 
                whileInView={{ rotate: -5, scale: 1.05 }}
                className="absolute inset-0 z-0 opacity-50"
                style={{ backgroundColor: colorScheme.colors.accent }}
              />
              <DraggableImage id="about-photo" src={content.about.profilePhotoUrl} className="relative z-10 w-full aspect-[3/4] object-cover shadow-2xl mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
            <div className={`w-full ${isMobile ? '' : 'md:w-1/2'}`}>
              <h2 style={getStyle('about-bg-title', { ...displayFont, fontSize: isMobile ? '3rem' : '5rem', fontWeight: 700, color: colorScheme.colors.accent, opacity: 0.2 })} className={`absolute ${isMobile ? '-top-6 -left-4' : '-top-10 -left-10'} z-0 uppercase`}>{t('story')}</h2>
              <div className="relative z-10">
                <Clickable id="about-title">
                  <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: 700 })} className="mb-2">{content.about.title || t('theNarrative')}</h2>
                </Clickable>
                {content.about.subtitle && (
                  <Clickable id="about-subtitle">
                    <p style={getStyle('about-subtitle', { fontSize: '1rem', fontWeight: 300, opacity: 0.5, marginBottom: '2rem', fontStyle: 'italic' })}>
                      {content.about.subtitle}
                    </p>
                  </Clickable>
                )}
                <Clickable id="about-bio">
                  <div 
                    style={{ ...getStyle('about-bio', { fontSize: isMobile ? '1.1rem' : '1.25rem', lineHeight: 1.6, fontStyle: 'italic', opacity: 0.9 }), borderColor: colorScheme.colors.accent }} 
                    className="border-l-4 pl-6 md:pl-8 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.about.bio }}
                  />
                </Clickable>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className={`py-16 md:py-24 px-4 max-w-6xl mx-auto grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} gap-12 items-center ${isFriendly ? 'rounded-[30px] md:rounded-[40px] my-8 md:my-12 shadow-xl border-4' : ''}`} style={{ backgroundColor: isFriendly ? colorScheme.colors.bg : 'transparent', borderColor: isFriendly ? colorScheme.colors.accent + '22' : 'transparent' }}>
        <motion.div 
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -50 }}
          viewport={{ once: true }}
          className={`aspect-[3/4] overflow-hidden shadow-2xl ${isFriendly ? 'rounded-[30px] md:rounded-[40px]' : 'rounded-2xl'}`}
        >
          <img 
            src={content.about.profilePhotoUrl} 
            alt="Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.div
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 50 }}
          viewport={{ once: true }}
        >
          <Clickable id="about-title">
            <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 700 })} className="mb-2">
              {content.about.title || t('aboutMe')}
            </h2>
          </Clickable>
          {content.about.subtitle && (
            <Clickable id="about-subtitle">
              <p style={getStyle('about-subtitle', { fontSize: '1rem', fontWeight: 500, opacity: 0.5, marginBottom: '1.5rem' })}>
                {content.about.subtitle}
              </p>
            </Clickable>
          )}
          <Clickable id="about-bio">
            <div 
              style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.125rem', lineHeight: 1.6, opacity: 0.8 })} 
              className="mb-8 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content.about.bio }}
            />
          </Clickable>
          {normalizedDetails.length > 0 && (
            <div className="grid grid-cols-2 gap-4 border-t pt-8" style={{ borderColor: colorScheme.colors.border }}>
              {normalizedDetails.map((detail) => (
                <div key={detail.id}>
                  <Clickable id={`detail-label-${detail.id}`}>
                    <span style={getStyle(`detail-label-${detail.id}`, { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 })} className="block mb-1">{detail.label}</span>
                  </Clickable>
                  <Clickable id={`detail-value-${detail.id}`}>
                    <span style={getStyle(`detail-value-${detail.id}`, { fontWeight: 500 })} className="font-medium">{detail.value}</span>
                  </Clickable>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    );
  };

  const renderCareer = () => {
    if (isMinimal) {
      return (
        <section className="border-b-2" style={{ borderColor: colorScheme.colors.accent, backgroundColor: colorScheme.colors.bg }}>
          <div className={`${isMobile ? 'p-8' : 'p-12'} border-b-2`} style={{ borderColor: colorScheme.colors.accent }}>
            <Clickable id="career-title">
              <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em' })}>{content.careerTitle || '02. Career'}</h2>
            </Clickable>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            {content.career.map((item, idx) => (
              <div key={item.id} className={`${isMobile ? 'p-8' : 'p-12'} border-black ${!isMobile && idx % 2 === 0 ? 'border-r-2' : ''} ${isMobile || idx < content.career.length - 2 ? 'border-b-2' : ''}`} style={{ borderColor: colorScheme.colors.accent }}>
                <div className="font-mono text-sm opacity-50 mb-4">{item.period}</div>
                <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4 uppercase`}>{item.title}</h3>
                <div className="font-mono text-sm mb-4" dangerouslySetInnerHTML={{ __html: item.description }} />
                
                {item.thumbnail && (
                  <div className="mb-4 aspect-video overflow-hidden rounded-lg border border-black/10">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {item.youtubeUrl && (
                    <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-500 text-white rounded">
                      <Youtube size={12} />
                      <span>YOUTUBE</span>
                    </a>
                  )}
                  {item.websiteUrl && (
                    <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-blue-500 text-white rounded">
                      <LinkIcon size={12} />
                      <span>WEBSITE</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (isDiva) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'}`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className="max-w-4xl mx-auto px-4">
            <Clickable id="career-title">
              <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '2.5rem' : '4rem', fontStyle: 'italic', textAlign: 'center', color: colorScheme.colors.accent })} className={`${isMobile ? 'mb-12' : 'mb-20'}`}>{content.careerTitle || t('theJourney')}</h2>
            </Clickable>
            <div className={`${isMobile ? 'space-y-16' : 'space-y-24'}`}>
              {content.career.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 50 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`${isMobile ? 'text-6xl' : 'text-8xl'} font-serif mb-4`} style={{ color: `${colorScheme.colors.accent}33` }}>{item.period.split('.')[0]}</div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-light tracking-widest uppercase mb-6`}>{item.title}</h3>
                  
                  {item.thumbnail && (
                    <div className="mb-6 w-full max-w-lg aspect-video overflow-hidden rounded-2xl shadow-2xl">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="max-w-xl leading-loose opacity-60 text-sm md:text-base mb-6" dangerouslySetInnerHTML={{ __html: item.description }} />
                  
                  <div className="flex flex-wrap gap-4 justify-center">
                    {item.youtubeUrl && (
                      <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold px-4 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                        <Youtube size={16} />
                        <span>YOUTUBE</span>
                      </a>
                    )}
                    {item.websiteUrl && (
                      <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold px-4 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
                        <LinkIcon size={16} />
                        <span>WEBSITE</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isArtistic) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'} text-white`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className="max-w-6xl mx-auto px-4 relative">
            <div className="absolute top-0 left-1/2 w-px h-full -translate-x-1/2 hidden md:block" style={{ backgroundColor: `${colorScheme.colors.accent}33` }} />
            <Clickable id="career-title">
              <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '3rem' : '4.5rem', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.05em' })} className={`${isMobile ? 'mb-16' : 'mb-32'}`}>{content.careerTitle || 'Milestones'}</h2>
            </Clickable>
            <div className={`${isMobile ? 'space-y-16' : 'space-y-32'}`}>
              {content.career.map((item, idx) => (
                <div key={item.id} className={`flex flex-col md:flex-row gap-8 md:gap-12 items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                    <span className="text-sm font-bold mb-4 tracking-widest uppercase" style={{ color: colorScheme.colors.accent }}>{item.period}</span>
                    <h3 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-6 uppercase leading-none`}>{item.title}</h3>
                    <p className="opacity-50 leading-relaxed text-sm md:text-base">{item.description}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full z-10 hidden md:flex items-center justify-center font-bold text-black border-4" style={{ backgroundColor: colorScheme.colors.accent, borderColor: colorScheme.colors.bg }}>
                    {idx + 1}
                  </div>
                  <div className="w-full md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isPop) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'} overflow-hidden`} style={{ backgroundColor: colorScheme.colors.secondary }}>
          <div className="max-w-6xl mx-auto px-4">
            <Clickable id="career-title">
              <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '3rem' : '5rem', fontWeight: 900, color: colorScheme.colors.bg, textTransform: 'uppercase', fontStyle: 'italic' })} className={`${isMobile ? 'mb-12' : 'mb-20'} drop-shadow-lg`}>{content.careerTitle || 'Timeline'}</h2>
            </Clickable>
            <div className="flex gap-6 md:gap-8 overflow-x-auto pb-12 no-scrollbar">
              {content.career.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -10 }}
                  className={`${isMobile ? 'min-w-[280px] p-6' : 'min-w-[350px] p-10'} border-4 shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`}
                  style={{ backgroundColor: colorScheme.colors.bg, borderColor: colorScheme.colors.text }}
                >
                  <div className="text-black inline-block px-4 py-1 font-bold mb-6 skew-x-[-10deg] text-xs md:text-sm" style={{ backgroundColor: colorScheme.colors.accent }}>
                    {item.period}
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black mb-4 uppercase leading-tight`}>{item.title}</h3>
                  <p className="opacity-60 text-xs md:text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} px-4`} style={{ backgroundColor: isFriendly ? colorScheme.colors.secondary + '22' : colorScheme.colors.secondary }}>
        <div className="max-w-6xl mx-auto">
          <Clickable id="career-title">
            <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 700, textAlign: 'center' })} className={`${isMobile ? 'mb-10' : 'mb-16'}`}>
              {content.careerTitle || t('careerTimeline')}
            </h2>
          </Clickable>
          <div className={`${isMobile ? 'space-y-8' : 'space-y-12'}`}>
            {content.career.map((item, idx) => (
              <motion.div 
                key={item.id}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col md:flex-row gap-6 md:gap-8 items-start ${isFriendly ? 'bg-white p-6 md:p-8 rounded-3xl shadow-sm border' : ''}`}
                style={{ borderColor: isFriendly ? colorScheme.colors.accent + '22' : 'transparent' }}
              >
                <div className={`${isMobile ? 'w-full text-xl' : 'md:w-1/4 text-2xl'} font-bold ${isFriendly ? '' : 'opacity-30'}`} style={getStyle('career-period', { ...displayFont, color: isFriendly ? colorScheme.colors.accent : undefined })}>
                  {item.period}
                </div>
                <div className={`${isMobile ? 'w-full p-6' : 'md:w-3/4 p-8'} rounded-2xl shadow-sm`} style={{ backgroundColor: isFriendly ? 'transparent' : colorScheme.colors.card }}>
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-4`}>{item.title}</h3>
                  <p className="opacity-70 leading-relaxed text-sm md:text-base">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderPortfolioItem = (item: PortfolioItem, className: string) => {
    if (item.type === 'video') {
      const ytMatch = item.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (ytMatch) {
        return (
          <iframe 
            src={`https://www.youtube.com/embed/${ytMatch[1]}`} 
            className={className}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        );
      }
      const vimeoMatch = item.url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/);
      if (vimeoMatch) {
        return (
          <iframe 
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} 
            className={className}
            allow="autoplay; fullscreen; picture-in-picture" 
            allowFullScreen
          />
        );
      }
      return <video src={item.url} className={className} controls playsInline muted />;
    }
    return <DraggableImage id={`portfolio-${item.id}`} src={item.url} alt={item.title || 'Portfolio'} className={className} referrerPolicy="no-referrer" />;
  };

  const renderPortfolio = () => {
    if (isMinimal) {
      return (
        <section className="border-b-2" style={{ borderColor: colorScheme.colors.accent, backgroundColor: colorScheme.colors.bg }}>
          <div className={`${isMobile ? 'p-8' : 'p-12'} border-b-2 flex justify-between items-center`} style={{ borderColor: colorScheme.colors.accent }}>
            <Clickable id="portfolio-title">
              <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em' })}>{content.portfolioTitle || '03. Works'}</h2>
            </Clickable>
            <span className="font-mono text-xs md:text-sm opacity-50">[{content.portfolio.length} ITEMS]</span>
          </div>
          <div className={`grid grid-cols-1 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {content.portfolio.map((item, idx) => (
              <div key={item.id} className="aspect-square border-r-2 border-b-2 last:border-r-0 group relative overflow-hidden" style={{ borderColor: colorScheme.colors.accent }}>
                {renderPortfolioItem(item, "w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500")}
                <div className="absolute bottom-0 left-0 w-full p-2 md:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform font-mono text-[10px] md:text-xs" style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg }}>
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (isDiva) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'}`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className="max-w-7xl mx-auto px-4">
            <Clickable id="portfolio-title">
              <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '2.5rem' : '4rem', fontStyle: 'italic', textAlign: 'center', color: colorScheme.colors.accent })} className={`${isMobile ? 'mb-12' : 'mb-20'}`}>{content.portfolioTitle || t('theGallery')}</h2>
            </Clickable>
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-2 gap-12'}`}>
              {content.portfolio.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 50 }}
                  className={`relative group overflow-hidden ${!isMobile && idx % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'}`}
                >
                  {renderPortfolioItem(item, "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110")}
                  <div className={`absolute inset-0 bg-black/40 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex flex-col justify-end p-6 md:p-12`}>
                    <h3 className="text-white text-xl md:text-3xl font-light uppercase tracking-widest">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isArtistic) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'} overflow-hidden`} style={{ backgroundColor: colorScheme.colors.secondary }}>
          <div className="max-w-6xl mx-auto px-4">
            <Clickable id="portfolio-title">
              <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '3rem' : '4.5rem', fontWeight: 700, color: colorScheme.colors.accent })} className={`${isMobile ? 'mb-12' : 'mb-20'} uppercase`}>{content.portfolioTitle || t('visuals')}</h2>
            </Clickable>
            <div className={`columns-1 ${isMobile ? 'columns-2' : 'md:columns-2 lg:columns-3'} gap-4 md:gap-8 space-y-4 md:space-y-8`}>
              {content.portfolio.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  className="relative group break-inside-avoid"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity z-10" style={{ backgroundColor: colorScheme.colors.accent }} />
                  {renderPortfolioItem(item, "w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500")}
                  <div className="mt-2 md:mt-4">
                    <h3 className="text-white text-sm md:text-lg font-bold uppercase tracking-tighter">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isPop) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'} px-4 overflow-hidden`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <Clickable id="portfolio-title">
            <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '15vw' : '8vw', fontWeight: 900, textAlign: 'center', color: colorScheme.colors.text, textTransform: 'uppercase' })} className={`${isMobile ? 'mb-12' : 'mb-20'} -rotate-2`}>{content.portfolioTitle || 'Gallery'}</h2>
          </Clickable>
          <div className="flex gap-6 md:gap-8 overflow-x-auto pb-12 px-4 md:px-12 no-scrollbar">
            {content.portfolio.map((item, idx) => (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
                className={`${isMobile ? 'min-w-[280px]' : 'min-w-[400px]'} aspect-[4/5] p-4 shadow-2xl`}
                style={{ backgroundColor: colorScheme.colors.bg, border: `${isMobile ? '4px' : '8px'} solid ${colorScheme.colors.text}` }}
              >
                {renderPortfolioItem(item, "w-full h-full object-cover mb-4")}
                <p className="font-bold uppercase text-sm md:text-base" style={{ color: colorScheme.colors.text }}>{item.title}</p>
              </motion.div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} px-4 max-w-6xl mx-auto ${isFriendly ? 'rounded-[30px] md:rounded-[40px] my-8 md:my-12 shadow-xl border-4' : ''}`} style={{ backgroundColor: isFriendly ? colorScheme.colors.bg : 'transparent', borderColor: isFriendly ? colorScheme.colors.accent + '22' : 'transparent' }}>
        <div className="max-w-6xl mx-auto">
          <Clickable id="portfolio-title">
            <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 700, textAlign: 'center' })} className={`${isMobile ? 'mb-10' : 'mb-16'}`}>
              {content.portfolioTitle || t('portfolio')}
            </h2>
          </Clickable>
          <div className={`grid grid-cols-1 ${isMobile ? 'grid-cols-2 gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {content.portfolio.map((item, idx) => (
              <motion.div 
                key={item.id}
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative aspect-video overflow-hidden shadow-lg cursor-pointer ${isFriendly ? 'rounded-2xl md:rounded-3xl' : 'rounded-xl'}`}
              >
                {renderPortfolioItem(item, "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110")}
                <div className={`absolute inset-0 bg-black/60 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex items-center justify-center p-4 md:p-6 text-center`}>
                  <p className="text-white font-medium text-xs md:text-base">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderStrengths = () => {
    const strengthsCount = content.strengths.length;
    const itemWidth = strengthsCount === 1 ? 'w-full' : strengthsCount === 2 ? 'w-full md:w-1/2' : 'w-full md:w-1/3';

    if (isMinimal) {
      return (
        <section className="border-b-2" style={{ borderColor: colorScheme.colors.accent, backgroundColor: colorScheme.colors.bg }}>
          <div className={`${isMobile ? 'p-8' : 'p-12'} border-b-2`} style={{ borderColor: colorScheme.colors.accent }}>
            <Clickable id="strengths-title" defaultStyle={{ ...displayFont, fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
              <h2 style={getStyle('strengths-title', { ...displayFont, fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em' })}>{content.strengthsTitle || '04. Strengths'}</h2>
            </Clickable>
          </div>
          <div className={`flex flex-wrap justify-center`}>
            {content.strengths.map((item, idx) => (
              <div key={item.id} className={`${isMobile ? 'p-8' : 'p-12'} border-black ${itemWidth} ${!isMobile && idx < content.strengths.length - 1 ? 'border-r-2' : ''} ${isMobile && idx < content.strengths.length - 1 ? 'border-b-2' : ''}`} style={{ borderColor: colorScheme.colors.accent }}>
                <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} mb-6`}>{item.icon}</div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-4 uppercase`}>{item.title}</h3>
                <p className="font-mono text-sm opacity-60">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (isDiva) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'}`} style={{ backgroundColor: colorScheme.colors.secondary }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className={`flex flex-wrap justify-center gap-y-12 md:gap-y-16`}>
              {content.strengths.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 50 }}
                  className={`${itemWidth} px-4 text-center`}
                >
                  <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} mb-6 md:mb-8 opacity-40`}>{item.icon}</div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-light tracking-widest uppercase mb-4 md:mb-6`}>{item.title}</h3>
                  <p className="opacity-50 leading-loose text-xs md:text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isArtistic) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'} text-white`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className={`flex flex-wrap justify-center gap-px bg-white/10`} style={{ backgroundColor: `${colorScheme.colors.accent}22` }}>
              {content.strengths.map((item, idx) => (
                <div key={item.id} className={`${isMobile ? 'p-8' : 'p-16'} ${itemWidth} group hover:bg-white/5 transition-colors`} style={{ backgroundColor: colorScheme.colors.bg }}>
                  <div className={`${isMobile ? 'text-3xl' : 'text-5xl'} mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 inline-block`}>{item.icon}</div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4 md:mb-6 uppercase`} style={{ color: colorScheme.colors.accent }}>{item.title}</h3>
                  <p className="opacity-50 leading-relaxed text-sm md:text-base">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isPop) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'}`} style={{ backgroundColor: colorScheme.colors.accent }}>
          <div className={`max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-8`}>
            {content.strengths.map((item, idx) => (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? -2 : 2 }}
                className={`${isMobile ? 'p-6' : 'p-10'} ${strengthsCount === 1 ? 'w-full' : strengthsCount === 2 ? 'w-[calc(50%-1.5rem)]' : 'w-full md:w-[calc(33.33%-2rem)]'} border-4 shadow-[10px_10px_0px_rgba(0,0,0,1)]`}
                style={{ backgroundColor: colorScheme.colors.bg, borderColor: colorScheme.colors.text }}
              >
                <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} mb-4 md:mb-6`}>{item.icon}</div>
                <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black mb-4 uppercase`}>{item.title}</h3>
                <p className="font-bold opacity-60 text-xs md:text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} px-4`} style={{ backgroundColor: isFriendly ? colorScheme.colors.bg : colorScheme.colors.bg }}>
        <div className="max-w-6xl mx-auto">
          <Clickable id="strengths-title" defaultStyle={{ ...displayFont, fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 700, textAlign: 'center' }}>
            <h2 style={getStyle('strengths-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 700, textAlign: 'center' })} className={`${isMobile ? 'mb-10' : 'mb-16'}`}>
              {content.strengthsTitle || t('keyStrengths')}
            </h2>
          </Clickable>
          <div className={`flex flex-wrap justify-center gap-6 md:gap-8`}>
            {content.strengths.map((item, idx) => (
              <motion.div 
                key={item.id}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`${isMobile ? 'p-6' : 'p-10'} ${strengthsCount === 1 ? 'w-full' : strengthsCount === 2 ? 'w-full md:w-[calc(50%-2rem)]' : 'w-full md:w-[calc(33.33%-2rem)]'} text-center ${isFriendly ? 'bg-white rounded-[30px] md:rounded-[40px] shadow-lg border-2' : 'rounded-3xl shadow-sm'}`}
                style={{ backgroundColor: isFriendly ? colorScheme.colors.bg : colorScheme.colors.card, borderColor: isFriendly ? colorScheme.colors.accent + '22' : 'transparent' }}
              >
                <div className={`${isMobile ? 'text-4xl' : 'text-5xl'} mb-4 md:mb-6`}>{item.icon}</div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-4`}>{item.title}</h3>
                <p className="opacity-70 leading-relaxed text-sm md:text-base">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderContact = () => {
    if (isMinimal) {
      return (
        <section className={`p-8 md:p-12 flex flex-col ${isMobile ? '' : 'md:flex-row'} gap-12 items-center justify-between`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className={`w-full ${isMobile ? '' : 'md:w-1/2'}`}>
            <Clickable id="contact-title">
              <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: 900, textTransform: 'uppercase' })} className="mb-8">{content.contact.title || 'Contact'}</h2>
            </Clickable>
            <div className="space-y-4 font-mono uppercase text-sm md:text-base">
              <a href={`mailto:${content.contact.email}`} className="block border-b-2 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: colorScheme.colors.accent }}>Email: {content.contact.email}</a>
              {content.contact.phone && <a href={`tel:${content.contact.phone}`} className="block border-b-2 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: colorScheme.colors.accent }}>Phone: {content.contact.phone}</a>}
              {content.contact.kakaoOpenChat && <a href={content.contact.kakaoOpenChat} target="_blank" rel="noreferrer" className="block border-b-2 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: colorScheme.colors.accent }}>KakaoTalk</a>}
              {content.contact.instagram && <a href={content.contact.instagram} target="_blank" rel="noreferrer" className="block border-b-2 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: colorScheme.colors.accent }}>Instagram</a>}
              {content.contact.youtube && <a href={content.contact.youtube} target="_blank" rel="noreferrer" className="block border-b-2 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: colorScheme.colors.accent }}>YouTube</a>}
              {content.contact.tiktok && <a href={content.contact.tiktok} target="_blank" rel="noreferrer" className="block border-b-2 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: colorScheme.colors.accent }}>TikTok</a>}
              {content.contact.blog && <a href={content.contact.blog} target="_blank" rel="noreferrer" className="block border-b-2 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: colorScheme.colors.accent }}>Blog</a>}
            </div>
          </div>
          <div className={`w-full ${isMobile ? 'max-w-[200px]' : 'md:w-1/3'} border-2 p-6 md:p-8 flex flex-col items-center gap-4`} style={{ borderColor: colorScheme.colors.accent }}>
            <div className="p-2 bg-white border" style={{ borderColor: colorScheme.colors.accent }}>
              <QRCodeSVG value={window.location.href} size={isMobile ? 100 : 120} />
            </div>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest opacity-50">{t('scanToConnect')}</span>
          </div>
        </section>
      );
    }

    if (isDiva) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'} text-center`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-2xl mx-auto px-4">
            <Clickable id="contact-title">
              <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '2.5rem' : '4rem', fontStyle: 'italic', color: colorScheme.colors.accent })} className="mb-8 md:mb-12">{content.contact.title || t('connect')}</h2>
            </Clickable>
            <p className="mb-12 md:mb-16 font-light tracking-widest uppercase opacity-60 text-xs md:text-sm">{t('forInquiries')}</p>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-px border ${isMobile ? 'mb-12' : 'mb-20'}`} style={{ backgroundColor: `${colorScheme.colors.accent}22`, borderColor: `${colorScheme.colors.accent}22` }}>
              <a href={`mailto:${content.contact.email}`} className={`${isMobile ? 'p-6' : 'p-10'} hover:bg-white/5 transition-colors flex flex-col items-center gap-4`} style={{ backgroundColor: colorScheme.colors.bg }}>
                <Mail style={{ color: colorScheme.colors.accent }} size={isMobile ? 24 : 32} />
                <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60">Email</span>
              </a>
              {content.contact.phone && (
                <a href={`tel:${content.contact.phone}`} className={`${isMobile ? 'p-6' : 'p-10'} hover:bg-white/5 transition-colors flex flex-col items-center gap-4`} style={{ backgroundColor: colorScheme.colors.bg }}>
                  <Phone style={{ color: colorScheme.colors.accent }} size={isMobile ? 24 : 32} />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60">Phone</span>
                </a>
              )}
              {content.contact.kakaoOpenChat && (
                <a href={content.contact.kakaoOpenChat} target="_blank" rel="noreferrer" className={`${isMobile ? 'p-6' : 'p-10'} hover:bg-white/5 transition-colors flex flex-col items-center gap-4`} style={{ backgroundColor: colorScheme.colors.bg }}>
                  <MessageCircle style={{ color: colorScheme.colors.accent }} size={isMobile ? 24 : 32} />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60">KakaoTalk</span>
                </a>
              )}
              {content.contact.instagram && (
                <a href={content.contact.instagram} target="_blank" rel="noreferrer" className={`${isMobile ? 'p-6' : 'p-10'} hover:bg-white/5 transition-colors flex flex-col items-center gap-4`} style={{ backgroundColor: colorScheme.colors.bg }}>
                  <Instagram style={{ color: colorScheme.colors.accent }} size={isMobile ? 24 : 32} />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60">Instagram</span>
                </a>
              )}
              {content.contact.youtube && (
                <a href={content.contact.youtube} target="_blank" rel="noreferrer" className={`${isMobile ? 'p-6' : 'p-10'} hover:bg-white/5 transition-colors flex flex-col items-center gap-4`} style={{ backgroundColor: colorScheme.colors.bg }}>
                  <Youtube style={{ color: colorScheme.colors.accent }} size={isMobile ? 24 : 32} />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60">YouTube</span>
                </a>
              )}
              {content.contact.tiktok && (
                <a href={content.contact.tiktok} target="_blank" rel="noreferrer" className={`${isMobile ? 'p-6' : 'p-10'} hover:bg-white/5 transition-colors flex flex-col items-center gap-4`} style={{ backgroundColor: colorScheme.colors.bg }}>
                  <Video style={{ color: colorScheme.colors.accent }} size={isMobile ? 24 : 32} />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60">TikTok</span>
                </a>
              )}
              {content.contact.blog && (
                <a href={content.contact.blog} target="_blank" rel="noreferrer" className={`${isMobile ? 'p-6' : 'p-10'} hover:bg-white/5 transition-colors flex flex-col items-center gap-4`} style={{ backgroundColor: colorScheme.colors.bg }}>
                  <BookOpen style={{ color: colorScheme.colors.accent }} size={isMobile ? 24 : 32} />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest opacity-60">Blog</span>
                </a>
              )}
            </div>
            <div className={`inline-block ${isMobile ? 'p-4' : 'p-6'} bg-white rounded-xl shadow-2xl`}>
              <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 120 : 150} />
            </div>
          </div>
        </section>
      );
    }

    if (isArtistic) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'} text-black`} style={{ backgroundColor: colorScheme.colors.accent }}>
          <div className={`max-w-6xl mx-auto px-4 flex flex-col ${isMobile ? '' : 'md:flex-row'} items-center gap-12 md:gap-20`}>
            <div className={`w-full ${isMobile ? '' : 'md:w-1/2'}`}>
              <Clickable id="contact-title">
                <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '3.5rem' : '6rem', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 })} className="mb-6 md:mb-8">{content.contact.title || t('talk')}</h2>
              </Clickable>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold uppercase mb-8 md:mb-12 opacity-80`}>{t('letsCreate')}</p>
              <div className="flex flex-col gap-4">
                <a href={`mailto:${content.contact.email}`} className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black hover:translate-x-4 transition-transform break-all`}>{content.contact.email}</a>
                {content.contact.phone && <a href={`tel:${content.contact.phone}`} className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black hover:translate-x-4 transition-transform italic underline`}>{content.contact.phone}</a>}
                {content.contact.kakaoOpenChat && <a href={content.contact.kakaoOpenChat} target="_blank" rel="noreferrer" className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black hover:translate-x-4 transition-transform italic underline`}>@KakaoTalk</a>}
                {content.contact.instagram && <a href={content.contact.instagram} target="_blank" rel="noreferrer" className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black hover:translate-x-4 transition-transform italic underline`}>@Instagram</a>}
                {content.contact.youtube && <a href={content.contact.youtube} target="_blank" rel="noreferrer" className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black hover:translate-x-4 transition-transform italic underline`}>@YouTube</a>}
                {content.contact.tiktok && <a href={content.contact.tiktok} target="_blank" rel="noreferrer" className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black hover:translate-x-4 transition-transform italic underline`}>@TikTok</a>}
                {content.contact.blog && <a href={content.contact.blog} target="_blank" rel="noreferrer" className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-black hover:translate-x-4 transition-transform italic underline`}>@Blog</a>}
              </div>
            </div>
            <div className={`w-full ${isMobile ? '' : 'md:w-1/2'} flex justify-center`}>
              <div className={`p-6 md:p-8 bg-black rounded-none rotate-3 shadow-[10px_10px_0px_rgba(255,255,255,1)] md:shadow-[20px_20px_0px_rgba(255,255,255,1)]`}>
                <div className="p-4 bg-white">
                  <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 150 : 200} />
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (isPop) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-32'}`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Clickable id="contact-title">
              <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '18vw' : '10vw', fontWeight: 900, color: colorScheme.colors.accent, textTransform: 'uppercase', lineHeight: 1 })} className="mb-10 md:mb-12">{content.contact.title || 'Hello!'}</h2>
            </Clickable>
            <div className={`flex flex-wrap justify-center gap-4 md:gap-8 ${isMobile ? 'mb-12' : 'mb-20'}`}>
              <a href={`mailto:${content.contact.email}`} className={`${isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-black uppercase skew-x-[-10deg] hover:scale-110 transition-transform shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: colorScheme.colors.secondary, color: colorScheme.colors.text }}>{t('emailMe')}</a>
              {content.contact.phone && <a href={`tel:${content.contact.phone}`} className={`${isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-black uppercase skew-x-[-10deg] hover:scale-110 transition-transform shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: colorScheme.colors.secondary, color: colorScheme.colors.text }}>{t('callMe')}</a>}
              {content.contact.kakaoOpenChat && <a href={content.contact.kakaoOpenChat} target="_blank" rel="noreferrer" className={`${isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-black uppercase skew-x-[-10deg] hover:scale-110 transition-transform shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}>KakaoTalk</a>}
              {content.contact.instagram && <a href={content.contact.instagram} target="_blank" rel="noreferrer" className={`${isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-black uppercase skew-x-[-10deg] hover:scale-110 transition-transform shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: colorScheme.colors.accent, color: colorScheme.colors.bg }}>Instagram</a>}
              {content.contact.youtube && <a href={content.contact.youtube} target="_blank" rel="noreferrer" className={`${isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-black uppercase skew-x-[-10deg] hover:scale-110 transition-transform shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: '#FF0000', color: '#FFFFFF' }}>YouTube</a>}
              {content.contact.tiktok && <a href={content.contact.tiktok} target="_blank" rel="noreferrer" className={`${isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-black uppercase skew-x-[-10deg] hover:scale-110 transition-transform shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>TikTok</a>}
              {content.contact.blog && <a href={content.contact.blog} target="_blank" rel="noreferrer" className={`${isMobile ? 'px-8 py-4 text-xl' : 'px-12 py-6 text-2xl'} font-black uppercase skew-x-[-10deg] hover:scale-110 transition-transform shadow-[10px_10px_0px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: '#03C75A', color: '#FFFFFF' }}>Blog</a>}
            </div>
            <div className={`inline-block ${isMobile ? 'p-6' : 'p-8'} border-8 shadow-[10px_10px_0px_rgba(0,0,0,0.2)] md:shadow-[20px_20px_0px_rgba(0,0,0,0.2)]`} style={{ borderColor: colorScheme.colors.text, backgroundColor: colorScheme.colors.bg }}>
              <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 120 : 150} />
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} px-4 max-w-4xl mx-auto text-center`}>
        <Clickable id="contact-title">
          <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 700 })} className={`${isMobile ? 'mb-8' : 'mb-12'}`}>
            {content.contact.title || t('getInTouch')}
          </h2>
        </Clickable>
        <div className={`flex flex-wrap justify-center gap-4 md:gap-6 ${isMobile ? 'mb-10' : 'mb-16'}`}>
          <a href={`mailto:${content.contact.email}`} className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-opacity-10 ${isFriendly ? 'rounded-2xl bg-emerald-100 text-emerald-700 border-none' : 'rounded-full border'}`} style={{ borderColor: isFriendly ? undefined : colorScheme.colors.border }}>
            <Mail size={20} />
            <span className="text-sm md:text-base">Email</span>
          </a>
          {content.contact.phone && (
            <a href={`tel:${content.contact.phone}`} className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-opacity-10 ${isFriendly ? 'rounded-2xl bg-blue-100 text-blue-700 border-none' : 'rounded-full border'}`} style={{ borderColor: isFriendly ? undefined : colorScheme.colors.border }}>
              <Phone size={20} />
              <span className="text-sm md:text-base">Phone</span>
            </a>
          )}
          {content.contact.kakaoOpenChat && (
            <a href={content.contact.kakaoOpenChat} target="_blank" rel="noreferrer" className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-opacity-10 ${isFriendly ? 'rounded-2xl bg-yellow-100 text-yellow-700 border-none' : 'rounded-full border'}`} style={{ borderColor: isFriendly ? undefined : colorScheme.colors.border }}>
              <MessageCircle size={20} />
              <span className="text-sm md:text-base">KakaoTalk</span>
            </a>
          )}
          {content.contact.instagram && (
            <a href={content.contact.instagram} target="_blank" rel="noreferrer" className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-opacity-10 ${isFriendly ? 'rounded-2xl bg-pink-100 text-pink-700 border-none' : 'rounded-full border'}`} style={{ borderColor: isFriendly ? undefined : colorScheme.colors.border }}>
              <Instagram size={20} />
              <span className="text-sm md:text-base">Instagram</span>
            </a>
          )}
          {content.contact.youtube && (
            <a href={content.contact.youtube} target="_blank" rel="noreferrer" className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-opacity-10 ${isFriendly ? 'rounded-2xl bg-red-100 text-red-700 border-none' : 'rounded-full border'}`} style={{ borderColor: isFriendly ? undefined : colorScheme.colors.border }}>
              <Youtube size={20} />
              <span className="text-sm md:text-base">YouTube</span>
            </a>
          )}
          {content.contact.tiktok && (
            <a href={content.contact.tiktok} target="_blank" rel="noreferrer" className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-opacity-10 ${isFriendly ? 'rounded-2xl bg-gray-100 text-gray-700 border-none' : 'rounded-full border'}`} style={{ borderColor: isFriendly ? undefined : colorScheme.colors.border }}>
              <Video size={20} />
              <span className="text-sm md:text-base">TikTok</span>
            </a>
          )}
          {content.contact.blog && (
            <a href={content.contact.blog} target="_blank" rel="noreferrer" className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-opacity-10 ${isFriendly ? 'rounded-2xl bg-green-100 text-green-700 border-none' : 'rounded-full border'}`} style={{ borderColor: isFriendly ? undefined : colorScheme.colors.border }}>
              <BookOpen size={20} />
              <span className="text-sm md:text-base">Blog</span>
            </a>
          )}
        </div>

        <div className={`${isMobile ? 'p-8' : 'p-12'} border flex flex-col items-center gap-6 ${isFriendly ? 'rounded-[30px] md:rounded-[40px] bg-white shadow-xl border-emerald-100' : 'rounded-3xl'}`} style={{ borderColor: colorScheme.colors.border }}>
          <div className="p-4 bg-white rounded-2xl">
            <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 120 : 150} />
          </div>
          <p className="text-[10px] md:text-sm opacity-50 uppercase tracking-widest">{t('scanToShare')}</p>
          <h3 style={getStyle('footer-name', { ...displayFont, fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700 })} className="text-xl md:text-2xl font-bold">{content.hero.nameEn}</h3>
        </div>
      </section>
    );
  };

  const availableLanguages = languages.filter(lang => 
    lang.code === 'ko' || (page.content.translations && page.content.translations[lang.code])
  );

  return (
    <div className={`min-h-screen overflow-x-hidden ${isMinimal ? 'border-[20px] border-black' : ''}`} style={{ ...sectionStyle }}>
      {/* Language Selector */}
      {availableLanguages.length > 1 && (
        <div className="fixed top-6 right-6 z-50">
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-900 shadow-lg transition-all hover:bg-gray-50"
            >
              {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Globe size={16} />}
              <span className="text-sm font-medium">{languages.find(l => l.code === currentLang)?.label}</span>
              <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl overflow-hidden min-w-[120px] border border-gray-100"
                >
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-6 py-3 text-sm transition-colors hover:bg-gray-50 ${currentLang === lang.code ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div id="section-hero">{renderHero()}</div>
      <div id="section-about">{renderAbout()}</div>
      {(page.visibleSections?.career ?? true) && <div id="section-career">{renderCareer()}</div>}
      {(page.visibleSections?.portfolio ?? true) && <div id="section-portfolio">{renderPortfolio()}</div>}
      {(page.visibleSections?.strengths ?? true) && <div id="section-strengths">{renderStrengths()}</div>}
      <div id="section-contact">{renderContact()}</div>

      {/* Floating KakaoTalk Button */}
      {content.contact.kakaoOpenChat && (
        <motion.a 
          href={content.contact.kakaoOpenChat}
          target="_blank"
          rel="noreferrer"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed ${isMobile ? 'bottom-6 right-6 px-4 py-3 text-sm' : 'bottom-10 right-10 px-6 py-4 text-base'} z-[100] flex items-center gap-3 bg-[#FEE500] text-[#3C1E1E] rounded-full shadow-[0_10px_30px_rgba(254,229,0,0.4)] font-bold border border-[#FEE500] hover:shadow-[0_15px_40px_rgba(254,229,0,0.6)] transition-all`}
        >
          <MessageCircle size={isMobile ? 18 : 22} fill="#3C1E1E" />
          <span>{t('contactMe')}</span>
        </motion.a>
      )}

      {/* Checkout CTA — 홈페이지 제작 신청 버튼 */}
      {!onSelectElement && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16 px-6 text-center"
          style={{ backgroundColor: colorScheme.colors.secondary }}
        >
          <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: colorScheme.colors.text, fontFamily: layout.fonts.display }}>
            홈페이지 제작을 원하시나요?
          </h3>
          <p className="text-sm md:text-base mb-8 opacity-70" style={{ color: colorScheme.colors.text }}>
            지금 바로 신청하고 맞춤형 PR 홈페이지를 받아보세요
          </p>
          <a
            href={`/checkout/${page.slug}`}
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            style={{ backgroundColor: page.accentColor || colorScheme.colors.accent, color: colorScheme.colors.bg }}
          >
            <span>제작 신청하기</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t text-center opacity-50 text-sm" style={{ borderColor: colorScheme.colors.border }}>
        <p>&copy; {new Date().getFullYear()} {content.hero.nameKo}. All rights reserved.</p>
        <p className="mt-2">Powered by CastFolio</p>
      </footer>
    </div>
  );
};

export default PRPage;
