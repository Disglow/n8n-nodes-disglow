const { src, dest } = require('gulp');

const iconsBuild = () => {
	return src('nodes/**/*.svg')
		.pipe(dest('dist/nodes/'));
};

const credentialIconsBuild = () => {
	return src('credentials/**/*.svg')
		.pipe(dest('dist/credentials/'));
};

exports.build = exports.default = () => {
	return Promise.all([
		iconsBuild(),
		credentialIconsBuild()
	]);
};

exports['build:icons'] = exports.build;