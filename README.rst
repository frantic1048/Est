Est
======
|license|_ |code quality|_ |ci|_ |dm|_

.. |license| image:: https://img.shields.io/github/license/frantic1048/est.svg?style=flat-square
.. _license: https://github.com/frantic1048/est/blob/master/LICENSE
.. |code quality| image:: https://img.shields.io/codacy/grade/3aa60448106f4001b7ac194829f98397.svg?style=flat-square
.. _`code quality`: https://www.codacy.com/app/frantic1048/Est/dashboard
.. |ci| image:: https://img.shields.io/travis/frantic1048/Est.svg?style=flat-square
.. _ci: https://travis-ci.org/frantic1048/Est
.. |dm| image:: https://img.shields.io/david/frantic1048/Est.svg?style=flat-square
.. _dm: https://david-dm.org/frantic1048/Est

reStructuredText parser and renderer.

Build
======

Prepare:

.. code:: sh

    # fetch source code
    git clone https://github.com/frantic1048/Est.git

    # fetch dependencies
    yarn install


Debug build and run test:

.. code:: sh

    yarn ci

Normal build:

.. code:: sh

    yarn build

Usage
======

After build:

.. code:: js

    const est = require('<PATH_TO_EST>')

    // directly render rST into HTML string
    const html = est.rst2html('reStructuredText string...')


    // or...?
    // welcome to the dark side...

    // generate parsing tree
    // which is an ASTy instance
    const parse_t = est.parse('reStructuredText string...')

    // transfrom parsing tree into doc tree
    // which is an ASTy instance
    const doc_t = est.transfrom(parse_t)

    // render the doc tree into HTML string
    const html_the_harder_way = est.render(doc_t)

All node types of the parsed tree can be found from ``est.TokenTypes`` .

.. _ASTy: https://github.com/rse/asty

The node structure of a specific markup could be referred in ``test/grammar.<MarkupName>.js``

Render function is under constructing.

Recognized Markups
==================

:Inline:

  - `emphasis <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#emphasis>`_
  - `strong emphasis <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#strong-emphasis>`_
  - `interpreted text <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#interpreted-text>`_
  - `inline literal <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#inline-literals>`_
  - `hyperlink reference <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#hyperlink-references>`_
  - `substitution reference <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#substitution-references>`_
  - `inline internal target <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#inline-internal-targets>`_
  - `standalone hyperlink <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#standalone-hyperlinks>`_

    URI is refer to `RFC 3986 <https://tools.ietf.org/html/rfc3986#appendix-A>`_ 's ``absolute-URI`` definition, no scheme restriction.

    Email address is a simplified subset of URI. See ``TextEmailAdress`` rule in ``src/parser.pegjs``


:Block-level:

  - `section <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#sections>`_

    Unlike adorment line should be longer than title text in spec, section adornment length > 3 is accepted length.

  - `transition <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#transitions>`_
  - `paragraph <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#paragraphs>`_
  - `bullet list <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#bullet-lists>`_

    fixed 2 spaces indent.

  - `enumerated list <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#enumerated-lists>`_

    the text immediately after the enumerator determines the indentation (same as spec).

  - `definition list <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#definition-lists>`_

    fixed 4 spaces indent.

  - `field list <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#field-lists>`_
  - `option list <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#option-lists>`_
  - `footnote <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#footnotes>`_

    standalone hyperlink is not recognized in field name, while the other inline markups is recognized.

  - `citation <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#citations>`_
  - `hyperlink target <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#hyperlink-targets>`_
  - `directive <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#directives>`_
  - `substitution definition <http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#substitution-definitions>`_
