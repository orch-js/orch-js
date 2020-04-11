import * as path from 'path'
import * as ts from 'typescript'

import { Options } from './options'
import { hash } from './hash'

export function isOrchModelClassDeclaration(node: ts.Node): node is ts.ClassDeclaration {
  return ts.isClassDeclaration(node) && isClassExtendsFromOrchModel(node)
}

export function addNamespaceForOrchModel({
  node,
  sourceRoot,
  position,
  options,
}: {
  node: ts.ClassDeclaration
  sourceRoot: string | undefined
  position: number
  options: Options
}): ts.ClassDeclaration {
  const namespace = getOrchModelNameSpace(node, sourceRoot, position)
  return setOrchModelNamespace(node, `${options.prefix}-${namespace}`)
}

function isIdentifierNode(node: ts.Node): node is ts.Identifier {
  return node.kind === ts.SyntaxKind.Identifier
}

function isClassExtendsFromOrchModel(node: ts.ClassDeclaration): boolean {
  return !!node.heritageClauses?.some((clause) => {
    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
      const type = clause.types[0]
      return type.expression.getText() === 'OrchModel'
    } else {
      return false
    }
  })
}

function setOrchModelNamespace(node: ts.ClassDeclaration, namespace: string): ts.ClassDeclaration {
  // Check if model already has `static namespace = ...` declaration.
  for (const member of node.members) {
    if (ts.isPropertyDeclaration(member)) {
      const isStaticMember = !!member.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword,
      )

      const identifierName = member.name && isIdentifierNode(member.name) ? member.name.text : null

      if (isStaticMember && identifierName === 'namespace') {
        const initializer = member.initializer

        if (initializer) {
          member.initializer = ts.createBinary(
            ts.createStringLiteral(`${namespace}-`),
            ts.createToken(ts.SyntaxKind.PlusToken),
            ts.createParen(initializer),
          )

          return node
        } else {
          member.initializer = ts.createStringLiteral(namespace)

          return node
        }
      } else {
        continue
      }
    } else {
      continue
    }
  }

  // Obviously there is no `static namespace = ...`. So let's create one
  return addStaticMemberToClass(node, 'namespace', ts.createStringLiteral(namespace))
}

function getOrchModelNameSpace(
  node: ts.ClassDeclaration,
  sourceRoot: string | undefined,
  position: number,
) {
  const fileName = node.getSourceFile().fileName
  const filePath = sourceRoot
    ? path.relative(sourceRoot, fileName).replace(path.sep, path.posix.sep)
    : fileName

  return hash(`${getOrchModelDefaultNameSpace(node)}${filePath}${position}`)
}

function getOrchModelDefaultNameSpace(node: ts.ClassDeclaration): string | undefined {
  if (node.name && isIdentifierNode(node.name)) {
    return node.name.text
  } else {
    return undefined
  }
}

function addStaticMemberToClass(
  classDeclaration: ts.ClassDeclaration,
  name: string,
  value: ts.Expression,
) {
  const propertyDeclaration = ts.createProperty(
    [],
    [ts.createToken(ts.SyntaxKind.StaticKeyword)],
    name,
    undefined,
    undefined,
    value,
  )

  return ts.updateClassDeclaration(
    classDeclaration,
    classDeclaration.decorators,
    classDeclaration.modifiers,
    classDeclaration.name,
    classDeclaration.typeParameters,
    ts.createNodeArray(classDeclaration.heritageClauses),
    ts.createNodeArray([propertyDeclaration, ...classDeclaration.members]),
  )
}
