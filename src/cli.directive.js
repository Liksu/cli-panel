angular.module('cli').directive('ngCli', function() {
	return {
		templateUrl: '/panel.html',
		replace: true,
		controller: function($scope, $cli) {
			$scope.show = true;

			var commandInput = document.querySelector('.cli .panel .line .command');
			document.addEventListener('keyup', function(e) {
				if (e.keyCode === 192) {
					$scope.show = !$scope.show;
					$scope.$apply();
				} else if (e.keyCode === 13 && e.target === commandInput) {
					$cli.run($scope.command);
					$scope.command = '';
				}
			});

			//TODO: buffer
			//TODO: loader
			//TODO: commands history + keys up & down
			//TODO: styling
		}
	}
});