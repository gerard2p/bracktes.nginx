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
        CommandManager = brackets.getModule('command/CommandManager');
    var Strings = require('strings'),
        panelTemplate = require('text!html/panel.html'),
        toolbarTemplate = require('text!html/toolbar.html');
    var $icon = $('<a href="#" title="' + Strings.EXTENSION_NAME + '" id="brackets-dbmodel-icon"></a>');
    var $panel, $iframe, panel;
    ExtensionUtils.loadStyleSheet(module, 'brackets-dbmodel.css');

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
                // Make <base> tag for relative URLS

                // Assemble the HTML source
                /*var htmlSource = _.template(previewHTML)({
                    baseUrl: baseUrl,
                    themeUrl: require.toUrl("./themes/" + _prefs.get("theme") + ".css"),
                    scrollTop: scrollPos,
                    bodyText: bodyText
                });*/
                //$iframe.attr("srcdoc", htmlSource);
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

    AppInit.appReady(function () {
        var panelHTML = Mustache.render(panelTemplate, {
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


        $icon.click(function () {
            _loadDoc(DocumentManager.getCurrentDocument());
        }).appendTo('#main-toolbar .buttons');
        Resizer.show($panel);

    });

    WorkspaceManager.on("workspaceUpdateLayout", _resizeIframe);
    $("#sidebar").on("panelCollapsed panelExpanded panelResizeUpdate", _resizeIframe);
    // Function to run when the menu item is clicked
    //CommandManager.register(Strings.MENU_COMMAND, "brackets.dbmodel.show", handleHelloWorld);

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    //var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    //menu.addMenuItem("brackets.hosts.show");

    // We could also add a key binding at the same time:
    //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-W");
    // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)
});