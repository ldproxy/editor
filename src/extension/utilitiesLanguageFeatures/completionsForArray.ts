export function extractIndexFromPath(path: string): number | null {
  const regex = /\[(\d+)\]/;

  const match = path.match(regex);
  console.log("match", match);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
}

export function getLinesForArrayIndex(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number | null;
    arrayIndex?: number;
  }[],
  arrayIndex: number
): number[] {
  const lines: number[] = [];

  for (const obj of allYamlKeys) {
    if (obj.lineOfPath && obj.arrayIndex === arrayIndex) {
      lines.push(obj.lineOfPath);
    }
  }
  console.log("ttt", lines);
  return lines;
}
