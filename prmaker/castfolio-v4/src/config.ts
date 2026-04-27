// ============================================================
// CastFolio Configuration
// ============================================================

// Owner bootstrap emails — 이 이메일로 가입하면 자동으로 owner 역할 부여
// 주의: Firebase Auth는 이메일을 항상 소문자로 반환하므로 반드시 소문자로 입력할 것!
export const OWNER_EMAILS = ['luck2s7912@gmail.com'];

// 플랫폼 기본 수수료율 (15%)
export const DEFAULT_COMMISSION_RATE = 0.15;

// 앱 기본 URL
export const APP_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

// 이미지 업로드 제한
export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 데이터 로딩 타임아웃 (ms)
export const DATA_LOAD_TIMEOUT_MS = 8000;
