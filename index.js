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
        transformJSXElement(path);
      },
      JSXFragment(path) {
        transformJSXFragment(path);
      },
      VariableDeclaration(path) {
        transformToES5(path);
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

function transformJSXElement(path) {
  const openingElement = path.node.openingElement;
  const tagName = openingElement.name.name;
  const isComponent = /^[A-Z]/.test(tagName);

  const attributes = openingElement.attributes.map((attr) => {
    if (t.isJSXSpreadAttribute(attr)) {
      return t.spreadElement(attr.argument);
    }

    const key = t.isValidIdentifier(attr.name.name)
      ? t.identifier(attr.name.name)
      : t.stringLiteral(attr.name.name);

    if (!attr.value) {
      return t.objectProperty(key, t.booleanLiteral(true));
    } else if (t.isJSXExpressionContainer(attr.value)) {
      return t.objectProperty(key, attr.value.expression);
    } else {
      return t.objectProperty(key, t.stringLiteral(attr.value.value));
    }
  });

  const attributesObject =
    attributes.length > 0 ? t.objectExpression(attributes) : t.nullLiteral();

  const children = path.node.children
    .map((child) => {
      if (t.isJSXText(child)) {
        const text = child.value.trim();
        return text ? t.stringLiteral(text) : null;
      } else if (t.isJSXElement(child)) {
        return child;
      } else if (t.isJSXExpressionContainer(child)) {
        return t.isJSXEmptyExpression(child.expression)
          ? null
          : child.expression;
      }
      return null;
    })
    .filter(Boolean);

  const reactCreateElementCall = t.callExpression(
    t.memberExpression(t.identifier("React"), t.identifier("createElement")),
    [
      isComponent ? t.identifier(tagName) : t.stringLiteral(tagName),
      attributesObject,
      ...children,
    ]
  );

  path.replaceWith(reactCreateElementCall);
}

function transformJSXFragment(path) {
  const children = path.node.children
    .map((child) => {
      if (t.isJSXText(child)) {
        const text = child.value.trim();
        return text ? t.stringLiteral(text) : null;
      } else if (t.isJSXElement(child)) {
        return child;
      } else if (t.isJSXExpressionContainer(child)) {
        return t.isJSXEmptyExpression(child.expression)
          ? null
          : child.expression;
      }
      return null;
    })
    .filter(Boolean);

  const reactFragment = t.callExpression(
    t.memberExpression(t.identifier("React"), t.identifier("createElement")),
    [
      t.memberExpression(t.identifier("React"), t.identifier("Fragment")),
      t.nullLiteral(),
      ...children,
    ]
  );

  path.replaceWith(reactFragment);
}
function transformToES5(path) {
  if (path.node.kind === "const" || path.node.kind === "let") {
    const parent = path.parentPath;

    if (parent.isBlockStatement() && parent.parentPath.isFunction()) {
      path.node.kind = "var";
      hoistVariable(path);
      path.skip();
      return;
    }

    if (
      parent.isFunction() ||
      parent.isArrowFunctionExpression() ||
      parent.isFunctionExpression()
    ) {
      path.node.kind = "var";
      hoistVariable(path);
      path.skip();
      return;
    }

    if (
      parent.isBlockStatement() &&
      (parent.parentPath.isIfStatement() ||
        parent.parentPath.isForStatement() ||
        parent.parentPath.isWhileStatement())
    ) {
      path.node.kind = "var";
      const iife = t.callExpression(
        t.functionExpression(null, [], t.blockStatement([path.node])),
        []
      );
      path.replaceWith(iife);
      path.skip();
    }
  }
}

function hoistVariable(path) {
  const block = path.getStatementParent(); 
  const declaration = t.variableDeclaration("var", [
    t.variableDeclarator(path.node.declarations[0].id),
  ]);

  block.insertBefore(declaration); 
  path.node.declarations[0].init = null;
}

processFolder(srcDir).catch((err) => console.error("❌ Error:", err));
