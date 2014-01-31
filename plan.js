"use strict";

var defaults = {
	src: "./src",
	dst: "./package"
};

var less = {
	"css/gregory.css": "less/gregory.less"
};

var js = {
	"js/gregory.js": [
		"js/gregory.js"
	]
};


module.exports = {
	defaults: defaults,
	tools : {
		concat: {tasks: js, tools: ["common-js", "uglify"]},
		less: {tasks: less}
	}
};