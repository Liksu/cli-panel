angular.module('cli').run(function($injector, $cli) {
	var modules = angular.modules
		.reduce((list, module) => list.concat(angular.module(module)._invokeQueue), []);

	// get services
	var services = modules
		.filter(item => item[1] === 'service')
		.map(item => item[2][0]);

	services.push('$http', '$q');
	services.forEach(name => cli.ng.services[name] = $injector.get(name));

	// set keywords
	var keywords = modules
		.filter(item => item[0] === '$controllerProvider' || item[1] === 'controller' || item[1] === 'directive')
		.map(item => item[2][0])
		.concat(services);
});

angular.module('cli').config(function ($provide) {
	angular.modules = angular.modules.filter(function(module) { return module !== 'cli' });

	// get directives
	angular.modules.forEach(module => {
		var directives = angular
			.module(module)
			._invokeQueue
			.filter(function(item) { return item[1] === 'directive' })
			.map(function(item) { return item[2][0] });

		directives.forEach(name => {
			angular.module(module).config($provide => {
				$provide.decorator(name + 'Directive', $delegate => {
					$delegate[0].compile = () => {
						return function(scope, element, attrs) {
							$delegate[0].link.apply(this, arguments);

							if (!cli.ng.directives[name]) cli.ng.directives[name] = [];
							scope.$cliPosition = cli.ng.directives[name].push(scope) - 1;

							scope.$on('$destroy', () => cli.ng.directives[name].splice(scope.$cliPosition, 1));
						};
					};

					return $delegate;
				});
			});
		});
	});

	// get controllers
	$provide.decorator('$controller', function ($delegate) {
		return function(constructor, locals, later, indent) {
			if (typeof constructor == "string") cli.ng.controllers[constructor] = locals.$scope;
			return $delegate(constructor, locals, later, indent);
		}
	});
});
