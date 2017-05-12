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
    const astyFilter  = elt => {
      return (typeof elt === 'object')
        && (elt !== null)
        && (elt.ASTy === true)
    }

}

Document
// contains block level token
  = b:BodyElement bb:(BlankLine BodyElement)*
  { return unroll(b, bb, 1)}




BodyElement
  = BulletList
  / Paragraph

Paragraph
  = a:(InlineMarkups (NewLine InlineMarkups)*)
  {
    return ast(T.Paragraph)
      .add(flatten(a).filter(astyFilter))
  }

BulletList
  = b:ListItem bb:(BlankLine ListItem)*
  { return ast(T.BulletList).add(unroll(b, bb, 1)) }

ListItem
  = BulletListBullet _ i:BodyElement
  { return ast(T.ListItem).add(i) }

BulletListBullet
  // *      +      -    ‧    ‣     ⁃
  = [\u002A\u002B\u002D\u2027\u2023\u2043]



InlineMarkups
  = a:((InlineMarkupFirst / TextInline) InlineMarkupNonFirst*)
  {
    const nodes = flatten(a).filter(astyFilter)
    const mergedNodes = []

    // merge continuous Text node

    // not node
    const nn = {T: false}

    // previousNode
    let pn = nn

    for (const n of nodes) {
      if (n.T === T.Text) {
        if (pn.T === T.Text) {
          const npn = ast(T.Text).set('value',
            pn.get('value') + n.get('value')
          )
          pn = npn
        } else {
          pn = n
        }
      } else { // n.T !== T.Text
        if (pn.T === T.Text) { mergedNodes.push(pn) }
        mergedNodes.push(n)
        pn = nn
      }
    }

    if (pn.T === T.Text) mergedNodes.push(pn)

    return mergedNodes
  }

InlineMarkupFirst
  = StandAloneHyperlink
  / InlineInternalTarget
  / AnonymousHyperlink
  / FootnoteReference
  / CitationReference
  / SubstitutionReference
  / NamedHyperlink
  / InlineLiterals
  / InterpretedText
  / StrongEmphasis
  / Emphasis

InlineMarkupNonFirst
  = "\\ " m:InlineMarkupFirst {return m}
  / _ InlineMarkupFirst
  / "\\ " m:TextInline {return m}
  / _ TextInline
  / TextInline

TextInline
  = c:CharTextInline+ {return ast(T.Text).set('value', c.join(''))}

CharTextInline
  = "\\\\" {return '\\'}
  / [^\r\n \\]

StandAloneHyperlink
  = t:TextEmailAdress
  { return ast(T.StandAloneHyperlink).add(t).set('ref', 'mailto:' + t.get('value')) }
  / t:TextAbsoluteURI
  {
    // decodeURI for displayed text
    const uri = t.get('value')
    const text = decodeURI(uri)
    const tNode = ast(T.Text).set('value', text)
    return ast(T.StandAloneHyperlink).add(tNode).set('ref', uri)
  }

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

AnonymousHyperlink
  // embbed with URI
  = !"\\" "`" t:EmbeddedHyperlinkLabel u:TextAbsoluteURI ">`__"
  {
    const tNode = ast(T.Text).set('value', t)
    return ast(T.AnonymousHyperlink).add(tNode).set('ref', u.get('value'))
  }
  / !"\\" "`" t:TextInlineLiteral !"\\" "`__"
  { return ast(T.AnonymousHyperlink).add(t) }
  / t:AnonymousHyperlinkImplict
  {
    const tNode = ast(T.Text).set('value', t)
    return ast(T.AnonymousHyperlink).add(tNode)
  }

EmbeddedHyperlinkLabel
  = t:CharInlineLiteral r:EmbeddedHyperlinkLabel
  { return t + r }
  / "<" {return ''}

AnonymousHyperlinkImplict
  = t:CharReferenceName r:AnonymousHyperlinkImplict
  {return t + r}
  / "__" // don't return ending "__"
  {return ''}

