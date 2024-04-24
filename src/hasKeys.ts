export const hasKeys = <T extends object>(obj: T): boolean => {
  for (const key in obj) return true;
  return false;
};
