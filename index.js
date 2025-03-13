const babel = require("@babel/core");
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

// Read all files from src directory
fs.readdirSync(srcDir).forEach(async (file) => {
  const filePath = path.join(srcDir, file);
  await CompileOnce(filePath);
});

async function CompileOnce(filePath) {
  try {
    const code = await fs.promises.readFile(filePath, "utf-8");

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    traverse(ast, {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const tagName = openingElement.name.name; 
        const attributes = openingElement.attributes.map((attr) =>
          t.objectProperty(
            t.identifier(attr.name.name),
            attr.value
              ? t.stringLiteral(attr.value.value)
              : t.booleanLiteral(true) // Handle boolean attributes (e.g., `disabled`)
          )
        );

        const attributesObject =
          attributes.length > 0
            ? t.objectExpression(attributes)
            : t.nullLiteral();

        const reactCreateElementCall = t.callExpression(
          t.memberExpression(
            t.identifier("React"),
            t.identifier("createElement")
          ),
          [
            t.stringLiteral(tagName), 
            attributesObject, 
            ...path.node.children.map((child) => {
              if (t.isJSXText(child)) {
                return t.stringLiteral(child.value.trim()); 
              }
              return child; 
            }),
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
