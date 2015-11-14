(function(original) {
	angular.modules = [];
	angular.module = function() {
		if (arguments.length > 1) angular.modules.push(arguments[0]);
		return original.apply(null, arguments);
	};
})(angular.module);

angular.module('cli', []).factory('$cli', () => {
	var cli = window.cli;
	cli.ng = {controllers: {}, directives: {}, services: {}};
	cli.ng.c = cli.ng.controllers;
	cli.ng.d = cli.ng.directives;
	cli.ng.s = cli.ng.services;
	return cli;
});
