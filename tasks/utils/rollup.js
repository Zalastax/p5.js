// common functionality for our rollup build tasks
'use strict';

var rollup = require('rollup');

module.exports.build = function build(
  grunt,
  done,
  banner,
  inputOptions,
  libFilePath
) {
  var outputOptions = {
    format: 'umd',
    name: 'p5',
    banner: banner
  };

  return rollup
    .rollup(inputOptions)
    .then(function(bundle) {
      return bundle.generate(outputOptions).then(function(generated) {
        var code = generated.code;
        grunt.file.write(libFilePath, code);

        // Print a success message
        grunt.log.writeln('>>'.green + ' ' + libFilePath.blue + ' created.');
      });
    })
    .catch(function(e) {
      console.error(e);
      grunt.fail.fatal(e);
    })
    .then(function() {
      done();
    });
};
