const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const fs = require("fs");
const path = require("path");

const srcDir = "./src";
const outDir = "./dist";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}
async function processFolder(folderPath) {
  const files = await fs.promises.readdir(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = await fs.promises.stat(filePath); 

    if (stat.isDirectory()) {
      await processFolder(filePath); 
    } else if (stat.isFile() && /\.(js|ts|jsx|tsx)$/.test(file)) {
      await CompileOnce(filePath);
    }
  }
}
async function CompileOnce(filePath) {
  try {
    const code = await fs.promises.readFile(filePath, "utf-8");

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const tagName = openingElement.name.name;
           const attributes = openingElement.attributes.map((attr) => {
             const key = t.isValidIdentifier(attr.name.name)
               ? t.identifier(attr.name.name) 
               : t.stringLiteral(attr.name.name); 

             if (t.isJSXExpressionContainer(attr.value)) {
               return t.objectProperty(key, attr.value.expression);
             } else {
               return t.objectProperty(key, t.stringLiteral(attr.value.value));
             }
           });


        const attributesObject =
          attributes.length > 0
            ? t.objectExpression(attributes)
            : t.nullLiteral();
           const children = path.node.children
             .map((child) => {
               if (t.isJSXText(child)) {
                 return t.stringLiteral(child.value.trim()); 
               } else if (t.isJSXElement(child)) {
                 return child; 
               } else if (t.isJSXExpressionContainer(child)) {
                 return child.expression; 
               }
               return null;
             })
             .filter(Boolean);
        const reactCreateElementCall = t.callExpression(
          t.memberExpression(
            t.identifier("React"),
            t.identifier("createElement")
          ),
          [
            t.stringLiteral(tagName),
            attributesObject,
            ...children
          ]
        );

        path.replaceWith(reactCreateElementCall);
      },
    });

    const output = generate(ast).code;

    const outputFilePath = path.join(outDir, path.basename(filePath));
    fs.writeFileSync(outputFilePath, output);

    console.log(`✅ Transformed: ${filePath} → ${outputFilePath}`);
  } catch (error) {
    console.error(`❌ Error reading file: ${filePath}`, error);
  }
}


processFolder(srcDir).catch((err) => console.error("❌ Error:", err));
