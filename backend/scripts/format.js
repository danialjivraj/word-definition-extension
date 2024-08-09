import fs from "fs";
import path from "path";
import prettier from "prettier";

const ROOT_DIR = "word-definition-extension";

const excludedFiles = ["english-dictionary.json"];
const excludedDirectories = ["node_modules"];

function isSupportedFile(filename) {
  const extname = path.extname(filename).toLowerCase();
  const allowedExtensions = [
    ".js",
    ".mjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".json",
    ".css",
    ".scss",
    ".less",
    ".html",
    ".htm",
    ".vue",
    ".hbs",
    ".handlebars",
    ".gjs",
    ".gts",
    ".graphql",
    ".gql",
    ".md",
    ".markdown",
    ".yaml",
    ".yml",
  ];

  if (allowedExtensions.includes(extname)) {
    return !excludedFiles.includes(filename);
  }
  return false;
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      if (!excludedDirectories.includes(file)) {
        traverseDirectory(filePath);
      }
    } else if (stats.isFile() && isSupportedFile(file)) {
      formatFile(filePath);
    }
  });
}

function formatFile(filePath) {
  const rootDir = findRootDirectory();
  const relativePath = path.relative(rootDir, filePath);
  try {
    const options = prettier.resolveConfig.sync(filePath) || {};
    const code = fs.readFileSync(filePath, "utf8");
    const formattedCode = prettier.format(code, {
      ...options,
      filepath: filePath,
    });

    if (formattedCode !== code) {
      fs.writeFileSync(filePath, formattedCode, "utf8");
      console.log(
        `Formatting: ${relativePath} \x1b[32m✔ (file formatted)\x1b[0m`
      );
    } else {
      console.log(`Formatting: ${relativePath} \x1b[32m✔\x1b[0m`);
    }
  } catch (error) {
    console.log(`Formatting: ${relativePath} \x1b[31m✘\x1b[0m`);
    console.error(
      ` \x1b[31mError formatting ${relativePath}: ${error.message}\x1b[0m`
    );
  }
}

function findRootDirectory() {
  let currentDir = process.cwd();
  while (true) {
    const folderName = path.basename(currentDir);
    if (folderName === ROOT_DIR) {
      return currentDir;
    }
    const parentDir = path.resolve(currentDir, "..");
    if (parentDir === currentDir) {
      return null;
    }
    currentDir = parentDir;
  }
}

function main() {
  const rootDir = findRootDirectory();

  if (!rootDir) {
    console.error(
      `\x1b[31mError: The root directory must be named ${ROOT_DIR} for formatting to proceed.\n Aborting formatting process.\x1b[0m`
    );
    return;
  }

  console.log(
    `\x1b[33mStarting formatting from root folder: ${ROOT_DIR}\x1b[0m`
  );
  traverseDirectory(rootDir);
}

main();
