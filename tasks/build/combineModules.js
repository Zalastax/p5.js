'use strict';

var fs = require('fs');
var path = require('path');
var rollup = require('../utils/rollup');
var commonjs = require('rollup-plugin-commonjs');
var multiEntry = require('rollup-plugin-multi-entry');
var string = require('rollup-plugin-string');
var nodeResolve = require('rollup-plugin-node-resolve');
var json = require('rollup-plugin-json');

function inputOptions(srcFilePath) {
  return {
    input: srcFilePath,
    plugins: [
      multiEntry(),
      string({
        include: ['**/*.vert', '**/*.frag']
      }),
      json(),
      nodeResolve({
        browser: true,
        main: true,
        jsnext: false,
        module: false
      }),
      commonjs()
    ],
    context: 'window'
  };
}

// TODO: Make this method less brittle to changes in app.js or explicitly mention it in app.js
function sourcesInApp() {
  // Make a list of sources from app.js in that sequence only
  var sources = [];
  var dump = fs.readFileSync('./src/app.js', 'utf8');
  var regexp = /require\('\.\/(.+)'\)/g;
  var match;
  while ((match = regexp.exec(dump)) != null) {
    sources.push(match[1]);
  }

  return sources;
}

// TODO: Evaluate if this is the best way to find the files for each module
function srcFilePaths(modules) {
  var srcDirPath = './src';
  return sourcesInApp()
    .map(function(source) {
      var base = source.substring(0, source.lastIndexOf('/'));
      if (base === 'core' || modules.includes(base)) {
        var filePath = source.search('.js') !== -1 ? source : source + '.js';
        return path.resolve(srcDirPath, filePath);
      }
    })
    .filter(function(path) {
      return path !== undefined;
    });
}

module.exports = function(grunt) {
  grunt.registerTask(
    'combineModules',
    'Compile and combine certain modules with rollup',
    function() {
      // Reading and writing files is asynchronous
      var done = this.async();

      var modules = Array.prototype.slice.call(arguments);
      // Module sources are space separated names in a single string (enter within quotes)
      var module_src = modules.join(', ');

      // Render the banner for the top of the file. Includes the Module name.
      var bannerTemplate =
        '/*! Custom p5.js v<%= pkg.version %> <%= grunt.template.today("mmmm dd, yyyy") %> \nContains the following modules : ' +
        module_src +
        '*/';
      var banner = grunt.template.process(bannerTemplate);

      // Target file path
      var libFilePath = path.resolve('./lib/modules/p5Custom.js');

      return rollup.build(
        grunt,
        done,
        banner,
        inputOptions(srcFilePaths(modules)),
        libFilePath
      );
    }
  );
};
