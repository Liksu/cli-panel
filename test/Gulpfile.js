var gulp = require('gulp');

gulp.task('server', function(cb) {
	require('gulp-connect').server({
		root: '..',
		host: 'localhost',
		port: 4242,
		fallback: 'index.html'
	});
	cb();
});