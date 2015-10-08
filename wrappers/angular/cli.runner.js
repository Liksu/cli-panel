angular.module('cli').run(function() {
	var panel = angular.element('<ng-cli></ng-cli>');
	angular.element(document.body).append(panel)
});