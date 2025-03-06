const {series} = require('gulp');
const gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const {src, dest} = require('gulp');


function installDependencies(cb) {
    cb();
}

const formProofEnvironmentApis = {
    local: 'https://bright-api-2n99o.ampt.app/api',
    staging: 'https://splendid-binary-uynxj.ampt.app/api',
    production: 'https://intelligent-src-r12j9.ampt.app/api'
};

function build(apiEnvironment, cb) {
    console.log('Build');
    gulp.src(['node_modules/rrweb/dist/rrweb.js', 'src/formtrace.js', 'src/tfaValidation.js', 'src/saveRecording.js', 'src/blackListPhone.js', 'src/utils/send2faCode.js', "src/utils/validate2faCode.js",
        "src/utils/verifyPhoneBlackListApi.js", "src/utils/saveRecordings.js"])
        .pipe(gp_concat('formtrace-concat.js'))
        .pipe(replace('base_api_value', formProofEnvironmentApis[apiEnvironment]))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('formtrace.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
    cb();
}

function buildStaging(cb) {
    build('staging', cb);
}

function buildProduction(cb) {
    build('production', cb);
}

function buildLocal(cb) {
    build('local', cb);
}


function buildBlackList(cb) {
    console.log('Build')
    gulp.src(['src/blackListPhone.js'])
        .pipe(gp_concat('blackListPhone-concat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('blackListPhone.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
    cb();
}

function watch() {
    gulp.watch(['src/formtrace.js', 'src/tfaValidation.js', 'src/saveRecording.js', 'src/blackListPhone.js', 'src/utils/send2faCode.js', 'src/utils/validate2faCode.js', "src/utils/verifyPhoneBlackListApi.js",
        "src/utils/saveRecordings.js"], buildLocal);
}

function watchBuildBlackList() {
    gulp.watch(['src/blackListPhone.js'], buildBlackList);
}


function replaceTemplate() {
    return src(['src/formtrace.js'])
        .pipe(replace('base_api_value', formProofEnvironmentApis['production']))
        .pipe(dest('build/'));
}

exports.build = build;
exports.buildStaging = buildStaging;
exports.buildProduction = buildProduction;
exports.buildBlackList = buildBlackList;
exports.watch = watch;
exports.watchBuildBlackList = watchBuildBlackList;

exports.default = series(build);
exports.default = series(buildStaging);
exports.default = series(buildProduction);
exports.default = series(buildBlackList);
