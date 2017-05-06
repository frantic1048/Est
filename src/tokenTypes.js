module.exports = {
  // =============
  // BodyElement
  // =============
  Paragraph: Symbol('Paragraph'),
  BulletList: Symbol('BulletList'),
  ListItem: Symbol('ListItem'),

  // =============
  // InlineMarkup
  // =============
  Emphasis: Symbol('Emphasis'),
  StrongEmphasis: Symbol('StrongEmphasis'),
  InterpretedText: Symbol('InterpretedText'),

  // Literals
  InlineLiterals: Symbol('InlineLiterals'),

  // Reference
  AnonymousHyperlink: Symbol('AnonymousHyperlink'),
  NamedHyperlink: Symbol('NamedHyperlink'),
  StandAloneHyperlink: Symbol('StandAloneHyperlink'),
  FootnoteReference: Symbol('FootnoteReference'),

  // Target
  InlineInternalTarget: Symbol('InlineInternalTarget'),

  // Text
  Text: Symbol('Text')
}
