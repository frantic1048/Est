/**
 * complete semantics through 2 pass:
 * walker1:
 *   - collect reference targets
 *   - collect section header levels
 *   - collect&fill auto numbers
 *
 * walker2:
 *   - fill reference targets
 *   - set section header levels
 */

const sanitizeHtml = require('sanitize-html')

const T = require('../tokenTypes')

const targets = new Map()

function walker1 (node, depth, parent, when) {
  if (node.T === T.Target) {
    if (node.C[0].T === T.Text) {
      targets.set(node.A.name,
        sanitizeHtml(node.C[0].A.value,
          {allowedTags: [],
            allowedAttributes: []}))
    }
  }
  return node
}

function walker2 (node, depth, parent, when) {
  if (node.T === T.NamedHyperlink) {
    if (targets.has(node.A.name)) {
      node.set('ref', targets.get(node.A.name))
    } else {
      // unknown reference name
      // throw error
    }
  }
  return node
}

 /**
  * recursively fill an ASTy node's semantics
  * @param  {ASTYNode}
  * @return {ASTYNode}
  */
function transform (node) {
  return node.walk(walker1)
             .walk(walker2)
}

module.exports = transform