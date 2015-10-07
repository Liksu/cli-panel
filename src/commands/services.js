angular.module('cli').run(function($cli) {
	var services = angular.modules
		.filter(function(module) { return module !== 'cli' })
		.reduce(function(list, module) { return list.concat(angular.module(module)._invokeQueue) }, [])
		.filter(function(item) { return item[1] === 'service' })
		.map(function(item) { return item[2][0] })
		.forEach(function(service) {
			//$cli.command(service, )
		})
});