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