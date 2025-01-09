import { writeFileSync, mkdirSync, copyFileSync } from "fs";
import pkg from "./package.json" with { type: "json" };

const target = process.argv[2];
const platform = process.argv[3];

if (!target) {
    throw new Error("Missing target");
}

const {browser,main,scripts,dependencies,devDependencies,...rest} = pkg;

const vsixPkg = {
    ...rest,
    [target === "web" ? "browser" : "main"]: "./extension.js",
};


mkdirSync("dist/vsix", { recursive: true });
mkdirSync(`dist/${target}`, { recursive: true });

writeFileSync(`dist/${target}/package.json`, JSON.stringify(vsixPkg, null, 2));

if (target === "native") {
writeFileSync(`dist/${target}/.vscodeignore`, `
prebuilds/**
!prebuilds/${platform}
`);
}

copyFileSync("README.md", `dist/${target}/README.md`);
copyFileSync("LICENSE", `dist/${target}/LICENSE`);
