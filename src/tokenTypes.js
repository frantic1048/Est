module.exports = {
  // =============
  // BodyElement
  // =============
  Paragraph: Symbol('Paragraph'),
  Transition: Symbol('Transition'),
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
  CitationReference: Symbol('CitationReference'),
  SubstitutionReference: Symbol('SubstitutionReference'),

  // Target
  InlineInternalTarget: Symbol('InlineInternalTarget'),

  // Text
  Text: Symbol('Text')
}
