import * as ts from 'typescript'

import { isOrchModelClassDeclaration, addNamespaceForOrchModel } from './utils'

export function createTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    const { sourceRoot } = context.getCompilerOptions()

    return (node) => {
      let lastOrchModelPosition = 0

      const visitor: ts.Visitor = (node) => {
        if (isOrchModelClassDeclaration(node)) {
          lastOrchModelPosition += 1
          return addNamespaceForOrchModel(node, sourceRoot, lastOrchModelPosition)
        } else {
          return ts.visitEachChild(node, visitor, context)
        }
      }

      return ts.visitNode(node, visitor)
    }
  }
}
