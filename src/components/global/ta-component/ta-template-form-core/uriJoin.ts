export const uriJoin = (...paths: (string | undefined)[]) => {
  return paths
    .map((path?: string) => {
      if (!path) return '';
      let result = path;
      if (path.startsWith('/')) {
        result = result.substring(1);
      }

      if (path.endsWith('/')) {
        result = result.substring(0, result.length - 1);
      }

      return result;
    })
    .filter(i => i)
    .join('/');
};
