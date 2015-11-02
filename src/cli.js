window.cli = new (function() {
	/* templates */
	this.templates = {};
	this.cache = {
		commandInput: null,
		buffer: null,
		panel: null,
		show: false
	};

	this.addHtml = function(name, content, selector) {
		this.templates[name] = {
			html: content,
			selector: selector || 'body'
		};
	}.bind(this);

	document.addEventListener("DOMContentLoaded", function() {
		var templates = this.templates;
		var fragments = {};

		Object.keys(templates).forEach(function(name) {
			var selector = templates[name].selector;
			if (!fragments[selector]) {
				fragments[selector] = document.createElement('div');
				fragments[selector].innerHTML = '';
			}
			fragments[selector].innerHTML += templates[name].html;
		});

		Object.keys(fragments).forEach(function(selector) {
			document.querySelector(selector).appendChild( fragments[selector] );
		});

		this.cache.panel = document.querySelector('.cli .panel');
		this.cache.commandInput = this.cache.panel.querySelector('.line .command');
		this.cache.buffer = this.cache.panel.querySelector('.buffer');
	}.bind(this));

	/* keyboard */
	document.addEventListener('keydown', function(e) {
		if (e.keyCode === 192) { // `
			if (e.target.nodeName === 'INPUT' && e.target !== this.cache.commandInput) return;
			this.toggle();
		}
		else if (e.keyCode === 13 && e.target === this.cache.commandInput) { // enter
			//cli.print(cli.prompt + $scope.command);
			//cli.run($scope.command);
			//
			//buffer.scrollTop = buffer.scrollHeight;
			//$scope.command = '';
		}

		//$scope.$apply();
	}.bind(this));


	/* ui helpers */

	this.show = function() {
		this.cache.panel.className += ' show';
		this.cache.show = true;
		this.focus();
	}.bind(this);

	this.hide = function() {
		this.cache.panel.className = this.cache.panel.className.replace(/\s*show/g, '');
		this.cache.show = false;
	}.bind(this);

	this.toggle = function(show){
		if (show === undefined) show = !this.cache.show;
		show ? this.show() : this.hide();
	}.bind(this);

	this.focus = function() {
		var input = this.cache.commandInput;
		setTimeout(function() {
			var len = input.value.length;
			if(input.setSelectionRange){
				input.setSelectionRange(len, len);
			} else if (typeof input.selectionStart == "number") {
				input.selectionStart = input.selectionEnd = len;
			} else if (typeof input.createTextRange != "undefined") {
				input.focus();
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd(len);
				range.moveStart(len);
				range.select();
			}
			input.focus();
		}, 0);
	}.bind(this);

	/* service */

	this.command = function() {

	};
})();