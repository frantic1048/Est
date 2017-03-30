{
    const unroll = options.util.makeUnroll(location, options)
    const ast = options.util.makeAST(location, options)
    const T = require('./tokenTypes')
}

Document
  = p:Paragraph b:Blankline d:Document
  { return unroll(p, d)}
  //{ return  [p].concat(d) }
  / Paragraph*

Paragraph
  = l1:Inline NewLine l2:Inline
  { return ast(T.Paragraph).set('vaule', l1.join('') + l2.join('')) }
  / l3:Inline
  { return ast(T.Paragraph).set('vaule', l3.join(''))}


Inline
  = char: [^\r\n]+ { return char }

Blankline
  = NewLine NewLine+

NewLine
  = [\r][\n]
  / [\r]
  / [\n]
