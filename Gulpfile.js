var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var gulpif = require('gulp-if');
var header = require('gulp-header');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var css2js = require('gulp-css-to-js');
var clean = require('gulp-clean');
var merge = require('merge-stream');
var size = require('gulp-size');
var jade = require('gulp-jade');
var debug = require('gulp-debug');

var pkg = {pkg: require('./package.json')};
var banner = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @version v<%= pkg.version %>',
	' * @link <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
	''].join('\n');

var srcCode = function() {
	return gulp.src(['src/cli.js', 'src/**/*.js'])
		.pipe(plumber())
        .pipe(size({showFiles: true}))
		.pipe(babel())
};

var srcStyle = function() {
	return gulp.src(['src/**/*.scss', 'src/**/*.css'])
		.pipe(plumber())
        .pipe(size({showFiles: true}))
		.pipe(gulpif(/\.scss$/, sass().on('error', sass.logError)))
		.pipe(css2js())
};

var srcTemplates = function() {
	return gulp.src(['src/**/*.jade', 'src/**/*.html'])
		.pipe(plumber())
		.pipe(size({showFiles: true}))
		.pipe(gulpif(/\.jade$/, jade()))
		.pipe(templateCache({
			root: '',
			templateHeader: '(function(cli){',
			templateBody: '\tcli.addHtml("<%= url %>", "<%= contents %>", "body");',
			templateFooter: '})(window.cli)'
		}))
};

gulp.task('clean', function () {
	return gulp.src('build', {read: false})
		.pipe(clean());
});

gulp.task('default', ['clean'], function () {
	return merge(srcCode(), srcStyle(), srcTemplates())
		.pipe(concat('cli.js', {newLine: '\n\n'}))
		.pipe(header(banner, pkg))
		.pipe(gulp.dest('build'))

		.pipe(uglify({
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		}))
		.pipe(header(banner, pkg))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('build'))
});

gulp.task('watch', ['default'], function(cb) {
	gulp.watch(['src/**/*.*'], ['default']);
	cb();
});

gulp.task('sample', ['default', 'watch'], function(cb) {
	require('gulp-connect').server({
		host: 'localhost',
		port: 9000,
		fallback: 'samples/index.html'
	});
	cb();
});

/* angular
var ngAnnotate = require('gulp-ng-annotate');
*/