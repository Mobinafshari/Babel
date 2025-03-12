const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const srcDir = "./src";
const outDir = "./dist";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

fs.readdirSync(srcDir).forEach(async (file) => {
  const filePath = path.join(srcDir, file);
  await CompileOnce(filePath);
});

async function CompileOnce(filePath) {
  try {
    const code = await fs.promises.readFile(filePath, "utf-8");
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    traverse(ast , {
        JSXElement(path){
            console.log(path.node.children)
        }
    })
  } catch (error) {
    console.error(`❌ Error reading file: ${filePath}`, error);
  }
}
