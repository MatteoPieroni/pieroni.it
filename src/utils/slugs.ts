export const ensureTrailingSlash = (url: string) =>
  url.at(-1) !== "/" ? `${url}/` : url;
