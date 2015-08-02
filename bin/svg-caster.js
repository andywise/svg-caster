#!/usr/bin/env node

'use strict';

var
  Application = require('../lib/Application'),
  yargs = require('yargs'),

  argv = yargs
    .usage('Usage: $0 [options]')

    .describe('svg-font', 'Path to SVG font file')
    .describe('ttf-font', 'Path to TTF font file')
    .describe('eot-font', 'Path to EOT font file')
    .describe('font-css', 'Path to SVG font CSS file')
    .describe('font-css-prefix', 'Prefix for icon names in font CSS file')
    .describe('font-codes-dsv', 'Path to CSV or another DSV format file with font glyph names')
    .describe('font-codes-dsv-delimiter', 'Delimiter for DSV file')
    .describe('font-no-empty-glyphs', 'Remove empty font glyphs')
    .describe('svg', 'Path/Pattern to SVG file/files')
    .describe('svg-set', 'Path/Pattern to SVG set file/files')
    .describe('out-svg', 'Path to output SVG files folder')
    .describe('out-svg-set', 'Path to output SVG set file')
    .describe('svgo', 'Optimize SVG with SVGO')
    .describe('pretty', 'Prettify output SVG and SVG sets')
    .describe('name-parser', 'Name formatter parser regular expression pattern')
    .describe('name-replace', 'Name formatter replace regular expression pattern')
    .describe('name-replacement', 'Name formatter replacement')
    .describe('name-lower', 'Name lower case formatter')
    .describe('id-uniquify', 'Uniquify identificators for insert into DOM')

    .help('h')
    .alias('h', 'help')

    .example('$0 --svg-font ./font.svg --svg-font-css ./font.css --out-svg ./svg/', 'Convert SVG font to SVG files')
    .example('$0 --svg-font ./font.svg --svg "./svg/*.svg" --out-svg-set ./svg-sprite.svg', 'Convert SVG font to SVG set file')
    .example('$0 --svg-set "./one/*.svg" --svg-set "./two/*.svg" --out-svg-set ./out.svg', 'Convert multiple SVG set files to one')
    .example('$0 --svg "./material-design-icons/*/svg/production/*24px.svg" --out-svg-set "./material-design-icons.svg" --pretty --svgo --name-parser "^ic_(.*?)_24px$" --name-replace="_" --name-replacement="-"', 'Convert google material design icons to SVG set')

    .epilog('svg-caster (https://github.com/icons8/svg-caster)')
    .argv,

  options;

options = argv;

new Application(options).run();
