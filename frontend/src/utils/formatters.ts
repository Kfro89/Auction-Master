export const normalizeTags = (tags: any): { key: string | null, value: string, fullTag: string }[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(t => typeof t === 'string').map(t => ({ key: null, value: t, fullTag: t }));
  if (typeof tags === 'object') {
    const result: { key: string, value: string, fullTag: string }[] = [];
    for (const [key, val] of Object.entries(tags)) {
      if (Array.isArray(val)) {
        val.forEach(v => result.push({ key, value: String(v), fullTag: `${key}: ${v}` }));
      } else if (val !== null && val !== undefined && String(val).trim() !== '') {
        result.push({ key, value: String(val), fullTag: `${key}: ${val}` });
      }
    }
    return result;
  }
  return [];
};

export const getHighResImageUrl = (url: string) => {
  if (!url || url.startsWith('data:')) return url || '';
  
  // Only attempt to replace if it contains small/thumb indicators
  // to avoid breaking random absolute URLs that happen to have these words in other parts
  const hasSmallIndicator = /\/(?:small|thumb)\//i.test(url) || /[_-](?:small|thumb)(\.[a-zA-Z0-9]+)$/i.test(url);
  
  if (!hasSmallIndicator) return url;

  return url
    .replace(/\/(?:small|thumb)\//i, '/large/')
    .replace(/[_-](?:small|thumb)(\.[a-zA-Z0-9]+)$/i, '_large$1');
};

export const formatAuctionDate = (dateString: string | null | undefined, timezone?: string) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '--';

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone || undefined,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

