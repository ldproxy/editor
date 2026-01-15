import { writeFileSync, mkdirSync } from "fs";
import { copySync } from "fs-extra/esm";
import pkg from "./package.json" with { type: "json" };

const target = process.argv[2];
const platform = process.argv[3];

if (!target) {
  throw new Error("Missing target");
}

const { browser, main, scripts, dependencies, devDependencies, version, ...rest } = pkg;

const vsixPkg = {
  ...rest,
  version:
    process.env.VSIX_VERSION === "snapshot"
      ? version +
        "-snapshot." +
        new Date()
          .toISOString()
          .substring(0, 19)
          .replace("T", "")
          .replaceAll("-", "")
          .replaceAll(":", "")
      : version,
  [target === "web" ? "browser" : "main"]: "./extension.js",
};

mkdirSync("dist/vsix", { recursive: true });
mkdirSync(`dist/${target}`, { recursive: true });

writeFileSync(`dist/${target}/package.json`, JSON.stringify(vsixPkg, null, 2));

if (target === "native") {
  writeFileSync(
    `dist/${target}/.vscodeignore`,
    `
prebuilds/**
!prebuilds/${platform}
`
  );
}

copySync("LICENSE", `dist/${target}/LICENSE`);
copySync("docs/vscode.md", `dist/${target}/README.md`);
copySync("docs/icon.png", `dist/${target}/icon.png`);
copySync("docs/screenshot.png", `dist/${target}/screenshot.png`);
copySync("docs/screenshot2.png", `dist/${target}/screenshot2.png`);
copySync("docs/screenshot3.png", `dist/${target}/screenshot3.png`);

mkdirSync(`dist/${target}/webview-ui/build`, { recursive: true });
copySync("webview-ui/build", `dist/${target}/webview-ui/build`);
