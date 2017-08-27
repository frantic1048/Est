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

import sanitizeHtml from 'sanitize-html'

import T from '../tokenTypes.js'

const sanitize = s => sanitizeHtml(s,
  {
    allowedTags: [],
    allowedAttributes: []
  })

const targets = new Map()
const anonymousTargets = []
const sectionLevelOfStyles = new Map()

function walker1 (node, depth, parent, when) {
  if (node.T === T.Target) {
    if (node.C[0].T === T.Text) { // hyperlink definition with a direct link
      if (node.A.name) { // named hyperlink definition
        targets.set(node.A.name,
          sanitize(node.C[0].A.value))
      } else { // anonymous hyperlink definition
        anonymousTargets.push(sanitize(node.C[0].A.value))
      }
    }
  } else if (node.T === T.Section) {
    if (!sectionLevelOfStyles.has(node.A.style)) {
      // new style, set a new level for it
      const level = sectionLevelOfStyles.size + 1
      sectionLevelOfStyles.set(node.A.style, level)
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
  } else if (node.T === T.AnonymousHyperlink) {
    if (!node.A.ref) { // dose not have embed URI
      // TODO: assert anonymousTargets.length > 0

      // consume an anonymousTarget
      node.set('ref', anonymousTargets.pop())
    }
  } else if (node.T === T.Section) {
    node.set('level', sectionLevelOfStyles.get(node.A.style))
  }
  return node
}

/**
  * recursively fill an ASTy node's semantics
  * @param  {ASTYNode}
  * @return {ASTYNode}
  */
export default function transform (node) {
  return node.walk(walker1)
    .walk(walker2)
}
