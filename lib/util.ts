export const appendMissItems = <T>(
  rows: T[],
  missItem: T,
  count: number
): T[] => {
  return [...rows, ...Array.from({ length: count }, () => missItem)];
};
export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return null;
};
