export function removeDuplicates(
  specifiedDefs: { ref: string; finalPath: string }[]
): { ref: string; finalPath: string }[] {
  let uniquePaths: { ref: string; finalPath: string }[] = [];

  specifiedDefs.forEach((def) => {
    const { ref, finalPath } = def;
    const refExists = uniquePaths.find((obj) => obj.ref === ref);
    if (refExists) {
      if (finalPath.includes(".")) {
        uniquePaths.push({ ref, finalPath });
      }
    } else {
      uniquePaths.push({ ref, finalPath });
    }
  });

  return uniquePaths;
}
