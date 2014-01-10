var npm = require("npm");
var semver = require("semver");


module.exports = function() {

	var handleError = function(er) {
		console.log(er);
	}

	var getRemoteHarpVersion =  function(callback) {
			npm.load({}, function (er) {
			  if (er) return console.log(er);

			  npm.commands.view(["harp","version"], true, function (er, data) {
			    if (er) return handleError(er);
			    var version = Object.keys(data)[0];
			    callback(null, semver.clean(version));
			  });
			});
		}

		// Gets the local version of Harp or false if HARP is missing
		var getLocalHarpVersion = function(callback) {
			npm.load({}, function (er) {
			  if (er) return console.log(er);

			  npm.commands.ls(["harp"], true, function (er, data) {
			    if (er) return handleError(er);
			    callback(null, (data.dependencies.harp === undefined) ? false : semver.clean(data.dependencies.harp.version));
			  });
			});
		}

		// Installs HARP if it is not already installed locally.
		var installHarp = function(callback) {
			npm.load({}, function (er) {
			  if (er) return console.log(er);

				getLocalHarpVersion(function(er, data) {
					if (er) return handleError(er);
					if (data === false) {
						npm.commands.install(["harp@latest"], function (er, data) {
						  if (er) return handleError(er);
						  callback(null, data)
						});				
					}
				});
			});
		}

		// Return boolean if we need to upgrade
		var upgradeRequred = function(callback) {
			getRemoteHarpVersion(function(er, rv) {
				getLocalHarpVersion(function(er, lv) {
					if (lv === false) {
						callback(null, true)	
					} else {
						callback(null, semver.lt(lv, rv))	
					}
				});
			});
		}

	return {
		getRemoteHarpVersion: getRemoteHarpVersion,
		getLocalHarpVersion: getLocalHarpVersion,
		installHarp: installHarp,
		upgradeRequred: upgradeRequred
  }
}

