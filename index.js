const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const fs = require("fs");
const path = require("path");
const { loadConfig, startWatchingConfig } = require("./watchConfig");

let config = loadConfig();

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

    const visitor = {
      JSXElement(path) {
        transformJSXElement(path);
      },
      JSXFragment(path) {
        transformJSXFragment(path);
      },
      VariableDeclaration(path) {
        transformVariables(path);
      },
      ArrowFunctionExpression(path) {
        transformArrowFunction(path);
      },
      ImportDeclaration(path) {
        convertImportDeclaration(path);
      },
      ExportDefaultDeclaration(path) {
        convertExportDefault(path);
      },
      ExportNamedDeclaration(path) {
        convertExportName(path);
      },
      TemplateLiteral(path) {
        convertBacktick(path);
      },
      
    };

    config.plugins.forEach((plugin) => {
      const pluginVisitor = plugin().visitor;
      Object.keys(pluginVisitor).forEach((key) => {
        if (visitor[key]) {
          const originalTransform = visitor[key];
          visitor[key] = function (path) {
            originalTransform(path);
            pluginVisitor[key](path);
          };
        } else {
          visitor[key] = pluginVisitor[key];
        }
      });
    });

    traverse(ast, visitor);

    const output = generate(ast).code;

    const outputFilePath = path.join(
      outDir,
      path.basename(filePath, path.extname(filePath)) + ".js"
    );
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

function transformVariables(path) {
  if (path.node.kind === "const" || path.node.kind === "let") {
    const parent = path.parentPath;

    if (parent.isBlockStatement() && parent.parentPath.isFunction()) {
      path.node.kind = "var";
      return;
    }

    if (
      parent.isFunction() ||
      parent.isArrowFunctionExpression() ||
      parent.isFunctionExpression()
    ) {
      path.node.kind = "var";
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
    }
  }
}

function transformArrowFunction(path) {
  const { node } = path;
  const functionExpression = t.functionExpression(
    null,
    node.params,
    t.isBlockStatement(node.body)
      ? node.body
      : t.blockStatement([t.returnStatement(node.body)]),
    false,
    node.async
  );

  path.replaceWith(functionExpression);
}

function convertImportDeclaration(path) {
  const { node } = path;
  const imports = node.specifiers;

  const declarations = imports.map((importedFile) => {
    if (importedFile.type === "ImportDefaultSpecifier") {
      return t.variableDeclaration("var", [
        t.variableDeclarator(
          t.identifier(importedFile.local.name),
          t.callExpression(t.identifier("require"), [
            t.stringLiteral(node.source.value),
          ])
        ),
      ]);
    } else if (importedFile.type === "ImportSpecifier") {
      return t.variableDeclaration("var", [
        t.variableDeclarator(
          t.identifier(importedFile.local.name),
          t.memberExpression(
            t.callExpression(t.identifier("require"), [
              t.stringLiteral(node.source.value),
            ]),
            t.identifier(importedFile.imported.name)
          )
        ),
      ]);
    }
  });

  path.replaceWithMultiple(declarations);
}

function convertExportDefault(path) {
  const { node } = path;

  let declaration = node.declaration;

  if (t.isIdentifier(declaration)) {
    declaration = t.identifier(declaration.name);
  } else if (
    t.isFunctionDeclaration(declaration) ||
    t.isClassDeclaration(declaration)
  ) {
    declaration = t.toExpression(declaration);
  }

  const converted = t.expressionStatement(
    t.assignmentExpression(
      "=",
      t.memberExpression(t.identifier("module"), t.identifier("exports")),
      declaration
    )
  );

  path.replaceWith(converted);
}

function convertExportName(path) {
  const { node } = path;

  if (
    t.isFunctionDeclaration(node.declaration) ||
    t.isClassDeclaration(node.declaration)
  ) {
    const name = node.declaration.id.name;
    const exported = t.expressionStatement(
      t.assignmentExpression(
        "=",
        t.memberExpression(t.identifier("exports"), t.identifier(name)),
        t.identifier(name)
      )
    );

    path.insertAfter(exported);
    path.replaceWith(node.declaration);
  } else if (t.isVariableDeclaration(node.declaration)) {
    const declarations = node.declaration.declarations.map((decl) => {
      return t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.memberExpression(
            t.identifier("exports"),
            t.identifier(decl.id.name)
          ),
          t.identifier(decl.id.name)
        )
      );
    });

    path.insertAfter(declarations);
    path.replaceWith(node.declaration);
  }
}

function convertBacktick(path) {
  const { node } = path;

  if (node.expressions.length === 0) {
    path.replaceWith(t.stringLiteral(node.quasis[0].value.cooked));
    return;
  }

  let transformed = null;

  node.quasis.forEach((quasi, index) => {
    if (quasi.value.cooked) {
      const stringNode = t.stringLiteral(quasi.value.cooked);
      transformed = transformed
        ? t.binaryExpression("+", transformed, stringNode)
        : stringNode;
    }

    if (node.expressions[index]) {
      transformed = transformed
        ? t.binaryExpression("+", transformed, node.expressions[index])
        : node.expressions[index];
    }
  });

  path.replaceWith(transformed);
}

// startWatchingConfig((newConfig) => {
//   config = newConfig;
//   console.log("✅ Plugins updated!");
// });
processFolder(srcDir).catch((err) => console.error("❌ Error:", err));
