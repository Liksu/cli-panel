angular.module('cli', []);




angular.module("cli").run(["$templateCache", function($templateCache) {$templateCache.put("/panel.html","<div>\n	<style>\n		.panel {\n			height: 33%;\n			position: absolute;\n			top: 0;\n			left: 0;\n			right: 0;\n			color: white;\n			font: 16px monospace;\n			background: rgba(0, 0, 0, 0.6);\n		}\n	</style>\n\n	<div class=\"panel\" ng-show=\"show\">\n		<div class=\"buffer\">\n			<span class=\"loader\"></span>\n		</div>\n		<div class=\"line\">\n			<span class=\"prompt\">&gt;</span>\n			<input type=\"text\" class=\"command\"/>\n		</div>\n	</div>\n</div>");}]);

angular.module('cli').run(function() {
	var panel = angular.element('<ng-cli></ng-cli>');
	angular.element(document.body).append(panel)
});

angular.module('cli').controller('help', function($cli) {
	console.log( angular.mode('cli')._invokeQueue );
});

angular.module('cli').service('$cli', function() {
	return {
		command: function(name, worker, description) {}
	}
});



angular.module('cli').directive('ngCli', function() {
	return {
		templateUrl: '/panel.html',
		replace: true,
		controller: function($scope) {
			$scope.show = true;
			document.addEventListener('keyup', function(e) {
				if (e.keyCode === 192) {
					$scope.show = !$scope.show;
					$scope.$apply();
				}
			});
		}
	}
});