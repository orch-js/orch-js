import * as ts from 'typescript'

import { withDefaultOptions, Options } from './options'
import { isOrchModelClassDeclaration, addNamespaceForOrchModel } from './utils'

export function createTransformer(
  partialOptions?: Partial<Options>,
): ts.TransformerFactory<ts.SourceFile> {
  const options = withDefaultOptions(partialOptions)

  return (context) => {
    const { sourceRoot } = context.getCompilerOptions()

    return (node) => {
      let lastOrchModelPosition = 0

      const visitor: ts.Visitor = (node) => {
        if (isOrchModelClassDeclaration(node)) {
          lastOrchModelPosition += 1
          return addNamespaceForOrchModel({
            node,
            options,
            sourceRoot,
            position: lastOrchModelPosition,
          })
        } else {
          return ts.visitEachChild(node, visitor, context)
        }
      }

      return ts.visitNode(node, visitor)
    }
  }
}
