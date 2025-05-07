export const normalizePath = (path: string): string => {
  return path.replace(/\/+$/, '');
};

export const parseParamsAndSearchParams = (route: string) => {
  const [path, queryString] = route.split('?');
  const searchParams = new URLSearchParams(queryString);
  const params: Record<string, string> = {};
  const pathSegments = path.split('/').filter(Boolean);
  pathSegments.forEach((segment, index) => {
    if (segment.startsWith(':') && pathSegments[index + 1]) {
      params[segment.slice(1)] = pathSegments[index + 1];
    }
  });
  return { params, searchParams };
};
