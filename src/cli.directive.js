angular.module('cli').directive('ngCli', function($timeout) {
	return {
		templateUrl: '/panel.html',
		replace: true,
		controller: function($scope, $cli) {
			$scope.show = false;
			// dirty hack
			var superPrint = $cli.print;
			$cli.print = function(string) {
				if (string !== null) superPrint(string);
				$scope.buffer = $cli.buffer.replace(/\t/g, '    ').replace(/  /g, '  ');
			};
			$scope.prompt = $cli.prompt;

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

			document.addEventListener('keydown', function(e) {
				if (e.keyCode === 192) {
					if (e.target.nodeName === 'INPUT' && e.target !== commandInput) return;
					$scope.show = !$scope.show;
					if ($scope.show) $scope.focus();
				}
				else if (e.keyCode === 13 && e.target === commandInput) {
					$cli.print($cli.prompt + $scope.command);
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