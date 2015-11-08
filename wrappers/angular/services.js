angular.module('cli').run(function($cli, $rootScope) {
	var store = {controller: {}};
	var modules = angular.modules
		.filter(function(module) { return module !== 'cli' })
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

	console.log('services:', services, 'controllers:', controllers, 'directives:', directives);
	console.log('store:', store);
	console.log('modules:', modules);
	console.log('$rootScope:', $rootScope);
});