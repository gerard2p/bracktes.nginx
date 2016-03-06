/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, Mustache */
define(function (require, exports, module) {
    'use strict';

    function parseServe(servers) {
        servers = servers
            .replace(/.?server {/igm, "\nserver {")
            .replace(/\$ +/igm, "$")
            .replace(/\$+/igm, "$")
            .replace(/\$server {/igm, "\nserver{\n")
            .replace(/\$([^ ;\$]*)( [^;\$]*)( [^ ;\$]*);/igm, "\"$1\":[\"$2\",\"$3\"],")
            .replace(/\$([^ ;\$]*) ([^ ;\$]*);/igm, "\"$1\":\"$2\",")
            .replace(/\$([^ ;\$]*) ([^{]*) {([^{]*)}/igm, "\"$1\":{\"__path\":\"$2\",\"__data\":{$3}},")
            .replace(/,\$/img, "")
            .replace(/server{/igm, "{")
            .replace(/\$/igm, "")
            .replace(/server/gim,"");
        servers = ("[" + servers + "]").replace(/,.?\]/img, "]");
        return servers;
    }

    function parse(text, regex, replace) {
        text = text.replace(regex, replace);
        return text;
    }

    function json(rawtext) {
        rawtext = rawtext
            .replace(/\t/igm, " ")
            .replace(/\r\n/igm, "\n")
            .replace(/ +/igm, " ")
            .replace(/#.*/igm, "")
            .replace(/[^\w\d{}=\-; /\.]/igm, "$")
            .replace(/(\$ ?)+/igm, "$")
        if (rawtext.indexOf("brackets_servers") > -1) {
            rawtext = parse(rawtext
                .replace(/^\$/, "")
                .replace(/\$$/, ""), /#.*/igm, "");
            rawtext = parse(rawtext, /\$/igm, "\n");
            rawtext = parse(rawtext, /([^ {}\n]*) ([^ ;{}]*);?\n/ig, "\"$1\":\"$2\",\n");
            rawtext = parse(rawtext, /([^ \n]*) {\n/ig, "\"$1\":{\n");
            rawtext = parse(rawtext, /}/ig, "},");
            rawtext = "{\n" + rawtext + "\n}";
            rawtext = parse(rawtext, /,[ \t\r\n]+}/ig, "}");
        } else {
            rawtext = parseServe(rawtext);
        }
        return JSON.parse(rawtext);
    }

    function conf(json) {
        return "";
    }
    return {
        toJson: json,
        toConf: conf
    }
});