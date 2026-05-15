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
  if (!url) return '';
  return url.replace(/\/(?:small|thumb)\//i, '/large/').replace(/[_-](?:small|thumb)(\.[a-zA-Z0-9]+)$/i, '_large$1');
};
