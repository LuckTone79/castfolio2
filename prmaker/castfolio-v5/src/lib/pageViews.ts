import { doc, collection, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const VIEW_COOLDOWN_MS = 1000 * 60 * 30; // 30 minutes

export const recordPageView = async (pageId: string) => {
  try {
    // 1. Get or create session ID
    let sessionId = localStorage.getItem('castfolio_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('castfolio_session_id', sessionId);
    }

    // 2. Check cooldown
    const lastViewKey = `castfolio_last_view_${pageId}`;
    const lastViewTime = localStorage.getItem(lastViewKey);
    const now = Date.now();

    if (lastViewTime && now - parseInt(lastViewTime, 10) < VIEW_COOLDOWN_MS) {
      // Cooldown active, don't record
      return;
    }

    // 3. Record view in page_views collection
    await addDoc(collection(db, 'page_views'), {
      pageId,
      viewedAt: new Date().toISOString(),
      referrer: document.referrer || '',
      userAgent: navigator.userAgent.substring(0, 255), // Truncate to save space
      sessionId,
    });

    // 4. Increment viewsCount on the page document
    const pageRef = doc(db, 'pages', pageId);
    await updateDoc(pageRef, {
      viewsCount: increment(1),
    });

    // 5. Update last view time
    localStorage.setItem(lastViewKey, now.toString());

  } catch (error) {
    console.error('Failed to record page view:', error);
  }
};
