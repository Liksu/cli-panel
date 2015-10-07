var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var gulpif = require('gulp-if');
var ngAnnotate = require('gulp-ng-annotate');

var ordered_src = [
	'src/cli.js',
	'src/cli.runner.js',
	'src/cli.service.js',
	'src/cli.directive.js',
	'src/preprocessors/argv.js',
	'src/commands/*.js',
	'src/postprocessors/calc.js',
	'src/templates/*.html'
];

gulp.task('build', function() {
	return gulp.src(ordered_src)
		.pipe(gulpif(/[.]js$/, ngAnnotate()))
		.pipe(gulpif(/[.]html$/, templateCache({
			root: '/',
			module: 'cli'
		})))
		.pipe(concat('cli.js', {newLine: '\n\n'}))
		.pipe(gulp.dest('.'))
		.pipe(uglify())
		.pipe(rename('cli.min.js'))
		.pipe(gulp.dest('.'))
});

gulp.task('watch', function(cb) {
	gulp.watch(['./**/*.js', './**/*.html'], ['build']);
	cb();
});
gulp.task('dev', ['build', 'watch']);