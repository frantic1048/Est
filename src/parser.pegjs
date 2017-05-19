{
    const unroll = options.util.makeUnroll(location, options)
    const ast = options.util.makeAST(location, options)
    const T = require('./').tokenTypes

    // manage indent state
    // ONLY call indent() in &{} predicate,

    // for dynamic indent(like EnumeratedList):
    //    call setIndentPlaceholder() in a rule
    //    which followed by IndentPlaceholder
    const indents = [0]
    const indent = (i = 2) => indents.push(i)
    const dedent = () => indents.pop()
    const indentLevel = () => indents.reduce((sum, elt) => sum + elt)
    let indentPlaceholder = 0
    const setIndentPlaceholder = v => indentPlaceholder = v

    // flatten nested array
    const flatten = arr => arr.reduce(
      (acc, val) => acc.concat(
        Array.isArray(val) ? flatten(val) : val
      ),
      []
    )

    // filter valid ASTy node
    const astyFilter  = elt => {
      return (typeof elt === 'object')
        && (elt !== null)
        && (elt.ASTy === true)
    }

    // merge continuous Text node
    const mergeContinuousTextNodes = nodes => {
      const mergedNodes = []

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

}

Document
// contains block level token
  = b:BodyElement bb:(BlankLine BodyElement)* NewLine*
  {return unroll(b, bb, 1)}

BodyElement "BodyElement"
  = Transition
  / EnumeratedList
  / BulletList
  / FieldList
  / DefinitionList
  / Paragraph

Samedent
  = spaces:" "* &{return spaces.length === indentLevel()}

Moredent
  = spaces:" "* &{return spaces.length > indentLevel()}

IndentPlaceholder
  = &{indent(indentPlaceholder); return  true}

Indent
// default indent: 2 space
// for other indent length,
// manually write assertion like this
  = &{indent(2); return true}

Dedent
  = &{dedent(); return true}

Transition "Transition"
// NOTE: semantic: Document or section may not
//     start/end with Transition
// POSIX Character Class [:punct:]
// https://www.gnu.org/software/grep/manual/html_node/Character-Classes-and-Bracket-Expressions.html
  =("!!!!" "!"*
  / "\"\"\"\"" "\""*
  / "####" "#"*
  / "$$$$" "$"*
  / "%%%%" "%"*
  / "&&&&" "&"*
  / "''''" "'"*
  / "((((" "("*
  / "))))" ")"*
  / "****" "*"*
  / "++++" "+"*
  / ",,,," ","*
  / "----" "-"*
  / "...." "."*
  / "////" "/"*
  / "::::" ":"*
  / ";;;;" ";"*
  / "<<<<" "<"*
  / "====" "="*
  / ">>>>" ">"*
  / "????" "?"*
  / "@@@@" "@"*
  / "[[[[" "["*
  / "\\\\\\\\" "\\"*
  / "]]]]" "]"*
  / "^^^^" "^"*
  / "____" "_"*
  / "````" "`"*
  / "{{{{" "{"*
  / "||||" "|"*
  / "}}}}" "}"*
  / "~~~~" "~"*)
  {return ast(T.Transition)}


Paragraph "Paragraph"
  = a:(InlineMarkups (NewLine Samedent InlineMarkups)*)
  {
    return ast(T.Paragraph)
      .add(mergeContinuousTextNodes(flatten(a).filter(astyFilter)))
  }

BulletList "BulletList"
  = b:BulletListItem bb:(NewLine NewLine* Samedent BulletListItem)*
  { return ast(T.BulletList).add(unroll(b, bb, 3)) }

BulletListItem "BulletListItem"
  = BulletListBullet _
    Indent     // fixed 2 space indent
      i:ListItem
    Dedent
    {return i}


ListItem "ListItem"
  = i:(BodyElement)
    ii:(BlankLine Samedent BodyElement)*
  { return ast(T.ListItem).add(i).add(flatten(ii).filter(astyFilter)) }

BulletListBullet "BulletListBullet"
  // *      +      -    ‧    ‣     ⁃
  = [\u002A\u002B\u002D\u2027\u2023\u2043]

EnumeratedList
  = i:EnumeratedListItemFirst
    ii:(NewLine NewLine* Samedent EnumeratedListItem)*
  {
    const l = ast(T.EnumeratedList)
      .set('style', i.style)
      .add(unroll(i.item, ii, 3))
    return l
  }

EnumeratedListItemFirst
= t:EnumeratedListEnumeratorFirst _
  IndentPlaceholder
    i:ListItem
  Dedent
  {
    return {
      style: t,
      item: i
    }
  }

EnumeratedListItem
  = EnumeratedListEnumerator _
    IndentPlaceholder
      i:ListItem
    Dedent
    {return i}

// t: enumerator type
// prefix: enumerator prefix
// suffix: enumerator suffix
EnumeratedListEnumeratorFirst
  = "(" a:Num+ ")"       {
    setIndentPlaceholder(a.length + 3)
    return {t:'arabic_num', prefix: '(', suffix: ')'}
  }
  / a:Num+ p:[.)]        {
    setIndentPlaceholder(a.length + 2)
    return {t:'arabic_num', suffix: p}
  }
  / "(" "I" ")"          {
    setIndentPlaceholder(4)
    return {t: 'uppercase_roman_num', prefix: '(', suffix: ')'}
  }
  / "(" a:[IVXLCDM]+ ")" {
    setIndentPlaceholder(a.length + 3)
    return {t: 'uppercase_roman_num', prefix: '(', suffix: ')'}
  }
  / "I" p:[.)]           {
    setIndentPlaceholder(3)
    return {t: 'uppercase_roman_num', suffix: p}
  }
  / a:[IVXLCDM]+ p:[.)]  {
    setIndentPlaceholder(a.length + 2)
    return {t: 'uppercase_roman_num', suffix: p}
  }
  / "(" "i" ")"          {
    setIndentPlaceholder(4)
    return {t: 'lowercase_roman_num', prefix: '(', suffix: ')'}
  }
  / "(" a:[ivxlcdm]+ ")" {
    setIndentPlaceholder(a.length + 3)
    return {t: 'lowercase_roman_num', prefix: '(', suffix: ')'}
  }
  / "i" p:[.)]           {
    setIndentPlaceholder(3)
    return {t: 'lowercase_roman_num', suffix: p}
  }
  / a:[ivxlcdm]+ p:[.)]  {
    setIndentPlaceholder(a.length + 2)
    return {t: 'lowercase_roman_num', suffix: p}
  }
  / "(" a:[A-Z]+ ")"     {
    setIndentPlaceholder(a.length + 3)
    return {t: 'uppercase_alpha', prefix: '(', suffix: ')'}
  }
  / a:[A-Z]+ p:[.)]      {
    setIndentPlaceholder(a.length + 2)
    return {t: 'uppercase_alpha', suffix: p}
  }
  / "(" a:[a-z]+ ")"     {
    setIndentPlaceholder(a.length + 3)
    return {t: 'lowercase_alpha', prefix: '(', suffix: ')'}
  }
  / a:[a-z]+ p:[.)]      {
    setIndentPlaceholder(a.length + 2)
    return {t: 'lowercase_alpha', suffix: p}
  }

