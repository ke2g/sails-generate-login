/**
 * Module dependencies
 */

var util = require('util')
  , crypto = require('crypto')
  , uuid = require('node-uuid')
  , _ = require('lodash');
_.defaults = require('merge-defaults');


/**
 * sails-generate-login
 *
 * Usage:
 * `sails generate login`
 *
 * @description Generates a login
 * @help See http://links.sailsjs.org/docs/generators
 */

module.exports = {

  /**
   * `before()` is run before executing any of the `targets`
   * defined below.
   *
   * This is where we can validate user input, configure default
   * scope variables, get extra dependencies, and so on.
   *
   * @param  {Object} scope
   * @param  {Function} cb    [callback]
   */

  before: function (scope, cb) {

    // scope.args are the raw command line arguments.
    //
    // e.g. if someone runs:
    // $ sails generate login user find create update
    // then `scope.args` would be `['user', 'find', 'create', 'update']`
    /*if (!scope.args[0]) {
      return cb( new Error('Please provide a name for this login.') );
    }*/

    // scope.rootPath is the base path for this generator
    //
    // e.g. if this generator specified the target:
    // './Foobar.md': { copy: 'Foobar.md' }
    //
    // And someone ran this generator from `/Users/dbowie/sailsStuff`,
    // then `/Users/dbowie/sailsStuff/Foobar.md` would be created.
    if (!scope.rootPath) {
      return cb( INVALID_SCOPE_VARIABLE('rootPath') );
    }

    //modify package.json
    updatePackage (scope.rootPath);

    // Attach defaults
    _.defaults(scope, {
      createdAt: new Date()
    });

    // Decide the output filename for use in targets below:
    scope.filename = scope.args[0];

    // Add other stuff to the scope for use in our templates:
    scope.whatIsThis = 'an example file created at '+scope.createdAt;

    //secret key
    scope.secretKey = crypto.createHash('md5').update(uuid.v4()).digest('hex');        

    // When finished, we trigger a callback with no error
    // to begin generating files/folders as specified by
    // the `targets` below.
    cb();
  },



  /**
   * The files/folders to generate.
   * @type {Object}
   */

  targets: {

    // Usage:
    // './path/to/destination.foo': { someHelper: opts }

    // Creates a dynamically-named file relative to `scope.rootPath`
    // (defined by the `filename` scope variable).
    //
    // The `template` helper reads the specified template, making the
    // entire scope available to it (uses underscore/JST/ejs syntax).
    // Then the file is copied into the specified destination (on the left).
    './api/services/passport.js': { template: {templatePath: 'Passport_Service.template.js', force: true} },
    './api/models/User.js': { template: {templatePath: 'User_Model.template.js', force: true} },
    './api/controllers/UserController.js': { template: {templatePath: 'User_Controller.template.js', force: true} },
    './views/user': { folder: {force: true} },
    './views/user/login.ejs': { template: {templatePath: 'User_View_Login.template.js', force: true} },
    './views/user/signup.ejs': { template: {templatePath: 'User_View_Signup.template.js', force: true} },
    './config/secret.js': { template: {templatePath: 'Config_Secret.template.js', force: true} },
    './config/http.js': { template: {templatePath: 'Config_http.template.js', force: true} },
    // Creates a folder at a static path
    //'./hey_look_a_folder': { folder: {} }

  },


  /**
   * The absolute path to the `templates` for this generator
   * (for use with the `template` helper)
   *
   * @type {String}
   */
  templatesDirectory: require('path').resolve(__dirname, './templates')
};



/**
 * updatePackage()
 * updates package.json with the required packages (bycrpt and passport)
 * @param {String} path - package.json path
 */

function updatePackage (path) {
  var filename = path + '/package.json'
  var packageJson = require(filename);  
  var fs = require('fs');
  packageJson.dependencies['passport'] = "latest";
  packageJson.dependencies['passport-local'] = "latest";
  packageJson.dependencies['bcrypt'] = "latest";

  fs.writeFileSync(filename, JSON.stringify(packageJson,null,2));
}

/**
 * INVALID_SCOPE_VARIABLE()
 *
 * Helper method to put together a nice error about a missing or invalid
 * scope variable. We should always validate any required scope variables
 * to avoid inadvertently smashing someone's filesystem.
 *
 * @param {String} varname [the name of the missing/invalid scope variable]
 * @param {String} details [optional - additional details to display on the console]
 * @param {String} message [optional - override for the default message]
 * @return {Error}
 * @api private
 */

function INVALID_SCOPE_VARIABLE (varname, details, message) {
  var DEFAULT_MESSAGE =
  'Issue encountered in generator "login":\n'+
  'Missing required scope variable: `%s`"\n' +
  'If you are the author of `sails-generate-login`, please resolve this '+
  'issue and publish a new patch release.';

  message = (message || DEFAULT_MESSAGE) + (details ? '\n'+details : '');
  message = util.inspect(message, varname);

  return new Error(message);
}
