export function getNextLineOfPath(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number;
    arrayIndex?: number;
  }[],
  currentLineOfPath: number,
  currentArrayIndex: number | null
) {
  const nextItem = allYamlKeys.find(
    (item) => item.lineOfPath > currentLineOfPath && item.arrayIndex !== currentArrayIndex
  );

  return nextItem ? nextItem.lineOfPath - 1 : Number.MAX_SAFE_INTEGER;
}
