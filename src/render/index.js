const sanitizeHtml = require('sanitize-html')

const T = require('../tokenTypes')

const sanitize = s => sanitizeHtml(s,
  {
    allowedTags: [],
    allowedAttributes: []
  })
/**
 * recursively render an ASTy node to HTML string
 * @param  {ASTYNode}  input ASTy node
 * @return {string}      rendered HTML
 */
module.exports = function render (node) {
  const childs = []
  if (Array.isArray(node.C)) {
    for (const e of node.C) {
      childs.push(render(e))
    }
  }

  let prefix = ''
  let suffix = ''
  if (node.T === T.Text) {
    prefix = sanitize(node.A.value)
  } else if (node.T === T.Emphasis) {
    prefix = '<em>'
    suffix = '</em>'
  } else if (node.T === T.StrongEmphasis) {
    prefix = '<strong>'
    suffix = '</strong>'
  } else if (node.T === T.Document) {
    // TODO: support document type options
    // generates HTML fragment
  } else if (node.T === T.Paragraph) {
    prefix = '<p>'
    suffix = '</p>'
  } else if (node.T === T.NamedHyperlink ||
             node.T === T.StandAloneHyperlink) {
    prefix = `<a href="${sanitize(node.A.ref)}">`
    suffix = '</a>'
  } else if (node.T === T.Transition) {
    prefix = '<hr>'
  } else if (node.T === T.InlineLiterals) {
    prefix = '<code>'
    suffix = '</code>'
  } else if (node.T === T.BulletList) {
    prefix = '<ul>'
    suffix = '</ul>'
  } else if (node.T === T.ListItem) {
    prefix = '<li>'
    suffix = '</li>'
  }
  return `${prefix}${childs.join('')}${suffix}`
}
