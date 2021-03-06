/**
 * Module dependencies
 */

var path = require('path');
var sailsgen = require('sails-generate');
var Generator = require('../lib');


//
// This script exists so we can run our generator
// directly from the command-line for convenience
// during development.
//


sailsgen(Generator, {

	rootPath: path.resolve(process.cwd()),

	force: true,
	id: process.argv[2],
	actions: process.argv.length > 3 ? process.argv.slice(3) : ['search', 'find', 'create', 'update', 'destroy']

	// You can stub other scope variables here, e.g.
	// foo: 'bar'

}, function (err) {
	if (err) throw err;

	// It worked!
	console.log('Done.');
});
