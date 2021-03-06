{
    /**
     * already in dependencies
     * const T = require('./tokenTypes')
     */

    const unroll = options.util.makeUnroll(location, options)
    const ast = options.util.makeAST(location, options)

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

    // for Samedent rule
    let indentBuffer = 0
    const resetIndentBuffer = () => indentBuffer = 0
    const indentBufferAdd = v => indentBuffer += v

    // for Section rule

    // ! " # $ % & ' ( ) * + , - . /
    // : ; < = > ? @
    // [ \ ] ^ _ `
    // { | } ~
    const regValidSectionAdornment = /[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]/

    const isValidSectionAdornment = (charList, symbol) => {
      const start = charList[0]

      if (symbol !== undefined) {
        if (start !== symbol) return false
      }


      // check if legal section adornment char
      if (!regValidSectionAdornment.test(start)) return false

      // check if all the same character
      if (!charList.reduce((s, c) => s && (c === start), true)) return false

      return true
    }

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
  = b:(HyperlinkTargets / BodyElement)
    bb:(BlankLine
        ( HyperlinkTargets / BodyElement )
    )*
    NewLine*
  {return ast(T.Document).add(flatten([b, bb]).filter(astyFilter))}

BodyElement "BodyElement"
  = Section
  / Transition
  / EnumeratedList
  / BulletList
  / FieldList

  // ExplicitMarkups
  / Footnote
  / Citation
  / SubstitutionDefinition
  / Directive

  / OptionList
  / DefinitionList

  / Paragraph

Samedent
// match same spaces as indentLevel()
// non-greedy
  = // clear indentBuffer to 0
    &{resetIndentBuffer(); return true}

    // eat spaces no more than
    // current indent level
    (_ &{
      if (indentBuffer < indentLevel()) {
      	indentBufferAdd(1)
      	return true
      }
      else { return false }
    })*

    // check if eaten spaces is enough
  	&{return indentBuffer === indentLevel()}

    // return nothing
    {return}

IndentPlaceholder
  = &{indent(indentPlaceholder); return  true}

Indent
// default indent: 2 space
// for other indent length,
// manually write assertion like this
  = &{indent(2); return true}

Dedent
  = &{dedent(); return true}

Section
  = c:(CharSectionAdornment+ NewLine)?
    m:InlineMarkups NewLine
    cc:CharSectionAdornment+
    &{
      // MEMO:
      //   dynamic CharSection length limit
      //   based on length of m:InlineMarkups
      if (cc.length < 3) return false

      if (!isValidSectionAdornment(cc)) return false

      if (c !== null) {
        if (!isValidSectionAdornment(c[0])) return false
        if (c[0].length !== cc.length) return false
        if (c[0][0] !== cc[0]) return false
      }

      return true
    }
    {
      const node = ast(T.Section).add(m)

      let style = cc[0]
      if (c !== null) style += cc[0]
      node.set('style', style)

      return node
    }


CharSectionAdornment
  // ! " # $ % & ' ( ) * + , - . /
  // : ; < = > ? @
  // [ \ ] ^ _ `
  // { | } ~
  = [\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]


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

EnumeratedList "EnumeratedList"
  = i:EnumeratedListItemFirst
    ii:(NewLine NewLine* Samedent EnumeratedListItem)*
  {
    const l = ast(T.EnumeratedList)
      .set('style', i.style)
      .add(unroll(i.item, ii, 3))
    return l
  }

EnumeratedListItemFirst "EnumeratedListItemFirst"
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

EnumeratedListItem "EnumeratedListItem"
  = EnumeratedListEnumerator _
    IndentPlaceholder
      i:ListItem
    Dedent
    {return i}

// t: enumerator type
// prefix: enumerator prefix
// suffix: enumerator suffix
EnumeratedListEnumeratorFirst "EnumeratedListEnumeratorFirst"
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

EnumeratedListEnumerator "EnumeratedListEnumerator"
  = "(" a:AlphaNum+ ")" {setIndentPlaceholder(a.length + 3)}
  / a:AlphaNum+ ")"     {setIndentPlaceholder(a.length + 2)}
  / a:AlphaNum+ "."     {setIndentPlaceholder(a.length + 2)}

DefinitionList "DefinitionList"
  = i:DefinitionListItem
    ii:(NewLine NewLine* Samedent DefinitionListItem)*
  {return ast(T.DefinitionList).add(unroll(i, ii, 3))}

DefinitionListItem "DefinitionListItem"
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

DefinitionListTerm "DefinitionListTerm"
  = i:InlineMarkupsDLT
  {return ast(T.DefinitionListTerm).add(i)}

DefinitionListClassifier "DefinitionListClassifier"
  = _ ":" i:InlineMarkupsDLT
  {return ast(T.DefinitionListClassifier).add(i)}

DefinitionListDefinition "DefinitionListDefinition"
  = i:BodyElement
    ii:(BlankLine NewLine* Samedent BodyElement)*
  { return ast(T.DefinitionListDefinition).add(unroll(i, ii, 3)) }

// InlineMarkups(DefinitionListTerm)
InlineMarkupsDLT "InlineMarkupsDLT"
  = a:((InlineMarkupFirst / TextInlineDLT)
        InlineMarkupNonFirstDLT*)
  {
    const nodes = flatten(a).filter(astyFilter)
    const mergedNodes = mergeContinuousTextNodes(nodes)
    return mergedNodes
  }

// InlineMarkupNonFirst(DefinitionListTerm)
InlineMarkupNonFirstDLT "InlineMarkupNonFirstDLT"
  = "\\ " m:InlineMarkupFirst {return m}
  / _ InlineMarkupFirst
  / "\\ " m:TextInlineDLT {return m}
  / _ TextInlineDLT
  / TextInlineDLT

// TextInline(DefinitionListTerm)
TextInlineDLT "TextInlineDLT"
  = c:CharTextInlineDLT+ {return ast(T.Text).set('value', c.join(''))}

CharTextInlineDLT "CharTextInlineDLT"
  = "\\\\" {return '\\'}
  / "\\:"  {return ':'}
  // CR LF SPACE \    :
  / [^\r\n\u0020\u005c\u003a]

FieldList "FieldList"
  = f:Field ff:(NewLine NewLine* Samedent Field)*
  {return ast(T.FieldList).add(unroll(f, ff, 3))}

Field "Field"
  = n:FieldName
    Indent
      _ e:BodyElement
      ee:(BlankLine NewLine* Samedent BodyElement)*
    Dedent
  {
    const fBody = ast(T.FieldBody).add(unroll(e, ee, 3))
    return ast(T.Field).add([n, fBody])
  }

FieldName "FieldName"
  = ":" i:InlineMarkupsFN ":"
  {return ast(T.FieldName).add(i)}

// InlineMarkups(FieldName)
InlineMarkupsFN "InlineMarkupsFN"
  = a:((InlineMarkupFirstFN / TextInlineDLT)
        InlineMarkupNonFirstFN*)
  {
    const nodes = flatten(a).filter(astyFilter)
    const mergedNodes = mergeContinuousTextNodes(nodes)
    return mergedNodes
  }

InlineMarkupFirstFN "InlineMarkupFirstFN"
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

InlineMarkupNonFirstFN "InlineMarkupNonFirstFN"
  = "\\ " m:InlineMarkupFirstFN {return m}
  / _ InlineMarkupFirstFN
  / "\\ " m:TextInlineDLT {return m}
  / _ TextInlineDLT
  / TextInlineDLT

// MEMO:
// allow wider argument forms as in spec
OptionList "OptionList"
  = i:OptionListItem ii:(NewLine NewLine* Samedent OptionListItem)*
  {
    return ast(T.OptionList).add(unroll(i, ii, 3))
  }

OptionListItem "OptionListItem"
//  = OptionGroup NewLine Indent2+ OptionDescription
  = g:OptionGroup _ _ spc:_*
    &{ indent(g.len + 2 + spc.length); return true }
      d:OptionDescription
    Dedent
  {

    return ast(T.OptionListItem).add(g.node).add(d)
  }

OptionGroup "OptionGroup"
  = o:Option oo:(", " Option)*
  {
    let len = o.len
    const node = ast(T.OptionGroup).add(o.node)

    oo.forEach(elt => {
      len += 2 + elt[1]
      node.add(ast(T.OptionDelimiter))
      node.add(elt[1].node)
    })

    return { len, node }
  }

Option "Option"
  = s:OptionString a:((_ / "=") OptionArgument)?
  {
    let len = s.len
    const node = ast(T.Option).add(s.node)

    if (a !== null) {
      // +1 for _ / "="
      len += 1 + a[1].len
      node.add(a[1].node)
    }

    return { len, node }
  }

OptionString "OptionString"
  // long POSIX option
  = c:("--" AlphaNum+ ("-" AlphaNum+)*

  // short POSIX option
  / "-" AlphaNum

  // DOS/VMS option
  / "/" AlphaNum+)
  {
    const text = flatten([c]).join('')
    const len = text.length
    const tNode = ast(T.Text).set('value', text)
    const node = ast(T.OptionString).add(tNode)

    // return len for indentation calculation
    return { len, node }
  }

OptionArgument "OptionArgument"
  = c:AlphaNum+
  {
    const text = c.join('')
    const len = text.length
    const tNode = ast(T.Text).set('value', text)
    const node = ast(T.OptionArgument).add(tNode)

    return { len, node }
  }

OptionDescription "OptionDescription"
  = b:BodyElement
    bb:(NewLine NewLine* Samedent BodyElement)*
  {
    return ast(T.OptionDescription).add(unroll(b, bb, 3))
  }

ExplicitMarkupStart = ".. "

Footnote "Footnote"
  = ExplicitMarkupStart
    "["  t:(Num+ / "*" / "#" (AlphaNum / "-")* ) "]" _
    // MEMO: could be more flexible
    // fixed 4 space indent
    &{indent(4); return true}
      b:BodyElement
      bb:(NewLine NewLine* Samedent BodyElement)*
    Dedent
    {
      return ast(T.Footnote)
        .add(unroll(b, bb, 3))
        .set('ref', flatten([t]).join(''))
    }

Citation "Citation"
  = ExplicitMarkupStart
    "[" t:CitationReferenceName "]" _
    &{indent(4); return true}
      b:BodyElement
      bb:(NewLine NewLine* Samedent BodyElement)*
    Dedent
    {
      return ast(T.Citation)
        .add(unroll(b, bb, 3))
        .set('name', t)
    }

HyperlinkTargets
 = HyperlinkTarget (NewLine+ HyperlinkTarget)*

HyperlinkTarget "HyperlinkTarget"
  = ExplicitMarkupStart
    "__:" _ l:LinkBlock
    {
      // Anonymous target
      // dose not have name attribute
      return ast(T.Target).add(l)
    }
  / ExplicitMarkupStart
    "_" "`" t:CharInlineLiteral+ "`" ":"
    l:(_ LinkBlock)?
    {
      const node = ast(T.Target).set('name', t.join(''))
      if (l !== null) {
        node.add(l[1])
      }
      return node
    }
  / ExplicitMarkupStart
    "_" t:CharReferenceName+ ":"
    l:(_ LinkBlock)?
    {
      const node = ast(T.Target).set('name', t.join(''))
      if (l !== null) {
        node.add(l[1])
      }
      return node
    }

LinkBlock "LinkBlock"
  = NamedHyperlink
  / TextLiteralLink

TextLiteralLink "TextLiteralLink"
  = t:TextInline
    &{indent(3); return true}
      tt:(NewLine Samedent TextInline)*
    Dedent
    {
      // there should be only 1 node
      // after merging multiple Text node
      return mergeContinuousTextNodes(unroll(t, tt, 2))[0]
    }


Directive "Directive"
  = ExplicitMarkupStart
    d:InlineCompatibleDirective
    {return d}


InlineCompatibleDirective
  = t:DirectiveType "::" a:(_ DirectiveArgument)?
    &{indent(3); return true}
      o:(NewLine Samedent FieldList)? // DirectiveOption
      c:(NewLine Samedent DirectiveContent)?
    Dedent
    {
      const node = ast(T.Directive).set('type', t)
      if (a !== null) node.add(a[1])
      if (o !== null) node.add(ast(T.DirectiveOption).add(o[2]))
      if (c !== null) node.add(c[2])

      return node
    }

DirectiveType "DirectiveType"
  = t:CharDirectiveType r:DirectiveType
    {return t + r}
  / &"::" {return ''}

// Directive types are case‐
// insensitive single words (alphanumerics plus isolated internal hyphens, underscores, plus
// signs, colons, and periods; no whitespace).
CharDirectiveType "CharDirectiveType"
  = AlphaNum
    / "-"
    / "_"
    / "+"
    / ":"
    / "."

DirectiveArgument
  = t:[^\r\n]+
  {
    const tNode = ast(T.Text).set('value', t.join(''))
    return ast(T.DirectiveArgument).add(tNode)
  }

// a block of literal text
DirectiveContent "DirectiveContent"
  = t:CharDirectiveContent+
    tt:(NewLine+ Samedent CharDirectiveContent*)*
    {
      const text = t.join('') + tt.map(e => e[2].join('')).join('')
      const tNode = ast(T.Text).set('value', text)
      return ast(T.DirectiveContent).add(tNode)
    }

CharDirectiveContent "CharDirectiveContent"
  = [^\r\n]

SubstitutionDefinition "SubstitutionDefinition"
  = ExplicitMarkupStart
  "|" t:SubstitutionReferenceName "|" _
  d:InlineCompatibleDirective
  {
    return ast(T.SubstitutionDefinition)
            .set('name', t)
            .add(d)
  }



InlineMarkups "InlineMarkups"
  = a:((InlineMarkupFirst / TextInline) InlineMarkupNonFirst*)
  {
    const nodes = flatten(a).filter(astyFilter)
    const mergedNodes = mergeContinuousTextNodes(nodes)
    return mergedNodes
  }

InlineMarkupFirst "InlineMarkupFirst"
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

InlineMarkupNonFirst "InlineMarkupNonFirst"
  = "\\ " m:InlineMarkupFirst {return m}
  / _ InlineMarkupFirst
  / "\\ " m:TextInline {return m}
  / _ TextInline
  / TextInline

TextInline "TextInline"
  = c:CharTextInline+ {return ast(T.Text).set('value', c.join(''))}

CharTextInline "CharTextInline"
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
  /*
   * [Non standard]
   * https://github.com/frantic1048/Est/issues/1
   * python rST does not recognize this grammar
   * we disable this rule
   */
  // / URIPathEmpty

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

EmbeddedHyperlinkLabel "EmbeddedHyperlinkLabel"
  = t:CharInlineLiteral r:EmbeddedHyperlinkLabel
  { return t + r }
  / "<" {return ''}

AnonymousHyperlinkImplict "AnonymousHyperlinkImplict"
  = t:CharReferenceName r:AnonymousHyperlinkImplict
  {return t + r}
  / "__" // don't return ending "__"
  {return ''}

NamedHyperlink "NamedHyperlink"
  = !"\\" "`" t:EmbeddedHyperlinkLabel u:NamedHyperlinkReferenceName "_>`_"
  {
    const tNode = ast(T.Text).set('value', t)
    return ast(T.NamedHyperlink).add(tNode).set('name', u)
  }
  / !"\\" "`" t:TextInlineLiteral !"\\" "`_"
  { return ast(T.NamedHyperlink).add(t).set('name', t.get('value')) }
  / t:NamedHyperlinkImplict "_"
  {
    const tNode = ast(T.Text).set('value', t)
    return ast(T.NamedHyperlink).add(tNode).set('name', t)
  }

NamedHyperlinkReferenceName "NamedHyperlinkReferenceName"
  = t:CharInlineLiteral r:NamedHyperlinkReferenceName
  { return t + r }
  / &"_" {return ''}

NamedHyperlinkImplict "NamedHyperlinkImplict"
  = t:CharReferenceName r:NamedHyperlinkImplict
  { return t + r}
  / &"_" {return ''}

CharReferenceName "CharReferenceName"
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
  = !"\\" "[" t:CitationReferenceName "]_"
  { return ast(T.CitationReference).set('name', t) }

CitationReferenceName "CitationReferenceName"
  = t:CharReferenceName r:CitationReferenceName
  { return t + r }
  / &"]" {return ''}

SubstitutionReference "SubstitutionReference"
  // substitution as AnonymousHyperlink
  = !"\\" "|" t:SubstitutionReferenceName "|__"
  {
    const sNode = ast(T.SubstitutionReference).set('name', t)
    return ast(T.AnonymousHyperlink).add(sNode)
  }
  // substitution as NamedHyperlink
  / !"\\" "|" t:SubstitutionReferenceName "|_"
  {
    const sNode = ast(T.SubstitutionReference).set('name', t)
    return ast(T.NamedHyperlink).add(sNode).set('name', t)
  }
  // normal substitution
  / !"\\" "|" t:SubstitutionReferenceName "|"
  { return ast(T.SubstitutionReference).set('name', t) }

SubstitutionReferenceName "SubstitutionReferenceName"
  = t:CharReferenceName r:SubstitutionReferenceName
  { return t + r }
  / &"|" {return ''}

InterpretedText "InterpretedText"
  = r:InterpretedTextRole !"\\" "`"  t:TextInlineLiteral !"\\" "`"
  { return ast(T.InterpretedText).add(t).set('role', r)}

  / !"\\" "`"  t:TextInlineLiteral !"\\" "`" r:InterpretedTextRole
  { return ast(T.InterpretedText).add(t).set('role', r)}

  / !"\\" "`"  t:TextInlineLiteral !"\\" "`"
  { return ast(T.InterpretedText).add(t) }

InterpretedTextRole "InterpretedTextRole"
  = ":" r:CharReferenceName+ ":"
  { return r.join('')}


TextInlineLiteral "TextInlineLiteral"
  = c:CharInlineLiteral+
  { return ast(T.Text).set('value', c.join('')) }

CharInlineLiteral "CharInlineLiteral"
  = "\\`" { return '`' }
  //  CR LF `
  / [^\r\n\u0060]

StrongEmphasis "StrongEmphasis"
  = !"\\" "**" t:TextEmphasis !"\\" "**"
  { return ast(T.StrongEmphasis).add(t) }

Emphasis "Emphasis"
  = !"\\" "*" t:TextEmphasis !"\\" "*"
  { return ast(T.Emphasis).add(t) }

TextEmphasis "TextEmphasis"
  = c:CharEmphasis+
  { return ast(T.Text).set('value', c.join('')) }

CharEmphasis "CharEmphasis"
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