NamedHyperlink
  = !"\\" "`" t:EmbeddedHyperlinkLabel u:NamedHyperlinkReferenceName ">`_"
  {
    const tNode = ast(T.Text).set('value', t)
    return ast(T.NamedHyperlink).add(tNode).set('name', u)
  }
  / !"\\" "`" t:TextInlineLiteral !"\\" "`_"
  { return ast(T.NamedHyperlink).add(t).set('name', t.get('value')) }
  / t:NamedHyperlinkImplict
  {
    const tNode = ast(T.Text).set('value', t)
    return ast(T.NamedHyperlink).add(tNode).set('name', t)
  }

NamedHyperlinkReferenceName
  = t:CharInlineLiteral r:NamedHyperlinkReferenceName
  { return t + r }
  / "_" {return ''}

NamedHyperlinkImplict
  = t:CharReferenceName r:NamedHyperlinkImplict
  { return t + r}
  / "_" // don't return ending "_"
  { return ''}

CharReferenceName
  = [a-zA-Z0-9] / "+" / "-" / "_" / "."

InlineInternalTarget
  = !"\\" "_`" t:TextInlineLiteral !"\\" "`"
  {return ast(T.InlineInternalTarget).add(t).set('name', t.get('value'))}

InlineLiterals
  = !"\\" "``"  t:TextInlineLiteral !"\\" "``"
  { return ast(T.InlineLiterals).add(t) }

FootnoteReference
  = !"\\" "["  t:(Num+ / "*" / "#" (AlphaNum / "-")* ) !"\\" "]_"
  { return ast(T.FootnoteReference).set('ref', flatten([t]).join('')) }

CitationReference
  = !"\\" "[" t:CitationReferenceName "_"
  { return ast(T.CitationReference).set('name', t) }

CitationReferenceName
  = t:CharReferenceName r:CitationReferenceName
  { return t + r }
  / "]" {return ''}

SubstitutionReference
  // substitution as AnonymousHyperlink
  = !"\\" "|" t:SubstitutionReferenceName "__"
  {
    const sNode = ast(T.SubstitutionReference).set('name', t)
    return ast(T.AnonymousHyperlink).add(sNode)
  }
  // substitution as NamedHyperlink
  / !"\\" "|" t:SubstitutionReferenceName "_"
  {
    const sNode = ast(T.SubstitutionReference).set('name', t)
    return ast(T.NamedHyperlink).add(sNode).set('name', t)
  }
  // normal substitution
  / !"\\" "|" t:SubstitutionReferenceName
  { return ast(T.SubstitutionReference).set('name', t) }

SubstitutionReferenceName
  = t:CharReferenceName r:SubstitutionReferenceName
  { return t + r }
  / "|" {return ''}

InterpretedText
  = r:InterpretedTextRole !"\\" "`"  t:TextInlineLiteral !"\\" "`"
  { return ast(T.InterpretedText).add(t).set('role', r)}

  / !"\\" "`"  t:TextInlineLiteral !"\\" "`" r:InterpretedTextRole
  { return ast(T.InterpretedText).add(t).set('role', r)}

  / !"\\" "`"  t:TextInlineLiteral !"\\" "`"
  { return ast(T.InterpretedText).add(t) }

InterpretedTextRole
  = ":" r:CharReferenceName+ ":"
  { return r.join('')}


TextInlineLiteral
  = c:CharInlineLiteral+
  { return ast(T.Text).set('value', c.join('')) }

CharInlineLiteral
  = "\\`" { return '`' }
  //  CR LF `
  / [^\r\n\u0060]

StrongEmphasis
  = !"\\" "**" t:TextEmphasis !"\\" "**"
  { return ast(T.StrongEmphasis).add(t) }

Emphasis
  = !"\\" "*" t:TextEmphasis !"\\" "*"
  { return ast(T.Emphasis).add(t) }

TextEmphasis
  = c:CharEmphasis+
  { return ast(T.Text).set('value', c.join('')) }

CharEmphasis
  = "\\\\" {return '\\'}
  / "\\*" {return '*'}
  //  CR LF *
  / [^\r\n\u002A]


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
  = "\r\n" / "\r" / "\n" {return}

// whitspace

_ = " " {return ast(T.Text).set('value', ' ')}


// NOTE: not used yet
___
  = [ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]
