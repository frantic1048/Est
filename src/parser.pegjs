{
    const unroll = options.util.makeUnroll(location, options)
    const ast = options.util.makeAST(location, options)
    const T = require('./').tokenTypes
}

Document
// contains block level token
  = b:Block bb:(BlankLine Block)*
  { return unroll(b, bb, 1)}

Block
  = BulletList
  / Paragraph

Paragraph
  = i:Plain ii:(NewLine Plain)*
  { return ast(T.Paragraph).add(unroll(i, ii, 1)) }

BulletList
  = b:BulletListItem bb:(NewLine BulletListItem)*
  { return ast(T.BulletList).add(unroll(b, bb, 1)) }

BulletListItem
  = BulletListBullet _ i:Plain
  { return ast(T.BulletListItem).add(i) }

BulletListBullet
  = [*+-‧‣⁃]

Plain
  = c: [^\r\n]+
  { return ast(T.Plain).set('value', c.join(''))}

BlankLine
  = NewLine NewLine+

NewLine
  = [\r][\n]
  / [\r]
  / [\n]

// whitspace
_
  = " "
