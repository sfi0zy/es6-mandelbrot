"use strict";

module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "dist/index.html": "src/index.html"
                }
            }
        },
        
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    "dist/app-style.min.css": ["src/app-style.css"]
                }
            }
        },
        
        babel: {
            dist: {
                files: {
                    "tmp/mandelbrot.js": "src/mandelbrot.js",
                    "tmp/app.js": "src/app.js"
                }
            }
        },
        
        uglify: {
            dist: {
                files: {
                    "dist/mandelbrot.min.js": ["tmp/mandelbrot.js"],
                    "dist/app.min.js": ["tmp/app.js"]
                }
            }
        },
        
        clean: ["tmp", "dist"]
    });

    grunt.registerTask("default", ["htmlmin", "cssmin", "babel", "uglify"]);
};