'use strict';
var request = require('request');
var _ = require('lodash');
var path = require('path');

module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var javascriptSources = [
        'static/javascript/getcloudify.js',
        'static/javascript/directives/**/*.js',
        'static/javascript/controller/**/*.js'
    ];

    grunt.initConfig({

        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'public/style/template.css': 'sass/template.scss'
                }
            }
        },
        clean: {
            all: {
                files: [{
                    src: ['build', 'public', 'content/guide','static/**'],
                    filter: function (filepath) {

                        if ( filepath.indexOf('static') === 0 ) {
                            console.log(filepath);
                            return new RegExp('static/([a-zA-Z]+/)?\\d{1,2}\\.\\d{1,2}\\.\\d{1,2}').test(filepath);
                        }else{
                            return true;
                        }
                    }
                }]
            }
        },
        pkg: require('./package.json'),
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                files: {
                    src: [
                        'static/javascripts/**/*.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            getcloudify: {
                files: {
                    'public/javascript/getcloudify.min.js': ['public/javascript/getcloudify.all.js'],
                    'build/javascript/getcloudify.min.js': ['build/javascript/getcloudify.all.js']
                }
            }
        },
        concat: {
            public: {
                src: javascriptSources,
                dest: 'public/javascript/getcloudify.all.js'
            },
            build: {
                src: javascriptSources,
                dest: 'build/javascript/getcloudify.all.js'
            }
        },
        replace: {
            version: {
                src: ['config.toml'],
                overwrite: true,
                replacements: [{from: /guide= .*/, to: 'guide= "<%= pkg.permalink %>"'}]
            },
            frontmatter:{
                src: ['<%= build.content.root %>/content/guide/*.md'],
                overwrite:true,
                replacements:[
                    {
                        from: /^---$/g, // frontmatter
                        to: '---\n'
                    }
                ]
            },
            tags: {
                src: ['<%= build.content.root %>/content/guide/*.md'],
                overwrite: true,                 // overwrite matched source files
                replacements: [{
                    from: /{%.?summary(.*)%}/g,
                    to: '{{% gsSummary %}}'
                }, {
                    from: /{%.?endsummary(.*)%}/g,
                    to: '{{% /gsSummary %}}'
                }, {
                    from: /{%.?highlight(.*)%}/g,
                    to: '{{< gsHighlight $1 >}}'
                }, {
                    from: /{%.?endhighlight(.*)%}/g,
                    to: '{{< /gsHighlight >}}'
                }, {
                    from: /{%.?note.*title.*=((\s|\w)*)%}/g,
                    to: '{{% gsNote title="$1" %}}'
                }, {
                    from: /{%.?note(.*)%}/g,
                    to: '{{% gsNote %}}'
                }, {
                    from: /{%.?endnote(.*)%}/g,
                    to: '{{% /gsNote %}}'
                }, {
                    from: /{%.?warning.*title.*=((\s|\w)*)%}/g,
                    to: '{{% gsWarning title="$1" %}}'
                }, {
                    from: /{%.?endwarning(.*)%}/g,
                    to: '{{% /gsWarning %}}'
                }, {
                    from: /{%.?tip.*title.*=((\s|\w|-|\?)*)%}/g,
                    to: '{{% gsTip title="$1" %}}'
                }, {
                    from: /{%.?endtip(.*)%}/g,
                    to: '{{% /gsTip %}}'
                }, {
                    from: /{%.?info.*title.*=((\s|\w)*)%}/g,
                    to: '{{% gsInfo title="$1" %}}'
                },  {
                    from: /{%.?info(.*)%}/g,
                    to: '{{% gsInfo %}}'
                }, {
                    from: /{%.?endinfo(.*)%}/g,
                    to: '{{% /gsInfo %}}'
                }, {
                    from: /{%.?togglecloak.*id.*=((\s|\w)*)%}/g,
                    to: '{{% gsToggleCloak id="$1" %}}'
                }, {
                    from: /{%.?endtogglecloak(.*)%}/g,
                    to: '{{% /gsToggleCloak %}}'
                }, {
                    from: /{%.?gcloak ((\s|\w)*)%}/g,
                    to: '{{% gsCloak "$1" %}}'
                }, {
                    from: /{%.?endgcloak(.*)%}/g,
                    to: '{{% /gsCloak %}}'
                },{
                    from: /{%.?inittab(.*)%}/g,
                    to: '{{% gsInitTab %}}'
                },{
                    from: /{%.?endinittab(.*)%}/g,
                    to: '{{% /gsInitTab %}}'
                }, {
                    from: /{%.?tabcontent ((\s|\w)*)%}/g,
                    to: '{{% gsTabContent "$1" %}}'
                },{
                    from: /{%.?endtabcontent(.*)%}/g,
                    to: '{{% /gsTabContent %}}'
                }
                ]
            }
        },

        shell: {
            options: {
                stdout: true
            },
            build: {
                command: 'hugo -d build/ '
            }

        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            watch: {
                tasks: ['watch:sync', 'watch:sass', 'watch:javascript']
            }
        },

        aws_s3: {
            options: {
                accessKeyId: '<%= aws.accessKey %>', // Use the variables
                secretAccessKey: '<%= aws.secretKey %>', // You can also use env variables
                region: '<%= aws.region %>',
                access: 'public-read',
                bucket: '<%= aws.bucket %>',
                uploadConcurrency: 5, // 5 simultaneous uploads
                downloadConcurrency: 5 // 5 simultaneous downloads

            },
            upload: {
                files: [
                    {dest: '', cwd: './build', expand: true, src: ['**'], action: 'upload'}
                ]
            }
        },
        open: {
            devserver: {
                path: 'http://localhost:1313'
            }
        },

        sync: {
            content: {

                files: [
                    {cwd: '<%= build.content.root %>/content', src: ['**'], dest: 'content'},
                    {
                        cwd: '<%= build.content.root %>/static/images',
                        src: ['**'],
                        dest: 'static/images/<%= build.content.version %>'
                    } // includes files in path and its subdirs

                ],
                verbose: true

            }
        },
        watch: {
            options: {
                spawn: false
            },
            sync: {
                files: ['<%= build.content.root %>/content/**'],
                tasks: ['sync:content']
            },
            sass: {
                files: ['sass/**'],
                tasks: ['sass']
            },
            javascript: {
                files: ['static/javascript/**'],
                tasks: ['concat','uglify']
            }
        }
    });

    grunt.registerTask('listAllBranches', function () {
        var done = this.async();
        request({
                headers: {
                    'User-Agent': 'guy-mograbi-at-gigaspaces'
                },
                'method': 'GET',
                'url': 'https://api.github.com/repos/guy-mograbi-at-gigaspaces/getcloudify-hugo-version/branches'
            },
            function (err, result, body) {
                grunt.file.write('build/versions.json', body);
                grunt.file.write('public/versions.json', body);
                done();
            });

    });

    grunt.registerTask('hugoServer', function(){
        var spawn = require('child_process').spawn;
        var server = spawn('hugo' , ['server','--buildDrafts','--watch']);
        server.stdout.on('data', function(data) {
            console.log(data.toString());
        });
        server.stderr.on('data', function(data) {
            console.log(data.toString());
        });
        process.on('exit', function() {
            grunt.log.writeln('killing myserver...');
            server.kill();
            grunt.log.writeln('killed myserver');
        });
    });

    grunt.registerTask('normalizeVersion', function () {
        if (grunt.config.data.build.content && grunt.config.data.build.content.version) {
            grunt.config.data.pkg.version = grunt.config.data.build.content.version;
        }
        if (grunt.config.data.pkg.version === '0.0.0') {
            grunt.log.ok('normalized');
            grunt.config.data.pkg.version = '';
            grunt.config.data.pkg.permalink = '/:filename';
        } else {
            grunt.config.data.pkg.permalink = '/' + grunt.config.data.pkg.version + '/:filename';
            grunt.log.ok('no need to normalize');
        }
        grunt.log.ok('permalink is <%= pkg.permalink%>');
    });

    // since we want the content to come from a different branch
    // we need some configuration as to where that content is.
    grunt.registerTask('readConfiguration', function () {
        var configFile = process.env.CONFIG_JSON || './dev/config.json';
        var b = {content: {}};
        if (grunt.file.exists(configFile)) {
            _.merge(b, grunt.file.readJSON(configFile));
        }
        if (process.env.GETCLOUDIFY_CONTENT_ROOT) {
            b.content.root = process.env.GETCLOUDIFY_CONTENT_ROOT;
        }
        b.content.version = grunt.file.readJSON(path.join(b.content.root, 'package.json')).version;
        grunt.config.data.build = b;
        grunt.log.ok('content configuration is', b.content);
    });

    grunt.registerTask('readS3Keys', function () {
        grunt.config.data.aws = grunt.file.readJSON(process.env.AWS_JSON || './dev/aws.json'); // Read the file
    });

    grunt.registerTask('replaceFrontmatter', ['readConfiguration','replace:frontmatter']);
    grunt.registerTask('replaceAll', ['readConfiguration','replace:tags']);
    grunt.registerTask('syncAll', ['readConfiguration', 'sync:content']);
    grunt.registerTask('cleanAll', ['clean']);
    grunt.registerTask('serve', ['readConfiguration','sync:content','open:devserver','listAllBranches','hugoServer','sass','concat','uglify','concurrent:watch']);
    grunt.registerTask('server', ['serve']);

    grunt.registerTask('replaceVersion', ['normalizeVersion', 'replace:version']);
    grunt.registerTask('build', ['cleanAll', 'readConfiguration', 'sync:content', 'replaceVersion', 'jshint', 'shell:build', 'concat','uglify','listAllBranches']);

    grunt.registerTask('upload', ['readS3Keys', 'aws_s3:upload']);
    grunt.registerTask('default', 'build');
    //grunt.registerTask('deploy', ['shell:deploy']);


};
