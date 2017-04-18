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
  = InlineLiterals
  / InterpretedText
  / StrongEmphasis
  / Emphasis
  / TextEscaped

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
  = ":" r:AlphaNum+ ":"
  { return r.join('')}


TextInlineLiteral
  = c:CharInlineLiteral+
  {
    const escape = {
      '\\`': '`'
    }

    const re = /\\`/g

    const text = c.join('').replace(re, s => escape[s])

    return ast(T.Text).set('value', text)
  }

CharInlineLiteral
  = "\\`"
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
  {
    const escape = {
      '\\\\': '\\',
      '\\r': '\r',
      '\\n': '\n',
      '\\*': '*',
      '\\`': '`',
      '\\|': '|',
      '\\_': '_',
      '\\[': '[',
      '\\]': ']'
    }

    const re = /\\\\|\\r|\\n|\\\*|\\`|\\\||\\_|\\\[|\\\]/g

    const text = c.join('').replace(re, s => escape[s])

    return ast(T.Text).set('value', text)
  }

CharEscaped
  = "\\\\"
  / "\\r"
  / "\\n"
  / "\\*"
  / "\\`"
  / "\\|"
  / "\\_"
  / "\\["
  / "\\]"
  //  CR LF *    `      |     _     [     ]
  / [^\r\n\u002A\u0060\u007c\u005f\u005b\u005d]

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
  = " "
