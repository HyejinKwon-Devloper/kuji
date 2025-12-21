export const appendMissItems = <T>(
  rows: T[],
  missItem: T,
  count: number
): T[] => {
  return [...rows, ...Array.from({ length: count }, () => missItem)];
};
