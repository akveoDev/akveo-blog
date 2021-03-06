var packages = require('../../../package.json'),
    path = require('path'),
    crypto = require('crypto'),
    fs = require('fs'),
    mode = process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV,
    appRoot = path.resolve(__dirname, '../../../'),
    configFilePath = process.env.GHOST_CONFIG || path.join(appRoot, 'config.js'),
    checks;

checks = {
    check: function check() {
        this.nodeVersion();
        this.nodeEnv();
        this.packages();
        this.contentPath();
        this.sqlite();
    },

    // Make sure the node version is supported
    nodeVersion: function checkNodeVersion() {
        // Tell users if their node version is not supported, and exit
        var semver = require('semver');

        if (process.env.GHOST_NODE_VERSION_CHECK !== 'false' &&
            !semver.satisfies(process.versions.node, packages.engines.node) &&
            !semver.satisfies(process.versions.node, packages.engines.iojs)) {
            console.error('\x1B[31mERROR: Unsupported version of Node');
            console.error('\x1B[31mGhost needs Node version ' + packages.engines.node +
                          ' you are using version ' + process.versions.node + '\033[0m\n');
            console.error('\x1B[32mPlease go to http://nodejs.org to get a supported version or set GHOST_NODE_VERSION_CHECK=false\033[0m');

            process.exit(1);
        }
    },

    nodeEnv: function checkNodeEnvState() {
        // Check if config path resolves, if not check for NODE_ENV in config.example.js prior to copy
        var fd,
            configFile,
            config;

        try {
            fd = fs.openSync(configFilePath, 'r');
            fs.closeSync(fd);
        } catch (e) {
            configFilePath = path.join(appRoot, 'config.example.js');
        }

        configFile = require(configFilePath);
        config = configFile[mode];

        if (!config) {
            console.error('\x1B[31mERROR: Cannot find the configuration for the current NODE_ENV: ' +
                            process.env.NODE_ENV + '\033[0m\n');
            console.error('\x1B[32mEnsure your config.js has a section for the current NODE_ENV value' +
                            ' and is formatted properly.\033[0m');

            process.exit(1);
        }
    },

    // Make sure package.json dependencies have been installed.
    packages: function checkPackages() {
        if (mode !== 'production' && mode !== 'development') {
            return;
        }

        var errors = [];

        Object.keys(packages.dependencies).forEach(function (p) {
            try {
                require.resolve(p);
            } catch (e) {
                errors.push(e.message);
            }
        });

        if (!errors.length) {
            return;
        }

        errors = errors.join('\n  ');

        console.error('\x1B[31mERROR: Ghost is unable to start due to missing dependencies:\033[0m\n  ' + errors);
        console.error('\x1B[32m\nPlease run `npm install --production` and try starting Ghost again.');
        console.error('\x1B[32mHelp and documentation can be found at http://support.ghost.org.\033[0m\n');

        process.exit(1);
    },

    // Check content path permissions
    contentPath: function checkContentPaths() {
        if (mode !== 'production' && mode !== 'development') {
            return;
        }

        var configFile,
            config,
            contentPath,
            contentSubPaths = ['apps', 'data', 'images', 'themes'],
            fd,
            errorHeader = '\x1B[31mERROR: Unable to access Ghost\'s content path:\033[0m',
            errorHelp = '\x1B[32mCheck that the content path exists and file system permissions are correct.' +
                '\nHelp and documentation can be found at http://support.ghost.org.\033[0m';

        // Get the content path to test.  If it's defined in config.js use that, if not use the default
        try {
            configFile = require(configFilePath);
            config = configFile[mode];

            if (config && config.paths && config.paths.contentPath) {
                contentPath = config.paths.contentPath;
            } else {
                contentPath = path.join(appRoot, 'content');
            }
        } catch (e) {
            // If config.js doesn't exist yet, check the default content path location
            contentPath = path.join(appRoot, 'content');
        }

        // Use all sync io calls so that we stay in this function until all checks are complete

        // Check the root content path
        try {
            fd = fs.openSync(contentPath, 'r');
            fs.closeSync(fd);
        } catch (e) {
            console.error(errorHeader);
            console.error('  ' + e.message);
            console.error('\n' + errorHelp);

            process.exit(1);
        }

        // Check each of the content path subdirectories
        try {
            contentSubPaths.forEach(function (sub) {
                var dir = path.join(contentPath, sub),
                    randomFile = path.join(dir, crypto.randomBytes(8).toString('hex'));

                fd = fs.openSync(dir, 'r');
                fs.closeSync(fd);

                // Check write access to directory by attempting to create a random file
                fd = fs.openSync(randomFile, 'wx+');
                fs.closeSync(fd);
                fs.unlinkSync(randomFile);
            });
        } catch (e) {
            console.error(errorHeader);
            console.error('  ' + e.message);
            console.error('\n' + errorHelp);

            process.exit(1);
        }
    },

    // Make sure sqlite3 database is available for read/write
    sqlite: function checkSqlite() {
        if (mode !== 'production' && mode !== 'development') {
            return;
        }

        var configFile,
            config,
            appRoot = path.resolve(__dirname, '../../../'),
            dbPath,
            fd;

        try {
            configFile = require(configFilePath);
            config = configFile[mode];

            // Abort check if database type is not sqlite3
            if (config && config.database && config.database.client !== 'sqlite3') {
                return;
            }

            if (config && config.database && config.database.connection) {
                dbPath = config.database.connection.filename;
            }
        } catch (e) {
            // If config.js doesn't exist, use the default path
            dbPath = path.join(appRoot, 'content', 'data', mode === 'production' ? 'ghost.db' : 'ghost-dev.db');
        }

        // Check for read/write access on sqlite db file
        try {
            fd = fs.openSync(dbPath, 'r+');
            fs.closeSync(fd);
        } catch (e) {
            // Database file not existing is not an error as sqlite will create it.
            if (e.code === 'ENOENT') {
                return;
            }

            console.error('\x1B[31mERROR: Unable to open sqlite3 database file for read/write\033[0m');
            console.error('  ' + e.message);
            console.error('\n\x1B[32mCheck that the sqlite3 database file permissions allow read and write access.');
            console.error('Help and documentation can be found at http://support.ghost.org.\033[0m');

            process.exit(1);
        }
    }
};

module.exports = checks;