EnumeratedListEnumerator
  = "(" a:AlphaNum+ ")" {setIndentPlaceholder(a.length + 3)}
  / a:AlphaNum+ ")"     {setIndentPlaceholder(a.length + 2)}
  / a:AlphaNum+ "."     {setIndentPlaceholder(a.length + 2)}

DefinitionList
  = i:DefinitionListItem
    ii:(NewLine NewLine* Samedent DefinitionListItem)*
  {return ast(T.DefinitionList).add(unroll(i, ii, 3))}

DefinitionListItem
  = t:DefinitionListTerm
    c:DefinitionListClassifier*
    NewLine
    spaces:_* &{
      if (spaces.length === indentLevel() + 4) {
        indent(4)
        return true
      } else {
        return false
      }
    }
      d:DefinitionListDefinition
    Dedent
  {return ast(T.DefinitionListItem).add([t, ...c, d])}

DefinitionListTerm
  = i:InlineMarkupsDLT
  {return ast(T.DefinitionListTerm).add(i)}

DefinitionListClassifier
  = _ ":" i:InlineMarkupsDLT
  {return ast(T.DefinitionListClassifier).add(i)}

DefinitionListDefinition
  = i:BodyElement
    ii:(BlankLine NewLine* Samedent BodyElement)*
  { return ast(T.DefinitionListDefinition).add(unroll(i, ii, 3)) }

// InlineMarkups(DefinitionListTerm)
InlineMarkupsDLT
  = a:((InlineMarkupFirst / TextInlineDLT)
        InlineMarkupNonFirstDLT*)
  {
    const nodes = flatten(a).filter(astyFilter)
    const mergedNodes = mergeContinuousTextNodes(nodes)
    return mergedNodes
  }

