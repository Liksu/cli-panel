angular.module('cli', []);


angular.module('cli').run(function($cli) {
	$cli.preprocessor('argv', 'Split command line to arguments', function(commandObject) {
		if (!commandObject.input) return commandObject;

		var word = commandObject.input.match(/^\w+/);
		if (Object.keys($cli.workers.commands).indexOf(word && word[0]) !== -1) commandObject.command = word[0];

		console.log('argv', commandObject.command);

		return commandObject
	});
});

angular.module("cli").run(["$templateCache", function($templateCache) {$templateCache.put("/panel.html","<div class=\"cli\">\n	<style>\n		.panel {\n			height: 64%;\n			position: absolute;\n			top: 0;\n			left: 0;\n			right: 0;\n			color: white;\n			font: 16px monospace;\n			background: rgba(0, 0, 0, 0.8);\n			line-height: 20px;\n		}\n		.buffer {\n			overflow: auto;\n			white-space: pre-line;\n			position: absolute;\n			bottom: 20px;\n		}\n		.line {\n			position: absolute;\n			bottom: 0;\n			height: 20px;\n		}\n		.command {\n			background: none;\n			border: 0;\n			color: white;\n			outline: none;\n			font: 16px monospace;\n		}\n	</style>\n\n	<div class=\"panel\" ng-show=\"show\" ng-click=\"focus()\">\n		<div class=\"buffer\">{{buffer}}<span class=\"loader\" ng-show=\"loading\"></span></div>\n		<div class=\"line\">\n			<span class=\"prompt\">&gt;</span>\n			<input type=\"text\" class=\"command\" ng-model=\"command\" autofocus=\"autofocus\"/>\n		</div>\n	</div>\n</div>");}]);

angular.module('cli').run(function() {
	var panel = angular.element('<ng-cli></ng-cli>');
	angular.element(document.body).append(panel)
});

angular.module('cli').run(function($cli) {
	$cli.command('help', 'Display this list of available commands', function(commandObject) {
		console.log('in help', commandObject);
	});
	//console.log( 'help', angular.mode('cli')._invokeQueue );
});

angular.module('cli').service('$cli', function($q) {
	this.workers = {
		pre: [],
		commands: {},
		post: []
	};

	this.buffer = '';
	this.print = function(string) {
		this.buffer += string + '\n';
	}.bind(this);

	this.run = function(command) {
		var commandObject = {
			input: command,
			original: command,
			command: null,
			argv: {},
			result: null
		};
		console.log('run', commandObject);
		// run over all
		// each step is promise
		var pipeline = this.workers.pre.reduce(function(pipeline, processor, i) {
			return $q.when(pipeline).then(function() {console.log('pre', processor, commandObject); return processor.worker(commandObject)});
		}, commandObject);

		pipeline = $q.when(pipeline).then(function() {
			var command;
			console.log('check command', commandObject, this.workers.commands);
			if (commandObject.command && (command = this.workers.commands[commandObject.command])) {
				return $q
					.when(command.worker(commandObject))
					.then(function(result) {commandObject = result || commandObject});
			}

			return $q.when(commandObject);
		}.bind(this));

		pipeline = $q.when(pipeline).then(function() {
			this.workers.post.reduce(function (pipeline, processor, i) {
				return $q.when(pipeline).then(function () {
					return processor.worker(commandObject)
				});
			}, $q.when(commandObject));
		}.bind(this));

		return pipeline.then(function() { return commandObject });
	}.bind(this);

	/**
	 *
	 * @param type
	 * @param name
	 * @param [description]
	 * @param worker
	 */
	var store = function store(type, name, description, worker) {
		if (worker === undefined && typeof description === 'function') {
			worker = description;
			description = null;
		}

		var storeObject = {
			name: name,
			description: description,
			worker: worker
		};

		if (type === 'command') this.workers.commands[name] = storeObject;
		else this.workers[type].push(storeObject);
	};

	this.command = store.bind(this, 'command');
	this.preprocessor = store.bind(this, 'pre');
	this.postprocessor = store.bind(this, 'post');

	return this
});



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