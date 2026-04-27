export const getISODateString = (date?: Date): string => {
  return (date || new Date()).toISOString();
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString();
};
