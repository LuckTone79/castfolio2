export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[0-9+\-\s()]{8,20}$/;
  return re.test(phone);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequiredText = (text: string | undefined | null): boolean => {
  return typeof text === 'string' && text.trim().length > 0;
};

export const validateImageFile = (file: File, maxSizeMB: number, acceptedTypes: string[]): { valid: boolean; error?: string } => {
  if (!acceptedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type.' };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB.` };
  }
  return { valid: true };
};

export const validateVideoUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;
  const mp4Regex = /\.mp4$/i;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url) || mp4Regex.test(url);
};

export const sanitizeText = (text: string): string => {
  // Basic sanitization to prevent XSS if rendering as HTML
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
