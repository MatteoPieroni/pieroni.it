export const swapImageUrlDomain = (url: string) =>
  url.replace(
    'https://www.pieroni.it/wp-content/uploads',
    'https://images.pieroni.it',
  );

export const remoteToLocalUrl = (url: string) =>
  url.replace('https://www.pieroni.it', '');
