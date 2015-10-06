angular.module('cli', []);



angular.mode('cli').controller('help', function($cli) {
	console.log( angular.mode('cli')._invokeQueue );
});
angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/panel.html","<div class=\"panel\">\n	<div class=\"buffer\">\n		<span class=\"loader\"></span>\n	</div>\n	<div class=\"line\">\n		<span class=\"prompt\"></span>\n		<input type=\"text\" class=\"command\"/>\n	</div>\n</div>");
$templateCache.put("/panel.css",".panel {\n	height: 33%;\n	position: absolute;\n	top: 0;\n	left: 0;\n	right: 0;\n	color: white;\n	font: 16px monospace;\n	background: rgba(0, 0, 0, 0.6);\n}\n");}]);
angular.module('cli').service('$cli', function() {
	return {
		command: function(name, worker, description) {}
	}
});

