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


angular.module('cli').run(function() {
	var panel = angular.element('<ng-cli></ng-cli>');
	angular.element(document.body).append(panel)
});

angular.module('cli').service('$cli', ["$q", function($q) {
	this.prompt = '> ';
	this.buffer = '';
	this.history = [];
	this.workers = {
		pre: [],
		commands: {},
		post: []
	};

	this.print = function(string) {
		this.buffer += string + '\n';
	}.bind(this);

	this.run = function(command) {
		this.history.push(command);
		var commandObject = {
			input: command,
			original: command,
			command: null,
			argv: {},
			result: null
		};
		// run over all
		// each step is promise
		var pipeline = this.workers.pre.reduce(function(pipeline, processor, i) {
			return $q.when(pipeline).then(function() {return processor.worker(commandObject)});
		}, commandObject);

		pipeline = $q.when(pipeline).then(function() {
			var command;
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
}]);

angular.module('cli').directive('ngCli', ["$timeout", function($timeout) {
	return {
		templateUrl: '/panel.html',
		replace: true,
		controller: ["$scope", "$cli", function($scope, $cli) {
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
		}]
	}
}]);

angular.module('cli').run(["$cli", function($cli) {
	$cli.preprocessor('argv', 'Split command line to arguments', function(commandObject) {
		if (!commandObject.input) return commandObject;

		var word = commandObject.input.match(/^\w+/);
		if (Object.keys($cli.workers.commands).indexOf(word && word[0]) !== -1) {
			commandObject.command = word[0];
			commandObject.input = commandObject.input.replace(word[0], '');
		}

		return commandObject
	});
}]);

angular.module('cli').run(["$cli", function($cli) {
	$cli.command('clear', 'Clear screen', function(commandObject) {
		$cli.buffer = '';
		$cli.print(null);
	});
}]);

angular.module('cli').run(["$cli", function($cli) {
	$cli.command('help', 'Display this list', function(commandObject) {
		$cli.print('List of available commands:');
		Object.keys($cli.workers.commands)
			.sort()
			.forEach(function(command) {
				var descr = $cli.workers.commands[command].description;
				$cli.print(['\t', command, descr ? '- ' + descr : ''].join(' '));
			});
	});
	//console.log( 'help', angular.module('cli')._invokeQueue );
}]);

angular.module('cli').run(["$cli", function($cli) {
	var services = angular.modules
		.filter(function(module) { return module !== 'cli' })
		.reduce(function(list, module) { return list.concat(angular.module(module)._invokeQueue) }, [])
		.filter(function(item) { return item[1] === 'service' })
		.map(function(item) { return item[2][0] })
		.forEach(function(service) {
			//$cli.command(service, )
		})
}]);

angular.module('cli').run(["$cli", function($cli) {
	function calc(string) {
		return eval(string);
	}

	$cli.postprocessor('calc', 'Calculate input', function(commandObject) {
		if (!commandObject.input) return commandObject;

		$cli.print(calc(commandObject.input));

		return commandObject
	});
}]);

angular.module("cli").run(["$templateCache", function($templateCache) {$templateCache.put("/panel.html","<div class=\"cli\">\n	<style>\n		.panel {\n			height: 64%;\n			position: absolute;\n			top: 0;\n			left: 0;\n			right: 0;\n			color: white;\n			font: 16px monospace;\n			background: rgba(0, 0, 0, 0.8);\n			line-height: 20px;\n		}\n		.buffer {\n			overflow: auto;\n			white-space: pre-line;\n			position: absolute;\n			bottom: 20px;\n		}\n		.line {\n			position: absolute;\n			bottom: 0;\n			height: 20px;\n			width: 100%;\n		}\n		.command {\n			background: none;\n			border: 0;\n			color: white;\n			outline: none;\n			font: 16px monospace;\n			padding-left: 20px;\n			width: 100%;\n			box-sizing: border-box;\n			margin-left: -20px;\n		}\n	</style>\n\n	<div class=\"panel\" ng-show=\"show\" ng-click=\"focus()\">\n		<div class=\"buffer\">{{buffer}}<span class=\"loader\" ng-show=\"loading\"></span></div>\n		<div class=\"line\">\n			<span class=\"prompt\">{{prompt}}</span>\n			<input type=\"text\" class=\"command\" ng-model=\"command\" autofocus=\"autofocus\"/>\n		</div>\n	</div>\n</div>");}]);