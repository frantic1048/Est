{
    const unroll = options.util.makeUnroll(location, options)
    const ast = options.util.makeAST(location, options)
    const T = require('./').tokenTypes
    const flatten = arr => arr.reduce(
      (acc, val) => acc.concat(
        Array.isArray(val) ? flatten(val) : val
      ),
      []
    )
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
  = StandAloneHyperlink
  / EmbeddedHyperlink
  / AnonymousHyperlink
  / NamedHyperlink
  / InlineLiterals
  / InterpretedText
  / StrongEmphasis
  / Emphasis
  / TextEscaped

StandAloneHyperlink
// PLAN: use decodeURI(t.get('value')) as text node content
  = t:TextEmailAdress
  { return ast(T.StandAloneHyperlink).add(t).set('ref', 'mailto:' + t.get('value')) }
  / t:TextAbsoluteURI
  { return ast(T.StandAloneHyperlink).add(t).set('ref', t.get('value')) }

// URIAuthority without URIPort
TextEmailAdress
  = a:(URIUserInfo "@" URIHost)
  {return ast(T.Text).set('value',(flatten(a).join('')))}

// absolute-URI
// https://tools.ietf.org/html/rfc3986#appendix-A
// appended an optional fragment
// https://tools.ietf.org/html/rfc3986#appendix-D.1
TextAbsoluteURI
  = a:(URIScheme ":" URIHierPart ("?" URIQuery)? ("#" URIFragment)?)
  {return ast(T.Text).set('value', flatten(a).join(''))}

URIScheme
  = a:Alpha b:(AlphaNum / "+" / "-" / ".")*
  { return a + b.join('') }

URIHierPart
  = "//" a:URIAuthority p:URIPathAbempty
  { return "//" + a + p}
  / URIPathAbsolute
  / URIPathRootless
  / URIPathEmpty

URIAuthority
  = a:((URIUserInfo "@")? URIHost (":" URIPort)?)
  {return flatten(a).join('')}

URIUserInfo
  = (URIUnreserved / URIPCTEncoded / URISubDelims / ":")*

URIUnreserved
  = AlphaNum / "-" / "." / "_" / "~"

URIPCTEncoded
  = t:("%" Hex Hex)
  { return flatten(t).join('') }

URISubDelims
  = "!" / "$" / "&" / "'" / "(" / ")"
  / "*" / "+" / "," / ";" / "="

URIHost
  = URIIPLiteral / URIIPv4Address / URIRegName

URIIPLiteral
  = t:("[" (URIIPv6Address / URIIPvFuture) "]")
  {return t.join('')}

URIIPv6Address
  = a:(URIIPv6Address1
  / URIIPv6Address2
  / URIIPv6Address3
  / URIIPv6Address4
  / URIIPv6Address5
  / URIIPv6Address6
  / URIIPv6Address7
  / URIIPv6Address8
  / URIIPv6Address9)
  {return flatten(a).join('')}

URIIPv6Address1 = URIH16 ":" URIH16 ":" URIH16 ":" URIH16 ":" URIH16 ":" URIH16 ":" URILS32
URIIPv6Address2 =        "::" URIH16 ":" URIH16 ":" URIH16 ":" URIH16 ":" URIH16 ":" URILS32
URIIPv6Address3 = URIH16?          "::" URIH16 ":" URIH16 ":" URIH16 ":" URIH16 ":" URILS32
URIIPv6Address4 = (URIH16 (":" URIH16)?)?     "::" URIH16 ":" URIH16 ":" URIH16 ":" URILS32
URIIPv6Address5 = (URIH16 (":" URIH16)? (":" URIH16)?)?  "::" URIH16 ":" URIH16 ":" URILS32
URIIPv6Address6 = (URIH16 (":" URIH16)? (":" URIH16)? (":" URIH16)?)? "::" URIH16 ":" URILS32
URIIPv6Address7 = (URIH16 (":" URIH16)? (":" URIH16)? (":" URIH16)? (":" URIH16)?)? "::" URILS32
URIIPv6Address8 = (URIH16 (":" URIH16)? (":" URIH16)? (":" URIH16)? (":" URIH16)? (":" URIH16)?)? "::" URIH16
URIIPv6Address9 = (URIH16 (":" URIH16)? (":" URIH16)? (":" URIH16)? (":" URIH16)? (":" URIH16)? (":" URIH16)?)? "::"

URIH16
  = h:(Hex Hex? Hex? Hex?)
  {return h.join('')}

URILS32
  = (URIH16 ":" URIH16)
  / URIIPv4Address

URIDecOctet
  = "25" [0-5]    // 250-255
  / "2" [0-4] Num // 200-249
  / "1" Num Num   // 100-199
  / [1-9] Num     // 10-99
  / Num           // 0-9

URIIPvFuture
  = a:("v" Hex+ "." ( URIUnreserved / URISubDelims / ":" )+)
  {return flatten(a).join('')}

URIIPv4Address
  = a:(URIDecOctet "." URIDecOctet "." URIDecOctet "." URIDecOctet)
  {return flatten(a).join('')}

URIRegName
  = t:(URIUnreserved / URIPCTEncoded / URISubDelims)*
  {return t.join('')}

URIPort
  = n:Num*
  {return n.join('')}

URIPathAbempty
  = t:("/" URISegment)*
  { return flatten(t).join('') }

URISegment
  = c:URIPChar*
  {return c.join('')}

URISegmentNZ
  = c:URIPChar+
  {return c.join('')}

URIPChar
  = URIUnreserved / URIPCTEncoded / URISubDelims / ":" / "@"

URIPathAbsolute
  = "/" ( URISegmentNZ ("/" URISegment)* )?

URIPathRootless
  = s:URISegmentNZ ss:("/" URISegment)*
  {return s + ss.join('')}

URIPathEmpty
  = ""

URIQuery
  = t:(URIPChar / "/" / "?")*
  { return flatten(t).join('') }
URIFragment
  = t:(URIPChar / "/" / "?")*
  { return flatten(t).join('') }

EmbeddedHyperlink
  = !"\\" "`" t:TextEmbeddedHyperlink !"\\" "<" u:TextAbsoluteURI !"\\" ">" !"\\" "`__"
  { return ast(T.EmbeddedHyperlink).add(t).set('ref', u.get('value')) }
  / !"\\" "`" t:TextEmbeddedHyperlink !"\\" "<" r:TextReferenceName !"\\" "_" !"\\" ">" !"\\" "`__"
  { return ast(T.EmbeddedHyperlink).add(t).set('name', r.get('value')) }

TextEmbeddedHyperlink
  = c:CharEmbeddedHyperlink+
  { return ast(T.Text).set('value', c.join('')) }

CharEmbeddedHyperlink
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

// -------------
// General Rules
// -------------

NonSpace
  // same as \S in regex
  = [^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]

Alpha = [a-zA-Z]

Num = [0-9]

Hex = [0-9a-fA-F]

AlphaNum = Alpha / Num

BlankLine
  = NewLine NewLine+

NewLine
  = "\r\n" / "\r" / "\n"

// whitspace
_
  = [ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]
