import { Project, ScriptTarget, SourceFile, Node, ts } from 'ts-morph';

const glob = process.argv.slice(2)[0] || './**/*{.ts,.js}';
const project = new Project({
  compilerOptions: {
    allowJs: true,
    jsx: ts.JsxEmit.React,
    target: ScriptTarget.Latest,
  },
});

project.addSourceFilesAtPaths([glob, '!./node_modules/**']);

const sourceFiles = project.getSourceFiles();
for (const sourceFile of sourceFiles) {
  const [shouldUpdate, userEvent] = updateImports(sourceFile);

  if (shouldUpdate) {
    console.log(sourceFile.getFilePath());
    updateAwaitable(sourceFile, userEvent);
    updateTypeToPaste(sourceFile, userEvent);
    sourceFile.saveSync();
  }
}

function updateImports(sourceFile: SourceFile): [boolean, string] {
  const importDeclarations = sourceFile.getImportDeclarations();

  const userEvent = importDeclarations.find(
    (d) => d.getModuleSpecifierValue() === '@testing-library/user-event'
  );
  if (!userEvent) return [false, ''];

  const rtl = importDeclarations.find((d) =>
    /^@testing-library\/(react|angular)/.test(d.getModuleSpecifierValue())
  );
  if (!rtl) return [false, ''];

  const userEventImport = userEvent.getImportClause().getDefaultImport();
  const userEventImportName = userEventImport.getText();

  userEvent.replaceWithText('');

  if (userEventImportName !== 'userEvent') {
    rtl.addNamedImport(`userEvent as ${userEventImportName}`);
  } else {
    rtl.addNamedImport(`userEvent`);
  }

  return [true, userEventImportName];
}

// manually traverse, transform does mess up the format (removes empty lines?)
function updateAwaitable(index: SourceFile | Node<ts.Node>, userEvent: string) {
  const children = index.getChildren();
  for (const expressionStatement of children) {
    if (!Node.isExpressionStatement(expressionStatement)) {
      updateAwaitable(expressionStatement, userEvent);
      continue;
    }

    const userEventNode = findUserEvent(
      expressionStatement.getExpression(),
      userEvent
    );
    if (!userEventNode) {
      updateAwaitable(expressionStatement, userEvent);
      continue;
    }

    expressionStatement.replaceWithText(
      'await ' + expressionStatement.getText()
    );

    const parent = expressionStatement.getParent()?.getParent();
    if (parent && Node.isArrowFunction(parent)) {
      parent.toggleModifier('async', true);
    }
  }
}

function updateTypeToPaste(
  index: SourceFile | Node<ts.Node>,
  userEvent: string
) {
  const children = index.getChildren();
  for (const callExpression of children) {
    const userEventNode = findUserEvent(callExpression, userEvent);
    if (
      !userEventNode ||
      userEventNode.propertyAccessExpression.getName() !== 'type'
    ) {
      updateTypeToPaste(callExpression, userEvent);
      continue;
    }

    const [
      _element,
      _text,
      options,
    ] = userEventNode.callExpression.getArguments();

    if (!options || !Node.isObjectLiteralExpression(options)) {
      continue;
    }

    const allAtOnceProp = options.getProperty('allAtOnce');
    if (!allAtOnceProp) {
      continue;
    }

    const shouldRename =
      allAtOnceProp &&
      Node.isPropertyAssignment(allAtOnceProp) &&
      allAtOnceProp.getInitializerIfKind(ts.SyntaxKind.TrueKeyword);

    if (shouldRename) {
      userEventNode.propertyAccessExpression
        .getNameNode()
        .replaceWithText('paste');
    }

    const removeOptions = options.getProperties().length === 1;
    userEventNode.callExpression.removeArgument(
      removeOptions ? options : allAtOnceProp
    );
  }
}

function findUserEvent(node: Node<ts.Node>, userEvent: string) {
  if (!Node.isCallExpression(node)) return undefined;

  const propertyAccessExpression = node.getExpression();

  if (!Node.isPropertyAccessExpression(propertyAccessExpression))
    return undefined;

  if (propertyAccessExpression.getExpression().getText() !== userEvent)
    return undefined;

  return {
    callExpression: node,
    propertyAccessExpression,
  };
}
