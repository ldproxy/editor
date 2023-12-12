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
    startOfArray?: number;
    arrayIndex?: number;
  }[],
  index: number,
  path: string
): number | undefined {
  let line: number = 0;
  const pathToUse = path.replace(/\[\d+\]/g, "");

  for (const obj of allYamlKeys) {
    if (obj.lineOfPath && obj.arrayIndex === index && obj.path === pathToUse) {
      line = obj.lineOfPath;
    }
  }
  console.log("ttt", line);
  console.log("pathiToUse", pathToUse);
  if (line > 0) {
    return line;
  }
}

export function getMaxLine(
  allYamlKeys: {
    path: string;
    index: number;
    lineOfPath: number | null;
    startOfArray?: number;
    arrayIndex?: number;
  }[],
  minLine: number
): number | undefined {
  const myItem = allYamlKeys.find((item) => item.lineOfPath === minLine);

  let startIndex = 0;
  if (myItem) {
    startIndex = allYamlKeys.findIndex((item) => item === myItem);
  }
  console.log("startIndex", myItem);

  if (startIndex > 0) {
    for (let i = startIndex; i < allYamlKeys.length; i++) {
      const currentItem = allYamlKeys[i];
      console.log("currentItem", currentItem);
      if (
        (myItem && currentItem.startOfArray !== myItem.startOfArray) ||
        (myItem && !currentItem.arrayIndex)
      ) {
        if (currentItem.startOfArray) {
          return currentItem.startOfArray;
        } else if (currentItem.lineOfPath) {
          return currentItem.lineOfPath;
        }
      }
    }
  }
}
