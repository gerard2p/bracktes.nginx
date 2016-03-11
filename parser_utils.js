/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, Mustache */
define(function (require, exports, module) {
    'use strict';

    function deep(elements) {
        var root = {};
        var current = null;
        if (elements[0].indexOf(":") > -1) {
            current = elements[0].split('"')[1];
            root[current] = {};
            current = root[current];
        } else {
            current = root;
        }
        delete elements[0];
        var opened = 1;
        var closed = 0;
        var depper = [];
        var justC = false;
        elements.forEach(function (line) {
            if (line.indexOf("{") > -1) opened++;
            if (line.indexOf("}") > -1) {
                closed++;
                justC = opened==closed+1;
            }
            if (opened - closed == 1 && !justC) {
                line = line.replace(/"([^"]*)".*:.*"([^"]*)",?/, "$1\":\"$2").split("\":\"");
                if (current[line[0]] == undefined) {
                    current[line[0]] = line[1];
                } else {
                    if (!(current[line[0]] instanceof Array)) {
                        current[line[0]] = [current[line[0]]];
                    }
                    current[line[0]].push(line[1]);
                }
            } else {
                depper.push(line);
            }

            if (justC && depper.length > 2) {
                var ctx = deep(depper);
                for (var ct in ctx) {
                    current[ct] = ctx[ct];
                }
                depper = [];
                justC = false;
            }
        });
        return root;
    }

    function someparser(jsonString) {
        var result = {};
        jsonString = jsonString.replace(/{|,/igm, "$&\n")
            .replace(/\t/igm, "")
            .replace(/}/igm, "\n}")
            //.replace(/}}/igm, "}\n}")
            //.replace(/"}/igm, "\"\n}")
            .split('\n');

        result = deep(jsonString);

        return result;
    }

    function parse(text, regex, replace) {
        text = text.replace(regex, replace);
        return text;
    }

    function json(rawtext, servers) {
        rawtext = rawtext
            .replace(/\t/igm, " ")
            .replace(/\r\n/igm, "\n")
            .replace(/ +/igm, " ")
            .replace(/#.*/igm, "")
            .replace(/[^\w\d{}=\-; /\.]/igm, "$")
            .replace(/(\$ ?)+/igm, "$").replace(/^\$/, "")
            .replace(/\$$/, "").replace(/\$/igm, "\n");

        rawtext = parse(rawtext, /^server {/igm, "$server{");
        rawtext = parse(rawtext, /^([^ ;\n]*) ([^{\n]*) {\n([^{}]*)\n}/igm, "\"$1\":\t{\"@name\":\"$2\",\"__data\":{\n$3\n}\n\t},");
        var serversinman = rawtext.match(/\$server{[^\$]*/igm);
        if (serversinman != null && serversinman.length > 1 && rawtext.indexOf("brackets_servers") > -1) {
            serversinman.forEach(function (server) {
                var open = 0;
                var closed = 0;
                var index = 0;
                for (var _c in server) {
                    if (server[_c] == "{") open++;
                    if (server[_c] == "}") closed++;
                    index++;
                    if (open == closed && open > 0) {
                        break;
                    }
                }
                var actualserver = server.substr(0, index);
                rawtext = rawtext.replace(actualserver, "");
                actualserver = parse(actualserver, /^([^ ;\n]*) ([^;{\n]*);/igm, "\"$1\":\"$2\",");
                actualserver = parse(actualserver, /^([^ {\n]*) ?{\n/igm, "\"$1\":{\n");
                actualserver = parse(actualserver, /\$server/igm, "server");
                actualserver = parse(actualserver, /""/igm, "\"");
                actualserver = parse(actualserver, /\n/igm, "");
                actualserver = parse(actualserver, /,(}|\])/igm, "$1");
                actualserver = parse(actualserver, /}"/igm, "},\"");
                servers.push(JSON.parse("{" + actualserver + "}").server);
            });
        }
        //rawtext = parse(rawtext, /^([^ ;\n]*) ([^{\n]*) {\n([^{}]*)\n}/igm, "\"$1\":\t{\"@name\":\"$2\",\"__data\":{\n$3\n}\n\t},");
        rawtext = parse(rawtext, /^([^ ;\n]*) ([^;{\n]*);/igm, "\"$1\":\"$2\",");
        rawtext = parse(rawtext, /^([^ {\n]*) ?{\n/igm, "\"$1\":{\n");
        if (rawtext.indexOf("brackets_servers") > -1) {
            rawtext = ("{" + rawtext + "}");
        } else {
            rawtext = parse(rawtext, /\$server/igm, "server");
            rawtext = parse(rawtext, /}\n{/igm, "},{");
            rawtext = ("{" + rawtext + "}");
        }
        rawtext = rawtext.replace(/\n/igm, "").replace(/""/igm, "\"").replace(/,(}|\])/igm, "$1").replace(/}"/igm, "},\"");
        return someparser(rawtext.replace(/" /igm, '"'));
    }

    function conf(json, ident) {
        ident = ident == undefined ? "" : ident;
        var text = "";
        for (var prop in json) {
            switch (typeof json[prop]) {
            case "string":
                text += ident + prop + "\t" + json[prop] + ";\n";
                break;
            case "object":
                text += ident + prop + " " + (json[prop]["@name"] == undefined ? "" : json[prop]["@name"]) + " {\n";
                delete json[prop]["@name"];
                if (prop == "http") {
                    text += ident + "\tincludes_goes_here\n";
                } else {
                    json[prop] = json[prop].__data == undefined ? json[prop] : json[prop].__data;
                    text += conf(json[prop], ident + "\t");

                }
                text += ident + "}\n";
            }
        }
        return text;
    }
    return {
        toJson: json,
        toConf: conf
    }
});
