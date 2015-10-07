(function(orig) {
	angular.modules = [];
	angular.module = function() {
		if (arguments.length > 1) {
			angular.modules.push(arguments[0]);
		}
		return orig.apply(null, arguments);
	}
})(angular.module);

angular.module('cli', []);
