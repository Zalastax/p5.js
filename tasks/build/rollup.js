'use strict';

var path = require('path');
var rollup = require('../utils/rollup');
var commonjs = require('rollup-plugin-commonjs');
var string = require('rollup-plugin-string');
var nodeResolve = require('rollup-plugin-node-resolve');
var json = require('rollup-plugin-json');
var hypothetical = require('rollup-plugin-hypothetical');

var bannerTemplate =
  '/*! p5.js v<%= pkg.version %> <%= grunt.template.today("mmmm dd, yyyy") %> */';

function inputOptions(srcFilePath, isMin) {
  var fileOverrides = {};

  if (isMin) {
    fileOverrides['./docs/reference/data.json'] = '{}';
  }

  return {
    input: srcFilePath,
    plugins: [
      hypothetical({
        allowFallthrough: true,
        files: fileOverrides
      }),
      string({
        include: ['**/*.vert', '**/*.frag']
      }),
      nodeResolve({
        browser: true,
        main: true,
        jsnext: false,
        module: false
      }),
      commonjs(),
      json()
    ],
    context: 'window'
  };
}

module.exports = function(grunt) {
  var srcFilePath = path.resolve('./src/app.js');

  grunt.registerTask('rollup', 'Compile the p5.js source with rollup', function(
    param
  ) {
    var isMin = param === 'min';
    var filename = isMin ? 'p5.pre-min.js' : 'p5.js';

    // This file will not exist until it has been built
    var libFilePath = path.resolve('./lib', filename);

    // Reading and writing files is asynchronous
    var done = this.async();

    // Render the banner for the top of the file
    var banner = grunt.template.process(bannerTemplate);

    return rollup.build(
      grunt,
      done,
      banner,
      inputOptions(srcFilePath, isMin),
      libFilePath
    );
  });
};
