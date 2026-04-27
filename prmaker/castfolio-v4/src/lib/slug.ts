import { Firestore, collection, query, where, getDocs } from 'firebase/firestore';

export const slugifyTalentName = (nameEn: string, fallback: string): string => {
  const slug = nameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return slug || fallback;
};

export const ensureUniqueSlug = async (db: Firestore, baseSlug: string, excludePageId?: string): Promise<string> => {
  let slug = baseSlug;
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const q = query(collection(db, 'pages'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      isUnique = true;
    } else {
      // If there's a match, check if it's the excluded page
      if (excludePageId && querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludePageId) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
  }

  return slug;
};
