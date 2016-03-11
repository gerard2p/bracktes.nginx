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
        dialog = null,
        exec = null,
        tooltip = require("resources/js/bootstrap.min"),
        $icon = $('<a href="#" title="' + Strings.EXTENSION_NAME + '" id="brackets-nginx-icon"></a>');
    var $panel, $iframe, panel, $bodypanel;

    ExtensionUtils.loadStyleSheet(module, 'brackets-nginx.css');
    //ExtensionUtils.loadStyleSheet(module, 'resources/css/bootstrap.min.css');
    ExtensionUtils.loadStyleSheet(module, 'resources/css/font-awesome.min.css');

    var location = ["proxy_pass", "fastcgi_pass", "uwsgi_pass", "scgi_pass", "memcached_pass"];
    var server = ["log_not_found"];
    var nginx_conf = "";
    var nginx = false;
    var nginx_configuration = null;
    var documentation = null;
    var includes = {},
        spawn;

    function renderHTML(JSObject, property) {
        var $div = $('<div class="property"/>');
        $div.append($('<span>' + property + '</span>'));
        var $input = $("<input/>");
        try {
            var directive = documentation.directives[property];
            if ((typeof directive.values) == "string") {
                $input.attr('title', directive.values);
            } else {
                $input.attr('title', directive.values.join(','));
            }
            $input.attr('data-info', directive.tooltip);
            $input.mouseenter(function () {
                $bodypanel.find("#information").html($(this).attr('data-info'));
            });
            //$input.tooltip();
        } catch (e) {
            console.log(property);
        }
        var $remove = $('<button data-id="removeprop" class="fa fa-trash"/>');
        $remove.click(function () {
            delete JSObject[property];
            $div.remove();
        });
        $div.append($input);
        $div.append($remove);
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

    function TABBED() {
        var $tabbed = $('<section data-id="tabpanel" class="panel"><menu></menu></section>');
        $tabbed.on('click', 'a', function (e) {
            if ($(this).hasClass('active')) {
                return false;
            }
            e.stopPropagation();
            $tabbed.find('>menu>a').removeClass("active");
            $(this).addClass("active");
            $tabbed.find('>[data-id=item]').hide(200);
            $tabbed.find('[data-id=item]').eq($tabbed.find('>menu>a').index(this)).show(200);
            return false;
        });
        return $tabbed;
    }
    var commands = {
        win: {
            permission: "icacls C:\ProgramData\chocolatey\lib\nginx\tools\nginx-1.8.0\conf\nginx.conf /q /c /t /grant Usuarios:W",
            read: "type"

        },
        mac: {
            read: "cat"
        }
    }
    var os = "";

    function addTab($main, src) {

        var $tabbed = TABBED();
        $tabbed.attr('data-id', 'item');
        $main.find('menu').append($('<a>' + src.split("/")[1] + '</a>'));
        exec("C:\\", "cat", [nginx_conf.replace('nginx.conf', "") + src]).done(function (res) {
            var JSObject = parser.toJson(res);
            JSObject = JSObject.server instanceof Array ? JSObject.server : [JSObject.server];
            includes[src.split("/")[1]] = JSObject;
            var $panel = $('<div class="server"  />');
            JSObject.forEach(function (server) {
                var $server = $('<div class="server" data-context="server" data-id="item"/>');
                $tabbed.append(renderObject($server, server));
                $tabbed.find(">menu").append($("<a>Server" + $tabbed.find(">menu>a").length + "</a>"));
            });
            $main.find('section').append($tabbed);
            $tabbed.find('>menu>a').eq(0).addClass('active');
            $tabbed.find('>[data-id=item]').hide();
            $tabbed.find('>[data-id=item]').eq(0).show();
            $tabbed.hide();
            $tabbed.find('>menu>a').append($('<button class="fa fa-trash removeServer"/>'));
            $tabbed.on('click', '.removeServer', function (e) {
                e.stopPropagation();
                var index = $tabbed.find('>menu>a .removeServer').index(this);
                $tabbed.find('>menu>a').eq(index).remove();
                $tabbed.find('>div').eq(index).remove();
                delete JSObject[index];
                $tabbed.find('>menu>a').eq(0).trigger('click');
                return false;
            });
        });
    }

    function renderArray($panel, JSObject) {
        renderMenuArray($panel, JSObject);
        for (var prop in JSObject) {
            switch (typeof JSObject[prop]) {
            case "object":
                $panel.append(renderObject($panel, JSObject[prop]));
                break;
            case "string":
                if (JSObject[prop].indexOf(".conf") > -1) {
                    addTab($bodypanel, JSObject[prop]);
                }
                $panel.append(renderHTML(JSObject, prop));
                break;
            }
        }
        return $panel;
    }

    function renderObject($panel, JSObject) {
        renderMenuOptionsFor($panel, JSObject);
        for (var prop in JSObject) {
            switch (typeof JSObject[prop]) {
            case "object":
                var $obj = $('<div class="group" ><header>' + prop + '</header></div>');
                $obj.attr('data-context', prop);
                if (JSObject[prop].__data != undefined) {
                    $obj.append(renderHTML(JSObject[prop], "@name"));
                    $panel.append(renderObject($obj, JSObject[prop].__data));
                } else if (JSObject[prop] instanceof Array) {
                    $panel.append(renderArray($obj, JSObject[prop]));
                } else {
                    $panel.append(renderObject($obj, JSObject[prop]));
                }

                break;
            case "string":
                if (JSObject[prop].indexOf(".conf") > -1) {
                    addTab($bodypanel, JSObject[prop]);
                } else {
                    $panel.append(renderHTML(JSObject, prop));
                }
                break;
            }
        }
        return $panel;
    }

    function contains(Object, prop) {
        for (var p in Object) {
            if (p == prop) {
                return true;
            }
        }
        return false;
    }

    function renderMenuArray($panel, JSObject) {
        var $menu = $('<nav class="newproperties"/>');
        $menu.append('<button data-id="add" class="fa fa-plus-square"/>');
        $menu.on('click', '[data-id=add]', function () {
            JSObject.push("");
            $panel.append(renderHTML(JSObject, JSObject.length - 1));
        });
        $panel.append($menu);
    }

    function renderMenuOptionsFor($panel, JSObject) {
        var $menu = $('<nav class="newproperties"/>');
        $menu.append('<button data-id="add" class="fa fa-plus-square"/>');
        $menu.on('click', '[data-id=add]', function () {
            var $div = $('<div class="property"/>');
            //$combo=$('<span>' + property + '</span>');
            var $combo = $('<select>');
            for (var directiveName in documentation.byContext[$panel.attr('data-context')]) {
                //.forEach(function(directive){
                if (!contains(JSObject, directiveName)) {
                    $combo.append($('<option value="' + directiveName + '">' + directiveName + '</option>'));
                }
            }
            $combo.change(function () {
                JSObject[$(this).val()] = "";
                $panel.append(renderHTML(JSObject, $(this).val()));
                $div.remove();
            });
            $div.append($combo);
            var $input = $("<input/>");
            $div.append($input);
            $panel.append($div);
            //bind($input, JSObject, property);
        });
        $panel.append($menu);
    }

    function HTMLize(object) {
        var $tab = TABBED();
        $tab.find('menu').html('<a class="active">' + Strings.MAIN + '</a>');
        $bodypanel.append($tab);
        $panel = $('<div class="panel" data-context="main" data-id="item" data-source="nginx.conf"/>');
        $panel.html('<textarea>' + object + '</textarea>');
        object.match(/include(.*\.conf)/igm).forEach(function (include) {
            var src = include.replace(/include(.*\.conf)/igm, "$1").trim();

            $bodypanel.find('menu').append($('<a>' + src.split("/")[1] + '</a>'));
            exec("C:\\", "cat", [nginx_conf.replace('nginx.conf', "") + src]).done(function (res) {
                var $page = $('<div class="panel" data-context="main" data-id="item" data-source="' + src + '"/>');
                $page.html('<textarea>' + res + '</textarea>');
                $tab.append($page);
                $page.hide();
            });
        });
        $tab.append($panel);
        //renderObject($panel, object);

        $tab.find('>[data-id=item]').hide();
        $tab.find('>[data-id=item]').eq(0).show();

        //$bodypanel.append($("<div id='information'/>"));
        $bodypanel.on('click', 'button', function () {
            $(this.parentNode).find(">*").toggle(300);
            $(this).show(350);
        });
    }

    AppInit.appReady(function () {
        require("Node").done(function (command) {
            exec = command.execute;
            spawn = command.spawn;
            exec("", "nginx", ["-t"]).done(function (a, b) {
                nginx = true;
                try {
                    nginx_conf = a.match(/file (.*)nginx.conf test is successful/)[1];
                } catch (e) {
                    alert(a);
                    return;
                }
                var getdata = $.Deferred();
                exec("", "type", [nginx_conf.replace(/\//igm, "\\") + "nginx.conf"]).done(function (res) {
                    nginx_conf = nginx_conf.replace(/\//igm, "\\");
                    os = commands.win;
                    getdata.resolve(res);
                }).fail(function () {
                    return exec("", "cat", [nginx_conf + "nginx.conf"]).done(function (res) {
                        os = commands.mac;
                        getdata.resolve(res);
                    }).fail(function (err) {
                        getdata.reject(err);
                    });
                });
                getdata.done(function (res) {
                    var getdata = $.Deferred();
                    exec("", "echo", [res, '>', nginx_conf + "nginx.conf"]).done(function () {
                        nginx_configuration = res;
                        /*var servers = [];
                        nginx_configuration = parser.toJson(res, servers);
                        if (servers.length > 0) {
                            var main_conf = parser.toConf(nginx_configuration);
                            includes["main.conf"] = servers;
                            var inc = {};
                            var _inc = "";
                            for (var include in includes) {
                                _inc += "include\tincludes/" + include + ";\n";
                                inc[include] = "";
                                includes[include].forEach(function (server) {
                                    inc[include] += "server {\n" + parser.toConf(server, "\t") + "}\n";
                                });
                            }
                            main_conf = main_conf.replace(/includes_goes_here\n/igm, _inc);
                            console.log(parser.toConf(nginx_configuration));
                        }*/
                    }).fail(function (err) {
                        alert(err);
                    });
                    //HTMLize(nginx_configuration);
                }).fail(function (err) {
                    alert(err);
                });
                $icon.click(function () {
                    if (template == null) {
                        template = $(Mustache.render(require('text!html/modal.html'), Strings));
                        documentation = require("documentation");
                    }

                    exec("", os.read, [nginx_conf + "nginx.conf"]).done(function (res) {
                        nginx_configuration = res;
                        dialog = Dialogs.showModalDialogUsingTemplate(template);
                        dialog.done(function (result) {
                            if (result == "ok") {
                                template.find("[data-source]").each(function () {
                                    var src = $(this).attr('data-source');
                                    var text = $(this).find('textarea').val();
                                    text = '"' + text.replace(/\n/igm, "\\r\\n").replace(/""/igm, "\"").replace(/\$/igm, "\\$") + '"';
                                    exec("", "printf", [text, '>', nginx_conf + src]).done(function (data) {
                                        exec("", "nginx", ["-t"]).done(function (data) {
                                            exec("", "nginx", ["-s","reload"]).done(function (data) {});
                                        });
                                    }).fail(function (err) {
                                        alert(err);
                                    });
                                });
                            }
                        });
                        $bodypanel = $("#nginx_modal .modal-body");
                        $bodypanel.html('');
                        HTMLize(nginx_configuration);
                    }).fail(function (err) {
                        alert(err);
                    });
                    //$textblock='<textarea>'+nginx_configuration+'</textarea>';
                    //$bodypanel
                    template.find('[name=test]').click(function () {
                        exec("", "nginx", ["-t"]).always(function (a) {
                            a.split('\n').forEach(function (line) {
                                alert(line);
                            });
                        });
                    });
                    template.find('[name=start]').click(function () {
                        exec("", "nginx", ["-s stop"]).always(function (b) {
                            $icon.addClass('active');
                            exec("", "nginx", [""]).always(function (a) {
                                $icon.removeClass('active');
                            });
                        });

                    });
                    template.find('[name=stop]').click(function () {
                        exec("", "nginx", ["-s stop"]).always(function () {
                            $icon.removeClass('active');
                        });

                    });
                    setTimeout(function () {
                        $("#nginx_modal").css({
                            'z-index': 2000
                        });
                    }, 400);
                }).appendTo('#main-toolbar .buttons');

                $icon.addClass('active');
                exec("", "nginx", ["-s", "reload"]).done(function (res) {
                    if (res.indexOf("error") > -1) {
                        exec("", "nginx", []).always(function (res) {
                            $icon.removeClass('active');
                        });
                    }
                });
            });
        });
    });
});
