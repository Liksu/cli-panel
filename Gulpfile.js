var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var gulpif = require('gulp-if');
var ngAnnotate = require('gulp-ng-annotate');
var header = require('gulp-header');

var pkg = {pkg: require('./package.json')};
var banner = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @version v<%= pkg.version %>',
	' * @link <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
	''].join('\n');

gulp.task('build', function() {
	var ordered_src = [
		'src/cli.js',
		'src/templates/*.html'
	];

	return gulp.src(ordered_src)
		.pipe(gulpif(/[.]html$/, templateCache({
			root: '',
			templateHeader: '(function(cli){',
			templateBody: 'cli.addHtml("<%= url %>","<%= contents %>","body");',
			templateFooter: '})(window.cli)'
		})))
		.pipe(concat('cli.js', {newLine: '\n\n'}))
		.pipe(header(banner, pkg))
		.pipe(gulp.dest('build'))
		.pipe(uglify())
		.pipe(header(banner, pkg))
		.pipe(rename('cli.min.js'))
		.pipe(gulp.dest('build'))
});

gulp.task('watch', ['build'], function(cb) {
	gulp.watch(['./**/*.js', './**/*.html'], ['build']);
	cb();
});

gulp.task('build angular', function() {
	var ordered_src = [
		'wrappers/angular/cli.js',
		'wrappers/angular/cli.runner.js',
		'wrappers/angular/cli.service.js',
		'wrappers/angular/cli.directive.js',
		'src/preprocessors/argv.js',
		'src/commands/*.js',
		'src/postprocessors/calc.js',
		'src/templates/*.html'
	];

	return gulp.src(ordered_src)
		.pipe(gulpif(/[.]js$/, ngAnnotate()))
		.pipe(gulpif(/[.]html$/, templateCache({
			root: '/',
			module: 'cli'
		})))
		.pipe(concat('cli-angular.js', {newLine: '\n\n'}))
		.pipe(gulp.dest('build'))
		.pipe(uglify())
		.pipe(rename('cli-angular.min.js'))
		.pipe(gulp.dest('build'))
});