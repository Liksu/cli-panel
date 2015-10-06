angular.module('cli').directive('ngCli', function($timeout) {
	return {
		templateUrl: '/panel.html',
		replace: true,
		controller: function($scope, $cli) {
			$scope.show = true;
			// dirty hack
			var superPrint = $cli.print;
			$cli.print = function(string) {
				superPrint(string);
				$scope.buffer = $cli.buffer;
			};

			var commandInput = document.querySelector('.cli .panel .line .command');
			var buffer = document.querySelector('.cli .panel .buffer');

			$scope.focus = function() {
				$timeout(function() {
					var len = commandInput.value.length;
					if(commandInput.setSelectionRange){
						commandInput.setSelectionRange(len, len);
					} else if (typeof commandInput.selectionStart == "number") {
						commandInput.selectionStart = commandInput.selectionEnd = len;
					} else if (typeof commandInput.createTextRange != "undefined") {
						commandInput.focus();
						var range = commandInput.createTextRange();
						range.collapse(true);
						range.moveEnd(len);
						range.moveStart(len);
						range.select();
					}
					commandInput.focus();
				}, 0);
			};

			document.addEventListener('keyup', function(e) {
				if (e.keyCode === 192) {
					$scope.show = !$scope.show;
					if (e.target === commandInput) $scope.command = $scope.command.slice(0, -1);
					if ($scope.show) $scope.focus();
				}
				else if (e.keyCode === 13 && e.target === commandInput) {
					$cli.print($scope.command);
					$cli.run($scope.command);

					buffer.scrollTop = buffer.scrollHeight;
					$scope.command = '';
				}

				$scope.$apply();
			});

			//TODO: buffer
			//TODO: loader
			//TODO: commands history + keys up & down
			//TODO: styling
		}
	}
});