module.exports = {
  // =============
  // BodyElement
  // =============
  Paragraph: Symbol('Paragraph'),
  Transition: Symbol('Transition'),
  BulletList: Symbol('BulletList'),
  EnumeratedList: Symbol('EnumeratedList'),
  ListItem: Symbol('ListItem'),

  // DefinitionList
  DefinitionList: Symbol('DefinitionList'),
  DefinitionListItem: Symbol('DefinitionListItem'),
  DefinitionListTerm: Symbol('DefinitionListTerm'),
  DefinitionListClassifier: Symbol('DefinitionListClassifier'),
  DefinitionListDefinition: Symbol('DefinitionListDefinition'),

  // FieldList
  FieldList: Symbol('FieldList'),
  Field: Symbol('Field'),
  FieldName: Symbol('FieldName'),
  FieldBody: Symbol('FieldBody'),

  // OptionList
  OptionList: Symbol('OptionList'),
  OptionListItem: Symbol('OptionListItem'),
  OptionGroup: Symbol('OptionGroup'),
  Option: Symbol('Option'),
  OptionString: Symbol('OptionString'),
  OptionArgument: Symbol('OptionArgument'),
  OptionDescription: Symbol('OptionDescription'),

  // Reference Targets
  Section: Symbol('Section'),
  Title: Symbol('Title'),

  Footnote: Symbol('Footnote'),
  Citation: Symbol('Citation'),
  Target: Symbol('Target'),

  Directive: Symbol('Directive'),
  DirectiveType: Symbol('DirectiveType'),
  DirectiveArgument: Symbol('DirectiveArgument'),
  DirectiveOption: Symbol('DirectiveOption'),
  DirectiveContent: Symbol('DirectiveContent'),

  SubstitutionDefinition: Symbol('SubstitutionDefinition'),

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
