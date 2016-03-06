/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, Mustache, require */

require.config({
    paths: {
        "text": "lib/text",
        "i18n": "lib/i18n"
    },
    locale: brackets.getLocale()
});
define(function (require, exports, module) {
    "use strict";
    var AppInit = brackets.getModule('utils/AppInit'),
        Resizer = brackets.getModule('utils/Resizer'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        FileUtils = brackets.getModule("file/FileUtils"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        CommandManager = brackets.getModule('command/CommandManager');

    var Strings = require('strings'),
        parser = require("parser_utils"),
        panelTemplate = require('text!html/panel.html'),
        toolbarTemplate = require('text!html/toolbar.html');
    var template = null,
        exec = null,
        $icon = $('<a href="#" title="' + Strings.EXTENSION_NAME + '" id="brackets-nginx-icon"></a>');
    var $panel, $iframe, panel, $bodypanel;
    ExtensionUtils.loadStyleSheet(module, 'brackets-nginx.css');
    /*
        function _resizeIframe() {
            if ($iframe) {
                var iframeWidth = panel.$panel.innerWidth();
                $iframe.attr("width", iframeWidth + "px");
            }
        }
        function _loadDoc(doc, isReload) {
            if (doc && $iframe) {
                var docText = doc.getText(),
                    scrollPos = 0,
                    bodyText = "",
                    yamlRegEx = /^-{3}([\w\W]+?)(-{3})/,
                    yamlMatch = yamlRegEx.exec(docText);

                // Parse markdown into HTML
                //bodyText = marked(docText);

                // Show URL in link tooltip
                bodyText = docText.replace(/(href=\"([^\"]*)\")/g, "$1 title=\"$2\"");

                // Convert protocol-relative URLS
                bodyText = bodyText.replace(/src="\/\//g, "src=\"http://");

                if (isReload) {
                    $iframe[0].contentDocument.body.innerHTML = bodyText;
                } else {
                    bodyText = Mustache.render(require('text!html/preview.html'), {
                        baseUrl: window.location.protocol + "//" + FileUtils.getDirectoryPath(doc.file.fullPath),
                        bodyText: bodyText
                    });
                    $iframe.attr("srcdoc", bodyText);
                    // Remove any existing load handlers
                    $iframe.off("load");
                    $iframe.load(function () {
                        // Open external browser when links are clicked
                        // (similar to what brackets.js does - but attached to the iframe's document)
                        //$iframe[0].contentDocument.body.addEventListener("click", _handleLinkClick, true);

                        // Sync scroll position (if needed)
                        if (!isReload) {
                            //_editorScroll();
                        }

                        // Make sure iframe is showing
                        $iframe.show();
                    });
                }
            }
        }
    */
    var nginx_conf = "";
    var nginx = false;
    var nginx_configuration = null;

    function renderHTML(JSObject, property) {
        var $div = $('<div class="property"/>');
        $div.append($('<span>' + property + '</span>'));
        var $input = $("<input/>");
        $div.append($input);
        bind($input, JSObject, property);
        return $div;
    }

    function bind(HTMLObject, JSObject, property) {
        HTMLObject.val(JSObject[property]);
        HTMLObject.on('change', function () {
            JSObject[property] = $(this).val();
            console.log(nginx_configuration);
        });
    }

    function addTab($panel, src) {
        $bodypanel.find('menu').append($('<a>' + src + '</a>'));
        exec("C:\\", "cat", [nginx_conf.replace('nginx.conf', "") + src]).done(function (res) {
            var $panel = $('<div class="panel"/>');
            parser.toJson(res).forEach(function (server) {
                var $server = $('<div class="server"/>');
                $server.append($('<button></button>'));
                $panel.append(renderObject($server, {
                    data: server
                }, 'data'));
            });
            $panel.hide();
            $bodypanel.find('section').append($panel);
            $bodypanel.find(".server *").hide();
            $bodypanel.find(".server button").show();
        });
    }

    function renderObject($panel, JSObject, property) {
        for (var prop in JSObject[property]) {
            switch (typeof JSObject[property][prop]) {
            case "object":
                var $obj = $('<div class="group"><header>' + prop + '</header></div>');
                $panel.append(renderObject($obj, JSObject[property], prop));
                break;
            case "string":
                if (JSObject[property][prop].indexOf(".conf") > -1) {
                    addTab($bodypanel, JSObject[property][prop]);
                } else {
                    $panel.append(renderHTML(JSObject[property], prop));
                }
                break;
            }
        }
        return $panel;
    }
    
    function HTMLize(object) {
        $bodypanel.append($('<section><menu><a class="active">' + Strings.MAIN + '</a></menu></section>'));
        $panel = $('<div class="panel"/>');
        $bodypanel.find('section').append($panel);
        for (var prop in object) {
            switch (typeof object[prop]) {
            case "object":
                var $obj = $('<div class="group"><header>' + prop + '</header></div>');
                $panel.append(renderObject($obj, object, prop));
                break;
            case "string":
                if (object[prop].indexOf(".conf") > -1) {
                    addTab($bodypanel, object[prop]);
                } else {
                    $panel.append(renderHTML(object, prop));
                }
                break;
            default:
                console.log(typeof object[prop]);
                break;
            }

        }

        $bodypanel.on('click', 'a', function () {
            $bodypanel.find('menu a').removeClass("active");
            $(this).addClass("active");
            $bodypanel.find('section .panel').hide(200);
            console.log($bodypanel.find('menu').index(this));
            $bodypanel.find('section .panel').eq($bodypanel.find('menu a').index(this)).show(200);
        });
        $bodypanel.on('click', 'button', function () {
            $(this.parentNode).find("*").toggle(300);
            $(this).show(300);
        });
    }


    AppInit.appReady(function () {
        /*var panelHTML = Mustache.render(panelTemplate, {
            tools: Mustache.render(toolbarTemplate),
            strings: Strings
        });
        panel = WorkspaceManager.createBottomPanel('gerard2perez.dbmodel.panel', $(panelHTML), 100);
        $panel = $('#dbmodel-panel');
        $iframe = $panel.find("#panel-markdown-preview-frame");
        $panel.on("panelResizeUpdate", function (e, newSize) {
            $iframe.attr("height", newSize);
        });
        window.setTimeout(_resizeIframe);


                
        Resizer.show($panel);*/
        require("Node").done(function (command) {
            exec = command.execute;
            command.execute("C:\\", "nginx", ["-t"]).done(function (a, b) {
                nginx = true;

                nginx_conf = a.match(/file (.*) syntax/)[1];


                $icon.click(function () {
                    if (template == null) {
                        template = $(Mustache.render(require('text!html/modal.html'), Strings));
                    }
                    Dialogs.showModalDialogUsingTemplate(template).done(function (result) {
                        if (result == "ok") {
                            fileContent = fileContent.split('\n');
                            var res = [];
                            fileContent.forEach(function (line) {
                                if (line.indexOf("#") > -1) {
                                    res.push(line);
                                }
                            });
                            fileContent = res.join('\n');
                            var hoststring = "";
                            hosts.forEach(function (host) {
                                hoststring += host.join('\t') + '\r\n';
                            });
                            fileContent += "\r\n" + hoststring;
                            file.write(fileContent);
                        }
                    });
                    $bodypanel = $("#nginx_modal .modal-body");
                    $bodypanel.html('');
                    setTimeout(function () {
                        $("#nginx_modal").css({
                            'z-index': 2000
                        });
                    }, 400);
                    command.execute("C:\\", "cat", [nginx_conf]).done(function (res) {
                        nginx_configuration = parser.toJson(res);
                        HTMLize(nginx_configuration);
                    });
                }).appendTo('#main-toolbar .buttons');
                /*
                                nginx_conf = nginx_conf.replace('nginx.conf', "") + "/includes/brackets_servers.conf";
                                command.execute("C:\\", "cat", [nginx_conf]).done(function (res) {
                                    var servers = parser.toJson(res);
                                    servers.forEach(function (server) {
                                        console.log(JSON.stringify(server));
                                    });
                                });
                */
            });
        });
    });
});