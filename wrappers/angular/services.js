angular.module('cli').run(function($cli, $rootScope) {
	console.log('list or registred modules', angular.modules);
	angular.modules = angular.modules.filter(function(module) { return module !== 'cli' });

	var store = {controller: {}};
	window.store = store;
	var modules = angular.modules
		.reduce(function(list, module) { return list.concat(angular.module(module)._invokeQueue) }, []);

	var services = modules
		.filter(function(item) { return item[1] === 'service' })
		.map(function(item) { return item[2][0] });

	var controllers = modules
		.filter(function(item) { return item[1] === 'controller' || item[0] === '$controllerProvider' })
		.map(item => (store.controller[item[2][0]] = item[2][1], item[2][0]));
		//.map(function(item) { return item[2][0] });

	var directives = modules
		.filter(function(item) { return item[1] === 'directive' })
		.map(function(item) { return item[2][0] });

	//console.log(angular.modules);
	//console.warn(angular.module(angular.modules[0]));
	//angular.module('cli').factory('cliServiceStorage', Function.apply(angular.module('cli'), services.concat('console.warn("arguments", arguments); return {}')));

	//directives.forEach((name) => {
	//	$provide.decorator(name + 'Directive', ($delegate, $parse) => {
	//		console.log($delegate, $parse);
	//		return $delegate;
	//	})
	//});


	console.log('services:', services, 'controllers:', controllers, 'directives:', directives);
	console.log('store:', store);
	console.log('modules:', modules);
	console.log('$rootScope:', $rootScope);
});

angular.module('cli').config(function ($provide) {
	$provide.decorator('$controller', function ($delegate) {
		return function(constructor, locals, later, indent) {
			console.log('hey', constructor, locals);
			if (typeof constructor == "string") window.cli.controllers[constructor] = locals.$scope;
			return $delegate(constructor, locals, later, indent);
		}
	});
});
