angular.module('cli').service('$cli', function($q) {
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