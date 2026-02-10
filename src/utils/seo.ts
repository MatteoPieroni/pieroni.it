export const getMetaDescriptionFromHtmlDescription = (description?: string) => {
  return (
    description
      ?.replace(/<[^>]+>/g, '')
      .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
      ?.replace(/\[\&hellip\;\]/g, '') || ''
  );
};
