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
  const isAtelier = page.layout === 'curated-atelier';
  const isStitchEditorial01 = page.layout === 'stitch-editorial-01';
  const isStitchEditorial02 = page.layout === 'stitch-editorial-02';
  const isStitchEditorial03 = page.layout === 'stitch-editorial-03';
  const isStitchScrapbook04 = page.layout === 'stitch-scrapbook-04';
  const isStitchNoir05 = page.layout === 'stitch-noir-05';
  const isStitchBroadcaster06 = page.layout === 'stitch-broadcaster-06';
  const isStitchMinimal07 = page.layout === 'stitch-minimal-07';
  const isStitchCard08 = page.layout === 'stitch-card-08';

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

    if (isStitchEditorial02 || isStitchEditorial03) {
      return (
        <section className={`relative w-full min-h-screen flex items-center justify-center px-6 ${isMobile ? 'pt-28 pb-16' : 'pt-24'} overflow-hidden`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className={`max-w-7xl mx-auto w-full grid ${isMobile ? 'grid-cols-1 gap-10' : 'md:grid-cols-12 gap-12 items-center'}`}>
            <div className={`${isMobile ? '' : 'md:col-span-6'} z-10 flex flex-col items-start gap-6`}>
              {content.hero.label && (
                <Clickable id="hero-label">
                  <span style={getStyle('hero-label', { fontSize: '0.78rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: colorScheme.colors.accent, opacity: 0.75, fontFamily: layout.fonts.body })}>
                    {content.hero.label}
                  </span>
                </Clickable>
              )}
              <Clickable id="hero-name">
                <h1
                  style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '3.2rem' : '5.8rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.95 })}
                  className="uppercase"
                >
                  {(currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn).split(' ').map((part, idx) => (
                    <React.Fragment key={`${part}-${idx}`}>
                      {part}
                      {idx < (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn).split(' ').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h1>
              </Clickable>
              <Clickable id="hero-tagline">
                <p style={getStyle('hero-tagline', { fontSize: isMobile ? '1rem' : '1.2rem', opacity: 0.68, fontFamily: layout.fonts.body, maxWidth: '32rem', lineHeight: 1.8 })}>
                  {content.hero.tagline}
                </p>
              </Clickable>
              <div className="flex flex-wrap gap-4 mt-4">
                <a
                  href="#section-contact"
                  className="h-12 px-8 flex items-center justify-center text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                  style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg, fontFamily: layout.fonts.body }}
                >
                  Contact
                </a>
                <a
                  href="#section-portfolio"
                  className="h-12 px-8 border flex items-center justify-center text-xs uppercase tracking-[0.2em] transition-colors"
                  style={{ borderColor: `${colorScheme.colors.text}20`, color: colorScheme.colors.text, fontFamily: layout.fonts.body }}
                >
                  Portfolio
                </a>
              </div>
            </div>
            <div className={`${isMobile ? 'h-[420px]' : 'md:col-span-6 h-[720px]'} relative`}>
              <div className="absolute inset-0" style={{ backgroundColor: colorScheme.colors.card, transform: isMobile ? 'translate(12px, 12px)' : 'translate(18px, 18px)' }} />
              <div className="absolute inset-0 shadow-[0_20px_40px_rgba(49,51,44,0.08)]">
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (isStitchEditorial01) {
      return (
        <section className={`relative flex flex-col items-center justify-center text-center px-6 ${isMobile ? 'py-24' : 'py-32'} overflow-hidden`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 0.8px, transparent 0.8px)', backgroundSize: '22px 22px' }} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <div className={`${isMobile ? 'w-40 h-40 mb-10' : 'w-56 h-56 mb-12'} mx-auto rounded-full overflow-hidden border p-2`} style={{ borderColor: `${colorScheme.colors.accent}22` }}>
              <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
            <Clickable id="hero-name">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '3rem' : '5.5rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 })}
                className="mb-3 uppercase"
              >
                {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
              </motion.h1>
            </Clickable>
            {content.hero.label && (
              <Clickable id="hero-label">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.8 }}
                  style={getStyle('hero-label', { ...displayFont, fontSize: isMobile ? '1rem' : '1.35rem', fontStyle: 'italic', color: colorScheme.colors.accent, opacity: 0.8 })}
                  className="mb-6"
                >
                  {content.hero.label}
                </motion.p>
              </Clickable>
            )}
            <Clickable id="hero-tagline">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                style={getStyle('hero-tagline', { fontSize: isMobile ? '0.75rem' : '0.82rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.55, fontFamily: layout.fonts.body })}
                className="mb-10"
              >
                "{content.hero.tagline}"
              </motion.p>
            </Clickable>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#section-contact"
                className="px-8 py-3 text-xs uppercase tracking-[0.28em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg, fontFamily: layout.fonts.body }}
              >
                Contact
              </a>
              <a
                href="#section-portfolio"
                className="px-8 py-3 text-xs uppercase tracking-[0.28em] transition-colors"
                style={{ border: `1px solid ${colorScheme.colors.text}22`, color: colorScheme.colors.text, fontFamily: layout.fonts.body }}
              >
                Portfolio
              </a>
            </div>
            <div className="mt-12 flex flex-col items-center gap-2 opacity-40">
              <span className="text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: layout.fonts.body }}>Scroll</span>
              <div className="w-px h-12" style={{ backgroundColor: colorScheme.colors.text }} />
            </div>
          </motion.div>
        </section>
      );
    }

    if (isAtelier) {
      return (
        <section className={`relative flex flex-col items-center justify-center text-center px-4 ${isMobile ? 'py-20' : 'py-32'} overflow-hidden`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl mx-auto"
          >
            {content.hero.label && (
              <Clickable id="hero-label">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs md:text-sm uppercase tracking-[0.3em] mb-8"
                  style={getStyle('hero-label', { color: colorScheme.colors.accent, fontFamily: layout.fonts.body })}
                >
                  {content.hero.label}
                </motion.p>
              </Clickable>
            )}
            <div className={`${isMobile ? 'w-48 h-60' : 'w-64 h-80'} mx-auto mb-10 overflow-hidden shadow-2xl`} style={{ transform: 'rotate(-2deg)', borderRadius: '4px' }}>
              <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <Clickable id="hero-name">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '3.5rem' : '6rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 })}
                className="mb-6"
              >
                {content.hero.title || (currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn)}
              </motion.h1>
            </Clickable>
            <Clickable id="hero-tagline">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                style={getStyle('hero-tagline', { fontSize: isMobile ? '1.1rem' : '1.4rem', fontStyle: 'italic', opacity: 0.7, fontFamily: layout.fonts.body, lineHeight: 1.6 })}
                className="mb-12 px-4"
              >
                "{content.hero.tagline}"
              </motion.p>
            </Clickable>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              {content.contact.email && (
                <a
                  href={`mailto:${content.contact.email}`}
                  className="px-8 py-3 text-sm font-medium tracking-widest uppercase transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: colorScheme.colors.accent, color: colorScheme.colors.bg, borderRadius: '9999px', fontFamily: layout.fonts.body }}
                >
                  {t('contact')}
                </a>
              )}
              {content.contact.kakaoOpenChat && (
                <a
                  href={content.contact.kakaoOpenChat}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-3 text-sm font-medium tracking-widest uppercase transition-transform hover:scale-[1.02]"
                  style={{ border: `1px solid ${colorScheme.colors.accent}44`, color: colorScheme.colors.text, borderRadius: '9999px', fontFamily: layout.fonts.body }}
                >
                  KakaoTalk
                </a>
              )}
            </motion.div>
          </motion.div>
        </section>
      );
    }

    if (isStandard) {
      return (
        <section className={`relative flex items-end justify-end p-8 md:p-24 overflow-hidden ${isMobile ? 'min-h-screen' : 'h-screen'}`} style={{ backgroundColor: colorScheme.colors.bg }}>
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to left, ${colorScheme.colors.bg}dd, ${colorScheme.colors.bg}99, transparent)` }} />
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

    if (isStitchEditorial02 || isStitchEditorial03) {
      return (
        <section className={`${isMobile ? 'py-20 px-6' : 'py-24 px-6'}`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            <Clickable id="about-title">
              <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '1.7rem' : '2.3rem', fontWeight: 700, borderBottom: `1px solid ${colorScheme.colors.border}`, paddingBottom: '1rem' })}>
                {content.about.title || t('aboutMe')}
              </h2>
            </Clickable>
            {content.about.subtitle && (
              <Clickable id="about-subtitle">
                <p style={getStyle('about-subtitle', { fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 1.8, opacity: 0.78, fontStyle: 'italic', fontFamily: layout.fonts.body })}>
                  "{content.about.subtitle}"
                </p>
              </Clickable>
            )}
            <Clickable id="about-bio">
              <div
                style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 2, opacity: 0.72, fontFamily: layout.fonts.body })}
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content.about.bio }}
              />
            </Clickable>
            <div className="flex flex-wrap gap-3 pt-2">
              {normalizedDetails.slice(0, 4).map((detail) => (
                <div key={detail.id} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium" style={{ backgroundColor: colorScheme.colors.secondary, color: colorScheme.colors.bg, opacity: 0.85, fontFamily: layout.fonts.body }}>
                  <span>{detail.label}</span>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isStitchEditorial02 || isStitchEditorial03) {
      return (
        <section className={`${isMobile ? 'py-20 px-6' : 'py-24 px-6'}`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-3xl mx-auto">
            <Clickable id="portfolio-title">
              <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '1.7rem' : '2.3rem', fontWeight: 700, borderBottom: `1px solid ${colorScheme.colors.border}`, paddingBottom: '1rem' })} className="mb-12">
                {content.portfolioTitle || t('portfolio')}
              </h2>
            </Clickable>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.portfolio.map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 18 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="group"
                >
                  <div className="aspect-video mb-4 overflow-hidden" style={{ backgroundColor: colorScheme.colors.card }}>
                    {renderPortfolioItem(item, "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105")}
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-lg font-bold uppercase tracking-tight group-hover:opacity-75 transition-colors" style={{ fontFamily: layout.fonts.body }}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm mt-1" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] uppercase tracking-[0.24em] border-b pb-1 transition-colors hover:opacity-70"
                        style={{ borderColor: `${colorScheme.colors.accent}50`, color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}
                      >
                        View
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

    if (isStitchEditorial01) {
      return (
        <section className={`${isMobile ? 'py-20' : 'py-28'} px-6`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <div className="md:col-span-4">
              <Clickable id="about-title">
                <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '1.6rem' : '2rem', fontStyle: 'italic', fontWeight: 700 })} className="mb-3">
                  {content.about.title || t('aboutMe')}
                </h2>
              </Clickable>
              <div className="w-12 h-px mb-8" style={{ backgroundColor: `${colorScheme.colors.accent}55` }} />
              <div className="flex flex-wrap gap-3">
                {normalizedDetails.slice(0, 3).map((detail) => (
                  <div key={detail.id} className="px-4 py-2 text-[11px] font-medium" style={{ backgroundColor: colorScheme.colors.secondary, color: colorScheme.colors.text, fontFamily: layout.fonts.body }}>
                    {detail.value}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-8">
              {content.about.subtitle && (
                <Clickable id="about-subtitle">
                  <p style={getStyle('about-subtitle', { fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '1rem', fontFamily: layout.fonts.body })}>
                    {content.about.subtitle}
                  </p>
                </Clickable>
              )}
              <Clickable id="about-bio">
                <div
                  style={getStyle('about-bio', { ...displayFont, fontSize: isMobile ? '1.35rem' : '2rem', lineHeight: 1.6, opacity: 0.92 })}
                  className="max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: content.about.bio }}
                />
              </Clickable>
              {normalizedDetails.length > 0 && (
                <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 max-w-3xl">
                  {normalizedDetails.map((detail) => (
                    <div key={detail.id} className="pb-3 border-b" style={{ borderColor: `${colorScheme.colors.accent}18` }}>
                      <div className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ opacity: 0.45, fontFamily: layout.fonts.body }}>{detail.label}</div>
                      <div className="text-sm md:text-base font-medium" style={{ fontFamily: layout.fonts.body }}>{detail.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (isStitchEditorial01) {
      return (
        <section className={`${isMobile ? 'py-20' : 'py-28'} px-6`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-6xl mx-auto">
            <Clickable id="portfolio-title">
              <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 700 })} className="mb-14 md:mb-16">
                {content.portfolioTitle || t('portfolio')}
              </h2>
            </Clickable>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              {content.portfolio.map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 28 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="group"
                >
                  <div className="relative aspect-video overflow-hidden mb-6" style={{ backgroundColor: colorScheme.colors.card }}>
                    {renderPortfolioItem(item, "w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700")}
                    <div className={`absolute inset-0 bg-black/25 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex items-center justify-center`}>
                      <span className="text-white text-[11px] uppercase tracking-[0.25em]" style={{ fontFamily: layout.fonts.body }}>View</span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 style={{ ...displayFont, fontSize: isMobile ? '1.05rem' : '1.5rem', fontWeight: 700 }} className="mb-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm" style={{ opacity: 0.6, fontFamily: layout.fonts.body }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[11px] uppercase tracking-[0.22em] pb-1 border-b transition-colors hover:opacity-70"
                        style={{ borderColor: `${colorScheme.colors.accent}22`, color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}
                      >
                        Open
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

    if (isAtelier) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-28'} px-4`} style={{ backgroundColor: colorScheme.colors.card, color: colorScheme.colors.text }}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-6 ${isMobile ? 'mb-12' : 'mb-20'}`}>
              <Clickable id="about-title">
                <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700 })}>
                  {content.about.title || t('theEssence')}
                </h2>
              </Clickable>
              <div className="flex-1 h-px" style={{ backgroundColor: `${colorScheme.colors.accent}33` }} />
            </div>
            <div className={`flex flex-col ${isMobile ? '' : 'md:flex-row'} gap-12 md:gap-20 items-start`}>
              <div className={`${isMobile ? 'w-40 h-52' : 'w-56 h-72'} shrink-0 overflow-hidden shadow-xl`} style={{ borderRadius: '4px' }}>
                <DraggableImage id="about-photo" src={content.about.profilePhotoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                {content.about.subtitle && (
                  <Clickable id="about-subtitle">
                    <p style={getStyle('about-subtitle', { fontSize: '0.85rem', opacity: 0.5, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: layout.fonts.body })}>
                      {content.about.subtitle}
                    </p>
                  </Clickable>
                )}
                <Clickable id="about-bio">
                  <div
                    style={getStyle('about-bio', { fontSize: isMobile ? '1.05rem' : '1.2rem', lineHeight: 1.8, fontFamily: layout.fonts.body })}
                    className="mb-10 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.about.bio }}
                  />
                </Clickable>
                <div className="flex flex-wrap gap-3">
                  {normalizedDetails.map((detail) => (
                    <div
                      key={detail.id}
                      className="px-4 py-2 text-xs tracking-widest uppercase"
                      style={{ border: `1px solid ${colorScheme.colors.accent}44`, borderRadius: '9999px', fontFamily: layout.fonts.body, color: colorScheme.colors.text }}
                    >
                      <span style={{ opacity: 0.5 }}>{detail.label} </span>
                      <span className="font-semibold">{detail.value}</span>
                    </div>
                  ))}
                </div>
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

    if (isStitchEditorial02 || isStitchEditorial03) {
      return (
        <section className={`${isMobile ? 'py-20 px-6' : 'py-24 px-6'}`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-3xl mx-auto">
            <Clickable id="career-title">
              <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '1.7rem' : '2.3rem', fontWeight: 700, borderBottom: `1px solid ${colorScheme.colors.border}`, paddingBottom: '1rem' })} className="mb-12">
                {content.careerTitle || t('careerTimeline')}
              </h2>
            </Clickable>
            <div className={`relative ${isMobile ? 'pl-8' : 'pl-0'}`}>
              <div className={`absolute ${isMobile ? 'left-0' : 'left-32'} top-0 bottom-0 w-px`} style={{ backgroundColor: `${colorScheme.colors.accent}30` }} />
              <div className="space-y-12">
                {content.career.map((item) => (
                  <motion.div
                    key={item.id}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    viewport={{ once: true }}
                    className={`${isMobile ? '' : 'grid md:grid-cols-[128px_1fr] gap-8 items-start'} relative`}
                  >
                    {!isMobile && (
                      <div className="font-medium text-sm text-right pr-8" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>
                        {item.period}
                      </div>
                    )}
                    <div className="relative">
                      <div className={`absolute ${isMobile ? '-left-8' : '-left-[41px]'} top-1.5 w-4 h-4 ring-4`} style={{ backgroundColor: colorScheme.colors.text, boxShadow: `0 0 0 4px ${colorScheme.colors.bg}` }} />
                      {isMobile && (
                        <div className="font-medium text-sm mb-2" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>
                          {item.period}
                        </div>
                      )}
                      <h3 style={{ ...displayFont, fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700 }} className="mb-2 uppercase">
                        {item.title}
                      </h3>
                      {item.role && <p className="mb-3 text-sm font-medium" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>{item.role}</p>}
                      <p className="text-sm leading-relaxed" style={{ opacity: 0.72, fontFamily: layout.fonts.body }}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (isStitchEditorial01) {
      return (
        <section className={`${isMobile ? 'py-20' : 'py-28'} px-6`} style={{ backgroundColor: colorScheme.colors.secondary, color: colorScheme.colors.text }}>
          <div className="max-w-6xl mx-auto">
            <Clickable id="career-title">
              <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.4rem', fontStyle: 'italic', fontWeight: 700, textAlign: 'center' })} className="mb-14 md:mb-20">
                {content.careerTitle || t('careerTimeline')}
              </h2>
            </Clickable>
            <div className="relative max-w-5xl mx-auto">
              {!isMobile && <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ backgroundColor: `${colorScheme.colors.accent}22` }} />}
              <div className={`${isMobile ? 'space-y-10' : 'space-y-16'}`}>
                {content.career.map((item, idx) => {
                  const reverse = idx % 2 === 1;
                  return (
                    <motion.div
                      key={item.id}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 24 }}
                      viewport={{ once: true }}
                      className={`relative ${isMobile ? 'pl-8' : 'flex items-start justify-between'} ${!isMobile && reverse ? 'md:flex-row-reverse' : ''}`}
                    >
                      {isMobile && <div className="absolute left-0 top-2 bottom-0 w-px" style={{ backgroundColor: `${colorScheme.colors.accent}18` }} />}
                      <div className={`${isMobile ? 'mb-3' : 'md:w-5/12'} ${!isMobile && reverse ? 'md:text-left' : !isMobile ? 'md:text-right' : ''}`}>
                        <span style={{ ...displayFont, fontSize: isMobile ? '1rem' : '1.1rem', fontStyle: 'italic', color: colorScheme.colors.accent }}>
                          {item.period}
                        </span>
                      </div>
                      <div className={`absolute ${isMobile ? 'left-0' : 'left-1/2'} top-2 w-3 h-3 -translate-x-1/2`} style={{ backgroundColor: colorScheme.colors.accent }} />
                      <div className={`${isMobile ? '' : 'md:w-5/12'} ${isMobile ? 'pt-0' : ''}`}>
                        <h3 style={{ ...displayFont, fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700 }} className="mb-2">{item.title}</h3>
                        {item.role && <p className="mb-3 text-sm font-medium" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>{item.role}</p>}
                        <p className="text-sm leading-relaxed max-w-md" style={{ opacity: 0.68, fontFamily: layout.fonts.body }}>{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (isStitchEditorial02 || isStitchEditorial03) {
      const editorialContacts = [
        { href: `mailto:${content.contact.email}`, label: content.contact.email, icon: <Mail size={16} />, external: false, show: !!content.contact.email },
        { href: `tel:${content.contact.phone}`, label: content.contact.phone || '', icon: <Phone size={16} />, external: false, show: !!content.contact.phone },
        { href: content.contact.kakaoOpenChat || '', label: 'Kakao Open Chat', icon: <MessageCircle size={16} />, external: true, show: !!content.contact.kakaoOpenChat },
        { href: content.contact.instagram || '', label: 'Instagram', icon: <Instagram size={16} />, external: true, show: !!content.contact.instagram },
        { href: content.contact.youtube || '', label: 'YouTube', icon: <Youtube size={16} />, external: true, show: !!content.contact.youtube },
        { href: content.contact.blog || '', label: 'Blog', icon: <BookOpen size={16} />, external: true, show: !!content.contact.blog },
      ].filter((item) => item.show);

      return (
        <section className={`${isMobile ? 'py-20 px-6' : 'py-24 px-6'}`} style={{ backgroundColor: colorScheme.colors.card, color: colorScheme.colors.text }}>
          <div className="max-w-4xl mx-auto p-8 md:p-12 shadow-[0_20px_40px_rgba(49,51,44,0.05)]" style={{ backgroundColor: colorScheme.colors.bg }}>
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-10' : 'md:grid-cols-2 gap-14'}`}>
              <div className="space-y-6">
                <Clickable id="contact-title">
                  <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 700 })}>
                    {content.contact.title || 'Contact'}
                  </h2>
                </Clickable>
                {content.contact.subtitle && (
                  <Clickable id="contact-subtitle">
                    <p style={getStyle('contact-subtitle', { fontSize: '0.98rem', lineHeight: 1.9, opacity: 0.7, fontFamily: layout.fonts.body })}>
                      {content.contact.subtitle}
                    </p>
                  </Clickable>
                )}
                <div className="space-y-4">
                  {editorialContacts.map((item) => (
                    <a
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                      className="flex items-center gap-4 group"
                    >
                      <span style={{ color: colorScheme.colors.accent }}>{item.icon}</span>
                      <span className="text-sm font-medium border-b border-transparent group-hover:opacity-70 transition-all" style={{ fontFamily: layout.fonts.body }}>
                        {item.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="block text-xs uppercase tracking-[0.24em] mb-2 font-semibold" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>Name</div>
                  <div className="w-full border-b py-3 text-sm" style={{ borderColor: `${colorScheme.colors.accent}35`, opacity: 0.55, fontFamily: layout.fonts.body }}>
                    {content.hero.nameEn}
                  </div>
                </div>
                <div>
                  <div className="block text-xs uppercase tracking-[0.24em] mb-2 font-semibold" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>Email</div>
                  <div className="w-full border-b py-3 text-sm break-all" style={{ borderColor: `${colorScheme.colors.accent}35`, opacity: 0.55, fontFamily: layout.fonts.body }}>
                    {content.contact.email}
                  </div>
                </div>
                <div>
                  <div className="block text-xs uppercase tracking-[0.24em] mb-2 font-semibold" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>Message</div>
                  <div className="w-full border-b py-3 text-sm min-h-[96px]" style={{ borderColor: `${colorScheme.colors.accent}35`, opacity: 0.55, fontFamily: layout.fonts.body }}>
                    프로젝트 내용과 일정은 직접 문의 링크로 전달해주세요.
                  </div>
                </div>
                <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between gap-6'} pt-2`}>
                  <a
                    href={`mailto:${content.contact.email}`}
                    className="h-12 px-8 inline-flex items-center justify-center text-xs font-bold uppercase tracking-[0.22em] hover:opacity-80 transition-colors"
                    style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg, fontFamily: layout.fonts.body }}
                  >
                    Send Inquiry
                  </a>
                  <div className="p-3 border inline-flex" style={{ borderColor: `${colorScheme.colors.accent}18`, backgroundColor: colorScheme.colors.bg }}>
                    <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={96} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (isStitchEditorial01) {
      const editorialContacts = [
        { href: `mailto:${content.contact.email}`, label: content.contact.email, icon: <Mail size={16} />, external: false, show: !!content.contact.email },
        { href: `tel:${content.contact.phone}`, label: content.contact.phone || '', icon: <Phone size={16} />, external: false, show: !!content.contact.phone },
        { href: content.contact.kakaoOpenChat || '', label: 'Kakao Open Chat', icon: <MessageCircle size={16} />, external: true, show: !!content.contact.kakaoOpenChat },
        { href: content.contact.instagram || '', label: 'Instagram', icon: <Instagram size={16} />, external: true, show: !!content.contact.instagram },
        { href: content.contact.youtube || '', label: 'YouTube', icon: <Youtube size={16} />, external: true, show: !!content.contact.youtube },
        { href: content.contact.blog || '', label: 'Blog', icon: <BookOpen size={16} />, external: true, show: !!content.contact.blog },
      ].filter((item) => item.show);

      return (
        <section className={`${isMobile ? 'py-20' : 'py-28'} px-6`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <div className="md:col-span-5">
              <Clickable id="contact-title">
                <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '1.9rem' : '2.6rem', fontWeight: 700 })} className="mb-4">
                  {content.contact.title || t('getInTouch')}
                </h2>
              </Clickable>
              {content.contact.subtitle && (
                <Clickable id="contact-subtitle">
                  <p style={getStyle('contact-subtitle', { fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '2rem', fontFamily: layout.fonts.body })}>
                    {content.contact.subtitle}
                  </p>
                </Clickable>
              )}
              <div className="space-y-4">
                {editorialContacts.map((item) => (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    className="flex items-center justify-between gap-4 py-4 border-b transition-opacity hover:opacity-70"
                    style={{ borderColor: `${colorScheme.colors.accent}18`, fontFamily: layout.fonts.body }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: colorScheme.colors.accent }}>{item.icon}</span>
                      <span className="text-sm md:text-base break-all">{item.label}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.22em]" style={{ opacity: 0.45 }}>Open</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="md:col-span-7">
              <div className={`${isMobile ? 'p-8' : 'p-10'} h-full`} style={{ backgroundColor: colorScheme.colors.card }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] mb-4" style={{ opacity: 0.45, fontFamily: layout.fonts.body }}>
                      Direct Inquiry
                    </div>
                    <Clickable id="footer-name">
                      <h3 style={getStyle('footer-name', { ...displayFont, fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 700, marginBottom: '1rem' })}>
                        {content.hero.nameEn}
                      </h3>
                    </Clickable>
                    <p className="text-sm leading-relaxed mb-6" style={{ opacity: 0.65, fontFamily: layout.fonts.body }}>
                      방송, 행사, 인터뷰, 브랜드 협업 관련 문의를 남겨주시면 확인 후 빠르게 회신드립니다.
                    </p>
                    <a
                      href={`mailto:${content.contact.email}`}
                      className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.24em] transition-opacity hover:opacity-80"
                      style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg, fontFamily: layout.fonts.body }}
                    >
                      Send Inquiry
                    </a>
                  </div>
                  <div className="flex justify-center md:justify-end">
                    <div className={`${isMobile ? 'p-4' : 'p-5'} border`} style={{ backgroundColor: colorScheme.colors.bg, borderColor: `${colorScheme.colors.accent}16` }}>
                      <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 120 : 150} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (isAtelier) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-28'} px-4`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-6 ${isMobile ? 'mb-12' : 'mb-20'}`}>
              <Clickable id="career-title">
                <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700 })}>
                  {content.careerTitle || t('theJourney')}
                </h2>
              </Clickable>
              <div className="flex-1 h-px" style={{ backgroundColor: `${colorScheme.colors.accent}33` }} />
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-px" style={{ backgroundColor: `${colorScheme.colors.accent}33` }} />
              <div className={`${isMobile ? 'space-y-10' : 'space-y-16'} pl-8 md:pl-12`}>
                {content.career.map((item) => (
                  <motion.div
                    key={item.id}
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -20 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="absolute -left-8 md:-left-12 top-1 w-3 h-3 rounded-full border-2" style={{ backgroundColor: colorScheme.colors.bg, borderColor: colorScheme.colors.accent }} />
                    <div className="text-xs tracking-widest uppercase mb-2" style={{ opacity: 0.5, fontFamily: layout.fonts.body }}>{item.period}</div>
                    <h3 style={{ ...displayFont, fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700 }} className="mb-3">{item.title}</h3>
                    {item.role && <p className="text-sm mb-3" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>{item.role}</p>}
                    {item.thumbnail && (
                      <div className="mb-4 aspect-video overflow-hidden shadow-lg" style={{ maxWidth: '400px', borderRadius: '4px' }}>
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="text-sm leading-relaxed mb-4" style={{ opacity: 0.7, fontFamily: layout.fonts.body }} dangerouslySetInnerHTML={{ __html: item.description }} />
                    <div className="flex flex-wrap gap-3">
                      {item.youtubeUrl && (
                        <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs px-4 py-2 transition-transform hover:scale-[1.02]" style={{ border: `1px solid ${colorScheme.colors.accent}44`, borderRadius: '9999px', fontFamily: layout.fonts.body }}>
                          <Youtube size={12} />YouTube
                        </a>
                      )}
                      {item.websiteUrl && (
                        <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs px-4 py-2 transition-transform hover:scale-[1.02]" style={{ border: `1px solid ${colorScheme.colors.accent}44`, borderRadius: '9999px', fontFamily: layout.fonts.body }}>
                          <LinkIcon size={12} />Website
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
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

    if (isAtelier) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-28'} px-4`} style={{ backgroundColor: colorScheme.colors.card, color: colorScheme.colors.text }}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-6 ${isMobile ? 'mb-12' : 'mb-20'}`}>
              <Clickable id="portfolio-title">
                <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700 })}>
                  {content.portfolioTitle || t('theGallery')}
                </h2>
              </Clickable>
              <div className="flex-1 h-px" style={{ backgroundColor: `${colorScheme.colors.accent}33` }} />
            </div>
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-2 gap-8'}`}>
              {content.portfolio.map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className={`group relative overflow-hidden shadow-md ${!isMobile && idx === 0 ? 'md:col-span-2 aspect-[16/7]' : 'aspect-[4/3]'}`}
                  style={{ borderRadius: '4px' }}
                >
                  {renderPortfolioItem(item, "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105")}
                  <div className={`absolute inset-0 bg-black/30 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex flex-col justify-end p-6`}>
                    <p className="text-white font-medium text-sm md:text-base" style={{ fontFamily: layout.fonts.body }}>{item.title}</p>
                    {item.description && <p className="text-white/70 text-xs mt-1" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
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

    if (isStitchEditorial02 || isStitchEditorial03) {
      return (
        <section className={`${isMobile ? 'py-20 px-6' : 'py-24 px-6'}`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-3xl mx-auto">
            <Clickable id="strengths-title">
              <h2 style={getStyle('strengths-title', { ...displayFont, fontSize: isMobile ? '1.7rem' : '2.3rem', fontWeight: 700, borderBottom: `1px solid ${colorScheme.colors.border}`, paddingBottom: '1rem' })} className="mb-12">
                {content.strengthsTitle || t('keyStrengths')}
              </h2>
            </Clickable>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {content.strengths.map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-6 transition-colors" style={{ backgroundColor: colorScheme.colors.card }}>
                    <span className="text-3xl" style={{ color: colorScheme.colors.accent }}>{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 uppercase" style={{ fontFamily: layout.fonts.body }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ opacity: 0.7, fontFamily: layout.fonts.body }}>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isStitchEditorial01) {
      return (
        <section className={`${isMobile ? 'py-20' : 'py-28'} px-6`} style={{ backgroundColor: colorScheme.colors.card, color: colorScheme.colors.text }}>
          <div className="max-w-6xl mx-auto">
            <Clickable id="strengths-title">
              <h2 style={getStyle('strengths-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.4rem', fontStyle: 'italic', fontWeight: 700, textAlign: 'center' })} className="mb-14 md:mb-16">
                {content.strengthsTitle || t('keyStrengths')}
              </h2>
            </Clickable>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.strengths.map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className={`${isMobile ? 'p-8' : 'p-10'} text-center border`}
                  style={{ backgroundColor: colorScheme.colors.bg, borderColor: `${colorScheme.colors.accent}12` }}
                >
                  <div className="text-4xl mb-5" style={{ color: colorScheme.colors.accent }}>{item.icon}</div>
                  <h3 style={{ ...displayFont, fontSize: isMobile ? '1.1rem' : '1.35rem', fontWeight: 700 }} className="mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ opacity: 0.65, fontFamily: layout.fonts.body }}>
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (isAtelier) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-28'} px-4`} style={{ backgroundColor: colorScheme.colors.secondary, color: colorScheme.colors.text }}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-6 ${isMobile ? 'mb-12' : 'mb-20'}`}>
              <Clickable id="strengths-title">
                <h2 style={getStyle('strengths-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700 })}>
                  {content.strengthsTitle || t('keyStrengths')}
                </h2>
              </Clickable>
              <div className="flex-1 h-px" style={{ backgroundColor: `${colorScheme.colors.accent}33` }} />
            </div>
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-3 gap-10'}`}>
              {content.strengths.map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${isMobile ? 'p-6' : 'p-8'}`}
                  style={{ backgroundColor: colorScheme.colors.card, borderRadius: '4px' }}
                >
                  <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-4`}>{item.icon}</div>
                  <h3 style={{ ...displayFont, fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 700 }} className="mb-3">{item.title}</h3>
                  <p style={{ opacity: 0.65, lineHeight: 1.7, fontSize: '0.9rem', fontFamily: layout.fonts.body }}>{item.description}</p>
                </motion.div>
              ))}
            </div>
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

    if (isAtelier) {
      return (
        <section className={`${isMobile ? 'py-16' : 'py-28'} px-4`} style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-center gap-6 ${isMobile ? 'mb-12' : 'mb-20'}`}>
              <Clickable id="contact-title">
                <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 700 })}>
                  {content.contact.title || t('connect')}
                </h2>
              </Clickable>
              <div className="flex-1 h-px" style={{ backgroundColor: `${colorScheme.colors.accent}33` }} />
            </div>
            <div className={`grid grid-cols-2 ${isMobile ? 'gap-4' : 'md:grid-cols-4 gap-6'} mb-12`}>
              {[
                { href: `mailto:${content.contact.email}`, icon: <Mail size={isMobile ? 20 : 24} />, label: 'Email', show: true },
                { href: `tel:${content.contact.phone}`, icon: <Phone size={isMobile ? 20 : 24} />, label: 'Phone', show: !!content.contact.phone },
                { href: content.contact.kakaoOpenChat || '', icon: <MessageCircle size={isMobile ? 20 : 24} />, label: 'KakaoTalk', show: !!content.contact.kakaoOpenChat },
                { href: content.contact.instagram || '', icon: <Instagram size={isMobile ? 20 : 24} />, label: 'Instagram', show: !!content.contact.instagram },
                { href: content.contact.youtube || '', icon: <Youtube size={isMobile ? 20 : 24} />, label: 'YouTube', show: !!content.contact.youtube },
                { href: content.contact.tiktok || '', icon: <Video size={isMobile ? 20 : 24} />, label: 'TikTok', show: !!content.contact.tiktok },
                { href: content.contact.blog || '', icon: <BookOpen size={isMobile ? 20 : 24} />, label: 'Blog', show: !!content.contact.blog },
              ].filter(c => c.show).map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('mailto:') || c.href.startsWith('tel:') ? undefined : '_blank'}
                  rel="noreferrer"
                  className={`flex flex-col items-center gap-3 ${isMobile ? 'py-6 px-4' : 'py-8 px-6'} transition-transform hover:scale-[1.02]`}
                  style={{ backgroundColor: colorScheme.colors.card, borderRadius: '4px' }}
                >
                  <span style={{ color: colorScheme.colors.accent }}>{c.icon}</span>
                  <span className="text-xs tracking-widest uppercase" style={{ opacity: 0.6, fontFamily: layout.fonts.body }}>{c.label}</span>
                </a>
              ))}
            </div>
            <div className="flex justify-center">
              <div className={`${isMobile ? 'p-4' : 'p-6'} shadow-lg`} style={{ backgroundColor: colorScheme.colors.card, borderRadius: '4px' }}>
                <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 120 : 150} />
              </div>
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

  const renderLanguageSelector = (topClass: string, dark = false) => {
    if (availableLanguages.length <= 1) return null;

    const buttonClass = dark
      ? 'flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 border border-white/10 text-white shadow-lg transition-all hover:bg-black'
      : 'flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-900 shadow-lg transition-all hover:bg-gray-50';
    const menuClass = dark
      ? 'absolute top-full mt-2 right-0 bg-black/90 rounded-2xl shadow-2xl overflow-hidden min-w-[120px] border border-white/10'
      : 'absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl overflow-hidden min-w-[120px] border border-gray-100';
    const activeClass = dark ? 'text-white font-bold' : 'text-blue-600 font-bold';
    const inactiveClass = dark ? 'text-white/70' : 'text-gray-700';
    const hoverClass = dark ? 'hover:bg-white/5' : 'hover:bg-gray-50';

    return (
      <div className={`fixed right-6 z-50 ${topClass}`}>
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className={buttonClass}
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
                className={menuClass}
              >
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-6 py-3 text-sm transition-colors ${hoverClass} ${currentLang === lang.code ? activeClass : inactiveClass}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderSharedKakaoButton = () => (
    content.contact.kakaoOpenChat ? (
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
    ) : null
  );

  const renderSharedCheckout = (backgroundColor = colorScheme.colors.secondary, textColor = colorScheme.colors.text) => (
    !onSelectElement ? (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-6 text-center"
        style={{ backgroundColor }}
      >
        <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: textColor, fontFamily: layout.fonts.display }}>
          포트폴리오 제작이 필요하신가요?
        </h3>
        <p className="text-sm md:text-base mb-8 opacity-70" style={{ color: textColor }}>
          지금 바로 요청하고 맞춤형 PR 포트폴리오를 받아보세요.
        </p>
        <a
          href={`/checkout/${page.slug}`}
          className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          style={{ backgroundColor: page.accentColor || colorScheme.colors.accent, color: colorScheme.colors.bg }}
        >
          <span>제작 요청하기</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </motion.div>
    ) : null
  );

  const renderSharedFooter = (dark = false) => (
    <footer
      className={`py-12 border-t text-center text-sm ${dark ? 'opacity-70' : 'opacity-50'}`}
      style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : colorScheme.colors.border, color: dark ? 'rgba(255,255,255,0.7)' : undefined }}
    >
      <p>&copy; {new Date().getFullYear()} {content.hero.nameKo}. All rights reserved.</p>
      <p className="mt-2">Powered by CastFolio</p>
    </footer>
  );

  if (isStitchEditorial03) {
    const activeName = currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn;
    const aboutText = content.about.bio.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const contactLinks = [
      { href: `mailto:${content.contact.email}`, label: content.contact.email, external: false, show: !!content.contact.email },
      { href: `tel:${content.contact.phone}`, label: content.contact.phone || '', external: false, show: !!content.contact.phone },
      { href: content.contact.instagram || '', label: 'Instagram', external: true, show: !!content.contact.instagram },
      { href: content.contact.kakaoOpenChat || '', label: 'Kakao Open Chat', external: true, show: !!content.contact.kakaoOpenChat },
    ].filter((item) => item.show);

    return (
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: colorScheme.colors.bg, color: colorScheme.colors.text }}>
        {renderLanguageSelector('top-24')}
        <nav className="fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md" style={{ backgroundColor: `${colorScheme.colors.bg}eb`, borderColor: `${colorScheme.colors.accent}16` }}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
            <div style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700 }}>
              Runway Letter
            </div>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.24em]" style={{ fontFamily: layout.fonts.body }}>
              <a href="#section-about">About</a>
              {visibleSections.career && <a href="#section-career">Journal</a>}
              {visibleSections.portfolio && <a href="#section-portfolio">Works</a>}
              <a href="#section-contact">Contact</a>
            </div>
            <a
              href="#section-contact"
              className="px-5 py-2 text-[11px] uppercase tracking-[0.24em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg, fontFamily: layout.fonts.body }}
            >
              Inquire
            </a>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
          <section id="section-hero" className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-12 gap-10 items-start'} mb-24`}>
            <div className={`${isMobile ? '' : 'md:col-span-3'} order-2 md:order-1`}>
              <div className="text-[10px] uppercase tracking-[0.28em] mb-5" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>
                {content.hero.label || 'Broadcast Portfolio'}
              </div>
              <div className="space-y-4">
                {normalizedDetails.slice(0, 3).map((detail) => (
                  <div key={detail.id} className="border-b pb-4" style={{ borderColor: `${colorScheme.colors.accent}18` }}>
                    <div className="text-[10px] uppercase tracking-[0.22em] mb-2 opacity-45" style={{ fontFamily: layout.fonts.body }}>{detail.label}</div>
                    <div className="text-sm font-medium" style={{ fontFamily: layout.fonts.body }}>{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${isMobile ? '' : 'md:col-span-5'} order-1 md:order-2`}>
              <div className={`${isMobile ? 'h-[420px]' : 'h-[680px]'} overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.08)]`} style={{ backgroundColor: colorScheme.colors.card }}>
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>

            <div className={`${isMobile ? '' : 'md:col-span-4'} order-3`}>
              <Clickable id="hero-name">
                <h1 style={getStyle('hero-name', { ...displayFont, fontSize: isMobile ? '3rem' : '5rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.95 })}>
                  {content.hero.title || activeName}
                </h1>
              </Clickable>
              <Clickable id="hero-tagline">
                <p style={getStyle('hero-tagline', { fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: 1.9, opacity: 0.72, fontFamily: layout.fonts.body, marginTop: '1.5rem' })}>
                  {content.hero.tagline}
                </p>
              </Clickable>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#section-portfolio" className="px-6 py-3 text-xs uppercase tracking-[0.22em]" style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg, fontFamily: layout.fonts.body }}>
                  View Works
                </a>
                <a href="#section-contact" className="px-6 py-3 text-xs uppercase tracking-[0.22em] border" style={{ borderColor: `${colorScheme.colors.accent}22`, fontFamily: layout.fonts.body }}>
                  Contact
                </a>
              </div>
            </div>
          </section>

          <section id="section-about" className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-12 gap-10'} mb-24`}>
            <div className={`${isMobile ? '' : 'md:col-span-4'}`}>
              <Clickable id="about-title">
                <h2 style={getStyle('about-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 })}>
                  {content.about.title || 'About'}
                </h2>
              </Clickable>
            </div>
            <div className={`${isMobile ? '' : 'md:col-span-8'} space-y-6`}>
              {content.about.subtitle && (
                <Clickable id="about-subtitle">
                  <p style={getStyle('about-subtitle', { fontSize: isMobile ? '1.2rem' : '1.4rem', lineHeight: 1.7, fontStyle: 'italic', opacity: 0.8, fontFamily: layout.fonts.display })}>
                    "{content.about.subtitle}"
                  </p>
                </Clickable>
              )}
              <Clickable id="about-bio">
                <p style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 2, opacity: 0.75, fontFamily: layout.fonts.body })}>
                  {aboutText}
                </p>
              </Clickable>
            </div>
          </section>

          {visibleSections.career && (
            <section id="section-career" className="mb-24">
              <Clickable id="career-title">
                <h2 style={getStyle('career-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 })} className="mb-10">
                  {content.careerTitle || 'Journal'}
                </h2>
              </Clickable>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.career.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06 }}
                    className="p-7 border"
                    style={{ borderColor: `${colorScheme.colors.accent}14`, backgroundColor: idx % 2 === 0 ? colorScheme.colors.card : colorScheme.colors.secondary }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>{item.period}</div>
                    <h3 className="text-2xl mb-2" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    {item.role && <p className="text-sm mb-3 opacity-70" style={{ fontFamily: layout.fonts.body }}>{item.role}</p>}
                    <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.portfolio && (
            <section id="section-portfolio" className="mb-24">
              <Clickable id="portfolio-title">
                <h2 style={getStyle('portfolio-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 })} className="mb-10">
                  {content.portfolioTitle || 'Works'}
                </h2>
              </Clickable>
              <div className="space-y-8">
                {content.portfolio.map((item, idx) => (
                  <div key={item.id} className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-12 gap-6 items-center'}`}>
                    <div className={`${isMobile ? '' : idx % 2 === 0 ? 'md:col-span-7' : 'md:col-span-5 md:order-2'} overflow-hidden`} style={{ backgroundColor: colorScheme.colors.card }}>
                      {renderPortfolioItem(item, `w-full ${idx % 2 === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'} object-cover`)}
                    </div>
                    <div className={`${isMobile ? '' : idx % 2 === 0 ? 'md:col-span-5' : 'md:col-span-7 md:order-1'} p-2`}>
                      <div className="text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: colorScheme.colors.accent, fontFamily: layout.fonts.body }}>
                        Feature {String(idx + 1).padStart(2, '0')}
                      </div>
                      <h3 className="text-3xl mb-3" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                      {item.description && <p className="text-sm leading-relaxed opacity-72 mb-4" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] uppercase tracking-[0.24em] border-b pb-1" style={{ color: colorScheme.colors.accent, borderColor: `${colorScheme.colors.accent}44`, fontFamily: layout.fonts.body }}>
                          Open Feature
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.strengths && (
            <section id="section-strengths" className="mb-24">
              <Clickable id="strengths-title">
                <h2 style={getStyle('strengths-title', { ...displayFont, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 })} className="mb-10">
                  {content.strengthsTitle || 'Strengths'}
                </h2>
              </Clickable>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.strengths.map((item) => (
                  <div key={item.id} className="p-8 border" style={{ borderColor: `${colorScheme.colors.accent}14` }}>
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl mb-3" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="section-contact" className="py-14 border-t" style={{ borderColor: `${colorScheme.colors.accent}12` }}>
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-12 gap-10 items-start'}`}>
              <div className={`${isMobile ? '' : 'md:col-span-5'}`}>
                <Clickable id="contact-title">
                  <h2 style={getStyle('contact-title', { ...displayFont, fontSize: isMobile ? '2.4rem' : '4rem', fontWeight: 700, lineHeight: 1 })}>
                    {content.contact.title || 'Contact'}
                  </h2>
                </Clickable>
                <Clickable id="contact-subtitle">
                  <p style={getStyle('contact-subtitle', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 1.9, opacity: 0.72, fontFamily: layout.fonts.body, marginTop: '1rem' })}>
                    {content.contact.subtitle || 'Editorial partnerships, broadcast hosting, interviews, and brand appearances.'}
                  </p>
                </Clickable>
              </div>
              <div className={`${isMobile ? '' : 'md:col-span-7'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                {contactLinks.map((item) => (
                  <a key={`${item.label}-${item.href}`} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="p-5 border text-sm break-all hover:bg-black/5 transition-colors" style={{ borderColor: `${colorScheme.colors.accent}16`, fontFamily: layout.fonts.body }}>
                    {item.label}
                  </a>
                ))}
                <div className="p-5 border flex items-center justify-center md:row-span-2" style={{ borderColor: `${colorScheme.colors.accent}16` }}>
                  <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 116 : 150} />
                </div>
              </div>
            </div>
          </section>
        </main>
        {renderSharedKakaoButton()}
        {renderSharedCheckout(colorScheme.colors.secondary, colorScheme.colors.text)}
        {renderSharedFooter()}
      </div>
    );
  }

  if (isStitchScrapbook04) {
    const scrapbookAccent = '#b70049';
    const scrapbookSecondary = '#605a57';
    const scriptFont = "'Nanum Pen Script', cursive";
    const activeName = currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn;
    const scrapbookContacts = [
      { href: `mailto:${content.contact.email}`, label: content.contact.email, icon: <Mail size={16} />, external: false, show: !!content.contact.email },
      { href: content.contact.kakaoOpenChat || '', label: 'Kakao Open Chat', icon: <MessageCircle size={16} />, external: true, show: !!content.contact.kakaoOpenChat },
      { href: content.contact.instagram || '', label: content.contact.instagram || '@castfolio_on_air', icon: <Instagram size={16} />, external: true, show: !!content.contact.instagram },
    ].filter((item) => item.show);

    return (
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#fbf6eb', color: '#302f27' }}>
        {renderLanguageSelector('top-24')}
        <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 border-b border-black/5" style={{ backgroundColor: 'rgba(251,246,235,0.88)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
            <div className="text-xl font-black uppercase tracking-widest" style={{ fontFamily: layout.fonts.display }}>Castfolio</div>
            <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: layout.fonts.display }}>
              <a href="#section-about" style={{ color: scrapbookAccent }}>About</a>
              {visibleSections.career && <a href="#section-career" style={{ color: scrapbookSecondary }}>Career</a>}
              {visibleSections.portfolio && <a href="#section-portfolio" style={{ color: scrapbookSecondary }}>Archive</a>}
              <a href="#section-contact" style={{ color: scrapbookSecondary }}>Contact</a>
            </div>
            <button className="md:hidden text-xs uppercase tracking-[0.24em]" style={{ color: scrapbookAccent, fontFamily: layout.fonts.display }}>Menu</button>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative">
          <section id="section-hero" className="flex flex-col items-center text-center mb-28 relative pt-16">
            <div className="relative mb-8 group">
              <div className="absolute -top-4 -right-4 w-16 h-6 rotate-12 z-10 shadow-sm" style={{ background: 'rgba(226, 221, 206, 0.7)', backdropFilter: 'blur(1px)' }} />
              <div className="w-56 h-56 rounded-full overflow-hidden bg-white transition-transform duration-500 group-hover:rotate-3 shadow-[0_0_0_4px_#fbf6eb,0_0_0_5px_#302f27]">
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <Clickable id="hero-name">
              <h1 style={getStyle('hero-name', { fontFamily: scriptFont, fontSize: isMobile ? '4rem' : '6rem', lineHeight: 1, color: '#302f27' })} className="mb-2">
                {activeName}
              </h1>
            </Clickable>
            <Clickable id="hero-label">
              <p style={getStyle('hero-label', { fontFamily: layout.fonts.display, fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: scrapbookSecondary })} className="mb-6">
                {content.hero.label || 'Broadcaster & Host'}
              </p>
            </Clickable>
            <div className="flex gap-4 justify-center">
              <a href="#section-contact" className="bg-white border-2 border-[#302f27] px-8 py-2 font-bold uppercase tracking-wider hover:text-white transition-colors" style={{ fontFamily: layout.fonts.display }}>Contact</a>
              <a href="#section-portfolio" className="border-2 border-[#302f27] px-8 py-2 font-bold uppercase tracking-wider hover:text-white transition-colors" style={{ fontFamily: layout.fonts.display }}>Portfolio</a>
            </div>
            <div className="absolute -left-6 top-24 hidden lg:block opacity-25 pointer-events-none">
              <span style={{ fontFamily: scriptFont, fontSize: '5rem', color: '#f26b86', transform: 'rotate(-18deg)', display: 'inline-block' }}>ON AIR</span>
            </div>
          </section>

          <section id="section-about" className="mb-24 grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4 md:sticky md:top-24">
              <h2 style={{ fontFamily: scriptFont, fontSize: isMobile ? '3rem' : '4rem', color: scrapbookAccent }} className="mb-4">소개</h2>
              <div className="w-full mb-8" style={{ borderBottom: '2px solid #302f27', borderRadius: '100% 0% 100% 0% / 10% 10% 10% 10%' }} />
              <div className="flex flex-wrap gap-2">
                {normalizedDetails.slice(0, 4).map((detail, idx) => (
                  <span key={detail.id} className="px-4 py-1 bg-white rounded-full text-sm font-bold shadow-[2px_2px_0px_#302f27]" style={{ border: '1px solid #302f27' }}>
                    {idx < 3 ? detail.value : detail.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="md:col-span-8 bg-[#f6f0e4] p-8 relative shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-3 -left-3 w-12 h-5 -rotate-45" style={{ background: 'rgba(226, 221, 206, 0.7)' }} />
              <div className="absolute -bottom-3 -right-3 w-12 h-5 -rotate-45" style={{ background: 'rgba(226, 221, 206, 0.7)' }} />
              <Clickable id="about-bio">
                <div style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.15rem', lineHeight: 1.95, color: scrapbookSecondary, fontFamily: layout.fonts.body })} dangerouslySetInnerHTML={{ __html: content.about.bio }} />
              </Clickable>
            </div>
          </section>

          {visibleSections.career && (
            <section id="section-career" className="mb-24">
              <h2 style={{ fontFamily: scriptFont, fontSize: isMobile ? '3rem' : '4rem', color: scrapbookAccent }} className="mb-10">경력</h2>
              <div className="relative pl-8 md:pl-0">
                <div className="absolute left-0 md:left-1/4 h-full" style={{ borderLeft: '2px solid #302f27', borderRadius: '10% 10% 10% 10% / 100% 0% 100% 0%' }} />
                <div className="space-y-12">
                  {content.career.map((item) => (
                    <div key={item.id} className="grid md:grid-cols-12 gap-4 relative">
                      <div className="md:col-span-3 text-left md:text-right pr-8">
                        <span className="font-black text-2xl" style={{ fontFamily: layout.fonts.display }}>{item.period}</span>
                      </div>
                      <div className="md:col-span-9 pl-4">
                        <div className="absolute left-[-9px] md:left-[calc(25%-9px)] w-4 h-4 border-2" style={{ backgroundColor: scrapbookAccent, borderColor: '#302f27' }} />
                        <h3 className="font-bold text-2xl mb-2" style={{ fontFamily: layout.fonts.display }}>{item.title}</h3>
                        <p style={{ color: scrapbookSecondary }}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {visibleSections.portfolio && (
            <section id="section-portfolio" className="mb-24">
              <div className="flex justify-between items-end mb-10">
                <h2 style={{ fontFamily: scriptFont, fontSize: isMobile ? '3rem' : '4rem', color: scrapbookAccent }}>포트폴리오</h2>
                <div className="hidden md:block flex-grow mx-8 mb-4" style={{ borderBottom: '2px solid #302f27', borderRadius: '100% 0% 100% 0% / 10% 10% 10% 10%' }} />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {content.portfolio.map((item, idx) => (
                  <div key={item.id} className={`bg-white p-4 pb-12 shadow-xl relative group transition-transform duration-300 hover:rotate-0 ${idx % 3 === 0 ? 'rotate-[-2deg]' : idx % 3 === 1 ? 'rotate-[1.5deg]' : 'rotate-[-1deg]'}`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 z-20" style={{ background: 'rgba(226, 221, 206, 0.7)' }} />
                    <div className="aspect-video overflow-hidden mb-6 bg-[#dad4c5]">
                      {renderPortfolioItem(item, "w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500")}
                    </div>
                    <h3 className="font-bold text-lg mb-1 uppercase" style={{ fontFamily: layout.fonts.display }}>{item.title}</h3>
                    {item.description && <p style={{ fontFamily: scriptFont, fontSize: '1.7rem', color: scrapbookSecondary }} className="mb-4">{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.strengths && (
            <section id="section-strengths" className="mb-24">
              <h2 style={{ fontFamily: scriptFont, fontSize: isMobile ? '3rem' : '4rem', color: scrapbookAccent }} className="mb-10">강점</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {content.strengths.map((item) => (
                  <div key={item.id} className="bg-white p-8 border border-black shadow-[4px_4px_0px_#302f27]">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-3 uppercase" style={{ fontFamily: layout.fonts.display }}>{item.title}</h3>
                    <p style={{ color: scrapbookSecondary }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="section-contact" className="mb-16">
            <h2 style={{ fontFamily: scriptFont, fontSize: isMobile ? '3rem' : '4rem', color: scrapbookAccent }} className="mb-8">연락처</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {scrapbookContacts.map((item) => (
                <a key={`${item.label}-${item.href}`} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="bg-[#f6f0e4] p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <span style={{ color: scrapbookAccent }}>{item.icon}</span>
                  <span className="font-medium break-all">{item.label}</span>
                </a>
              ))}
            </div>
          </section>
        </main>
        {renderSharedKakaoButton()}
        {renderSharedCheckout('#f6f0e4', '#302f27')}
        {renderSharedFooter()}
      </div>
    );
  }

  if (isStitchNoir05) {
    const noirAccent = '#E02424';
    const activeName = currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn;
    const noirContacts = [
      { href: content.contact.instagram || '', label: 'Instagram', icon: <Instagram size={22} />, external: true, show: !!content.contact.instagram },
      { href: content.contact.blog || '', label: 'Blog', icon: <BookOpen size={22} />, external: true, show: !!content.contact.blog },
      { href: content.contact.youtube || '', label: 'YouTube', icon: <Youtube size={22} />, external: true, show: !!content.contact.youtube },
    ].filter((item) => item.show);

    return (
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000000', color: '#e2e2e2' }}>
        {renderLanguageSelector('top-24', true)}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-md">
          <div className="max-w-screen-2xl mx-auto px-8 py-6 flex items-center justify-between gap-6">
            <span className="text-2xl font-black uppercase" style={{ fontFamily: layout.fonts.display }}>SEO-YUN PARK</span>
            <div className="hidden md:flex gap-10 items-center text-[0.75rem] uppercase tracking-[0.1rem]" style={{ fontFamily: layout.fonts.display }}>
              {visibleSections.portfolio && <a href="#section-portfolio" style={{ color: noirAccent, borderBottom: `2px solid ${noirAccent}`, paddingBottom: '0.25rem' }}>Work</a>}
              <a href="#section-about" className="text-neutral-400 hover:text-white transition-colors">Bio</a>
              <a href="#section-contact" className="text-neutral-400 hover:text-white transition-colors">Contact</a>
            </div>
            <button className="md:hidden text-white text-xs uppercase tracking-[0.2rem]">Menu</button>
          </div>
        </nav>

        <main className="w-full max-w-[768px] mx-auto px-6 md:px-0">
          <section id="section-hero" className="relative min-h-screen flex flex-col justify-end pt-32 pb-20">
            <div className="absolute top-20 right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 -z-10" style={{ backgroundColor: noirAccent }} />
            <div className="absolute top-40 left-[-5%] w-32 h-32 border-[20px] rounded-full opacity-40 -z-10" style={{ borderColor: noirAccent }} />
            <div className="relative z-10">
              <div className="mb-8">
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full aspect-[4/5] object-cover grayscale contrast-125" referrerPolicy="no-referrer" />
              </div>
              <Clickable id="hero-name">
                <h1 style={getStyle('hero-name', { fontFamily: layout.fonts.display, fontSize: isMobile ? '4rem' : '7rem', lineHeight: 0.9, fontWeight: 900, letterSpacing: '-0.05em' })} className="uppercase mb-4">
                  {activeName.split(' ').map((part, idx) => (
                    <React.Fragment key={`${part}-${idx}`}>
                      {idx === activeName.split(' ').length - 1 ? <span style={{ color: noirAccent }}>{part}</span> : part}
                      {idx < activeName.split(' ').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h1>
              </Clickable>
              <div className="flex flex-wrap gap-4 mt-10">
                {visibleSections.portfolio && <a href="#section-portfolio" className="px-8 py-3 text-[0.75rem] tracking-widest font-bold uppercase text-white transition-all" style={{ backgroundColor: noirAccent }}>View Portfolio</a>}
                <a href="#section-contact" className="border px-8 py-3 text-[0.75rem] tracking-widest font-bold uppercase hover:bg-white hover:text-black transition-all" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>Get In Touch</a>
              </div>
            </div>
          </section>

          <section id="section-about" className="py-20 border-t border-white/10">
            <span className="text-xl font-black mb-6 block" style={{ fontFamily: layout.fonts.display, color: noirAccent }}>소개</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-3">
                <Clickable id="about-bio">
                  <div style={getStyle('about-bio', { fontSize: isMobile ? '1.3rem' : '1.8rem', lineHeight: 1.7, color: '#e2e2e2', fontFamily: layout.fonts.body, fontWeight: 300 })}>
                    {content.about.bio.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                  </div>
                </Clickable>
              </div>
              <div className="flex flex-col gap-6 items-end">
                {normalizedDetails.slice(0, 2).map((detail, idx) => (
                  <div key={detail.id} className="w-20 h-20 rounded-full border flex items-center justify-center" style={{ borderColor: idx === 0 ? noirAccent : '#555', backgroundColor: idx === 1 ? noirAccent : 'transparent' }}>
                    <span className="text-[0.6rem] font-black tracking-tight text-center uppercase" style={{ fontFamily: layout.fonts.display, color: idx === 1 ? '#fff' : noirAccent }}>
                      {detail.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {visibleSections.career && (
            <section id="section-career" className="py-20">
              <h2 className="text-5xl font-black mb-16 uppercase tracking-tighter" style={{ fontFamily: layout.fonts.display }}>경력</h2>
              <div className="space-y-12">
                {content.career.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 items-baseline">
                    <div className="text-2xl text-neutral-600 mb-2 md:mb-0" style={{ fontFamily: layout.fonts.display }}>{item.period}</div>
                    <div className="md:col-span-3 border-l pl-8 pb-4" style={{ borderColor: noirAccent }}>
                      <h3 className="text-3xl font-bold text-white mb-2 uppercase" style={{ fontFamily: layout.fonts.display }}>{item.title}</h3>
                      <p className="text-neutral-400 uppercase tracking-widest text-xs">{item.role || item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.portfolio && (
            <section id="section-portfolio" className="py-20">
              <h2 className="text-[4rem] md:text-[6rem] font-black mb-12 uppercase leading-none" style={{ fontFamily: layout.fonts.display, WebkitTextStroke: '1px #e2e2e2', color: 'transparent' }}>포트폴리오</h2>
              <div className="space-y-20">
                {content.portfolio.map((item, idx) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden mb-6">
                      {renderPortfolioItem(item, "w-full aspect-video object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700")}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(224,36,36,0.2)' }} />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[0.65rem] tracking-[0.2rem] font-bold uppercase" style={{ color: noirAccent }}>{idx % 2 === 0 ? 'Broadcast' : 'Feature'}</span>
                        <h3 className="text-4xl font-bold text-white mt-2" style={{ fontFamily: layout.fonts.display }}>{item.title}</h3>
                      </div>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-white transition-colors border-b border-white hover:text-[#E02424]">↗</a>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.strengths && (
            <section id="section-strengths" className="py-20 bg-[#0e0e0e] mx-[-1.5rem] px-6 md:px-12">
              <h2 className="text-white text-5xl font-black mb-16 uppercase tracking-tighter text-center" style={{ fontFamily: layout.fonts.display }}>강점</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                {content.strengths.map((item) => (
                  <div key={item.id} className="bg-black p-12">
                    <div className="text-5xl mb-6" style={{ color: noirAccent }}>{item.icon}</div>
                    <h4 className="text-2xl font-bold text-white mb-4 uppercase" style={{ fontFamily: layout.fonts.display }}>{item.title}</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="section-contact" className="py-24 flex flex-col items-center text-center">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest" style={{ color: noirAccent, fontFamily: layout.fonts.display }}>연락처</h2>
            <a href={`mailto:${content.contact.email}`} className="text-3xl md:text-5xl font-black text-white hover:text-[#E02424] transition-colors mb-12 break-all" style={{ fontFamily: layout.fonts.display }}>
              {content.contact.email.toUpperCase()}
            </a>
            <div className="flex gap-12 mt-8">
              {noirContacts.map((item) => (
                <a key={`${item.label}-${item.href}`} href={item.href} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2">
                  <span className="text-white">{item.icon}</span>
                  <span className="text-[0.6rem] text-neutral-500 uppercase tracking-[0.2rem]">{item.label}</span>
                </a>
              ))}
            </div>
          </section>
        </main>
        {renderSharedKakaoButton()}
        {renderSharedCheckout('#0e0e0e', '#ffffff')}
        {renderSharedFooter(true)}
      </div>
    );
  }

  if (isStitchBroadcaster06) {
    const activeName = currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn;
    const aboutText = content.about.bio.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const accent = '#d97706';
    const contactLinks = [
      { href: `mailto:${content.contact.email}`, label: content.contact.email, external: false, show: !!content.contact.email },
      { href: `tel:${content.contact.phone}`, label: content.contact.phone || '', external: false, show: !!content.contact.phone },
      { href: content.contact.kakaoOpenChat || '', label: 'Kakao Open Chat', external: true, show: !!content.contact.kakaoOpenChat },
      { href: content.contact.instagram || '', label: 'Instagram', external: true, show: !!content.contact.instagram },
    ].filter((item) => item.show);

    return (
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#f8f2e9', color: '#33271d' }}>
        {renderLanguageSelector('top-24')}
        <nav className="fixed top-0 left-0 right-0 z-40 border-b border-black/5" style={{ backgroundColor: 'rgba(248,242,233,0.88)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
            <div style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>Broadcast Editorial</div>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.24em]" style={{ fontFamily: layout.fonts.body }}>
              <a href="#section-about">Profile</a>
              {visibleSections.career && <a href="#section-career">Career</a>}
              {visibleSections.portfolio && <a href="#section-portfolio">Portfolio</a>}
              <a href="#section-contact">Contact</a>
            </div>
            <a href="#section-contact" className="px-5 py-2 text-[11px] uppercase tracking-[0.24em]" style={{ backgroundColor: '#33271d', color: '#fffaf3', fontFamily: layout.fonts.body }}>
              Inquire
            </a>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
          <section id="section-hero" className={`grid grid-cols-1 ${isMobile ? 'gap-10' : 'md:grid-cols-12 gap-12 items-center'} mb-24`}>
            <div className={`${isMobile ? '' : 'md:col-span-7'} space-y-6`}>
              <Clickable id="hero-label">
                <div style={getStyle('hero-label', { fontSize: '0.8rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: accent, fontFamily: layout.fonts.body })}>
                  {content.hero.label || 'Broadcaster & MC'}
                </div>
              </Clickable>
              <Clickable id="hero-name">
                <h1 style={getStyle('hero-name', { fontFamily: layout.fonts.display, fontSize: isMobile ? '3.6rem' : '6rem', lineHeight: 0.95, fontWeight: 700, letterSpacing: '-0.05em' })}>
                  {content.hero.title || activeName}
                </h1>
              </Clickable>
              <Clickable id="hero-tagline">
                <p style={getStyle('hero-tagline', { fontSize: isMobile ? '1rem' : '1.16rem', lineHeight: 1.9, opacity: 0.75, fontFamily: layout.fonts.body, maxWidth: '36rem' })}>
                  {content.hero.tagline}
                </p>
              </Clickable>
            </div>
            <div className={`${isMobile ? 'h-[420px]' : 'md:col-span-5 h-[680px]'} relative`}>
              <div className="absolute inset-0 rounded-[40px]" style={{ backgroundColor: '#ebd7be', transform: isMobile ? 'translate(12px, 12px)' : 'translate(22px, 22px)' }} />
              <div className="absolute inset-0 rounded-[40px] overflow-hidden shadow-[0_30px_60px_rgba(83,61,31,0.14)]">
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </section>

          <section id="section-about" className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-12 gap-8'} mb-20`}>
            <div className={`${isMobile ? '' : 'md:col-span-4'}`}>
              <h2 style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 }}>{content.about.title || 'About'}</h2>
            </div>
            <div className={`${isMobile ? '' : 'md:col-span-8'} bg-white/85 p-8 shadow-[0_18px_40px_rgba(83,61,31,0.05)]`}>
              <Clickable id="about-bio">
                <p style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 1.95, fontFamily: layout.fonts.body, opacity: 0.8 })}>{aboutText}</p>
              </Clickable>
            </div>
          </section>

          {visibleSections.career && (
            <section id="section-career" className="mb-20 space-y-5">
              <h2 style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 }}>{content.careerTitle || 'Career'}</h2>
              {content.career.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/85 p-6 shadow-[0_16px_40px_rgba(83,61,31,0.05)]">
                  <div className="md:col-span-3 text-sm uppercase tracking-[0.2em]" style={{ color: accent, fontFamily: layout.fonts.body }}>{item.period}</div>
                  <div className="md:col-span-9">
                    <h3 className="text-2xl mb-2" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {visibleSections.portfolio && (
            <section id="section-portfolio" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 }}>{content.portfolioTitle || 'Portfolio'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.portfolio.map((item, idx) => (
                  <div key={item.id} className={`${idx === 0 ? 'md:col-span-2' : ''} bg-white/85 p-4 shadow-[0_18px_40px_rgba(83,61,31,0.05)]`}>
                    <div className={`overflow-hidden ${idx === 0 ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
                      {renderPortfolioItem(item, 'w-full h-full object-cover transition-transform duration-700 hover:scale-105')}
                    </div>
                    <div className="pt-4">
                      <h3 className="text-xl" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.strengths && (
            <section id="section-strengths" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700 }}>{content.strengthsTitle || 'Strengths'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.strengths.map((item) => (
                  <div key={item.id} className="p-8 bg-[#fff8ef] border" style={{ borderColor: 'rgba(217,119,6,0.16)' }}>
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl mb-3" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="section-contact" className="bg-[#2b2118] text-[#fff9f0] p-8 md:p-12 shadow-[0_30px_60px_rgba(52,39,25,0.18)]">
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-12 gap-10 items-center'}`}>
              <div className={`${isMobile ? '' : 'md:col-span-5'}`}>
                <Clickable id="contact-title">
                  <h2 style={getStyle('contact-title', { fontFamily: layout.fonts.display, fontSize: isMobile ? '2.4rem' : '4rem', fontWeight: 700, lineHeight: 1 })}>{content.contact.title || "Let's Collaborate."}</h2>
                </Clickable>
                <Clickable id="contact-subtitle">
                  <p style={getStyle('contact-subtitle', { fontSize: isMobile ? '1rem' : '1.12rem', lineHeight: 1.9, fontFamily: layout.fonts.body, opacity: 0.75, marginTop: '1.5rem' })}>{content.contact.subtitle || 'For events, shows, interviews, and branded productions, reach out with your schedule and brief.'}</p>
                </Clickable>
              </div>
              <div className={`${isMobile ? '' : 'md:col-span-7'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                {contactLinks.map((item) => (
                  <a key={`${item.label}-${item.href}`} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="bg-white/6 border border-white/10 p-5 text-sm break-all hover:bg-white/10 transition-colors" style={{ fontFamily: layout.fonts.body }}>
                    {item.label}
                  </a>
                ))}
                <div className="bg-white p-5 flex items-center justify-center md:row-span-2">
                  <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 116 : 156} />
                </div>
              </div>
            </div>
          </section>
        </main>
        {renderSharedKakaoButton()}
        {renderSharedCheckout('#fff2df', '#33271d')}
        {renderSharedFooter()}
      </div>
    );
  }

  if (isStitchMinimal07) {
    const activeName = currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn;
    const aboutText = content.about.bio.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const accent = '#3158ff';
    const contactLinks = [
      { href: `mailto:${content.contact.email}`, label: content.contact.email, title: 'Email', external: false, show: !!content.contact.email },
      { href: `tel:${content.contact.phone}`, label: content.contact.phone || '', title: 'Phone', external: false, show: !!content.contact.phone },
      { href: content.contact.kakaoOpenChat || '', label: 'Kakao Open Chat', title: 'Kakao', external: true, show: !!content.contact.kakaoOpenChat },
      { href: content.contact.instagram || '', label: 'Instagram', title: 'Instagram', external: true, show: !!content.contact.instagram },
    ].filter((item) => item.show);

    return (
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#f7f9ff', color: '#13233e' }}>
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-12rem] left-[-8rem] w-[28rem] h-[28rem] rounded-full opacity-70" style={{ background: 'radial-gradient(circle, rgba(141,174,255,0.35) 0%, rgba(141,174,255,0) 70%)' }} />
          <div className="absolute top-[10rem] right-[-10rem] w-[32rem] h-[32rem] rounded-full opacity-80" style={{ background: 'radial-gradient(circle, rgba(227,236,255,0.9) 0%, rgba(227,236,255,0) 70%)' }} />
        </div>
        {renderLanguageSelector('top-24')}
        <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#dbe4ff]" style={{ backgroundColor: 'rgba(247,249,255,0.82)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
            <div style={{ fontFamily: layout.fonts.display, fontWeight: 800, color: accent }}>Minimal Modern</div>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.24em]" style={{ fontFamily: layout.fonts.body }}>
              <a href="#section-about">About</a>
              {visibleSections.career && <a href="#section-career">Career</a>}
              {visibleSections.portfolio && <a href="#section-portfolio">Portfolio</a>}
              <a href="#section-contact">Contact</a>
            </div>
            <a href="#section-contact" className="px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.24em]" style={{ backgroundColor: accent, color: '#ffffff', fontFamily: layout.fonts.body }}>
              Connect
            </a>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          <section id="section-hero" className={`mb-24 grid grid-cols-1 ${isMobile ? 'gap-10 text-center' : 'md:grid-cols-12 gap-10 items-center'}`}>
            <div className={`${isMobile ? '' : 'md:col-span-7'}`}>
              <Clickable id="hero-label">
                <div style={getStyle('hero-label', { fontSize: '0.82rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: accent, fontFamily: layout.fonts.body })} className="mb-6">
                  {content.hero.label || 'Creative Strategy & Design'}
                </div>
              </Clickable>
              <Clickable id="hero-name">
                <h1 style={getStyle('hero-name', { fontFamily: layout.fonts.display, fontSize: isMobile ? '3.4rem' : '6.2rem', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.95, color: accent })}>
                  {content.hero.title || activeName}
                </h1>
              </Clickable>
              <Clickable id="hero-tagline">
                <p style={getStyle('hero-tagline', { fontSize: isMobile ? '1rem' : '1.16rem', lineHeight: 1.9, fontFamily: layout.fonts.body, opacity: 0.75, maxWidth: isMobile ? '40rem' : '32rem', margin: isMobile ? '1.5rem auto 0 auto' : '1.5rem 0 0 0' })}>
                  {content.hero.tagline}
                </p>
              </Clickable>
            </div>
            <div className={`${isMobile ? 'h-[360px]' : 'md:col-span-5 h-[520px]'} relative`}>
              <div className="absolute inset-0 rounded-[28px]" style={{ backgroundColor: '#dfe8ff', transform: isMobile ? 'translate(12px, 12px)' : 'translate(16px, 16px)' }} />
              <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-[#dbe4ff] shadow-[0_22px_50px_rgba(65,88,255,0.10)]">
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </section>

          <section id="section-about" className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-12 gap-8'} mb-20`}>
            <div className={`${isMobile ? '' : 'md:col-span-8'} bg-white/90 border border-[#dbe4ff] p-8 md:p-10 shadow-[0_18px_40px_rgba(65,88,255,0.06)]`}>
              <Clickable id="about-title">
                <h2 style={getStyle('about-title', { fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800, color: accent, marginBottom: '1rem' })}>{content.about.title || 'About'}</h2>
              </Clickable>
              <Clickable id="about-bio">
                <p style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 1.9, fontFamily: layout.fonts.body, opacity: 0.78 })}>{aboutText}</p>
              </Clickable>
            </div>
            <div className={`${isMobile ? '' : 'md:col-span-4'} space-y-4`}>
              {normalizedDetails.slice(0, 4).map((detail) => (
                <div key={detail.id} className="bg-[#eef3ff] border border-[#dbe4ff] p-5">
                  <div className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: accent, fontFamily: layout.fonts.body }}>{detail.label}</div>
                  <div className="text-sm font-semibold" style={{ fontFamily: layout.fonts.body }}>{detail.value}</div>
                </div>
              ))}
            </div>
          </section>

          {visibleSections.career && (
            <section id="section-career" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800 }}>{content.careerTitle || 'Career'}</h2>
              <div className="divide-y divide-[#dbe4ff] border border-[#dbe4ff] bg-white/85">
                {content.career.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 md:p-8">
                    <div className="md:col-span-3 text-sm uppercase tracking-[0.22em]" style={{ color: accent, fontFamily: layout.fonts.body }}>{item.period}</div>
                    <div className="md:col-span-9">
                      <h3 className="text-2xl mb-2" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                      <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.portfolio && (
            <section id="section-portfolio" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800 }}>{content.portfolioTitle || 'Portfolio'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.portfolio.map((item) => (
                  <div key={item.id} className="bg-white border border-[#dbe4ff] p-4 shadow-[0_18px_36px_rgba(65,88,255,0.05)]">
                    <div className="aspect-[4/3] overflow-hidden mb-5">
                      {renderPortfolioItem(item, 'w-full h-full object-cover transition-transform duration-700 hover:scale-105')}
                    </div>
                    <h3 className="text-xl" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.strengths && (
            <section id="section-strengths" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800 }}>{content.strengthsTitle || 'Strengths'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.strengths.map((item) => (
                  <div key={item.id} className="bg-white border border-[#dbe4ff] p-8">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-5" style={{ backgroundColor: '#eef3ff', color: accent }}>{item.icon}</div>
                    <h3 className="text-xl mb-3" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="section-contact" className="mb-8">
            <div className="text-center mb-10">
              <Clickable id="contact-title">
                <h2 style={getStyle('contact-title', { fontFamily: layout.fonts.display, fontSize: isMobile ? '2.4rem' : '4rem', fontWeight: 800, color: accent })}>{content.contact.title || 'Let us connect.'}</h2>
              </Clickable>
              <Clickable id="contact-subtitle">
                <p style={getStyle('contact-subtitle', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 1.9, fontFamily: layout.fonts.body, opacity: 0.72, marginTop: '1rem' })}>{content.contact.subtitle || 'For project proposals and media collaboration, send a quick brief and preferred schedule.'}</p>
              </Clickable>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {contactLinks.map((item) => (
                <a key={`${item.title}-${item.href}`} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="bg-white border border-[#dbe4ff] p-6 shadow-[0_16px_36px_rgba(65,88,255,0.04)] hover:translate-y-[-2px] transition-transform">
                  <div className="text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: accent, fontFamily: layout.fonts.body }}>{item.title}</div>
                  <div className="text-sm break-all" style={{ fontFamily: layout.fonts.body }}>{item.label}</div>
                </a>
              ))}
            </div>
          </section>
        </main>
        {renderSharedKakaoButton()}
        {renderSharedCheckout('#edf3ff', '#13233e')}
        {renderSharedFooter()}
      </div>
    );
  }

  if (isStitchCard08) {
    const activeName = currentLang === 'ko' ? content.hero.nameKo : content.hero.nameEn;
    const aboutText = content.about.bio.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const accent = '#112b64';
    const contactLinks = [
      { href: `mailto:${content.contact.email}`, label: content.contact.email, title: 'Email', external: false, show: !!content.contact.email },
      { href: `tel:${content.contact.phone}`, label: content.contact.phone || '', title: 'Phone', external: false, show: !!content.contact.phone },
      { href: content.contact.kakaoOpenChat || '', label: 'Kakao Open Chat', title: 'Kakao', external: true, show: !!content.contact.kakaoOpenChat },
      { href: content.contact.instagram || '', label: 'Instagram', title: 'Instagram', external: true, show: !!content.contact.instagram },
      { href: content.contact.youtube || '', label: 'YouTube', title: 'YouTube', external: true, show: !!content.contact.youtube },
      { href: content.contact.blog || '', label: 'Blog', title: 'Blog', external: true, show: !!content.contact.blog },
    ].filter((item) => item.show);

    return (
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#f5f7fb', color: '#132033' }}>
        {renderLanguageSelector('top-24')}
        <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#dde6f2]" style={{ backgroundColor: 'rgba(245,247,251,0.88)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
            <div style={{ fontFamily: layout.fonts.display, fontWeight: 800, color: accent }}>Card Portfolio</div>
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.24em]" style={{ fontFamily: layout.fonts.body }}>
              <a href="#section-about">About</a>
              {visibleSections.portfolio && <a href="#section-portfolio">Portfolio</a>}
              {visibleSections.strengths && <a href="#section-strengths">Strengths</a>}
              <a href="#section-contact">Contact</a>
            </div>
            <a href="#section-contact" className="px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.24em]" style={{ backgroundColor: accent, color: '#ffffff', fontFamily: layout.fonts.body }}>
              Inquiry
            </a>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          <section id="section-hero" className="text-center mb-24">
            <div className={`${isMobile ? 'w-40 h-40' : 'w-56 h-56'} mx-auto rounded-full p-3 bg-white shadow-[0_26px_60px_rgba(17,43,100,0.12)] mb-8`}>
              <div className="w-full h-full rounded-full overflow-hidden">
                <DraggableImage id="hero-photo" src={content.hero.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <Clickable id="hero-label">
              <div style={getStyle('hero-label', { fontSize: '0.8rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: accent, fontFamily: layout.fonts.body })} className="mb-5">
                {content.hero.label || activeName}
              </div>
            </Clickable>
            <Clickable id="hero-name">
              <h1 style={getStyle('hero-name', { fontFamily: layout.fonts.display, fontSize: isMobile ? '3rem' : '5rem', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 })}>
                {content.hero.title || activeName}
              </h1>
            </Clickable>
            <Clickable id="hero-tagline">
              <p style={getStyle('hero-tagline', { fontSize: isMobile ? '1rem' : '1.12rem', lineHeight: 1.9, fontFamily: layout.fonts.body, opacity: 0.74, maxWidth: '34rem', margin: '1.2rem auto 0 auto' })}>
                {content.hero.tagline}
              </p>
            </Clickable>
          </section>

          <section id="section-about" className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-12 gap-8'} mb-20`}>
            <div className={`${isMobile ? '' : 'md:col-span-7'} bg-white border border-[#dde6f2] p-8 md:p-10 shadow-[0_16px_36px_rgba(17,43,100,0.05)]`}>
              <Clickable id="about-title">
                <h2 style={getStyle('about-title', { fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800, color: accent, marginBottom: '1rem' })}>{content.about.title || 'About'}</h2>
              </Clickable>
              <Clickable id="about-bio">
                <p style={getStyle('about-bio', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 1.92, fontFamily: layout.fonts.body, opacity: 0.78 })}>{aboutText}</p>
              </Clickable>
            </div>
            <div className={`${isMobile ? '' : 'md:col-span-5'} bg-[#eef3fb] border border-[#dde6f2] p-8`}>
              <h3 className="text-lg mb-5" style={{ fontFamily: layout.fonts.display, fontWeight: 700, color: accent }}>Profile Snapshot</h3>
              <div className="space-y-4">
                {normalizedDetails.slice(0, 4).map((detail) => (
                  <div key={detail.id} className="bg-white p-4 border border-[#dde6f2]">
                    <div className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: accent, fontFamily: layout.fonts.body }}>{detail.label}</div>
                    <div className="text-sm font-semibold" style={{ fontFamily: layout.fonts.body }}>{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {visibleSections.career && (
            <section id="section-career" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800 }}>{content.careerTitle || 'Career'}</h2>
              <div className="grid grid-cols-1 gap-5">
                {content.career.map((item) => (
                  <div key={item.id} className="bg-white border border-[#dde6f2] p-6 shadow-[0_16px_30px_rgba(17,43,100,0.04)]">
                    <div className="text-[11px] uppercase tracking-[0.22em] mb-3" style={{ color: accent, fontFamily: layout.fonts.body }}>{item.period}</div>
                    <h3 className="text-2xl mb-2" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.portfolio && (
            <section id="section-portfolio" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800 }}>{content.portfolioTitle || 'Portfolio'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.portfolio.map((item, idx) => (
                  <div key={item.id} className={`${idx === 0 ? 'md:col-span-2' : ''} bg-white border border-[#dde6f2] p-4 md:p-5 shadow-[0_16px_36px_rgba(17,43,100,0.05)]`}>
                    <div className={`overflow-hidden rounded-[24px] ${idx === 0 ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
                      {renderPortfolioItem(item, 'w-full h-full object-cover transition-transform duration-700 hover:scale-105')}
                    </div>
                    <div className="pt-5">
                      <h3 className="text-xl" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.strengths && (
            <section id="section-strengths" className="mb-20">
              <h2 className="mb-8" style={{ fontFamily: layout.fonts.display, fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800 }}>{content.strengthsTitle || 'Strengths'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.strengths.map((item) => (
                  <div key={item.id} className="bg-white border border-[#dde6f2] p-8 text-center">
                    <div className="text-4xl mb-5">{item.icon}</div>
                    <h3 className="text-xl mb-3" style={{ fontFamily: layout.fonts.display, fontWeight: 700 }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-75" style={{ fontFamily: layout.fonts.body }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="section-contact" className="bg-[#102a5e] text-white p-8 md:p-12 rounded-[32px] shadow-[0_28px_56px_rgba(17,43,100,0.18)]">
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-8' : 'md:grid-cols-12 gap-10 items-start'}`}>
              <div className={`${isMobile ? '' : 'md:col-span-4'}`}>
                <Clickable id="contact-title">
                  <h2 style={getStyle('contact-title', { fontFamily: layout.fonts.display, fontSize: isMobile ? '2.2rem' : '3.6rem', fontWeight: 800, lineHeight: 1 })}>{content.contact.title || 'Contact'}</h2>
                </Clickable>
                <Clickable id="contact-subtitle">
                  <p style={getStyle('contact-subtitle', { fontSize: isMobile ? '1rem' : '1.08rem', lineHeight: 1.9, fontFamily: layout.fonts.body, opacity: 0.78, marginTop: '1rem' })}>{content.contact.subtitle || 'Choose the most comfortable contact channel and share your brief.'}</p>
                </Clickable>
              </div>
              <div className={`${isMobile ? '' : 'md:col-span-8'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                {contactLinks.map((item) => (
                  <a key={`${item.title}-${item.href}`} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className="bg-white/8 border border-white/10 p-5 hover:bg-white/12 transition-colors">
                    <div className="text-[10px] uppercase tracking-[0.22em] mb-3 text-[#c5d4ff]" style={{ fontFamily: layout.fonts.body }}>{item.title}</div>
                    <div className="text-sm break-all" style={{ fontFamily: layout.fonts.body }}>{item.label}</div>
                  </a>
                ))}
                <div className="bg-white p-5 flex items-center justify-center md:col-span-2">
                  <QRCodeSVG value={content.contact.qrCodeUrl || window.location.href} size={isMobile ? 116 : 150} />
                </div>
              </div>
            </div>
          </section>
        </main>
        {renderSharedKakaoButton()}
        {renderSharedCheckout('#eef3fb', accent)}
        {renderSharedFooter()}
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-x-hidden ${isMinimal ? 'border-[20px] border-black' : ''}`} style={{ ...sectionStyle }}>
      {/* Language Selector */}
      {availableLanguages.length > 1 && (
        <div className={`fixed right-6 z-50 ${(isStitchEditorial01 || isStitchEditorial02 || isStitchEditorial03) ? 'top-24' : 'top-6'}`}>
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

      {(isStitchEditorial01 || isStitchEditorial02 || isStitchEditorial03) && (
        <nav className="fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md" style={{ backgroundColor: `${colorScheme.colors.bg}dd`, borderColor: `${colorScheme.colors.accent}14` }}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
            <div style={{ ...displayFont, fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700 }}>
              Broadcaster PR
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#section-about" className="text-[11px] uppercase tracking-[0.24em] hover:opacity-70" style={{ opacity: (isStitchEditorial02 || isStitchEditorial03) ? 1 : 0.65, borderBottom: (isStitchEditorial02 || isStitchEditorial03) ? `1px solid ${colorScheme.colors.accent}` : undefined, paddingBottom: (isStitchEditorial02 || isStitchEditorial03) ? '0.25rem' : undefined, fontFamily: layout.fonts.body }}>Profile</a>
              {visibleSections.career && <a href="#section-career" className="text-[11px] uppercase tracking-[0.24em] hover:opacity-70" style={{ opacity: (isStitchEditorial02 || isStitchEditorial03) ? 0.7 : 0.65, fontFamily: layout.fonts.body }}>Career</a>}
              {visibleSections.portfolio && <a href="#section-portfolio" className="text-[11px] uppercase tracking-[0.24em] hover:opacity-70" style={{ opacity: (isStitchEditorial02 || isStitchEditorial03) ? 0.7 : 0.65, fontFamily: layout.fonts.body }}>Portfolio</a>}
              {visibleSections.strengths && <a href="#section-strengths" className="text-[11px] uppercase tracking-[0.24em] hover:opacity-70" style={{ opacity: (isStitchEditorial02 || isStitchEditorial03) ? 0.7 : 0.65, fontFamily: layout.fonts.body }}>Strengths</a>}
              <a href="#section-contact" className="text-[11px] uppercase tracking-[0.24em] hover:opacity-70" style={{ opacity: (isStitchEditorial02 || isStitchEditorial03) ? 0.7 : 0.65, fontFamily: layout.fonts.body }}>Contact</a>
            </div>
            {isStitchEditorial01 ? (
              <a
                href="#section-contact"
                className="shrink-0 px-5 py-2 text-[11px] uppercase tracking-[0.24em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: colorScheme.colors.text, color: colorScheme.colors.bg, fontFamily: layout.fonts.body }}
              >
                Inquire
              </a>
            ) : (
              <button className="md:hidden text-xs uppercase tracking-[0.24em]" style={{ color: colorScheme.colors.text, fontFamily: layout.fonts.body }}>
                Menu
              </button>
            )}
          </div>
        </nav>
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
