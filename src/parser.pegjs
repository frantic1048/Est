Document
  = p:Paragraph b:Blankline d:Document
  { return  [p].concat(d)}
  / Paragraph*

Paragraph
  = l1:Inline NewLine l2:Inline
  { return l1.join('') + '\n' + l2.join('') }
  / l3:Inline
  { return l3.join('')}


Inline
  = char: [^\r\n]+ { return char }

Blankline
  = NewLine NewLine+

NewLine
  = [\r][\n]
  / [\r]
  / [\n]
