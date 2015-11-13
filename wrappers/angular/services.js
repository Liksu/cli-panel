angular.module('cli').run(function($cli, $rootScope, $injector) {
	console.log('list or registred modules', angular.modules);

	var store = {controller: {}, directive: {}, service: {}};
	window.store = store;
	var modules = angular.modules
		.reduce(function(list, module) { return list.concat(angular.module(module)._invokeQueue) }, []);

	var services = modules
		.filter(function(item) { return item[1] === 'service' })
		.map(item => (store.service[item[2][0]] = item[2][1], item[2][0]));
		//.map(function(item) { return item[2][0] });

	var controllers = modules
		.filter(function(item) { return item[1] === 'controller' || item[0] === '$controllerProvider' })
		.map(item => (store.controller[item[2][0]] = item[2][1], item[2][0]));
		//.map(function(item) { return item[2][0] });

	var directives = modules
		.filter(function(item) { return item[1] === 'directive' })
		.map(item => (store.directive[item[2][0]] = item[2][1], item[2][0]));
		//.map(function(item) { return item[2][0] });

	services.push('$http', '$q');
	services.forEach(name => window.cli.services[name] = $injector.get(name));

	//console.log(angular.modules);
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
	angular.modules = angular.modules.filter(function(module) { return module !== 'cli' });
	console.log('CLI config', angular.modules);

	var modules = angular.modules
		.reduce(function(list, module) { return list.concat(angular.module(module)._invokeQueue) }, []);

	var directives = modules
		.filter(function(item) { return item[1] === 'directive' })
		.map(function(item) { return item[2][0] });

	//directives.forEach((name) => {
	//	$provide.decorator(name + 'Directive', ($delegate, $parse) => {
	//		console.log($delegate, $parse);
	//		return $delegate;
	//	})
	//});


	//var _directive = angular.module(angular.modules[0]).directive;
	//angular.module(angular.modules[0]).directive = function( name, factory ) {
	//	console.log('set directive', name, factory);
	//	$compileProvider.directive( name, factory );
	//	return( this );
	//};

	$provide.decorator('$controller', function ($delegate) {
		return function(constructor, locals, later, indent) {
			console.warn('hey', constructor, locals);
			if (typeof constructor == "string") window.cli.controllers[constructor] = locals.$scope;
			else if (typeof constructor == "function") console.info('doh', constructor.prototype);
			return $delegate(constructor, locals, later, indent);
		}
	});
});
