/*global require, exports, Buffer */

/**
 * Brackets node domain
 * @module domain
 * @author Martin Zagora
 * @license MIT
 * @modified for use here
 */


(function () {
    "use strict";
    var ChildProcess = require("child_process"),
        domainName = "brackets-dbmodel";

    function fixEOL(str) {
        if (str[str.length - 1] === "\n") {
            str = str.slice(0, -1);
        }
        return str;
    }
    // handler with ChildProcess.exec
    /**
     * Execute command with ChildProcess.exec
     * @param  {String}   directory Directory to execute command from
     * @param  {String}   command   Command
     * @param  {Array}    args      Command arguments
     * @param  {Function} callback  [description]
     */
    function execute(directory, command, args, callback) {
        // http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
        ChildProcess.exec(command + " " + args.join(" "), {
            cwd: directory
        }, function (err, stdout, stderr) {
            callback(err ? fixEOL(stderr) : undefined, err ? undefined : fixEOL(stdout));
        });
    }
    // handler with ChildProcess.spawn
    function join(arr) {
        var result, index = 0,
            length;
        length = arr.reduce(function (l, b) {
            return l + b.length;
        }, 0);
        result = new Buffer(length);
        arr.forEach(function (b) {
            b.copy(result, index);
            index += b.length;
        });
        return fixEOL(result.toString("utf8"));
    }

    function spawn(directory, command, args, callback) {
        // https://github.com/creationix/node-git
        var child = ChildProcess.spawn(command, args, {
            cwd: directory
        });
        var exitCode, stdout = [],
            stderr = [];
        child.stdout.addListener("data", function (text) {
            stdout[stdout.length] = text;
        });
        child.stderr.addListener("data", function (text) {
            stderr[stderr.length] = text;
        });
        child.addListener("exit", function (code) {
            exitCode = code;
        });
        child.addListener("close", function () {
            callback(exitCode > 0 ? join(stderr) : undefined,
                exitCode > 0 ? undefined : join(stdout));
        });
        child.stdin.end();
    }

    /**
     * Initializes the domain.
     * @param {DomainManager} DomainManager for the server
     */
    exports.init = function (DomainManager) {
        if (!DomainManager.hasDomain(domainName)) {
            DomainManager.registerDomain(domainName, {
                major: 0,
                minor: 1
            });
        }

        DomainManager.registerCommand(
            domainName,
            "execute", // command name
            execute, // command handler function
            true, // this command is async
            "Runs a command in a shell and buffers the output.", [
                {
                    name: "directory",
                    type: "string"
                },
                {
                    name: "command",
                    type: "string"
                },
                {
                    name: "args",
                    type: "array"
                }
            ], [{
                name: "stdout",
                type: "string"
            }]
        );

        DomainManager.registerCommand(
            domainName,
            "spawn", // command name
            spawn, // command handler function
            true, // this command is async
            "Launches a new process with the given command.", [
                {
                    name: "directory",
                    type: "string"
                },
                {
                    name: "command",
                    type: "string"
                },
                {
                    name: "args",
                    type: "array"
                }
            ], [{
                name: "stdout",
                type: "string"
            }]
        );
    };

}());