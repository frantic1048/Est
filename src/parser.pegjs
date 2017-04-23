{
    const unroll = options.util.makeUnroll(location, options)
    const ast = options.util.makeAST(location, options)
    const T = require('./').tokenTypes
}

Document
// contains block level token
  = b:BodyElement bb:(BlankLine BodyElement)*
  { return unroll(b, bb, 1)}




BodyElement
  = BulletList
  / Paragraph

Paragraph
  = i:InlineMarkup+ ii:(NewLine InlineMarkup+)*
  { return ast(T.Paragraph).add(i).add(ii.reduce((arr, v) => arr.concat(v[1]), [])) }

BulletList
  = b:ListItem bb:(BlankLine ListItem)*
  { return ast(T.BulletList).add(unroll(b, bb, 1)) }

ListItem
  = BulletListBullet _ i:BodyElement
  { return ast(T.ListItem).add(i) }

BulletListBullet
  = [*+-‧‣⁃]




InlineMarkup
  = EmbeddedHyperlink
  / AnonymousHyperlink
  / NamedHyperlink
  / InlineLiterals
  / InterpretedText
  / StrongEmphasis
  / Emphasis
  / TextEscaped

// TODO: URI
// https://www.ietf.org/rfc/rfc2396.txt
// http://www.rfc-editor.org/rfc/rfc2732.txt
// URI

EmbeddedHyperlink
// TODO embedded URI
// = !"\\" "`" t:TextInlineLiteral !"\\" "<" t:TextURI !"\\" ">" !"\\" "`__"
  = !"\\" "`" t:TextEmbeddedHyperlink !"\\" "<" r:TextReferenceName !"\\" "_" !"\\" ">" !"\\" "`__"
  { return ast(T.EmbeddedHyperlink).add(t).set('name', r.get('value')) }

TextEmbeddedHyperlink
  = c:CharEmbeddedHyperlink+
  { return ast(T.Text).set('value', c.join('')) }

CharEmbeddedHyperlink
  // normalize multiple whitspace to one space
  = "\\<" {return '<'}
  / "\\>" {return '>'}
  //   <     >
  / c:[^\u003c\u003e] {return c}

AnonymousHyperlink
  = !"\\" "`" t:TextInlineLiteral !"\\" "`__"
  { return ast(T.AnonymousHyperlink).add(t) }
  / t:TextReferenceName !"\\" "__"
  { return ast(T.AnonymousHyperlink).add(t) }

NamedHyperlink
  = !"\\" "`" t:TextInlineLiteral !"\\" "`_"
  { return ast(T.NamedHyperlink).add(t).set('name', t.get('value')) }
  / t:TextReferenceName !"\\" "_"
  { return ast(T.NamedHyperlink).add(t).set('name', t.get('value')) }

TextReferenceName
  = c:CharReferenceName+
  { return ast(T.Text).set('value', c.join('')) }

CharReferenceName
  // normalize multiple whitspace to one space
  = c:_+ { return ' '}
  / "\\<" {return '<'}
  / "\\>" {return '>'}
  / "\\:" {return ':'}
  / "\\_" {return '_'}
  //   <     >       :     _
  / c:[^\u003c\u003e\u003a\u005f] {return c}

InlineLiterals
  = !"\\" "``"  t:TextInlineLiteral !"\\" "``"
  { return ast(T.InlineLiterals).add(t) }

InterpretedText
  = r:InterpretedTextRole !"\\" "`"  t:TextInlineLiteral !"\\" "`"
  { return ast(T.InterpretedText).add(t).set('role', r)}

  / !"\\" "`"  t:TextInlineLiteral !"\\" "`" r:InterpretedTextRole
  { return ast(T.InterpretedText).add(t).set('role', r)}

  / !"\\" "`"  t:TextInlineLiteral !"\\" "`"
  { return ast(T.InterpretedText).add(t) }

InterpretedTextRole
  = ":" r:TextReferenceName ":"
  { return r.get('value')}


TextInlineLiteral
  = c:CharInlineLiteral+
  { return ast(T.Text).set('value', c.join('')) }

CharInlineLiteral
  = "\\`" { return '`' }
  //  CR LF `
  / [^\r\n\u0060]

StrongEmphasis
  = !"\\" "**" t:TextEscaped !"\\" "**"
  { return ast(T.StrongEmphasis).add(t) }

Emphasis
  = !"\\" "*" t:TextEscaped !"\\" "*"
  { return ast(T.Emphasis).add(t) }

TextEscaped
  = c:CharEscaped+
  { return ast(T.Text).set('value', c.join('')) }

CharEscaped
  = "\\\\" { return "\\"}
  / "\\*"  { return "\*"}
  / "\\`"  { return "`"}
  / "\\|"  { return "|"}
  / "\\_"  { return "_"}
  / "\\["  { return "["}
  / "\\]"  { return "]"}
  //  CR LF *    `      |     _     [     ]
  / [^\r\n\u002A\u0060\u007c\u005f\u005b\u005d]

NonSpace
  // same as \S in regex
  = [^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]

AlphaNum
  = [a-zA-Z0-9]

BlankLine
  = NewLine NewLine+

NewLine
  = [\r][\n]
  / [\r]
  / [\n]

// whitspace
_
  = [ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]
