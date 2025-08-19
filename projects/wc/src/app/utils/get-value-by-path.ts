export const getValueByPath = <T extends object, R = unknown>(
  obj: T,
  path: string,
): R | undefined => {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
};
