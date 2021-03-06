/**
 * Module dependencies
 */

var util = require('util')
	, _ = require('lodash')
	, fs = require('fs')
	, path = require('path');

// Make _.defaults recursive
_.defaults = require('merge-defaults');
_.str = require('underscore.string');


// Fetch stub action template on initial load.
var ACTION_TEMPLATE = path.resolve(__dirname, '../templates/action.template');
ACTION_TEMPLATE = fs.readFileSync(ACTION_TEMPLATE, 'utf8');



/**
 * This `before` function is run before generating targets.
 * Validate, configure defaults, get extra dependencies, etc.
 *
 * @param  {Object} scope
 * @param  {Function} cb    [callback]
 */

module.exports = function(scope, cb) {

	// scope.args are the raw command line arguments.
	//
	// e.g. if you run:
	// sails generate controlller user find create update
	// then:
	// scope.args = ['user', 'find', 'create', 'update']
	//
	_.defaults(scope, {
		id: scope.args[0],
		actions: scope.args.slice(1)
	});


	//
	// Validate custom scope variables which
	// are required by this generator.
	//

	if ( ! scope.rootPath ) {
		return cb.invalid('Usage: sails generate controller <controllername> [action ...]');
	}

	// Check that we're in a valid sails project
	var pathToPackageJSON = path.resolve(scope.rootPath, 'package.json');
	var package, invalidPackageJSON;
	try { package = require(pathToPackageJSON); } catch (e) {invalidPackageJSON = true;}

	if (invalidPackageJSON) {
		return cb.invalid('Sorry, this command can only be used in the root directory of a Sails project.');
	}

	if ( ! scope.id ) {
		return cb.invalid('Usage: sails generate controller <controllername> [action ...]');
	}

	// Validate optional action arguments
	var actions = scope.actions;
	var invalidActions = [];
	actions = _.map(actions, function (action, i) {

		// Validate action names
		var invalid = action.match(/[^a-zA-Z0-9_\$]+/);

		// Handle errors
		if (invalid) {
			return invalidActions.push(
				'Invalid action notation:   "' + action + '"');
		}
		return action;
	});

	// Handle invalid action arguments
	// Send back invalidActions
	if (invalidActions.length) {
		return cb.invalid(invalidActions);
	}

	// Make sure there aren't duplicates
	if ((_.uniq(actions)).length !== actions.length) {
		return cb.invalid('Duplicate actions not allowed!');
	}




	//
	// Determine default values based on the
	// available scope.
	//

	_.defaults(scope, {
		globalID: _.str.capitalize(scope.id) + 'Controller',
		ext: '.js',
		actions: [],
		destDir: 'api/controllers/'
	});



	//
	// Take multiple "passes" if necessary.
	//

	_.defaults(scope, {
		rootPath: scope.rootPath,
		filename: scope.globalID + scope.ext
	});



	//
	// Transforms
	//


	// Render some stringified code from the action template
	// and make it available in our scope for use later on.
	scope.actions = _.map(scope.actions, function (action) {
		return _.str.rtrim(
			_.unescape(
				_.template(ACTION_TEMPLATE, {
					actionName: action,
					commentHeading: util.format('`%s.%s`', scope.globalID, action)
				})
			)
		);
	});



	//
	// Trigger callback with no error to proceed.
	//

	return cb.success();
};
