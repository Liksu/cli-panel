var gulp = require('gulp');
var plumber = require('gulp-plumber');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');
var merge = require('merge-stream');

var config = {
	templates: ['src/templates/*.html', 'src/templates/*.css'],
	core: [
		'src/cli.js',
		'src/cli.runner.js',
		'src/cli.service.js',
		'src/cli.directive.js'
	],
	addons: [
		'src/preprocessors/argv.js',
		'src/commands/help.js',
		'src/postprocessors/calc.js'
	]
};

gulp.task('build', function() {
	var core = gulp.src(config.core).pipe(plumber());
	var addons = gulp.src(config.addons).pipe(plumber());
	var templates = gulp.src(config.templates)
		.pipe(plumber())
		.pipe(templateCache({
			root: '/',
			standalone: true
		}))
		.pipe(plumber());

	return merge(core, addons, templates)
		.pipe(concat('cli.js'))
		.pipe(gulp.dest('.'))
});


