/**
 * ngct
 * @author Liksu
 * @version v1.0.0-beta.1
 * @link http://liksu.github.io/cli-panel/
 * @license MIT
 */

window.ng = {};
'use strict';

// wrappers/angular/cli.js
(function (cli) {
	(function (original) {
		angular.modules = [];
		angular.module = function () {
			if (arguments.length > 1) angular.modules.push(arguments[0]);
			return original.apply(null, arguments);
		};
	})(angular.module);

	angular.module('cli', []).factory('$cli', function () {
		cli.ng = { controllers: {}, directives: {}, services: {} };
		cli.ng.c = cli.ng.controllers;
		cli.ng.d = cli.ng.directives;
		cli.ng.s = cli.ng.services;
		return cli;
	});
})(window);

'use strict';

// wrappers/angular/services.js
(function (cli) {
	angular.module('cli').run(["$injector", "$cli", function ($injector, $cli) {
		var modules = angular.modules.reduce(function (list, module) {
			return list.concat(angular.module(module)._invokeQueue);
		}, []);

		// get services
		var services = modules.filter(function (item) {
			return item[1] === 'service';
		}).map(function (item) {
			return item[2][0];
		});

		services.push('$http', '$q');
		services.forEach(function (name) {
			return cli.ng.services[name] = $injector.get(name);
		});

		// set keywords
		var keywords = modules.filter(function (item) {
			return item[0] === '$controllerProvider' || item[1] === 'controller' || item[1] === 'directive';
		}).map(function (item) {
			return item[2][0];
		}).concat(services);
	}]);

	angular.module('cli').config(["$provide", function ($provide) {
		angular.modules = angular.modules.filter(function (module) {
			return module !== 'cli';
		});

		// get directives
		angular.modules.forEach(function (module) {
			var directives = angular.module(module)._invokeQueue.filter(function (item) {
				return item[1] === 'directive';
			}).map(function (item) {
				return item[2][0];
			});

			directives.forEach(function (name) {
				angular.module(module).config(["$provide", function ($provide) {
					$provide.decorator(name + 'Directive', ["$delegate", function ($delegate) {
						$delegate[0].compile = function () {
							return function (scope, element, attrs) {
								$delegate[0].link.apply(this, arguments);

								if (!cli.ng.directives[name]) cli.ng.directives[name] = [];
								scope.$cliPosition = cli.ng.directives[name].push(scope) - 1;

								scope.$on('$destroy', function () {
									return cli.ng.directives[name].splice(scope.$cliPosition, 1);
								});
							};
						};

						return $delegate;
					}]);
				}]);
			});
		});

		// get controllers
		$provide.decorator('$controller', ["$delegate", function ($delegate) {
			return function (constructor, locals, later, indent) {
				if (typeof constructor == "string") cli.ng.controllers[constructor] = locals.$scope;
				return $delegate(constructor, locals, later, indent);
			};
		}]);
	}]);
})(window);