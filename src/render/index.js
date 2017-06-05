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
             node.T === T.StandAloneHyperlink ||
             node.T === T.AnonymousHyperlink) {
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
  } else if (node.T === T.OptionList) {
    prefix = '<table><colgroup><col><col></colgroup><tbody>'
    suffix = '</tbody></table>'
  } else if (node.T === T.OptionListItem) {
    prefix = '<tr>'
    suffix = '</tr>'
  } else if (node.T === T.OptionGroup) {
    prefix = '<td><kbd>'
    suffix = '</kbd></td>'
  } else if (node.T === T.OptionDescription) {
    prefix = '<td>'
    suffix = '</td>'
  } else if (node.T === T.Option) {
    // no special tag
  } else if (node.T === T.OptionString) {
    // no special tag
  } else if (node.T === T.OptionArgument) {
    prefix = '<var>'
    suffix = '</var>'
  } else if (node.T === T.OptionDelimiter) {
    prefix = ', '
  } else if (node.T === T.DefinitionList) {
    prefix = '<dl>'
    suffix = '</dl>'
  } else if (node.T === T.DefinitionListTerm) {
    prefix = '<dt>'
    suffix = '</dt>'
  } else if (node.T === T.DefinitionListDefinition) {
    prefix = '<dd>'
    suffix = '</dd>'
  } else if (node.T === T.Section) {
    prefix = `<h${node.A.level}>`
    suffix = `</h${node.A.level}>`
  } else if (node.T === T.FieldList) {
    prefix = '<table><colgroup><col><col></colgroup><tbody>'
    suffix = '</tbody></table>'
  } else if (node.T === T.Field) {
    prefix = '<tr>'
    suffix = '</tr>'
  } else if (node.T === T.FieldName) {
    prefix = '<th>'
    suffix = '</th>'
  } else if (node.T === T.FieldBody) {
    prefix = '<td>'
    suffix = '</td>'
  }
  return `${prefix}${childs.join('')}${suffix}`
}