// InlineMarkupNonFirst(DefinitionListTerm)
InlineMarkupNonFirstDLT
  = "\\ " m:InlineMarkupFirst {return m}
  / _ InlineMarkupFirst
  / "\\ " m:TextInlineDLT {return m}
  / _ TextInlineDLT
  / TextInlineDLT

// TextInline(DefinitionListTerm)
TextInlineDLT
  = c:CharTextInlineDLT+ {return ast(T.Text).set('value', c.join(''))}

CharTextInlineDLT
  = "\\\\" {return '\\'}
  / "\\:"  {return ':'}
  // CR LF SPACE \    :
  / [^\r\n\u0020\u005c\u003a]

FieldList
  = f:Field ff:(NewLine NewLine* Field)*
  {return ast(T.FieldList).add(unroll(f, ff, 2))}

Field
  = n:FieldName
    Indent
      _ e:BodyElement
      ee:(BlankLine NewLine* Samedent BodyElement)*
    Dedent
  {
    const fBody = ast(T.FieldBody).add(unroll(e, ee, 3))
    return ast(T.Field).add([n, fBody])
  }

FieldName
  = ":" i:InlineMarkupsFN ":"
  {return ast(T.FieldName).add(i)}

// InlineMarkups(FieldName)
InlineMarkupsFN
  = a:((InlineMarkupFirstFN / TextInlineDLT)
        InlineMarkupNonFirstFN*)
  {
    const nodes = flatten(a).filter(astyFilter)
    const mergedNodes = mergeContinuousTextNodes(nodes)
    return mergedNodes
  }

InlineMarkupFirstFN
// MEMO:
// InlineMarkupFirst rule
//   without StandAloneHyperlink
//   for disambiguation
// this could be better to make
//   StandAloneHyperlink rule
//   not eager with ":"
  = InlineInternalTarget
  / AnonymousHyperlink
  / FootnoteReference
  / CitationReference
  / SubstitutionReference
  / NamedHyperlink
  / InlineLiterals
  / InterpretedText
  / StrongEmphasis
  / Emphasis

InlineMarkupNonFirstFN
  = "\\ " m:InlineMarkupFirstFN {return m}
  / _ InlineMarkupFirstFN
  / "\\ " m:TextInlineDLT {return m}
  / _ TextInlineDLT
  / TextInlineDLT

InlineMarkups "InlineMarkups"
  = a:((InlineMarkupFirst / TextInline) InlineMarkupNonFirst*)
  {
    const nodes = flatten(a).filter(astyFilter)
    const mergedNodes = mergeContinuousTextNodes(nodes)
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

TextInline "TextInline"
  = c:CharTextInline+ {return ast(T.Text).set('value', c.join(''))}

CharTextInline
  = "\\\\" {return '\\'}
  // CR LF SPACE \
  / [^\r\n\u0020\u005c]

StandAloneHyperlink "StandAloneHyperlink"
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
TextEmailAdress "TextEmailAdress"
  = a:(URIUserInfo "@" URIHost)
  {return ast(T.Text).set('value',(flatten(a).join('')))}

// absolute-URI
// https://tools.ietf.org/html/rfc3986#appendix-A
// appended an optional fragment
// https://tools.ietf.org/html/rfc3986#appendix-D.1
TextAbsoluteURI "TextAbsoluteURI"
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

AnonymousHyperlink "AnonymousHyperlink"
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

NamedHyperlink "NamedHyperlink"
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

InlineInternalTarget "InlineInternalTarget"
  = !"\\" "_`" t:TextInlineLiteral !"\\" "`"
  {return ast(T.InlineInternalTarget).add(t).set('name', t.get('value'))}

InlineLiterals "InlineLiterals"
  = !"\\" "``"  t:TextInlineLiteral !"\\" "``"
  { return ast(T.InlineLiterals).add(t) }

FootnoteReference "FootnoteReference"
  = !"\\" "["  t:(Num+ / "*" / "#" (AlphaNum / "-")* ) !"\\" "]_"
  { return ast(T.FootnoteReference).set('ref', flatten([t]).join('')) }

CitationReference "CitationReference"
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

InterpretedText "InterpretedText"
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

StrongEmphasis "StrongEmphasis"
  = !"\\" "**" t:TextEmphasis !"\\" "**"
  { return ast(T.StrongEmphasis).add(t) }

Emphasis "Emphasis"
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


// FIXME: not used yet
___
  = [ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]
