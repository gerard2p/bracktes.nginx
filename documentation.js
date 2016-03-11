/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, Mustache */
define(function (require, exports, module) {
    'use strict';
    var directives = {
        "xml_entities": {
            "values": "path",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Specifies the DTD file that declares character entities.This file is compiled at the configuration stage.For technical reasons, the module is unable to use theexternal subset declared in the processed XML, so it isignored and a specially defined file is used instead.This file should not describe the XML structure.It is enough to declare just the required character entities, for example:</p> <blockquote class=\"example\"><pre>&lt;!ENTITY nbsp \"&amp;#xa0;\"&gt;</pre></blockquote><p> </p>"
        },
        "xslt_last_modified": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows preserving the “Last-Modified” header fieldfrom the original response during XSLT transformationsto facilitate response caching.</p><p>By default, the header field is removed as contents of the responseare modified during transformations and may contain dynamically generatedelements or parts that are changed independently of the original response.</p>"
        },
        "xslt_param": {
            "values": "parameter value",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines the parameters for XSLT stylesheets.The <code><i>value</i></code> is treated as an XPath expression.The <code><i>value</i></code> can contain variables.To pass a string value to a stylesheet,the  directive can be used.</p><p>There could be several <code>xslt_param</code> directives.These directives are inherited from the previous level if andonly if there are no<code>xslt_param</code> and directives defined on the current level.</p>"
        },
        "xslt_string_param": {
            "values": "parameter value",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines the string parameters for XSLT stylesheets.XPath expressions in the <code><i>value</i></code> are not interpreted.The <code><i>value</i></code> can contain variables.</p><p>There could be several <code>xslt_string_param</code> directives.These directives are inherited from the previous level if andonly if there are no and <code>xslt_string_param</code>directives defined on the current level.</p>"
        },
        "xslt_stylesheet": {
            "values": "stylesheet [parameter=value ...]",
            "default": "",
            "context": ["location"],
            "isIn": isIn,
            "tooltip": "<p>Defines the XSLT stylesheet and its optional parameters.A stylesheet is compiled at the configuration stage.</p><p>Parameters can either be specified separately, or grouped in asingle line using the “<code>:</code>” delimiter.If a parameter includes the “<code>:</code>” character,it should be escaped as “<code>%3A</code>”.Also, <code>libxslt</code> requires to enclose parametersthat contain non-alphanumeric characters into single or double quotes,for example:</p> <blockquote class=\"example\"><pre>param1='http%3A//www.example.com':param2=value2</pre></blockquote><p> </p><p>The parameters description can contain variables, for example,the whole line of parameters can be taken from a single variable:</p> <blockquote class=\"example\"><pre>location / {    xslt_stylesheet /site/xslt/one.xslt                    $arg_xslt_params                    param1='$value1':param2=value2                    param3=value3;}</pre></blockquote><p> </p><p>It is possible to specify several stylesheets.They will be applied sequentially in the specified order.</p>__end"
        },
        "uwsgi_bind": {
            "values": ["address", "off"],
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Makes outgoing connections to a uwsgi server originatefrom the specified local IP <code><i>address</i></code>.Parameter value can contain variables (1.3.12).The special value <code>off</code> (1.3.12) cancels the effectof the <code>uwsgi_bind</code> directiveinherited from the previous configuration level, which allows thesystem to auto-assign the local IP address.</p>"
        },
        "uwsgi_buffer_size": {
            "values": "size",
            "default": "4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>size</i></code> of the buffer used for reading the first partof the response received from the uwsgi server.This part usually contains a small response header.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.It can be made smaller, however.</p>"
        },
        "uwsgi_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of responses from the uwsgi server.</p><p>When buffering is enabled, nginx receives a response from the uwsgi serveras soon as possible, saving it into the buffers set by the and  directives.If the whole response does not fit into memory, a part of it can be savedto a  on the disk.Writing to temporary files is controlled by the and directives.</p><p>When buffering is disabled, the response is passed to a client synchronously,immediately as it is received.nginx will not try to read the whole response from the uwsgi server.The maximum size of the data that nginx can receive from the serverat a time is set by the  directive.</p><p>Buffering can also be enabled or disabled by passing“<code>yes</code>” or “<code>no</code>” in the“X-Accel-Buffering” response header field.This capability can be disabled using the directive.</p>"
        },
        "uwsgi_buffers": {
            "values": "number size",
            "default": "8 4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> and <code><i>size</i></code> of thebuffers used for reading a response from the uwsgi server,for a single connection.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.</p>"
        },
        "uwsgi_busy_buffers_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the uwsgiserver is enabled, limits the total <code><i>size</i></code> of buffers thatcan be busy sending a response to the client while the response is notyet fully read.In the meantime, the rest of the buffers can be used for reading the responseand, if needed, buffering part of the response to a temporary file.By default, <code><i>size</i></code> is limited by the size of two buffers set by the and  directives.</p>"
        },
        "uwsgi_cache": {
            "values": ["zone", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a shared memory zone used for caching.The same zone can be used in several places.Parameter value can contain variables (1.7.9).The <code>off</code> parameter disables caching inheritedfrom the previous configuration level.</p>"
        },
        "uwsgi_cache_bypass": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be taken from a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be taken from the cache:</p> <blockquote class=\"example\"><pre>uwsgi_cache_bypass $cookie_nocache $arg_nocache$arg_comment;uwsgi_cache_bypass $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "uwsgi_cache_key": {
            "values": "string",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a key for caching, for example</p> <blockquote class=\"example\"><pre>uwsgi_cache_key localhost:9000$request_uri;</pre></blockquote><p> </p>"
        },
        "uwsgi_cache_lock": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When enabled, only one request at a time will be allowed to populatea new cache element identified according to the directive by passing a request to a uwsgi server.Other requests of the same cache element will either waitfor a response to appear in the cache or the cache lock forthis element to be released, up to the time set by the directive.</p>"
        },
        "uwsgi_cache_lock_age": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the last request passed to the uwsgi serverfor populating a new cache elementhas not completed for the specified <code><i>time</i></code>,one more request may be passed to the uwsgi server.</p>"
        },
        "uwsgi_cache_lock_timeout": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for .When the <code><i>time</i></code> expires,the request will be passed to the uwsgi server,however, the response will not be cached.</p> <blockquote class=\"note\">Before 1.7.8, the response could be cached.</blockquote><p> </p>"
        },
        "uwsgi_cache_methods": {
            "values": ["GET", "HEAD", "POST ..."],
            "default": "GET HEAD",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the client request method is listed in this directive thenthe response will be cached.“<code>GET</code>” and “<code>HEAD</code>” methods are alwaysadded to the list, though it is recommended to specify them explicitly.See also the  directive.</p>"
        },
        "uwsgi_cache_min_uses": {
            "values": "number",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> of requests after which the responsewill be cached.</p>"
        },
        "uwsgi_cache_path": {
            "values": "path [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] [loader_files=number] [loader_sleep=time] [loader_threshold=time] [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the path and other parameters of a cache.Cache data are stored in files.The file name in a cache is a result ofapplying the MD5 function to the.The <code>levels</code> parameter defines hierarchy levels of a cache.For example, in the following configuration</p> <blockquote class=\"example\"><pre>uwsgi_cache_path /data/nginx/cache levels=1:2 keys_zone=one:10m;</pre></blockquote><p> file names in a cache will look like this:</p> <blockquote class=\"example\"><pre>/data/nginx/cache/<strong>c</strong>/<strong>29</strong>/b7f54b2df7773722d382f4809d650<strong>29c</strong></pre></blockquote><p> </p><p>A cached response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the cache can be put ondifferent file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both cache and a directoryholding temporary filesare put on the same file system.A directory for temporary files is set based onthe <code>use_temp_path</code> parameter (1.7.10).If this parameter is omitted or set to the value <code>on</code>,the directory set by the  directivefor the given location will be used.If the value is set to <code>off</code>,temporary files will be put directly in the cache directory.</p><p>In addition, all active keys and information about data are storedin a shared memory zone, whose <code><i>name</i></code> and <code><i>size</i></code>are configured by the <code>keys_zone</code> parameter.One megabyte zone can store about 8 thousand keys.</p><p>Cached data that are not accessed during the time specified by the<code>inactive</code> parameter get removed from the cacheregardless of their freshness.By default, <code>inactive</code> is set to 10 minutes.</p><p>The special “cache manager” process monitors the maximum cache size setby the <code>max_size</code> parameter.When this size is exceeded, it removes the least recently used data.</p><p>A minute after the start the special “cache loader” process is activated.It loads information about previously cached data stored on file systeminto a cache zone.The loading is done in iterations.During one iteration no more than <code>loader_files</code> itemsare loaded (by default, 100).Besides, the duration of one iteration is limited by the<code>loader_threshold</code> parameter (by default, 200 milliseconds).Between iterations, a pause configured by the <code>loader_sleep</code>parameter (by default, 50 milliseconds) is made.</p><p>Additionally,the following parameters are available as part of our:</p><p></p> <dl class=\"compact\"><dt id=\"purger\"><code>purger</code>=<code>on</code>|<code>off</code></dt><dd>Instructs whether cache entries that match awill be removed from the disk by the cache purger (1.7.12).Setting the parameter to <code>on</code>(default is <code>off</code>)will activate the “cache purger” process thatpermanently iterates through all cache entriesand deletes the entries that match the wildcard key.</dd><dt id=\"purger_files\"><code>purger_files</code>=<code><i>number</i></code></dt><dd>Sets the number of items that will be scanned during one iteration (1.7.12).By default, <code>purger_files</code> is set to 10.</dd><dt id=\"purger_threshold\"><code>purger_threshold</code>=<code><i>number</i></code></dt><dd>Sets the duration of one iteration (1.7.12).By default, <code>purger_threshold</code> is set to 50 milliseconds.</dd><dt id=\"purger_sleep\"><code>purger_sleep</code>=<code><i>number</i></code></dt><dd>Sets a pause between iterations (1.7.12).By default, <code>purger_sleep</code> is set to 50 milliseconds.</dd></dl><p> </p>"
        },
        "uwsgi_cache_purge": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the request will be considered a cachepurge request.If at least one value of the string parameters is not empty and is not equalto “0” then the cache entry with a corresponding is removed.The result of successful operation is indicated by returningthe 204 (No Content) response.</p><p>If the  of a purge request endswith an asterisk (“<code>*</code>”), all cache entries matching thewildcard key will be removed from the cache.However, these entries will remain on the disk until they are deletedfor either ,or processed by the  (1.7.12),or a client attempts to access them.</p><p>Example configuration:</p> <blockquote class=\"example\"><pre>uwsgi_cache_path /data/nginx/cache keys_zone=cache_zone:10m;map $request_method $purge_method {    PURGE   1;    default 0;}server {    ...    location / {        uwsgi_pass        backend;        uwsgi_cache       cache_zone;        uwsgi_cache_key   $uri;        uwsgi_cache_purge $purge_method;    }}</pre></blockquote><p> </p> <blockquote class=\"note\">This functionality is available as part of our.</blockquote><p> </p>"
        },
        "uwsgi_cache_revalidate": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables revalidation of expired cache items using conditional requests withthe “If-Modified-Since” and “If-None-Match”header fields.</p>"
        },
        "uwsgi_cache_use_stale": {
            "values": ["error", "timeout", "invalid_header", "updating", "http_500", "http_503", "http_403", "http_404", "off ..."],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines in which cases a stale cached response can be usedwhen an error occurs during communication with the uwsgi server.The directive’s parameters match the parameters of the directive.</p><p>The <code>error</code> parameter also permitsusing a stale cached response if a uwsgi server to process a requestcannot be selected.</p><p>Additionally, the <code>updating</code> parameter permitsusing a stale cached response if it is currently being updated.This allows minimizing the number of accesses to uwsgi serverswhen updating cached data.</p><p>To minimize the number of accesses to uwsgi servers whenpopulating a new cache element, the directive can be used.</p>"
        },
        "uwsgi_cache_valid": {
            "values": "[code ...] time",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets caching time for different response codes.For example, the following directives</p> <blockquote class=\"example\"><pre>uwsgi_cache_valid 200 302 10m;uwsgi_cache_valid 404      1m;</pre></blockquote><p> set 10 minutes of caching for responses with codes 200 and 302and 1 minute for responses with code 404.</p><p>If only caching <code><i>time</i></code> is specified</p> <blockquote class=\"example\"><pre>uwsgi_cache_valid 5m;</pre></blockquote><p> then only 200, 301, and 302 responses are cached.</p><p>In addition, the <code>any</code> parameter can be specifiedto cache any responses:</p> <blockquote class=\"example\"><pre>uwsgi_cache_valid 200 302 10m;uwsgi_cache_valid 301      1h;uwsgi_cache_valid any      1m;</pre></blockquote><p> </p><p>Parameters of caching can also be set directlyin the response header.This has higher priority than setting of caching time using the directive.</p> <ul><li>The “X-Accel-Expires” header field sets caching time of aresponse in seconds.The zero value disables caching for a response.If the value starts with the <code>@</code> prefix, it sets an absolutetime in seconds since Epoch, up to which the response may be cached.</li><li>If the header does not include the “X-Accel-Expires” field,parameters of caching may be set in the header fields“Expires” or “Cache-Control”.</li><li>If the header includes the “Set-Cookie” field, such aresponse will not be cached.</li><li>If the header includes the “Vary” fieldwith the special value “<code>*</code>”, such aresponse will not be cached (1.7.7).If the header includes the “Vary” fieldwith another value, such a response will be cachedtaking into account the corresponding request header fields (1.7.7).</li></ul><p> Processing of one or more of these response header fields can be disabledusing the  directive.</p>"
        },
        "uwsgi_connect_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for establishing a connection with a uwsgi server.It should be noted that this timeout cannot usually exceed 75 seconds.</p>"
        },
        "uwsgi_force_ranges": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables byte-range supportfor both cached and uncached responses from the uwsgi serverregardless of the “Accept-Ranges” field in these responses.</p>"
        },
        "uwsgi_hide_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>By default,nginx does not pass the header fields “Status” and“X-Accel-...” from the response of a uwsgiserver to a client.The <code>uwsgi_hide_header</code> directive sets additional fieldsthat will not be passed.If, on the contrary, the passing of fields needs to be permitted,the  directive can be used.</p>"
        },
        "uwsgi_ignore_client_abort": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether the connection with a uwsgi server should beclosed when a client closes the connection without waitingfor a response.</p>"
        },
        "uwsgi_ignore_headers": {
            "values": "field ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Disables processing of certain response header fields from the uwsgi server.The following fields can be ignored: “X-Accel-Redirect”,“X-Accel-Expires”, “X-Accel-Limit-Rate” (1.1.6),“X-Accel-Buffering” (1.1.6),“X-Accel-Charset” (1.1.6), “Expires”,“Cache-Control”, “Set-Cookie” (0.8.44),and “Vary” (1.7.7).</p><p>If not disabled, processing of these header fields has the followingeffect:</p> <ul><li>“X-Accel-Expires”, “Expires”,“Cache-Control”, “Set-Cookie”,and “Vary”set the parameters of response ;</li><li>“X-Accel-Redirect” performs an to the specified URI;</li><li>“X-Accel-Limit-Rate” sets the for transmission of a response to a client;</li><li>“X-Accel-Buffering” enables or disables of a response;</li><li>“X-Accel-Charset” sets the desiredof a response.</li></ul><p> </p>"
        },
        "uwsgi_intercept_errors": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether a uwsgi server responses with codes greater than or equalto 300 should be passed to a client or be redirected to nginx for processingwith the  directive.</p>"
        },
        "uwsgi_limit_rate": {
            "values": "rate",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the speed of reading the response from the uwsgi server.The <code><i>rate</i></code> is specified in bytes per second.The zero value disables rate limiting.The limit is set per a request, and so if nginx simultaneously openstwo connections to the uwsgi server,the overall rate will be twice as much as the specified limit.The limitation works only if of responses from the uwsgiserver is enabled.</p>"
        },
        "uwsgi_max_temp_file_size": {
            "values": "size",
            "default": "1024m",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the uwsgiserver is enabled, and the whole response does not fit into the buffersset by the  and directives, a part of the response can be saved to a temporary file.This directive sets the maximum <code><i>size</i></code> of the temporary file.The size of data written to the temporary file at a time is setby the  directive.</p><p>The zero value disables buffering of responses to temporary files.</p><p></p> <blockquote class=\"note\">This restriction does not apply to responsesthat will be or  on disk.</blockquote><p> </p>"
        },
        "uwsgi_modifier1": {
            "values": "number",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the value of the <code>modifier1</code> field in the.</p>"
        },
        "uwsgi_modifier2": {
            "values": "number",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the value of the <code>modifier2</code> field in the.</p>"
        },
        "uwsgi_next_upstream": {
            "values": ["error", "timeout", "invalid_header", "http_500", "http_503", "http_403", "http_404", "off ..."],
            "default": "error timeout",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies in which cases a request should be passed to the next server:</p> <dl class=\"compact\"><dt><code>error</code></dt><dd>an error occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>timeout</code></dt><dd>a timeout has occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>invalid_header</code></dt><dd>a server returned an empty or invalid response;</dd><dt><code>http_500</code></dt><dd>a server returned a response with the code 500;</dd><dt><code>http_503</code></dt><dd>a server returned a response with the code 503;</dd><dt><code>http_403</code></dt><dd>a server returned a response with the code 403;</dd><dt><code>http_404</code></dt><dd>a server returned a response with the code 404;</dd><dt><code>off</code></dt><dd>disables passing a request to the next server.</dd></dl><p> </p><p>One should bear in mind that passing a request to the next server isonly possible if nothing has been sent to a client yet.That is, if an error or timeout occurs in the middle of thetransferring of a response, fixing this is impossible.</p><p>The directive also defines what is considered an of communication with a server.The cases of <code>error</code>, <code>timeout</code> and<code>invalid_header</code> are always considered unsuccessful attempts,even if they are not specified in the directive.The cases of <code>http_500</code> and <code>http_503</code> areconsidered unsuccessful attempts only if they are specified in the directive.The cases of <code>http_403</code> and <code>http_404</code>are never considered unsuccessful attempts.</p><p>Passing a request to the next server can be limited byand by .</p>"
        },
        "uwsgi_next_upstream_timeout": {
            "values": "time",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the time allowed to pass a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "uwsgi_next_upstream_tries": {
            "values": "number",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the number of possible tries for passing a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "uwsgi_no_cache": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be saved to a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be saved:</p> <blockquote class=\"example\"><pre>uwsgi_no_cache $cookie_nocache $arg_nocache$arg_comment;uwsgi_no_cache $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "uwsgi_param": {
            "values": "parameter value [if_not_empty]",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a <code><i>parameter</i></code> that should be passed to the uwsgi server.The <code><i>value</i></code> can contain text, variables, and their combination.These directives are inherited from the previous level if andonly if there are no<code>uwsgi_param</code>directives defined on the current level.</p><p>Standardshould be provided as uwsgi headers, see the <code>uwsgi_params</code> fileprovided in the distribution:</p> <blockquote class=\"example\"><pre>location / {    include uwsgi_params;    ...}</pre></blockquote><p> </p><p>If a directive is specified with <code>if_not_empty</code> (1.1.11) thensuch a parameter will not be passed to the server until its value is not empty:</p> <blockquote class=\"example\"><pre>uwsgi_param HTTPS $https if_not_empty;</pre></blockquote><p> </p>"
        },
        "uwsgi_pass": {
            "values": "[protocol://]address",
            "default": "",
            "context": ["location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Sets the protocol and address of a uwsgi server.As a <code><i>protocol</i></code>,“<code>uwsgi</code>” or “<code>suwsgi</code>”(secured uwsgi, uwsgi over SSL) can be specified.The address can be specified as a domain name or IP address,and a port:</p> <blockquote class=\"example\"><pre>uwsgi_pass localhost:9000;uwsgi_pass uwsgi://localhost:9000;uwsgi_pass suwsgi://[2001:db8::1]:9090;</pre></blockquote><p> or as a UNIX-domain socket path:</p> <blockquote class=\"example\"><pre>uwsgi_pass unix:/tmp/uwsgi.socket;</pre></blockquote><p> </p><p>If a domain name resolves to several addresses, all of them will beused in a round-robin fashion.In addition, an address can be specified as a.</p><p></p> <blockquote class=\"note\">Secured uwsgi protocol is supported since version 1.5.8.</blockquote><p> </p>"
        },
        "uwsgi_pass_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Permits passing  headerfields from a uwsgi server to a client.</p>"
        },
        "uwsgi_pass_request_body": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the original request body is passedto the uwsgi server.See also the  directive.</p>"
        },
        "uwsgi_pass_request_headers": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the header fields of the original request are passedto the uwsgi server.See also the  directive.</p>"
        },
        "uwsgi_read_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for reading a response from the uwsgi server.The timeout is set only between two successive read operations,not for the transmission of the whole response.If the uwsgi server does not transmit anything within this time,the connection is closed.</p>"
        },
        "uwsgi_request_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of a client request body.</p><p>When buffering is enabled, the entire request body isfrom the client before sending the request to a uwsgi server.</p><p>When buffering is disabled, the request body is sent to the uwsgi serverimmediately as it is received.In this case, the request cannot be passed to theif nginx already started sending the request body.</p><p>When HTTP/1.1 chunked transfer encoding is usedto send the original request body,the request body will be buffered regardless of the directive value.</p>"
        },
        "uwsgi_send_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for transmitting a request to the uwsgi server.The timeout is set only between two successive write operations,not for the transmission of the whole request.If the uwsgi server does not receive anything within this time,the connection is closed.</p>"
        },
        "uwsgi_ssl_certificate": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with the certificate in the PEM formatused for authentication to a secured uwsgi server.</p>"
        },
        "uwsgi_ssl_certificate_key": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with the secret key in the PEM formatused for authentication to a secured uwsgi server.</p><p>The value<code>engine</code>:<code><i>name</i></code>:<code><i>id</i></code>can be specified instead of the <code><i>file</i></code> (1.7.9),which loads a secret key with a specified <code><i>id</i></code>from the OpenSSL engine <code><i>name</i></code>.</p>"
        },
        "uwsgi_ssl_ciphers": {
            "values": "ciphers",
            "default": "DEFAULT",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies the enabled ciphers for requests to a secured uwsgi server.The ciphers are specified in the format understood by the OpenSSL library.</p><p>The full list can be viewed using the“<code>openssl ciphers</code>” command.</p>"
        },
        "uwsgi_ssl_crl": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with revoked certificates (CRL)in the PEM format used to the certificate of the secured uwsgi server.</p>"
        },
        "uwsgi_ssl_name": {
            "values": "name",
            "default": "host from uwsgi_pass",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows overriding the server name used tothe certificate of the secured uwsgi server and to bewhen establishing a connection with the secured uwsgi server.</p><p>By default, the host part from  is used.</p>"
        },
        "uwsgi_ssl_password_file": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with passphrases forwhere each passphrase is specified on a separate line.Passphrases are tried in turn when loading the key.</p>"
        },
        "uwsgi_ssl_protocols": {
            "values": "[SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2]",
            "default": "TLSv1 TLSv1.1 TLSv1.2",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables the specified protocols for requests to a secured uwsgi server.</p>"
        },
        "uwsgi_ssl_server_name": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables passing of the server name through (SNI, RFC 6066)when establishing a connection with the secured uwsgi server.</p>"
        },
        "uwsgi_ssl_session_reuse": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether SSL sessions can be reused when working witha secured uwsgi server.If the errors“<code>SSL3_GET_FINISHED:digest check failed</code>”appear in the logs, try disabling session reuse.</p>"
        },
        "uwsgi_ssl_trusted_certificate": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with trusted CA certificates in the PEM formatused to the certificate of the secured uwsgi server.</p>"
        },
        "uwsgi_ssl_verify": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables verification of the secured uwsgi server certificate.</p>"
        },
        "uwsgi_ssl_verify_depth": {
            "values": "number",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the verification depth in the secured uwsgi server certificates chain.</p>"
        },
        "uwsgi_store": {
            "values": ["on", "off", "string"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables saving of files to a disk.The <code>on</code> parameter saves files with pathscorresponding to the directives or.The <code>off</code> parameter disables saving of files.In addition, the file name can be set explicitly using the<code><i>string</i></code> with variables:</p> <blockquote class=\"example\"><pre>uwsgi_store /data/www$original_uri;</pre></blockquote><p> </p><p>The modification time of files is set according to the received“Last-Modified” response header field.The response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the persistent storecan be put on different file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both saved files and adirectory holding temporary files, set by the directive, are put on the same file system.</p><p>This directive can be used to create local copies of static unchangeablefiles, e.g.:</p> <blockquote class=\"example\"><pre>location /images/ {    root               /data/www;    error_page         404 = /fetch$uri;}location /fetch/ {    internal;    uwsgi_pass         backend:9000;    ...    uwsgi_store        on;    uwsgi_store_access user:rw group:rw all:r;    uwsgi_temp_path    /data/temp;    alias              /data/www/;}</pre></blockquote><p> </p>"
        },
        "uwsgi_store_access": {
            "values": "users:permissions ...",
            "default": "user:rw",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets access permissions for newly created files and directories, e.g.:</p> <blockquote class=\"example\"><pre>uwsgi_store_access user:rw group:rw all:r;</pre></blockquote><p> </p><p>If any <code>group</code> or <code>all</code> access permissionsare specified then <code>user</code> permissions may be omitted:</p> <blockquote class=\"example\"><pre>uwsgi_store_access group:rw all:r;</pre></blockquote><p> </p>"
        },
        "uwsgi_temp_file_write_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the <code><i>size</i></code> of data written to a temporary fileat a time, when buffering of responses from the uwsgi serverto temporary files is enabled.By default, <code><i>size</i></code> is limited by two buffers set by the and  directives.The maximum size of a temporary file is set by the directive.</p>__end"
        },
        "userid": {
            "values": ["on", "v1", "log", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables or disables setting cookies and logging the received cookies:</p> <dl class=\"compact\"><dt><code>on</code></dt><dd>enables the setting of version 2 cookiesand logging of the received cookies;</dd><dt><code>v1</code></dt><dd>enables the setting of version 1 cookiesand logging of the received cookies;</dd><dt><code>log</code></dt><dd>disables the setting of cookies,but enables logging of the received cookies;</dd><dt><code>off</code></dt><dd>disables the setting of cookies and logging of the received cookies.</dd></dl><p> </p>"
        },
        "userid_domain": {
            "values": ["name", "none"],
            "default": "none",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a domain for which the cookie is set.The <code>none</code> parameter disables setting of a domain for thecookie.</p>"
        },
        "userid_expires": {
            "values": ["time", "max", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a time during which a browser should keep the cookie.The parameter <code>max</code> will cause the cookie to expire on“<code>31 Dec 2037 23:55:55 GMT</code>”.The parameter <code>off</code> will cause the cookie to expire atthe end of a browser session.</p>"
        },
        "userid_mark": {
            "values": ["letter", "digit", "=", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the parameter is not <code>off</code>, enables the cookie markingmechanism and sets the character used as a mark.This mechanism is used to add or change and/or a cookie expiration time whilepreserving the client identifier.A mark can be any letter of the English alphabet (case-sensitive),digit, or the “<code>=</code>” character.</p><p>If the mark is set, it is compared with the first padding symbolin the base64 representation of the client identifier passed in a cookie.If they do not match, the cookie is resent with the specified mark,expiration time, and “P3P” header.</p>"
        },
        "userid_name": {
            "values": "name",
            "default": "uid",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the cookie name.</p>"
        },
        "userid_p3p": {
            "values": ["string", "none"],
            "default": "none",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a value for the “P3P” header field that will besent along with the cookie.If the directive is set to the special value <code>none</code>,the “P3P” header will not be sent in a response.</p>"
        },
        "userid_path": {
            "values": "path",
            "default": "/",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a path for which the cookie is set.</p>"
        },
        "userid_service": {
            "values": "number",
            "default": "IP address of the server",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If identifiers are issued by multiple servers (services),each service should be assigned its own <code><i>number</i></code>to ensure that client identifiers are unique.For version 1 cookies, the default value is zero.For version 2 cookies, the default value is the number composed from the lastfour octets of the server’s IP address.</p>__end"
        },
        "sub_filter": {
            "values": "string replacement",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets a string to replace and a replacement string.The string to replace is matched ignoring the case.The string to replace (1.9.4) and replacement string can contain variables.Several <code>sub_filter</code> directivescan be specified on one configuration level (1.9.4).</p>"
        },
        "sub_filter_last_modified": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows preserving the “Last-Modified” header fieldfrom the original response during replacementto facilitate response caching.</p><p>By default, the header field is removed as contents of the responseare modified during processing.</p>"
        },
        "sub_filter_once": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether to look for each string to replaceonce or repeatedly.</p>__end"
        },
        "stub_status": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "__begin<p>The basic status information will be accessible from the surrounding location.</p><p></p> <blockquote class=\"note\">In versions prior to 1.7.5,the directive syntax required an arbitrary argument, for example,“<code>stub_status on</code>”.</blockquote><p> </p>__end<center><h4>Data</h4></center><p>The following status information is provided:</p> <dl class=\"compact\"><dt id=\"stubstat_active\"><code>Active connections</code></dt><dd>The current number of active client connectionsincluding <code>Waiting</code> connections.</dd><dt id=\"stubstat_accepts\"><code>accepts</code></dt><dd>The total number of accepted client connections.</dd><dt id=\"stubstat_handled\"><code>handled</code></dt><dd>The total number of handled connections.Generally, the parameter value is the same as <code>accepts</code>unless some resource limits have been reached(for example, the limit).</dd><dt id=\"stubstat_requests\"><code>requests</code></dt><dd>The total number of client requests.</dd><dt id=\"stubstat_reading\"><code>Reading</code></dt><dd>The current number of connections where nginx is reading the request header.</dd><dt id=\"stubstat_writing\"><code>Writing</code></dt><dd>The current number of connectionswhere nginx is writing the response back to the client.</dd><dt id=\"stubstat_waiting\"><code>Waiting</code></dt><dd>The current number of idle client connections waiting for a request.</dd></dl><p> </p>__end"
        },
        "status": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "__begin<p>The status information will be accessible from the surrounding location.Access to this location should be.</p>"
        },
        "status_format": {
            "values": "json;status_format jsonp [callback]",
            "default": "json",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>By default, status information is output in the JSON format.</p><p>Alternatively, data may be output as JSONP.The <code><i>callback</i></code> parameter specifies the name of a callback function.The value can contain variables.If parameter is omitted, or the computed value is an empty string,then “<code>ngx_status_jsonp_callback</code>” is used.</p>"
        },
        "status_zone": {
            "values": "zone",
            "default": "",
            "context": ["server"],
            "isIn": isIn,
            "tooltip": "<p>Enables collection of virtualor(1.7.11) server status information in the specified <code><i>zone</i></code>.Several servers may share the same zone.</p>__end<center><h4>Data</h4></center><p>The following status information is provided:</p> <dl class=\"compact\"><dt id=\"version\"><code>version</code></dt><dd>Version of the provided data set.The current version is 6.</dd><dt><code>nginx_version</code></dt><dd>Version of nginx.</dd><dt><code>address</code></dt><dd>The address of the server that accepted status request.</dd><dt id=\"generation\"><code>generation</code></dt><dd>The total number of configuration.</dd><dt id=\"load_timestamp\"><code>load_timestamp</code></dt><dd>Time of the last reload of configuration, in milliseconds since Epoch.</dd><dt><code>timestamp</code></dt><dd>Current time in milliseconds since Epoch.</dd><dt id=\"pid\"><code>pid</code></dt><dd>The ID of the worker process that handled status request.</dd><dt id=\"processes\"><code>processes</code></dt><dd><dl class=\"compact\"><dt id=\"respawned\"><code>respawned</code></dt><dd>The total number of abnormally terminated and respawnedchild processes.</dd></dl></dd><dt><code>connections</code></dt><dd><dl class=\"compact\"><dt><code>accepted</code></dt><dd>The total number of accepted client connections.</dd><dt><code>dropped</code></dt><dd>The total number of dropped client connections.</dd><dt><code>active</code></dt><dd>The current number of active client connections.</dd><dt><code>idle</code></dt><dd>The current number of idle client connections.</dd></dl></dd><dt id=\"ssl\"><code>ssl</code></dt><dd><dl class=\"compact\"><dt><code>handshakes</code></dt><dd>The total number of successful SSL handshakes.</dd><dt><code>handshakes_failed</code></dt><dd>The total number of failed SSL handshakes.</dd><dt><code>session_reuses</code></dt><dd>The total number of session reuses during SSL handshake.</dd></dl></dd><dt><code>requests</code></dt><dd><dl class=\"compact\"><dt><code>total</code></dt><dd>The total number of client requests.</dd><dt><code>current</code></dt><dd>The current number of client requests.</dd></dl></dd><dt id=\"server_zones\"><code>server_zones</code></dt><dd>For each :<dl class=\"compact\"><dt><code>processing</code></dt><dd>The number ofclient requests that are currently being processed.</dd><dt><code>requests</code></dt><dd>The total number ofclient requests received from clients.</dd><dt><code>responses</code></dt><dd><dl class=\"compact\"><dt><code>total</code></dt><dd>The total number ofresponses sent to clients.</dd><dt><code>1xx</code>,<code>2xx</code>,<code>3xx</code>,<code>4xx</code>,<code>5xx</code></dt><dd>The number of responses with status codes 1xx, 2xx, 3xx, 4xx, and 5xx.</dd></dl></dd><dt id=\"discarded\"><code>discarded</code></dt><dd>The total number of requests completed without sending a response.</dd><dt><code>received</code></dt><dd>The total number of bytes received from clients.</dd><dt><code>sent</code></dt><dd>The total number of bytes sent to clients.</dd></dl></dd><dt id=\"upstreams\"><code>upstreams</code></dt><dd>For each,the following data are provided:<dl class=\"compact\"><dt id=\"peers\"><code>peers</code></dt><dd>For each,the following data are provided:<dl class=\"compact\"><dt id=\"id\"><code>id</code></dt><dd>The ID of the server.</dd><dt><code>server</code></dt><dd>Anof the server.</dd><dt><code>backup</code></dt><dd>A boolean value indicating whether the server is aserver.</dd><dt><code>weight</code></dt><dd>of the server.</dd><dt id=\"state\"><code>state</code></dt><dd>Current state, which may be one of“<code>up</code>”,“<code>draining</code>”,“<code>down</code>”,“<code>unavail</code>”,or“<code>unhealthy</code>”.</dd><dt><code>active</code></dt><dd>The current number of active connections.</dd><dt id=\"max_conns\"><code>max_conns</code></dt><dd>The  limitfor the server.</dd><dt><code>requests</code></dt><dd>The total number ofclient requests forwarded to this server.</dd><dt><code>responses</code></dt><dd><dl class=\"compact\"><dt><code>total</code></dt><dd>The total number ofresponses obtained from this server.</dd><dt><code>1xx</code>,<code>2xx</code>,<code>3xx</code>,<code>4xx</code>,<code>5xx</code></dt><dd>The number of responses with status codes 1xx, 2xx, 3xx, 4xx, and 5xx.</dd></dl></dd><dt><code>sent</code></dt><dd>The total number of bytes sent to this server.</dd><dt><code>received</code></dt><dd>The total number of bytes received from this server.</dd><dt><code>fails</code></dt><dd>The total number ofunsuccessful attempts to communicate with the server.</dd><dt><code>unavail</code></dt><dd>How many timesthe server became unavailable for client requests(state “<code>unavail</code>”)due to the number of unsuccessful attempts reaching thethreshold.</dd><dt><code>health_checks</code></dt><dd><dl class=\"compact\"><dt><code>checks</code></dt><dd>The total number ofrequests made.</dd><dt><code>fails</code></dt><dd>The number of failed health checks.</dd><dt><code>unhealthy</code></dt><dd>How many timesthe server became unhealthy (state “<code>unhealthy</code>”).</dd><dt><code>last_passed</code></dt><dd>Boolean indicatingif the last health check request was successful and passed.</dd></dl></dd><dt><code>downtime</code></dt><dd>Total timethe server was in the “<code>unavail</code>”and “<code>unhealthy</code>” states.</dd><dt><code>downstart</code></dt><dd>The time (in milliseconds since Epoch)when the server became“<code>unavail</code>”or “<code>unhealthy</code>”.</dd><dt id=\"selected\"><code>selected</code></dt><dd>The time (in milliseconds since Epoch)when the server was last selected to process a request (1.7.5).</dd><dt id=\"header_time\"><code>header_time</code></dt><dd>The average time to get the from the server (1.7.10).The field is available when using theload balancing method.</dd><dt id=\"response_time\"><code>response_time</code></dt><dd>The average time to get the from the server (1.7.10).The field is available when using theload balancing method.</dd></dl></dd><dt><code>keepalive</code></dt><dd>The current number ofidle  connections.</dd><dt id=\"queue\"><code>queue</code></dt><dd>For the requests ,the following data are provided:<dl class=\"compact\"><dt><code>size</code></dt><dd>The current number of requests in the queue.</dd><dt id=\"max_size\"><code>max_size</code></dt><dd>The maximum number of requests that can be in the queue at the same time.</dd><dt><code>overflows</code></dt><dd>The total number of requests rejected due to the queue overflow.</dd></dl></dd></dl></dd><dt id=\"caches\"><code>caches</code></dt><dd>For each cache (configured by and the likes):<dl class=\"compact\"><dt><code>size</code></dt><dd>The current size of the cache.</dd><dt><code>max_size</code></dt><dd>The limit on the maximum size of the cache specified in the configuration.</dd><dt><code>cold</code></dt><dd>A boolean value indicating whether the “cache loader” process is still loadingdata from disk into the cache.</dd><dt>    <code>hit</code>,    <code>stale</code>,    <code>updating</code>,    <code>revalidated</code></dt><dd><dl class=\"compact\"><dt><code>responses</code></dt><dd>The total number of responses read from the cache (hits, or stale responsesdue to and the likes).</dd><dt><code>bytes</code></dt><dd>The total number of bytes read from the cache.</dd></dl></dd><dt>    <code>miss</code>,    <code>expired</code>,    <code>bypass</code></dt><dd><dl class=\"compact\"><dt><code>responses</code></dt><dd>The total number of responses not taken from the cache (misses, expires, orbypasses due toand the likes).</dd><dt><code>bytes</code></dt><dd>The total number of bytes read from the proxied server.</dd><dt><code>responses_written</code></dt><dd>The total number of responses written to the cache.</dd><dt><code>bytes_written</code></dt><dd>The total number of bytes written to the cache.</dd></dl></dd></dl></dd><dt id=\"stream\"><code>stream</code></dt><dd><dl class=\"compact\"><dt><code>server_zones</code></dt><dd>For each :<dl class=\"compact\"><dt><code>processing</code></dt><dd>The number ofclient connections that are currently being processed.</dd><dt><code>connections</code></dt><dd>The total number ofconnections accepted from clients.</dd><dt><code>received</code></dt><dd>The total number of bytes received from clients.</dd><dt><code>sent</code></dt><dd>The total number of bytes sent to clients.</dd></dl></dd><dt><code>upstreams</code></dt><dd>For each,the following data are provided:<dl class=\"compact\"><dt><code>peers</code></dt><dd>For eachthe following data are provided:<dl class=\"compact\"><dt><code>id</code></dt><dd>The ID of the server.</dd><dt><code>server</code></dt><dd>Anof the server.</dd><dt><code>backup</code></dt><dd>A boolean value indicating whether the server is aserver.</dd><dt><code>weight</code></dt><dd>of the server.</dd><dt><code>state</code></dt><dd>Current state, which may be one of“<code>up</code>”,“<code>down</code>”,“<code>unavail</code>”,or“<code>unhealthy</code>”.</dd><dt><code>active</code></dt><dd>The current number of connections.</dd><dt><code>connections</code></dt><dd>The total number ofclient connections forwarded to this server.</dd><dt><code>connect_time</code></dt><dd>The average time to connect to the upstream server.The field is available when using theload balancing method.</dd><dt><code>first_byte_time</code></dt><dd>The average time to receive the first byte of data.The field is available when using theload balancing method.</dd><dt><code>response_time</code></dt><dd>The average time to receive the last byte of data.The field is available when using theload balancing method.</dd><dt><code>sent</code></dt><dd>The total number of bytes sent to this server.</dd><dt><code>received</code></dt><dd>The total number of bytes received from this server.</dd><dt><code>fails</code></dt><dd>The total number ofunsuccessful attempts to communicate with the server.</dd><dt><code>unavail</code></dt><dd>How many timesthe server became unavailable for client connections(state “<code>unavail</code>”)due to the number of unsuccessful attempts reaching thethreshold.</dd><dt><code>health_checks</code></dt><dd><dl class=\"compact\"><dt><code>checks</code></dt><dd>The total number ofrequests made.</dd><dt><code>fails</code></dt><dd>The number of failed health checks.</dd><dt><code>unhealthy</code></dt><dd>How many timesthe server became unhealthy (state “<code>unhealthy</code>”).</dd><dt><code>last_passed</code></dt><dd>Boolean indicatingif the last health check request was successful and passed.</dd></dl></dd><dt><code>downtime</code></dt><dd>Total timethe server was in the “<code>unavail</code>”and “<code>unhealthy</code>” states.</dd><dt><code>downstart</code></dt><dd>The time (in milliseconds since Epoch)when the server became“<code>unavail</code>”or “<code>unhealthy</code>”.</dd><dt><code>selected</code></dt><dd>The time (in milliseconds since Epoch)when the server was last selected to process a connection.</dd></dl></dd></dl></dd></dl></dd></dl><p> </p>__end"
        },
        "ssl_certificate": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with the certificate in the PEM formatfor the given virtual server.If intermediate certificates should be specified in addition to a primarycertificate, they should be specified in the same file in the followingorder: the primary certificate comes first, then the intermediate certificates.A secret key in the PEM format may be placed in the same file.</p><p>It should be kept in mind that due to the HTTPS protocol limitationsvirtual servers should listen on different IP addresses:</p> <blockquote class=\"example\"><pre>server {    listen          192.168.1.1:443;    server_name     one.example.com;    ssl_certificate /usr/local/nginx/conf/one.example.com.cert;    ...}server {    listen          192.168.1.2:443;    server_name     two.example.com;    ssl_certificate /usr/local/nginx/conf/two.example.com.cert;    ...}</pre></blockquote><p> otherwisewill be issued for the second site.</p>"
        },
        "ssl_certificate_key": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with the secret key in the PEM formatfor the given virtual server.</p><p>The value<code>engine</code>:<code><i>name</i></code>:<code><i>id</i></code>can be specified instead of the <code><i>file</i></code> (1.7.9),which loads a secret key with a specified <code><i>id</i></code>from the OpenSSL engine <code><i>name</i></code>.</p>"
        },
        "ssl_ciphers": {
            "values": "ciphers",
            "default": "HIGH:!aNULL:!MD5",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies the enabled ciphers.The ciphers are specified in the format understood by theOpenSSL library, for example:</p> <blockquote class=\"example\"><pre>ssl_ciphers ALL:!aNULL:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP;</pre></blockquote><p> </p><p>The full list can be viewed using the“<code>openssl ciphers</code>” command.</p><p></p> <blockquote class=\"note\">The previous versions of nginx usedciphers by default.</blockquote><p> </p>"
        },
        "ssl_dhparam": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with DH parameters for EDH ciphers.</p>"
        },
        "ssl_ecdh_curve": {
            "values": "curve",
            "default": "prime256v1",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>curve</i></code> for ECDHE ciphers.</p>"
        },
        "ssl_handshake_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["stream", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a timeout for the SSL handshake to complete.</p>"
        },
        "ssl_password_file": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with passphrases forwhere each passphrase is specified on a separate line.Passphrases are tried in turn when loading the key.</p><p>Example:</p> <blockquote class=\"example\"><pre>http {    ssl_password_file /etc/keys/global.pass;    ...    server {        server_name www1.example.com;        ssl_certificate_key /etc/keys/first.key;    }    server {        server_name www2.example.com;        # named pipe can also be used instead of a file        ssl_password_file /etc/keys/fifo;        ssl_certificate_key /etc/keys/second.key;    }}</pre></blockquote><p> </p>"
        },
        "ssl_prefer_server_ciphers": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies that server ciphers should be preferred over clientciphers when using the SSLv3 and TLS protocols.</p>"
        },
        "ssl_protocols": {
            "values": "[SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2]",
            "default": "TLSv1 TLSv1.1 TLSv1.2",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables the specified protocols.The <code>TLSv1.1</code> and <code>TLSv1.2</code> parameters workonly when the OpenSSL library of version 1.0.1 or higher is used.</p> <blockquote class=\"note\">The <code>TLSv1.1</code> and <code>TLSv1.2</code> parameters aresupported starting from versions 1.1.13 and 1.0.12,so when the OpenSSL version 1.0.1 or higheris used on older nginx versions, these protocols work, but cannotbe disabled.</blockquote><p> </p>"
        },
        "ssl_session_cache": {
            "values": ["off", "none", "[builtin[:size]] [shared:name:size]"],
            "default": "none",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the types and sizes of caches that store session parameters.A cache can be of any of the following types:</p> <dl class=\"compact\"><dt><code>off</code></dt><dd>the use of a session cache is strictly prohibited:nginx explicitly tells a client that sessions may not be reused.</dd><dt><code>none</code></dt><dd>the use of a session cache is gently disallowed:nginx tells a client that sessions may be reused, but does notactually store session parameters in the cache.</dd><dt><code>builtin</code></dt><dd>a cache built in OpenSSL; used by one worker process only.The cache size is specified in sessions.If size is not given, it is equal to 20480 sessions.Use of the built-in cache can cause memory fragmentation.</dd><dt><code>shared</code></dt><dd>a cache shared between all worker processes.The cache size is specified in bytes; one megabyte can storeabout 4000 sessions.Each shared cache should have an arbitrary name.A cache with the same name can be used in several virtual servers.</dd></dl><p> </p><p>Both cache types can be used simultaneously, for example:</p> <blockquote class=\"example\"><pre>ssl_session_cache builtin:1000 shared:SSL:10m;</pre></blockquote><p> but using only shared cache without the built-in cache shouldbe more efficient.</p>"
        },
        "ssl_session_ticket_key": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets a <code><i>file</i></code> with the secret key used to encryptand decrypt TLS session tickets.The directive is necessary if the same key has to be shared betweenmultiple servers.By default, a randomly generated key is used.</p><p>If several keys are specified, only the first key isused to encrypt TLS session tickets.This allows configuring key rotation, for example:</p> <blockquote class=\"example\"><pre>ssl_session_ticket_key current.key;ssl_session_ticket_key previous.key;</pre></blockquote><p> </p><p>The <code><i>file</i></code> must contain 48 bytes of random data and canbe created using the following command:</p> <blockquote class=\"example\"><pre>openssl rand 48 &gt; ticket.key</pre></blockquote><p> </p>"
        },
        "ssl_session_tickets": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables session resumption through.</p>"
        },
        "ssl": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables the HTTPS protocol for the given virtual server.</p> <blockquote class=\"note\">It is recommended to use the <code>ssl</code> parameter of the directive insteadof this directive.</blockquote><p> </p>"
        },
        "ssl_client_certificate": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with trusted CA certificates in the PEM formatused to  client certificates andOCSP responses if  is enabled.</p><p>The list of certificates will be sent to clients.If this is not desired, the directive can be used.</p>"
        },
        "ssl_crl": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with revoked certificates (CRL)in the PEM format used to client certificates.</p>"
        },
        "ssl_session_timeout": {
            "values": "time",
            "default": "5m",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a time during which a client may reuse thesession parameters stored in a cache.</p>"
        },
        "ssl_trusted_certificate": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with trusted CA certificates in the PEM formatused to  client certificates andOCSP responses if  is enabled.</p><p>In contrast to the certificate set by ,the list of these certificates will not be sent to clients.</p>"
        },
        "ssl_verify_client": {
            "values": ["on", "off", "optional", "optional_no_ca"],
            "default": "off",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables verification of client certificates.The verification result is stored in the<code>$ssl_client_verify</code> variable.</p><p>The <code>optional</code> parameter (0.8.7+) requests the clientcertificate and verifies it if the certificate is present.</p><p>The <code>optional_no_ca</code> parameter (1.3.8, 1.2.5)requests the clientcertificate but does not require it to be signed by a trusted CA certificate.This is intended for the use in cases when a service that is external to nginxperforms the actual certificate verification.The contents of the certificate is accessible through the<code>$ssl_client_cert</code> variable.</p>"
        },
        "ssl_verify_depth": {
            "values": "number",
            "default": "1",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the verification depth in the client certificates chain.</p>__end<center><h4>Error Processing</h4></center><p>The <code>ngx_http_ssl_module</code> module supports severalnon-standard error codes that can be used for redirects using the directive:</p> <dl class=\"compact\"><dt>495</dt><dd>an error has occurred during the client certificate verification;</dd><dt>496</dt><dd>a client has not presented the required certificate;</dd><dt>497</dt><dd>a regular request has been sent to the HTTPS port.</dd></dl><p> </p><p>The redirection happens after the request is fully parsed andthe variables, such as <code>$request_uri</code>,<code>$uri</code>, <code>$args</code> and others, are available.</p>__end"
        },
        "ssl_buffer_size": {
            "values": "size",
            "default": "16k",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the size of the buffer used for sending data.</p><p>By default, the buffer size is 16k, which corresponds to minimaloverhead when sending big responses.To minimize Time To First Byte it may be beneficial to use smaller values,for example:</p> <blockquote class=\"example\"><pre>ssl_buffer_size 4k;</pre></blockquote><p> </p>"
        },
        "ssl_stapling": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables by the server.Example:</p> <blockquote class=\"example\"><pre>ssl_stapling on;resolver 192.0.2.1;</pre></blockquote><p> </p><p>For the OCSP stapling to work, the certificate of the server certificateissuer should be known.If the  file doesnot contain intermediate certificates,the certificate of the server certificate issuer should bepresent in the file.</p><p>For a resolution of the OCSP responder hostname,the  directiveshould also be specified.</p>"
        },
        "ssl_stapling_file": {
            "values": "file",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>When set, the stapled OCSP response will be taken from thespecified <code><i>file</i></code> instead of queryingthe OCSP responder specified in the server certificate.</p><p>The file should be in the DER format as produced by the“<code>openssl ocsp</code>” command.</p>"
        },
        "ssl_stapling_responder": {
            "values": "url",
            "default": "",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Overrides the URL of the OCSP responder specified in the“” certificate extension.</p><p>Only “<code>http://</code>” OCSP responders are supported:</p> <blockquote class=\"example\"><pre>ssl_stapling_responder http://ocsp.example.com/;</pre></blockquote><p> </p>"
        },
        "ssl_stapling_verify": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables verification of OCSP responses by the server.</p><p>For verification to work, the certificate of the server certificateissuer, the root certificate, and all intermediate certificatesshould be configured as trusted using the directive.</p>"
        },
        "ssi": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables or disables processing of SSI commands in responses.</p>"
        },
        "ssi_last_modified": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows preserving the “Last-Modified” header fieldfrom the original response during SSI processingto facilitate response caching.</p><p>By default, the header field is removed as contents of the responseare modified during processing and may contain dynamically generated elementsor parts that are changed independently of the original response.</p>"
        },
        "ssi_min_file_chunk": {
            "values": "size",
            "default": "1k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the minimum <code><i>size</i></code> for parts of a response stored on disk,starting from which it makes sense to send them using.</p>"
        },
        "ssi_silent_errors": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If enabled, suppresses the output of the“<code>[an error occurred while processing the directive]</code>”string if an error occurred during SSI processing.</p>"
        },
        "ssi_types": {
            "values": "mime-type ...",
            "default": "text/html",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables processing of SSI commands in responses with the specified MIME typesin addition to “<code>text/html</code>”.The special value “<code>*</code>” matches any MIME type (0.8.29).</p>"
        },
        "ssi_value_length": {
            "values": "length",
            "default": "256",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum length of parameter values in SSI commands.</p>__end<center><h4>SSI Commands</h4></center><p>SSI commands have the following generic format:</p> <blockquote class=\"example\"><pre>&lt;!--# command parameter1=value1 parameter2=value2 ... --&gt;</pre></blockquote><p> </p><p>The following commands are supported:</p> <dl class=\"compact\"><dt><code>block</code></dt><dd>Defines a block that can be used as a stubin the <code>include</code> command.The block can contain other SSI commands.The command has the following parameter:<dl class=\"compact\"><dt><code>name</code></dt><dd>block name.</dd></dl>Example:<blockquote class=\"example\"><pre>&lt;!--# block name=\"one\" --&gt;stub&lt;!--# endblock --&gt;</pre></blockquote></dd><dt><code>config</code></dt><dd>Sets some parameters used during SSI processing, namely:<dl class=\"compact\"><dt><code>errmsg</code></dt><dd>a string that is output if an error occurs during SSI processing.By default, the following string is output:<blockquote class=\"example\"><pre>[an error occurred while processing the directive]</pre></blockquote></dd><dt><code>timefmt</code></dt><dd>a format string passed to the <code>strftime()</code> functionused to output date and time.By default, the following format is used:<blockquote class=\"example\"><pre>\"%A, %d-%b-%Y %H:%M:%S %Z\"</pre></blockquote>The “<code>%s</code>” format is suitable to output time in seconds.</dd></dl></dd><dt><code>echo</code></dt><dd>Outputs the value of a variable.The command has the following parameters:<dl class=\"compact\"><dt><code>var</code></dt><dd>the variable name.</dd><dt><code>encoding</code></dt><dd>the encoding method.Possible values include <code>none</code>, <code>url</code>, and<code>entity</code>.By default, <code>entity</code> is used.</dd><dt><code>default</code></dt><dd>a non-standard parameter that sets a string to be outputif a variable is undefined.By default, “<code>none</code>” is output.The command<blockquote class=\"example\"><pre>&lt;!--# echo var=\"name\" default=\"<strong>no</strong>\" --&gt;</pre></blockquote>replaces the following sequence of commands:<blockquote class=\"example\"><pre>&lt;!--# if expr=\"$name\" --&gt;&lt;!--# echo var=\"name\" --&gt;&lt;!--#       else --&gt;<strong>no</strong>&lt;!--# endif --&gt;</pre></blockquote></dd></dl></dd><dt><code>if</code></dt><dd>Performs a conditional inclusion.The following commands are supported:<blockquote class=\"example\"><pre>&lt;!--# if expr=\"...\" --&gt;...&lt;!--# elif expr=\"...\" --&gt;...&lt;!--# else --&gt;...&lt;!--# endif --&gt;</pre></blockquote>Only one level of nesting is currently supported.The command has the following parameter:<dl class=\"compact\"><dt><code>expr</code></dt><dd>expression.An expression can be:<ul class=\"compact\"><li>variable existence check:<blockquote class=\"example\"><pre>&lt;!--# if expr=\"$name\" --&gt;</pre></blockquote></li><li>comparison of a variable with a text:<blockquote class=\"example\"><pre>&lt;!--# if expr=\"$name = <code><i>text</i></code>\" --&gt;&lt;!--# if expr=\"$name != <code><i>text</i></code>\" --&gt;</pre></blockquote></li><li>comparison of a variable with a regular expression:<blockquote class=\"example\"><pre>&lt;!--# if expr=\"$name = /<code><i>text</i></code>/\" --&gt;&lt;!--# if expr=\"$name != /<code><i>text</i></code>/\" --&gt;</pre></blockquote></li></ul>If a <code><i>text</i></code> contains variables,their values are substituted.A regular expression can contain positional and named capturesthat can later be used through variables, for example:<blockquote class=\"example\"><pre>&lt;!--# if expr=\"$name = /(.+)@(?P&lt;domain&gt;.+)/\" --&gt;    &lt;!--# echo var=\"1\" --&gt;    &lt;!--# echo var=\"domain\" --&gt;&lt;!--# endif --&gt;</pre></blockquote></dd></dl></dd><dt><code>include</code></dt><dd>Includes the result of another request into a response.The command has the following parameters:<dl class=\"compact\"><dt><code>file</code></dt><dd>specifies an included file, for example:<blockquote class=\"example\"><pre>&lt;!--# include file=\"footer.html\" --&gt;</pre></blockquote></dd><dt><code>virtual</code></dt><dd>specifies an included request, for example:<blockquote class=\"example\"><pre>&lt;!--# include virtual=\"/remote/body.php?argument=value\" --&gt;</pre></blockquote>Several requests specified on one page and processed by proxied orFastCGI/uwsgi/SCGI servers run in parallel.If sequential processing is desired, the <code>wait</code>parameter should be used.</dd><dt><code>stub</code></dt><dd>a non-standard parameter that names the block whosecontent will be output if the included request results in an emptybody or if an error occurs during the request processing, for example:<blockquote class=\"example\"><pre>&lt;!--# block name=\"one\" --&gt;&amp;nbsp;&lt;!--# endblock --&gt;&lt;!--# include virtual=\"/remote/body.php?argument=value\" stub=\"one\" --&gt;</pre></blockquote>The replacement block content is processed in the included request context.</dd><dt><code>wait</code></dt><dd>a non-standard parameter that instructs to wait for a request to fullycomplete before continuing with SSI processing, for example:<blockquote class=\"example\"><pre>&lt;!--# include virtual=\"/remote/body.php?argument=value\" wait=\"yes\" --&gt;</pre></blockquote></dd><dt><code>set</code></dt><dd>a non-standard parameter that instructs to write a successful resultof request processing to the specified variable,for example:<blockquote class=\"example\"><pre>&lt;!--# include virtual=\"/remote/body.php?argument=value\" set=\"one\" --&gt;</pre></blockquote>It should be noted that only the results of responses obtained using the,, (1.5.6), (1.5.6),and  (1.5.6)modules can be written into variables.</dd></dl></dd><dt><code>set</code></dt><dd>Sets a value of a variable.The command has the following parameters:<dl class=\"compact\"><dt><code>var</code></dt><dd>the variable name.</dd><dt><code>value</code></dt><dd>the variable value.If an assigned value contains variables,their values are substituted.</dd></dl></dd></dl><p> </p>__end"
        },
        "spdy_chunk_size": {
            "values": "size",
            "default": "8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the maximum size of chunksinto which the response body is.A too low value results in higher overhead.A too high value impairs prioritization due to.</p>"
        },
        "spdy_headers_comp": {
            "values": "level",
            "default": "0",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the header compression <code><i>level</i></code> of a response in a range from1 (fastest, less compression) to 9 (slowest, best compression).The special value 0 turns off the header compression.</p>__end"
        },
        "smtp_auth": {
            "values": "method ...",
            "default": "login plain",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets permitted methods offor SMTP clients.Supported methods are:</p> <dl class=\"compact\"><dt><code>login</code></dt><dd></dd><dt><code>plain</code></dt><dd></dd><dt><code>cram-md5</code></dt><dd>.In order for this method to work, the password must be stored unencrypted.</dd><dt><code>none</code></dt><dd>Authentication is not required.</dd></dl><p> </p>__end"
        },
        "slice": {
            "values": "size",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the <code><i>size</i></code> of the slice.The zero value disables splitting responses into slices.Note that a too low value may result in excessive memory usageand a large number of file descriptors.</p><p>In order for a subrequest to return the required range,the <code>$slice_range</code> variable should be tothe proxied server as the <code>Range</code> request header field.Ifis enabled, <code>$slice_range</code> should be added to theand caching of responses with 206 status code should be.</p>__end"
        },
        "session_log_zone": {
            "values": "path zone=name:size [format=format] [timeout=time] [id=id] [md5=md5]",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the path to a log file and configures the shared memory zone that is usedto store currently active sessions.</p><p>A session is considered active for as long as the time elapsed sincethe last request in the session does not exceed the specified<code>timeout</code> (by default, 30 seconds).Once a session is no longer active, it is written to the log.</p><p>The <code>id</code> parameter identifies thesession to which a request is mapped.The <code>id</code> parameter is set to the hexadecimal representationof an MD5 hash (for example, obtained from a cookie using variables).If this parameter is not specified or does not represent the validMD5 hash, nginx computes the MD5 hash from the value ofthe <code>md5</code> parameter and creates a new session using this hash.Both the <code>id</code> and <code>md5</code> parameterscan contain variables.</p><p>The <code>format</code> parameter sets the custom session logformat configured by the  directive.If <code>format</code> is not specified, the predefined“<code>combined</code>” format is used.</p>"
        },
        "session_log": {
            "values": ["name", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables the use of the specified session log.The special value <code>off</code> cancels all<code>session_log</code> directives inherited from the previousconfiguration level.</p>__end"
        },
        "secure_link": {
            "values": "expression",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Defines a string with variables from which thechecksum value and lifetime of a link will be extracted.</p><p>Variables used in an <code><i>expression</i></code> are usually associatedwith a request; see  below.</p><p>The checksum value extracted from the string is compared withthe MD5 hash value of the expression defined by the directive.If the checksums are different, the <code>$secure_link</code> variableis set to an empty string.If the checksums are the same, the link lifetime is checked.If the link has a limited lifetime and the time has expired,the <code>$secure_link</code> variable is set to “<code>0</code>”.Otherwise, it is set to “<code>1</code>”.The MD5 hash value passed in a request is encoded in.</p><p>If a link has a limited lifetime, the expiration timeis set in seconds since Epoch (Thu, 01 Jan 1970 00:00:00 GMT).The value is specified in the expression after the MD5 hash,and is separated by a comma.The expiration time passed in a request is available throughthe <code>$secure_link_expires</code> variable for a use inthe  directive.If the expiration time is not specified, a link has the unlimitedlifetime.</p>"
        },
        "secure_link_md5": {
            "values": "expression",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines an expression for which the MD5 hash value willbe computed and compared with the value passed in a request.</p><p>The expression should contain the secured part of a link (resource)and a secret ingredient.If the link has a limited lifetime,the expression should also contain <code>$secure_link_expires</code>.</p><p>To prevent unauthorized access, the expression may contain someinformation about the client, such as its address and browser version.</p><p>Example:</p> <blockquote class=\"example\"><pre>location /s/ {    secure_link $arg_md5,$arg_expires;    secure_link_md5 \"$secure_link_expires$uri$remote_addr secret\";    if ($secure_link = \"\") {        return 403;    }    if ($secure_link = \"0\") {        return 410;    }    ...}</pre></blockquote><p> The“<code>/s/link?md5=_e4Nc3iduzkWRm01TBBNYw&amp;expires=2147483647</code>”linkrestricts access to “<code>/s/link</code>” for the client with theIP address 127.0.0.1.The link also has the limited lifetime until January 19, 2038 (GMT).</p><p>On UNIX, the <code><i>md5</i></code> request argument value can be obtained as:</p> <blockquote class=\"example\"><pre>echo -n '2147483647/s/link127.0.0.1 secret' | \\    openssl md5 -binary | openssl base64 | tr +/ -_ | tr -d =</pre></blockquote><p> </p>"
        },
        "secure_link_secret": {
            "values": "word",
            "default": "",
            "context": ["location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a secret <code><i>word</i></code> used to check authenticityof requested links.</p><p>The full URI of a requested link looks as follows:</p> <blockquote class=\"example\"><pre>/<code><i>prefix</i></code>/<code><i>hash</i></code>/<code><i>link</i></code></pre></blockquote><p> where <code><i>hash</i></code> is a hexadecimal representation of theMD5 hash computed for the concatenation of the link and secret word,and <code><i>prefix</i></code> is an arbitrary string without slashes.</p><p>If the requested link passes the authenticity check,the <code>$secure_link</code> variable is set to the linkextracted from the request URI.Otherwise, the <code>$secure_link</code> variableis set to an empty string.</p><p>Example:</p> <blockquote class=\"example\"><pre>location /p/ {    secure_link_secret secret;    if ($secure_link = \"\") {        return 403;    }    rewrite ^ /secure/$secure_link;}location /secure/ {    internal;}</pre></blockquote><p> A request of “<code>/p/5e814704a28d9bc1914ff19fa0c4a00a/link</code>”will be internally redirected to“<code>/secure/link</code>”.</p><p>On UNIX, the hash value for this example can be obtained as:</p> <blockquote class=\"example\"><pre>echo -n 'linksecret' | openssl md5 -hex</pre></blockquote><p> </p>__end"
        },
        "scgi_bind": {
            "values": ["address", "off"],
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Makes outgoing connections to an SCGI server originatefrom the specified local IP <code><i>address</i></code>.Parameter value can contain variables (1.3.12).The special value <code>off</code> (1.3.12) cancels the effectof the <code>scgi_bind</code> directiveinherited from the previous configuration level, which allows thesystem to auto-assign the local IP address.</p>"
        },
        "scgi_buffer_size": {
            "values": "size",
            "default": "4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>size</i></code> of the buffer used for reading the first partof the response received from the SCGI server.This part usually contains a small response header.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.It can be made smaller, however.</p>"
        },
        "scgi_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of responses from the SCGI server.</p><p>When buffering is enabled, nginx receives a response from the SCGI serveras soon as possible, saving it into the buffers set by the and  directives.If the whole response does not fit into memory, a part of it can be savedto a  on the disk.Writing to temporary files is controlled by the and directives.</p><p>When buffering is disabled, the response is passed to a client synchronously,immediately as it is received.nginx will not try to read the whole response from the SCGI server.The maximum size of the data that nginx can receive from the serverat a time is set by the  directive.</p><p>Buffering can also be enabled or disabled by passing“<code>yes</code>” or “<code>no</code>” in the“X-Accel-Buffering” response header field.This capability can be disabled using the directive.</p>"
        },
        "scgi_buffers": {
            "values": "number size",
            "default": "8 4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> and <code><i>size</i></code> of thebuffers used for reading a response from the SCGI server,for a single connection.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.</p>"
        },
        "scgi_busy_buffers_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the SCGIserver is enabled, limits the total <code><i>size</i></code> of buffers thatcan be busy sending a response to the client while the response is notyet fully read.In the meantime, the rest of the buffers can be used for reading the responseand, if needed, buffering part of the response to a temporary file.By default, <code><i>size</i></code> is limited by the size of two buffers set by the and  directives.</p>"
        },
        "scgi_cache": {
            "values": ["zone", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a shared memory zone used for caching.The same zone can be used in several places.Parameter value can contain variables (1.7.9).The <code>off</code> parameter disables caching inheritedfrom the previous configuration level.</p>"
        },
        "scgi_cache_bypass": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be taken from a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be taken from the cache:</p> <blockquote class=\"example\"><pre>scgi_cache_bypass $cookie_nocache $arg_nocache$arg_comment;scgi_cache_bypass $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "scgi_cache_key": {
            "values": "string",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a key for caching, for example</p> <blockquote class=\"example\"><pre>scgi_cache_key localhost:9000$request_uri;</pre></blockquote><p> </p>"
        },
        "scgi_cache_lock": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When enabled, only one request at a time will be allowed to populatea new cache element identified according to the directive by passing a request to an SCGI server.Other requests of the same cache element will either waitfor a response to appear in the cache or the cache lock forthis element to be released, up to the time set by the directive.</p>"
        },
        "scgi_cache_lock_age": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the last request passed to the SCGI serverfor populating a new cache elementhas not completed for the specified <code><i>time</i></code>,one more request may be passed to the SCGI server.</p>"
        },
        "scgi_cache_lock_timeout": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for .When the <code><i>time</i></code> expires,the request will be passed to the SCGI server,however, the response will not be cached.</p> <blockquote class=\"note\">Before 1.7.8, the response could be cached.</blockquote><p> </p>"
        },
        "scgi_cache_methods": {
            "values": ["GET", "HEAD", "POST ..."],
            "default": "GET HEAD",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the client request method is listed in this directive thenthe response will be cached.“<code>GET</code>” and “<code>HEAD</code>” methods are alwaysadded to the list, though it is recommended to specify them explicitly.See also the  directive.</p>"
        },
        "scgi_cache_min_uses": {
            "values": "number",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> of requests after which the responsewill be cached.</p>"
        },
        "scgi_cache_path": {
            "values": "path [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] [loader_files=number] [loader_sleep=time] [loader_threshold=time] [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the path and other parameters of a cache.Cache data are stored in files.The file name in a cache is a result ofapplying the MD5 function to the.The <code>levels</code> parameter defines hierarchy levels of a cache.For example, in the following configuration</p> <blockquote class=\"example\"><pre>scgi_cache_path /data/nginx/cache levels=1:2 keys_zone=one:10m;</pre></blockquote><p> file names in a cache will look like this:</p> <blockquote class=\"example\"><pre>/data/nginx/cache/<strong>c</strong>/<strong>29</strong>/b7f54b2df7773722d382f4809d650<strong>29c</strong></pre></blockquote><p> </p><p>A cached response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the cache can be put ondifferent file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both cache and a directoryholding temporary filesare put on the same file system.A directory for temporary files is set based onthe <code>use_temp_path</code> parameter (1.7.10).If this parameter is omitted or set to the value <code>on</code>,the directory set by the  directivefor the given location will be used.If the value is set to <code>off</code>,temporary files will be put directly in the cache directory.</p><p>In addition, all active keys and information about data are storedin a shared memory zone, whose <code><i>name</i></code> and <code><i>size</i></code>are configured by the <code>keys_zone</code> parameter.One megabyte zone can store about 8 thousand keys.</p><p>Cached data that are not accessed during the time specified by the<code>inactive</code> parameter get removed from the cacheregardless of their freshness.By default, <code>inactive</code> is set to 10 minutes.</p><p>The special “cache manager” process monitors the maximum cache size setby the <code>max_size</code> parameter.When this size is exceeded, it removes the least recently used data.</p><p>A minute after the start the special “cache loader” process is activated.It loads information about previously cached data stored on file systeminto a cache zone.The loading is done in iterations.During one iteration no more than <code>loader_files</code> itemsare loaded (by default, 100).Besides, the duration of one iteration is limited by the<code>loader_threshold</code> parameter (by default, 200 milliseconds).Between iterations, a pause configured by the <code>loader_sleep</code>parameter (by default, 50 milliseconds) is made.</p><p>Additionally,the following parameters are available as part of our:</p><p></p> <dl class=\"compact\"><dt id=\"purger\"><code>purger</code>=<code>on</code>|<code>off</code></dt><dd>Instructs whether cache entries that match awill be removed from the disk by the cache purger (1.7.12).Setting the parameter to <code>on</code>(default is <code>off</code>)will activate the “cache purger” process thatpermanently iterates through all cache entriesand deletes the entries that match the wildcard key.</dd><dt id=\"purger_files\"><code>purger_files</code>=<code><i>number</i></code></dt><dd>Sets the number of items that will be scanned during one iteration (1.7.12).By default, <code>purger_files</code> is set to 10.</dd><dt id=\"purger_threshold\"><code>purger_threshold</code>=<code><i>number</i></code></dt><dd>Sets the duration of one iteration (1.7.12).By default, <code>purger_threshold</code> is set to 50 milliseconds.</dd><dt id=\"purger_sleep\"><code>purger_sleep</code>=<code><i>number</i></code></dt><dd>Sets a pause between iterations (1.7.12).By default, <code>purger_sleep</code> is set to 50 milliseconds.</dd></dl><p> </p>"
        },
        "scgi_cache_purge": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the request will be considered a cachepurge request.If at least one value of the string parameters is not empty and is not equalto “0” then the cache entry with a corresponding is removed.The result of successful operation is indicated by returningthe 204 (No Content) response.</p><p>If the  of a purge request endswith an asterisk (“<code>*</code>”), all cache entries matching thewildcard key will be removed from the cache.However, these entries will remain on the disk until they are deletedfor either ,or processed by the  (1.7.12),or a client attempts to access them.</p><p>Example configuration:</p> <blockquote class=\"example\"><pre>scgi_cache_path /data/nginx/cache keys_zone=cache_zone:10m;map $request_method $purge_method {    PURGE   1;    default 0;}server {    ...    location / {        scgi_pass        backend;        scgi_cache       cache_zone;        scgi_cache_key   $uri;        scgi_cache_purge $purge_method;    }}</pre></blockquote><p> </p> <blockquote class=\"note\">This functionality is available as part of our.</blockquote><p> </p>"
        },
        "scgi_cache_revalidate": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables revalidation of expired cache items using conditional requests withthe “If-Modified-Since” and “If-None-Match”header fields.</p>"
        },
        "scgi_cache_use_stale": {
            "values": ["error", "timeout", "invalid_header", "updating", "http_500", "http_503", "http_403", "http_404", "off ..."],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines in which cases a stale cached response can be usedwhen an error occurs during communication with the SCGI server.The directive’s parameters match the parameters of the directive.</p><p>The <code>error</code> parameter also permitsusing a stale cached response if an SCGI server to process a requestcannot be selected.</p><p>Additionally, the <code>updating</code> parameter permitsusing a stale cached response if it is currently being updated.This allows minimizing the number of accesses to SCGI serverswhen updating cached data.</p><p>To minimize the number of accesses to SCGI servers whenpopulating a new cache element, the directive can be used.</p>"
        },
        "scgi_cache_valid": {
            "values": "[code ...] time",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets caching time for different response codes.For example, the following directives</p> <blockquote class=\"example\"><pre>scgi_cache_valid 200 302 10m;scgi_cache_valid 404      1m;</pre></blockquote><p> set 10 minutes of caching for responses with codes 200 and 302and 1 minute for responses with code 404.</p><p>If only caching <code><i>time</i></code> is specified</p> <blockquote class=\"example\"><pre>scgi_cache_valid 5m;</pre></blockquote><p> then only 200, 301, and 302 responses are cached.</p><p>In addition, the <code>any</code> parameter can be specifiedto cache any responses:</p> <blockquote class=\"example\"><pre>scgi_cache_valid 200 302 10m;scgi_cache_valid 301      1h;scgi_cache_valid any      1m;</pre></blockquote><p> </p><p>Parameters of caching can also be set directlyin the response header.This has higher priority than setting of caching time using the directive.</p> <ul><li>The “X-Accel-Expires” header field sets caching time of aresponse in seconds.The zero value disables caching for a response.If the value starts with the <code>@</code> prefix, it sets an absolutetime in seconds since Epoch, up to which the response may be cached.</li><li>If the header does not include the “X-Accel-Expires” field,parameters of caching may be set in the header fields“Expires” or “Cache-Control”.</li><li>If the header includes the “Set-Cookie” field, such aresponse will not be cached.</li><li>If the header includes the “Vary” fieldwith the special value “<code>*</code>”, such aresponse will not be cached (1.7.7).If the header includes the “Vary” fieldwith another value, such a response will be cachedtaking into account the corresponding request header fields (1.7.7).</li></ul><p> Processing of one or more of these response header fields can be disabledusing the  directive.</p>"
        },
        "scgi_connect_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for establishing a connection with an SCGI server.It should be noted that this timeout cannot usually exceed 75 seconds.</p>"
        },
        "scgi_force_ranges": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables byte-range supportfor both cached and uncached responses from the SCGI serverregardless of the “Accept-Ranges” field in these responses.</p>"
        },
        "scgi_hide_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>By default,nginx does not pass the header fields “Status” and“X-Accel-...” from the response of an SCGIserver to a client.The <code>scgi_hide_header</code> directive sets additional fieldsthat will not be passed.If, on the contrary, the passing of fields needs to be permitted,the  directive can be used.</p>"
        },
        "scgi_ignore_client_abort": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether the connection with an SCGI server should beclosed when a client closes the connection without waitingfor a response.</p>"
        },
        "scgi_ignore_headers": {
            "values": "field ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Disables processing of certain response header fields from the SCGI server.The following fields can be ignored: “X-Accel-Redirect”,“X-Accel-Expires”, “X-Accel-Limit-Rate” (1.1.6),“X-Accel-Buffering” (1.1.6),“X-Accel-Charset” (1.1.6), “Expires”,“Cache-Control”, “Set-Cookie” (0.8.44),and “Vary” (1.7.7).</p><p>If not disabled, processing of these header fields has the followingeffect:</p> <ul><li>“X-Accel-Expires”, “Expires”,“Cache-Control”, “Set-Cookie”,and “Vary”set the parameters of response ;</li><li>“X-Accel-Redirect” performs an to the specified URI;</li><li>“X-Accel-Limit-Rate” sets the for transmission of a response to a client;</li><li>“X-Accel-Buffering” enables or disables of a response;</li><li>“X-Accel-Charset” sets the desiredof a response.</li></ul><p> </p>"
        },
        "scgi_intercept_errors": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether an SCGI server responses with codes greater than or equalto 300 should be passed to a client or be redirected to nginx for processingwith the  directive.</p>"
        },
        "scgi_limit_rate": {
            "values": "rate",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the speed of reading the response from the SCGI server.The <code><i>rate</i></code> is specified in bytes per second.The zero value disables rate limiting.The limit is set per a request, and so if nginx simultaneously openstwo connections to the SCGI server,the overall rate will be twice as much as the specified limit.The limitation works only if of responses from the SCGIserver is enabled.</p>"
        },
        "scgi_max_temp_file_size": {
            "values": "size",
            "default": "1024m",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the SCGIserver is enabled, and the whole response does not fit into the buffersset by the  and directives, a part of the response can be saved to a temporary file.This directive sets the maximum <code><i>size</i></code> of the temporary file.The size of data written to the temporary file at a time is setby the  directive.</p><p>The zero value disables buffering of responses to temporary files.</p><p></p> <blockquote class=\"note\">This restriction does not apply to responsesthat will be or  on disk.</blockquote><p> </p>"
        },
        "scgi_next_upstream": {
            "values": ["error", "timeout", "invalid_header", "http_500", "http_503", "http_403", "http_404", "off ..."],
            "default": "error timeout",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies in which cases a request should be passed to the next server:</p> <dl class=\"compact\"><dt><code>error</code></dt><dd>an error occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>timeout</code></dt><dd>a timeout has occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>invalid_header</code></dt><dd>a server returned an empty or invalid response;</dd><dt><code>http_500</code></dt><dd>a server returned a response with the code 500;</dd><dt><code>http_503</code></dt><dd>a server returned a response with the code 503;</dd><dt><code>http_403</code></dt><dd>a server returned a response with the code 403;</dd><dt><code>http_404</code></dt><dd>a server returned a response with the code 404;</dd><dt><code>off</code></dt><dd>disables passing a request to the next server.</dd></dl><p> </p><p>One should bear in mind that passing a request to the next server isonly possible if nothing has been sent to a client yet.That is, if an error or timeout occurs in the middle of thetransferring of a response, fixing this is impossible.</p><p>The directive also defines what is considered an of communication with a server.The cases of <code>error</code>, <code>timeout</code> and<code>invalid_header</code> are always considered unsuccessful attempts,even if they are not specified in the directive.The cases of <code>http_500</code> and <code>http_503</code> areconsidered unsuccessful attempts only if they are specified in the directive.The cases of <code>http_403</code> and <code>http_404</code>are never considered unsuccessful attempts.</p><p>Passing a request to the next server can be limited byand by .</p>"
        },
        "scgi_next_upstream_timeout": {
            "values": "time",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the time allowed to pass a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "scgi_next_upstream_tries": {
            "values": "number",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the number of possible tries for passing a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "scgi_no_cache": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be saved to a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be saved:</p> <blockquote class=\"example\"><pre>scgi_no_cache $cookie_nocache $arg_nocache$arg_comment;scgi_no_cache $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "scgi_param": {
            "values": "parameter value [if_not_empty]",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a <code><i>parameter</i></code> that should be passed to the SCGI server.The <code><i>value</i></code> can contain text, variables, and their combination.These directives are inherited from the previous level if andonly if there are no<code>scgi_param</code>directives defined on the current level.</p><p>Standardshould be provided as SCGI headers, see the <code>scgi_params</code> fileprovided in the distribution:</p> <blockquote class=\"example\"><pre>location / {    include scgi_params;    ...}</pre></blockquote><p> </p><p>If a directive is specified with <code>if_not_empty</code> (1.1.11) thensuch a parameter will not be passed to the server until its value is not empty:</p> <blockquote class=\"example\"><pre>scgi_param HTTPS $https if_not_empty;</pre></blockquote><p> </p>"
        },
        "scgi_pass": {
            "values": "address",
            "default": "",
            "context": ["location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Sets the address of an SCGI server.The address can be specified as a domain name or IP address,and a port:</p> <blockquote class=\"example\"><pre>scgi_pass localhost:9000;</pre></blockquote><p> or as a UNIX-domain socket path:</p> <blockquote class=\"example\"><pre>scgi_pass unix:/tmp/scgi.socket;</pre></blockquote><p> </p><p>If a domain name resolves to several addresses, all of them will beused in a round-robin fashion.In addition, an address can be specified as a.</p>"
        },
        "scgi_pass_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Permits passing  headerfields from an SCGI server to a client.</p>"
        },
        "scgi_pass_request_body": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the original request body is passedto the SCGI server.See also the  directive.</p>"
        },
        "scgi_pass_request_headers": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the header fields of the original request are passedto the SCGI server.See also the  directive.</p>"
        },
        "scgi_read_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for reading a response from the SCGI server.The timeout is set only between two successive read operations,not for the transmission of the whole response.If the SCGI server does not transmit anything within this time,the connection is closed.</p>"
        },
        "scgi_request_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of a client request body.</p><p>When buffering is enabled, the entire request body isfrom the client before sending the request to an SCGI server.</p><p>When buffering is disabled, the request body is sent to the SCGI serverimmediately as it is received.In this case, the request cannot be passed to theif nginx already started sending the request body.</p><p>When HTTP/1.1 chunked transfer encoding is usedto send the original request body,the request body will be buffered regardless of the directive value.</p>"
        },
        "scgi_send_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for transmitting a request to the SCGI server.The timeout is set only between two successive write operations,not for the transmission of the whole request.If the SCGI server does not receive anything within this time,the connection is closed.</p>"
        },
        "scgi_store": {
            "values": ["on", "off", "string"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables saving of files to a disk.The <code>on</code> parameter saves files with pathscorresponding to the directives or.The <code>off</code> parameter disables saving of files.In addition, the file name can be set explicitly using the<code><i>string</i></code> with variables:</p> <blockquote class=\"example\"><pre>scgi_store /data/www$original_uri;</pre></blockquote><p> </p><p>The modification time of files is set according to the received“Last-Modified” response header field.The response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the persistent storecan be put on different file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both saved files and adirectory holding temporary files, set by the directive, are put on the same file system.</p><p>This directive can be used to create local copies of static unchangeablefiles, e.g.:</p> <blockquote class=\"example\"><pre>location /images/ {    root              /data/www;    error_page        404 = /fetch$uri;}location /fetch/ {    internal;    scgi_pass         backend:9000;    ...    scgi_store        on;    scgi_store_access user:rw group:rw all:r;    scgi_temp_path    /data/temp;    alias             /data/www/;}</pre></blockquote><p> </p>"
        },
        "scgi_store_access": {
            "values": "users:permissions ...",
            "default": "user:rw",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets access permissions for newly created files and directories, e.g.:</p> <blockquote class=\"example\"><pre>scgi_store_access user:rw group:rw all:r;</pre></blockquote><p> </p><p>If any <code>group</code> or <code>all</code> access permissionsare specified then <code>user</code> permissions may be omitted:</p> <blockquote class=\"example\"><pre>scgi_store_access group:rw all:r;</pre></blockquote><p> </p>"
        },
        "scgi_temp_file_write_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the <code><i>size</i></code> of data written to a temporary fileat a time, when buffering of responses from the SCGI serverto temporary files is enabled.By default, <code><i>size</i></code> is limited by two buffers set by the and  directives.The maximum size of a temporary file is set by the directive.</p>__end"
        },
        "referer_hash_bucket_size": {
            "values": "size",
            "default": "64",
            "context": ["server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the bucket size for the valid referers hash tables.The details of setting up hash tables are provided in a separate.</p>"
        },
        "referer_hash_max_size": {
            "values": "size",
            "default": "2048",
            "context": ["server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum <code><i>size</i></code> of the valid referers hash tables.The details of setting up hash tables are provided in a separate.</p>"
        },
        "valid_referers": {
            "values": ["none", "blocked", "server_names", "string ..."],
            "default": "",
            "context": ["server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies the “Referer” request header field valuesthat will cause the embedded <code>$invalid_referer</code> variable tobe set to an empty string.Otherwise, the variable will be set to “<code>1</code>”.Search for a match is case-insensitive.</p><p>Parameters can be as follows:</p> <dl class=\"compact\"><dt><code>none</code></dt><dd>the “Referer” field is missing in the request header;</dd><dt><code>blocked</code></dt><dd>the “Referer” field is present in the request header,but its value has been deleted by a firewall or proxy server;such values are strings that do not start with“<code>http://</code>” or “<code>https://</code>”;</dd><dt><code>server_names</code></dt><dd>the “Referer” request header field containsone of the server names;</dd><dt>arbitrary string</dt><dd>defines a server name and an optional URI prefix.A server name can have an “<code>*</code>” at the beginning or end.During the checking, the server’s port in the “Referer” fieldis ignored;</dd><dt>regular expression</dt><dd>the first symbol should be a “<code>~</code>”.It should be noted that an expression will be matched againstthe text starting after the “<code>http://</code>”or “<code>https://</code>”.</dd></dl><p> </p><p>Example:</p> <blockquote class=\"example\"><pre>valid_referers none blocked server_names               *.example.com example.* www.example.org/galleries/               ~\\.google\\.;</pre></blockquote><p> </p>__end"
        },
        "set_real_ip_from": {
            "values": ["address", "CIDR", "unix:"],
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Defines trusted addresses that are known to send correctreplacement addresses.If the special value <code>unix:</code> is specified,all UNIX-domain sockets will be trusted.</p> <blockquote class=\"note\">IPv6 addresses are supported starting from versions 1.3.0 and 1.2.1.</blockquote><p> </p>"
        },
        "real_ip_header": {
            "values": ["field", "X-Real-IP", "X-Forwarded-For", "proxy_protocol"],
            "default": "X-Real-IP",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines the request header fieldwhose value will be used to replace the client address.</p><p>The <code>proxy_protocol</code> parameter (1.5.12) changesthe client address to the one from the PROXY protocol header.The PROXY protocol must be previously enabled by setting the<code>proxy_protocol</code> parameterin the  directive.</p>"
        },
        "real_ip_recursive": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If recursive search is disabled, the original client address thatmatches one of the trusted addresses is replaced by the lastaddress sent in the request header field defined by the directive.If recursive search is enabled, the original client address thatmatches one of the trusted addresses is replaced by the lastnon-trusted address sent in the request header field.</p>__end"
        },
        "proxy_buffer": {
            "values": "size",
            "default": "4k|8k",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the size of the buffer used for proxying.By default, the buffer size is equal to one memory page.Depending on a platform, it is either 4K or 8K.</p>"
        },
        "proxy_pass_error_message": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether to pass the error message obtained duringthe authentication on the backend to the client.</p><p>Usually, if the authentication in nginx is a success,the backend cannot return an error.If it nevertheless returns an error,it means some internal error has occurred.In such case the backend message can contain informationthat should not be shown to the client.However, responding with an error for the correct passwordis a normal behavior for some POP3 servers.For example, CommuniGatePro informs a user about or other events by periodically outputting the.The directive should be enabled in this case.</p>"
        },
        "proxy_timeout": {
            "values": "timeout",
            "default": "10m",
            "context": ["stream", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>timeout</i></code> between two successiveread or write operations on client or proxied server connections.If no data is transmitted within this time, the connection is closed.</p>__end"
        },
        "proxy_bind": {
            "values": ["address", "off"],
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Makes outgoing connections to a proxied server originatefrom the specified local IP <code><i>address</i></code>.Parameter value can contain variables (1.3.12).The special value <code>off</code> (1.3.12) cancels the effectof the <code>proxy_bind</code> directiveinherited from the previous configuration level, which allows thesystem to auto-assign the local IP address.</p>"
        },
        "proxy_buffer_size": {
            "values": "size",
            "default": "4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>size</i></code> of the buffer used for reading the first partof the response received from the proxied server.This part usually contains a small response header.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.It can be made smaller, however.</p>"
        },
        "proxy_connect_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for establishing a connection with a proxied server.It should be noted that this timeout cannot usually exceed 75 seconds.</p>"
        },
        "proxy_download_rate": {
            "values": "rate",
            "default": "0",
            "context": ["stream", "server"],
            "isIn": isIn,
            "tooltip": "<p>Limits the speed of reading the data from the proxied server.The <code><i>rate</i></code> is specified in bytes per second.The zero value disables rate limiting.The limit is set per a connection, so if nginx simultaneously openstwo connections to the proxied server,the overall rate will be twice as much as the specified limit.</p>"
        },
        "proxy_next_upstream": {
            "values": ["error", "timeout", "invalid_header", "http_500", "http_502", "http_503", "http_504", "http_403", "http_404", "off ..."],
            "default": "error timeout",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies in which cases a request should be passed to the next server:</p> <dl class=\"compact\"><dt><code>error</code></dt><dd>an error occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>timeout</code></dt><dd>a timeout has occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>invalid_header</code></dt><dd>a server returned an empty or invalid response;</dd><dt><code>http_500</code></dt><dd>a server returned a response with the code 500;</dd><dt><code>http_502</code></dt><dd>a server returned a response with the code 502;</dd><dt><code>http_503</code></dt><dd>a server returned a response with the code 503;</dd><dt><code>http_504</code></dt><dd>a server returned a response with the code 504;</dd><dt><code>http_403</code></dt><dd>a server returned a response with the code 403;</dd><dt><code>http_404</code></dt><dd>a server returned a response with the code 404;</dd><dt><code>off</code></dt><dd>disables passing a request to the next server.</dd></dl><p> </p><p>One should bear in mind that passing a request to the next server isonly possible if nothing has been sent to a client yet.That is, if an error or timeout occurs in the middle of thetransferring of a response, fixing this is impossible.</p><p>The directive also defines what is considered an of communication with a server.The cases of <code>error</code>, <code>timeout</code> and<code>invalid_header</code> are always considered unsuccessful attempts,even if they are not specified in the directive.The cases of <code>http_500</code>, <code>http_502</code>,<code>http_503</code> and <code>http_504</code> areconsidered unsuccessful attempts only if they are specified in the directive.The cases of <code>http_403</code> and <code>http_404</code>are never considered unsuccessful attempts.</p><p>Passing a request to the next server can be limited byand by .</p>"
        },
        "proxy_next_upstream_timeout": {
            "values": "time",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the time allowed to pass a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "proxy_next_upstream_tries": {
            "values": "number",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the number of possible tries for passing a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "proxy_pass": {
            "values": "URL",
            "default": "",
            "context": ["location", "ifinlocation", "limit_except"],
            "isIn": isIn,
            "tooltip": "<p>Sets the protocol and address of a proxied server and an optional URIto which a location should be mapped.As a protocol, “<code>http</code>” or “<code>https</code>”can be specified.The address can be specified as a domain name or IP address,and an optional port:</p> <blockquote class=\"example\"><pre>proxy_pass http://localhost:8000/uri/;</pre></blockquote><p> or as a UNIX-domain socket path specified after the word“<code>unix</code>” and enclosed in colons:</p> <blockquote class=\"example\"><pre>proxy_pass http://unix:/tmp/backend.socket:/uri/;</pre></blockquote><p> </p><p>If a domain name resolves to several addresses, all of them will beused in a round-robin fashion.In addition, an address can be specified as a.</p><p>A request URI is passed to the server as follows:</p> <ul><li>If the <code>proxy_pass</code> directive is specified with a URI,then when a request is passed to the server, the part of arequest URI matching the location is replaced by a URIspecified in the directive:<blockquote class=\"example\"><pre>location /name/ {    proxy_pass http://127.0.0.1/remote/;}</pre></blockquote></li><li>If <code>proxy_pass</code> is specified without a URI,the request URI is passed to the server in the same formas sent by a client when the original request is processed,or the full normalized request URI is passedwhen processing the changed URI:<blockquote class=\"example\"><pre>location /some/path/ {    proxy_pass http://127.0.0.1;}</pre></blockquote><blockquote class=\"note\">Before version 1.1.12,if <code>proxy_pass</code> is specified without a URI,the original request URI might be passedinstead of the changed URI in some cases.</blockquote></li></ul><p> </p><p>In some cases, the part of a request URI to be replaced cannot be determined:</p> <ul><li>When location is specified using a regular expression.<p>In this case, the directive should be specified without a URI.</p></li><li>When the URI is changed inside a proxied location using the directive,and this same configuration will be used to process a request(<code>break</code>):<blockquote class=\"example\"><pre>location /name/ {    rewrite    /name/([^/]+) /users?name=$1 break;    proxy_pass http://127.0.0.1;}</pre></blockquote><p>In this case, the URI specified in the directive is ignored andthe full changed request URI is passed to the server.</p></li></ul><p> </p><p>A server name, its port and the passed URI can also be specified usingvariables:</p> <blockquote class=\"example\"><pre>proxy_pass http://$host$uri;</pre></blockquote><p> or even like this:</p> <blockquote class=\"example\"><pre>proxy_pass $request;</pre></blockquote><p> </p><p>In this case, the server name is searched among the described,and, if not found, is determined using a.</p><p> proxying requires specialconfiguration and is supported since version 1.3.13.</p>"
        },
        "proxy_protocol": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["stream", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables the for connections to a proxied server.</p>"
        },
        "proxy_ssl": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["stream", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables the SSL/TLS protocol for connections to a proxied server.</p>"
        },
        "proxy_ssl_certificate": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with the certificate in the PEM formatused for authentication to a proxied HTTPS server.</p>"
        },
        "proxy_ssl_certificate_key": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with the secret key in the PEM formatused for authentication to a proxied HTTPS server.</p><p>The value<code>engine</code>:<code><i>name</i></code>:<code><i>id</i></code>can be specified instead of the <code><i>file</i></code> (1.7.9),which loads a secret key with a specified <code><i>id</i></code>from the OpenSSL engine <code><i>name</i></code>.</p>"
        },
        "proxy_ssl_ciphers": {
            "values": "ciphers",
            "default": "DEFAULT",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies the enabled ciphers for requests to a proxied HTTPS server.The ciphers are specified in the format understood by the OpenSSL library.</p><p>The full list can be viewed using the“<code>openssl ciphers</code>” command.</p>"
        },
        "proxy_ssl_crl": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with revoked certificates (CRL)in the PEM format used to the certificate of the proxied HTTPS server.</p>"
        },
        "proxy_ssl_name": {
            "values": "name",
            "default": "$proxy_host",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows to override the server name used tothe certificate of the proxied HTTPS server and to bewhen establishing a connection with the proxied HTTPS server.</p><p>By default, the host part of the  URL is used.</p>"
        },
        "proxy_ssl_password_file": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with passphrases forwhere each passphrase is specified on a separate line.Passphrases are tried in turn when loading the key.</p>"
        },
        "proxy_ssl_server_name": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables passing of the server name through (SNI, RFC 6066)when establishing a connection with the proxied HTTPS server.</p>"
        },
        "proxy_ssl_session_reuse": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether SSL sessions can be reused when working withthe proxied server.If the errors“<code>SSL3_GET_FINISHED:digest check failed</code>”appear in the logs, try disabling session reuse.</p>"
        },
        "proxy_ssl_protocols": {
            "values": "[SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2]",
            "default": "TLSv1 TLSv1.1 TLSv1.2",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables the specified protocols for requests to a proxied HTTPS server.</p>"
        },
        "proxy_ssl_trusted_certificate": {
            "values": "file",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> with trusted CA certificates in the PEM formatused to the certificate of the proxied HTTPS server.</p>"
        },
        "proxy_ssl_verify": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables verification of the proxied HTTPS server certificate.</p>"
        },
        "proxy_ssl_verify_depth": {
            "values": "number",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the verification depth in the proxied HTTPS server certificates chain.</p>"
        },
        "proxy_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of responses from the proxied server.</p><p>When buffering is enabled, nginx receives a response from the proxied serveras soon as possible, saving it into the buffers set by the and  directives.If the whole response does not fit into memory, a part of it can be savedto a  on the disk.Writing to temporary files is controlled by the and directives.</p><p>When buffering is disabled, the response is passed to a client synchronously,immediately as it is received.nginx will not try to read the whole response from the proxied server.The maximum size of the data that nginx can receive from the serverat a time is set by the  directive.</p><p>Buffering can also be enabled or disabled by passing“<code>yes</code>” or “<code>no</code>” in the“X-Accel-Buffering” response header field.This capability can be disabled using the directive.</p>"
        },
        "proxy_buffers": {
            "values": "number size",
            "default": "8 4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> and <code><i>size</i></code> of thebuffers used for reading a response from the proxied server,for a single connection.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.</p>"
        },
        "proxy_busy_buffers_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the proxiedserver is enabled, limits the total <code><i>size</i></code> of buffers thatcan be busy sending a response to the client while the response is notyet fully read.In the meantime, the rest of the buffers can be used for reading the responseand, if needed, buffering part of the response to a temporary file.By default, <code><i>size</i></code> is limited by the size of two buffers set by the and  directives.</p>"
        },
        "proxy_cache": {
            "values": ["zone", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a shared memory zone used for caching.The same zone can be used in several places.Parameter value can contain variables (1.7.9).The <code>off</code> parameter disables caching inheritedfrom the previous configuration level.</p>"
        },
        "proxy_cache_bypass": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be taken from a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be taken from the cache:</p> <blockquote class=\"example\"><pre>proxy_cache_bypass $cookie_nocache $arg_nocache$arg_comment;proxy_cache_bypass $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "proxy_cache_convert_head": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables the conversion of the “<code>HEAD</code>” methodto “<code>GET</code>” for caching.When the conversion is disabled, the should be configuredto include the <code>$request_method</code>.</p>"
        },
        "proxy_cache_key": {
            "values": "string",
            "default": "$scheme$proxy_host$request_uri",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a key for caching, for example</p> <blockquote class=\"example\"><pre>proxy_cache_key \"$host$request_uri $cookie_user\";</pre></blockquote><p> By default, the directive’s value is close to the string</p> <blockquote class=\"example\"><pre>proxy_cache_key $scheme$proxy_host$uri$is_args$args;</pre></blockquote><p> </p>"
        },
        "proxy_cache_lock": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When enabled, only one request at a time will be allowed to populatea new cache element identified according to the directive by passing a request to a proxied server.Other requests of the same cache element will either waitfor a response to appear in the cache or the cache lock forthis element to be released, up to the time set by the directive.</p>"
        },
        "proxy_cache_lock_age": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the last request passed to the proxied serverfor populating a new cache elementhas not completed for the specified <code><i>time</i></code>,one more request may be passed to the proxied server.</p>"
        },
        "proxy_cache_lock_timeout": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for .When the <code><i>time</i></code> expires,the request will be passed to the proxied server,however, the response will not be cached.</p> <blockquote class=\"note\">Before 1.7.8, the response could be cached.</blockquote><p> </p>"
        },
        "proxy_cache_methods": {
            "values": ["GET", "HEAD", "POST ..."],
            "default": "GET HEAD",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the client request method is listed in this directive thenthe response will be cached.“<code>GET</code>” and “<code>HEAD</code>” methods are alwaysadded to the list, though it is recommended to specify them explicitly.See also the  directive.</p>"
        },
        "proxy_cache_min_uses": {
            "values": "number",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> of requests after which the responsewill be cached.</p>"
        },
        "proxy_cache_path": {
            "values": "path [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] [loader_files=number] [loader_sleep=time] [loader_threshold=time] [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the path and other parameters of a cache.Cache data are stored in files.The file name in a cache is a result ofapplying the MD5 function to the.The <code>levels</code> parameter defines hierarchy levels of a cache.For example, in the following configuration</p> <blockquote class=\"example\"><pre>proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=one:10m;</pre></blockquote><p> file names in a cache will look like this:</p> <blockquote class=\"example\"><pre>/data/nginx/cache/<strong>c</strong>/<strong>29</strong>/b7f54b2df7773722d382f4809d650<strong>29c</strong></pre></blockquote><p> </p><p>A cached response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the cache can be put ondifferent file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both cache and a directoryholding temporary filesare put on the same file system.The directory for temporary files is set based onthe <code>use_temp_path</code> parameter (1.7.10).If this parameter is omitted or set to the value <code>on</code>,the directory set by the  directivefor the given location will be used.If the value is set to <code>off</code>,temporary files will be put directly in the cache directory.</p><p>In addition, all active keys and information about data are storedin a shared memory zone, whose <code><i>name</i></code> and <code><i>size</i></code>are configured by the <code>keys_zone</code> parameter.One megabyte zone can store about 8 thousand keys.</p><p>Cached data that are not accessed during the time specified by the<code>inactive</code> parameter get removed from the cacheregardless of their freshness.By default, <code>inactive</code> is set to 10 minutes.</p><p>The special “cache manager” process monitors the maximum cache size setby the <code>max_size</code> parameter.When this size is exceeded, it removes the least recently used data.</p><p>A minute after the start the special “cache loader” process is activated.It loads information about previously cached data stored on file systeminto a cache zone.The loading is done in iterations.During one iteration no more than <code>loader_files</code> itemsare loaded (by default, 100).Besides, the duration of one iteration is limited by the<code>loader_threshold</code> parameter (by default, 200 milliseconds).Between iterations, a pause configured by the <code>loader_sleep</code>parameter (by default, 50 milliseconds) is made.</p><p>Additionally,the following parameters are available as part of our:</p><p></p> <dl class=\"compact\"><dt id=\"purger\"><code>purger</code>=<code>on</code>|<code>off</code></dt><dd>Instructs whether cache entries that match awill be removed from the disk by the cache purger (1.7.12).Setting the parameter to <code>on</code>(default is <code>off</code>)will activate the “cache purger” process thatpermanently iterates through all cache entriesand deletes the entries that match the wildcard key.</dd><dt id=\"purger_files\"><code>purger_files</code>=<code><i>number</i></code></dt><dd>Sets the number of items that will be scanned during one iteration (1.7.12).By default, <code>purger_files</code> is set to 10.</dd><dt id=\"purger_threshold\"><code>purger_threshold</code>=<code><i>number</i></code></dt><dd>Sets the duration of one iteration (1.7.12).By default, <code>purger_threshold</code> is set to 50 milliseconds.</dd><dt id=\"purger_sleep\"><code>purger_sleep</code>=<code><i>number</i></code></dt><dd>Sets a pause between iterations (1.7.12).By default, <code>purger_sleep</code> is set to 50 milliseconds.</dd></dl><p> </p>"
        },
        "proxy_cache_purge": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the request will be considered a cachepurge request.If at least one value of the string parameters is not empty and is not equalto “0” then the cache entry with a corresponding is removed.The result of successful operation is indicated by returningthe 204 (No Content) response.</p><p>If the  of a purge request endswith an asterisk (“<code>*</code>”), all cache entries matching thewildcard key will be removed from the cache.However, these entries will remain on the disk until they are deletedfor either ,or processed by the  (1.7.12),or a client attempts to access them.</p><p>Example configuration:</p> <blockquote class=\"example\"><pre>proxy_cache_path /data/nginx/cache keys_zone=cache_zone:10m;map $request_method $purge_method {    PURGE   1;    default 0;}server {    ...    location / {        proxy_pass http://backend;        proxy_cache cache_zone;        proxy_cache_key $uri;        proxy_cache_purge $purge_method;    }}</pre></blockquote><p> </p> <blockquote class=\"note\">This functionality is available as part of our.</blockquote><p> </p>"
        },
        "proxy_cache_revalidate": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables revalidation of expired cache items using conditional requests withthe “If-Modified-Since” and “If-None-Match”header fields.</p>"
        },
        "proxy_cache_use_stale": {
            "values": ["error", "timeout", "invalid_header", "updating", "http_500", "http_502", "http_503", "http_504", "http_403", "http_404", "off ..."],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines in which cases a stale cached response can be usedwhen an error occurs during communication with the proxied server.The directive’s parameters match the parameters of the directive.</p><p>The <code>error</code> parameter also permitsusing a stale cached response if a proxied server to process a requestcannot be selected.</p><p>Additionally, the <code>updating</code> parameter permitsusing a stale cached response if it is currently being updated.This allows minimizing the number of accesses to proxied serverswhen updating cached data.</p><p>To minimize the number of accesses to proxied servers whenpopulating a new cache element, the directive can be used.</p>"
        },
        "proxy_cache_valid": {
            "values": "[code ...] time",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets caching time for different response codes.For example, the following directives</p> <blockquote class=\"example\"><pre>proxy_cache_valid 200 302 10m;proxy_cache_valid 404      1m;</pre></blockquote><p> set 10 minutes of caching for responses with codes 200 and 302and 1 minute for responses with code 404.</p><p>If only caching <code><i>time</i></code> is specified</p> <blockquote class=\"example\"><pre>proxy_cache_valid 5m;</pre></blockquote><p> then only 200, 301, and 302 responses are cached.</p><p>In addition, the <code>any</code> parameter can be specifiedto cache any responses:</p> <blockquote class=\"example\"><pre>proxy_cache_valid 200 302 10m;proxy_cache_valid 301      1h;proxy_cache_valid any      1m;</pre></blockquote><p> </p><p>Parameters of caching can also be set directlyin the response header.This has higher priority than setting of caching time using the directive.</p> <ul><li>The “X-Accel-Expires” header field sets caching time of aresponse in seconds.The zero value disables caching for a response.If the value starts with the <code>@</code> prefix, it sets an absolutetime in seconds since Epoch, up to which the response may be cached.</li><li>If the header does not include the “X-Accel-Expires” field,parameters of caching may be set in the header fields“Expires” or “Cache-Control”.</li><li>If the header includes the “Set-Cookie” field, such aresponse will not be cached.</li><li>If the header includes the “Vary” fieldwith the special value “<code>*</code>”, such aresponse will not be cached (1.7.7).If the header includes the “Vary” fieldwith another value, such a response will be cachedtaking into account the corresponding request header fields (1.7.7).</li></ul><p> Processing of one or more of these response header fields can be disabledusing the  directive.</p>"
        },
        "proxy_cookie_domain": {
            "values": "off;proxy_cookie_domain domain replacement",
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a text that should be changed in the <code>domain</code>attribute of the “Set-Cookie” header fields of aproxied server response.Suppose a proxied server returned the “Set-Cookie”header field with the attribute“<code>domain=localhost</code>”.The directive</p> <blockquote class=\"example\"><pre>proxy_cookie_domain localhost example.org;</pre></blockquote><p> will rewrite this attribute to“<code>domain=example.org</code>”.</p><p>A dot at the beginning of the <code><i>domain</i></code> and<code><i>replacement</i></code> strings and the <code>domain</code>attribute is ignored.Matching is case-insensitive.</p><p>The <code><i>domain</i></code> and <code><i>replacement</i></code> stringscan contain variables:</p> <blockquote class=\"example\"><pre>proxy_cookie_domain www.$host $host;</pre></blockquote><p> </p><p>The directive can also be specified using regular expressions.In this case, <code><i>domain</i></code> should start fromthe “<code>~</code>” symbol.A regular expression can contain named and positional captures,and <code><i>replacement</i></code> can reference them:</p> <blockquote class=\"example\"><pre>proxy_cookie_domain ~\\.(?P&lt;sl_domain&gt;[-0-9a-z]+\\.[a-z]+)$ $sl_domain;</pre></blockquote><p> </p><p>There could be several <code>proxy_cookie_domain</code> directives:</p> <blockquote class=\"example\"><pre>proxy_cookie_domain localhost example.org;proxy_cookie_domain ~\\.([a-z]+\\.[a-z]+)$ $1;</pre></blockquote><p> </p><p>The <code>off</code> parameter cancels the effect of all<code>proxy_cookie_domain</code> directives on the current level:</p> <blockquote class=\"example\"><pre>proxy_cookie_domain off;proxy_cookie_domain localhost example.org;proxy_cookie_domain www.example.org example.org;</pre></blockquote><p> </p>"
        },
        "proxy_cookie_path": {
            "values": "off;proxy_cookie_path path replacement",
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a text that should be changed in the <code>path</code>attribute of the “Set-Cookie” header fields of aproxied server response.Suppose a proxied server returned the “Set-Cookie”header field with the attribute“<code>path=/two/some/uri/</code>”.The directive</p> <blockquote class=\"example\"><pre>proxy_cookie_path /two/ /;</pre></blockquote><p> will rewrite this attribute to“<code>path=/some/uri/</code>”.</p><p>The <code><i>path</i></code> and <code><i>replacement</i></code> stringscan contain variables:</p> <blockquote class=\"example\"><pre>proxy_cookie_path $uri /some$uri;</pre></blockquote><p> </p><p>The directive can also be specified using regular expressions.In this case, <code><i>path</i></code> should either start fromthe “<code>~</code>” symbol for a case-sensitive matching,or from the “<code>~*</code>” symbols for case-insensitivematching.The regular expression can contain named and positional captures,and <code><i>replacement</i></code> can reference them:</p> <blockquote class=\"example\"><pre>proxy_cookie_path ~*^/user/([^/]+) /u/$1;</pre></blockquote><p> </p><p>There could be several <code>proxy_cookie_path</code> directives:</p> <blockquote class=\"example\"><pre>proxy_cookie_path /one/ /;proxy_cookie_path / /two/;</pre></blockquote><p> </p><p>The <code>off</code> parameter cancels the effect of all<code>proxy_cookie_path</code> directives on the current level:</p> <blockquote class=\"example\"><pre>proxy_cookie_path off;proxy_cookie_path /two/ /;proxy_cookie_path ~*^/user/([^/]+) /u/$1;</pre></blockquote><p> </p>"
        },
        "proxy_force_ranges": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables byte-range supportfor both cached and uncached responses from the proxied serverregardless of the “Accept-Ranges” field in these responses.</p>"
        },
        "proxy_headers_hash_bucket_size": {
            "values": "size",
            "default": "64",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the bucket <code><i>size</i></code> for hash tablesused by the  and directives.The details of setting up hash tables are provided in a separate.</p>"
        },
        "proxy_headers_hash_max_size": {
            "values": "size",
            "default": "512",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum <code><i>size</i></code> of hash tablesused by the  and directives.The details of setting up hash tables are provided in a separate.</p>"
        },
        "proxy_hide_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>By default,nginx does not pass the header fields “Date”,“Server”, “X-Pad”, and“X-Accel-...” from the response of a proxiedserver to a client.The <code>proxy_hide_header</code> directive sets additional fieldsthat will not be passed.If, on the contrary, the passing of fields needs to be permitted,the  directive can be used.</p>"
        },
        "proxy_http_version": {
            "values": ["1.0", "1.1"],
            "default": "1.0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the HTTP protocol version for proxying.By default, version 1.0 is used.Version 1.1 is recommended for use withconnections and.</p>"
        },
        "proxy_ignore_client_abort": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether the connection with a proxied server should beclosed when a client closes the connection without waitingfor a response.</p>"
        },
        "proxy_ignore_headers": {
            "values": "field ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Disables processing of certain response header fields from the proxied server.The following fields can be ignored: “X-Accel-Redirect”,“X-Accel-Expires”, “X-Accel-Limit-Rate” (1.1.6),“X-Accel-Buffering” (1.1.6),“X-Accel-Charset” (1.1.6), “Expires”,“Cache-Control”, “Set-Cookie” (0.8.44),and “Vary” (1.7.7).</p><p>If not disabled, processing of these header fields has the followingeffect:</p> <ul><li>“X-Accel-Expires”, “Expires”,“Cache-Control”, “Set-Cookie”,and “Vary”set the parameters of response ;</li><li>“X-Accel-Redirect” performs an to the specified URI;</li><li>“X-Accel-Limit-Rate” sets the for transmission of a response to a client;</li><li>“X-Accel-Buffering” enables or disables of a response;</li><li>“X-Accel-Charset” sets the desiredof a response.</li></ul><p> </p>"
        },
        "proxy_intercept_errors": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether proxied responses with codes greater than or equalto 300 should be passed to a client or be redirected to nginx for processingwith the  directive.</p>"
        },
        "proxy_limit_rate": {
            "values": "rate",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the speed of reading the response from the proxied server.The <code><i>rate</i></code> is specified in bytes per second.The zero value disables rate limiting.The limit is set per a request, and so if nginx simultaneously openstwo connections to the proxied server,the overall rate will be twice as much as the specified limit.The limitation works only if of responses from the proxiedserver is enabled.</p>"
        },
        "proxy_max_temp_file_size": {
            "values": "size",
            "default": "1024m",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the proxiedserver is enabled, and the whole response does not fit into the buffersset by the  and directives, a part of the response can be saved to a temporary file.This directive sets the maximum <code><i>size</i></code> of the temporary file.The size of data written to the temporary file at a time is setby the  directive.</p><p>The zero value disables buffering of responses to temporary files.</p><p></p> <blockquote class=\"note\">This restriction does not apply to responsesthat will be or  on disk.</blockquote><p> </p>"
        },
        "proxy_method": {
            "values": "method",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies the HTTP <code><i>method</i></code> to use in requests forwardedto the proxied server instead of the method from the client request.</p>"
        },
        "proxy_no_cache": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be saved to a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be saved:</p> <blockquote class=\"example\"><pre>proxy_no_cache $cookie_nocache $arg_nocache$arg_comment;proxy_no_cache $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "proxy_pass_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Permits passing  headerfields from a proxied server to a client.</p>"
        },
        "proxy_pass_request_body": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the original request body is passedto the proxied server.</p> <blockquote class=\"example\"><pre>location /x-accel-redirect-here/ {    proxy_method GET;    proxy_pass_request_body off;    proxy_set_header Content-Length \"\";    proxy_pass ...}</pre></blockquote><p> See also the  and directives.</p>"
        },
        "proxy_pass_request_headers": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the header fields of the original request are passedto the proxied server.</p> <blockquote class=\"example\"><pre>location /x-accel-redirect-here/ {    proxy_method GET;    proxy_pass_request_headers off;    proxy_pass_request_body off;    proxy_pass ...}</pre></blockquote><p> See also the  and directives.</p>"
        },
        "proxy_read_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for reading a response from the proxied server.The timeout is set only between two successive read operations,not for the transmission of the whole response.If the proxied server does not transmit anything within this time,the connection is closed.</p>"
        },
        "proxy_redirect": {
            "values": "default;proxy_redirect off;proxy_redirect redirect replacement",
            "default": "default",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the text that should be changed in the “Location”and “Refresh” header fields of a proxied server response.Suppose a proxied server returned the header field“<code>Location: http://localhost:8000/two/some/uri/</code>”.The directive</p> <blockquote class=\"example\"><pre>proxy_redirect http://localhost:8000/two/ http://frontend/one/;</pre></blockquote><p> will rewrite this string to“<code>Location: http://frontend/one/some/uri/</code>”.</p><p>A server name may be omitted in the <code><i>replacement</i></code> string:</p> <blockquote class=\"example\"><pre>proxy_redirect http://localhost:8000/two/ /;</pre></blockquote><p> then the primary server’s name and port, if different from 80,will be inserted.</p><p>The default replacement specified by the <code>default</code> parameteruses the parameters of the and directives.Hence, the two configurations below are equivalent:</p> <blockquote class=\"example\"><pre>location /one/ {    proxy_pass     http://upstream:port/two/;    proxy_redirect default;</pre></blockquote><p> </p> <blockquote class=\"example\"><pre>location /one/ {    proxy_pass     http://upstream:port/two/;    proxy_redirect http://upstream:port/two/ /one/;</pre></blockquote><p> The <code>default</code> parameter is not permitted if is specified using variables.</p><p>A <code><i>replacement</i></code> string can contain variables:</p> <blockquote class=\"example\"><pre>proxy_redirect http://localhost:8000/ http://$host:$server_port/;</pre></blockquote><p> </p><p>A <code><i>redirect</i></code> can also contain (1.1.11) variables:</p> <blockquote class=\"example\"><pre>proxy_redirect http://$proxy_host:8000/ /;</pre></blockquote><p> </p><p>The directive can be specified (1.1.11) using regular expressions.In this case, <code><i>redirect</i></code> should either start withthe “<code>~</code>” symbol for a case-sensitive matching,or with the “<code>~*</code>” symbols for case-insensitivematching.The regular expression can contain named and positional captures,and <code><i>replacement</i></code> can reference them:</p> <blockquote class=\"example\"><pre>proxy_redirect ~^(http://[^:]+):\\d+(/.+)$ $1$2;proxy_redirect ~*/user/([^/]+)/(.+)$      http://$1.example.com/$2;</pre></blockquote><p> </p><p>There could be several <code>proxy_redirect</code> directives:</p> <blockquote class=\"example\"><pre>proxy_redirect default;proxy_redirect http://localhost:8000/  /;proxy_redirect http://www.example.com/ /;</pre></blockquote><p> </p><p>The <code>off</code> parameter cancels the effect of all<code>proxy_redirect</code> directives on the current level:</p> <blockquote class=\"example\"><pre>proxy_redirect off;proxy_redirect default;proxy_redirect http://localhost:8000/  /;proxy_redirect http://www.example.com/ /;</pre></blockquote><p> </p><p>Using this directive, it is also possible to add host names to relativeredirects issued by a proxied server:</p> <blockquote class=\"example\"><pre>proxy_redirect / /;</pre></blockquote><p> </p>"
        },
        "proxy_request_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of a client request body.</p><p>When buffering is enabled, the entire request body isfrom the client before sending the request to a proxied server.</p><p>When buffering is disabled, the request body is sent to the proxied serverimmediately as it is received.In this case, the request cannot be passed to theif nginx already started sending the request body.</p><p>When HTTP/1.1 chunked transfer encoding is usedto send the original request body,the request body will be buffered regardless of the directive value unlessHTTP/1.1 is  for proxying.</p>"
        },
        "proxy_send_lowat": {
            "values": "size",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the directive is set to a non-zero value, nginx will try tominimize the numberof send operations on outgoing connections to a proxied server by using either<code>NOTE_LOWAT</code> flag of the method,or the <code>SO_SNDLOWAT</code> socket option,with the specified <code><i>size</i></code>.</p><p>This directive is ignored on Linux, Solaris, and Windows.</p>"
        },
        "proxy_send_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for transmitting a request to the proxied server.The timeout is set only between two successive write operations,not for the transmission of the whole request.If the proxied server does not receive anything within this time,the connection is closed.</p>"
        },
        "proxy_set_body": {
            "values": "value",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows redefining the request body passed to the proxied server.The <code><i>value</i></code> can contain text, variables, and their combination.</p>"
        },
        "proxy_set_header": {
            "values": "field value",
            "default": "Host $proxy_host",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows redefining or appending fields to the request header to the proxied server.The <code><i>value</i></code> can contain text, variables, and their combinations.These directives are inherited from the previous level if andonly if there are no<code>proxy_set_header</code>directives defined on the current level.By default, only two fields are redefined:</p> <blockquote class=\"example\"><pre>proxy_set_header Host       $proxy_host;proxy_set_header Connection close;</pre></blockquote><p> If caching is enabled, the header fields“If-Modified-Since”,“If-Unmodified-Since”,“If-None-Match”,“If-Match”,“Range”,and“If-Range”from the original request are not passed to the proxied server.</p><p>An unchanged “Host” request header field can be passed like this:</p> <blockquote class=\"example\"><pre>proxy_set_header Host       $http_host;</pre></blockquote><p> </p><p>However, if this field is not present in a client request header thennothing will be passed.In such a case it is better to use the <code>$host</code> variable&nbsp;- itsvalue equals the server name in the “Host” request headerfield or the primary server name if this field is not present:</p> <blockquote class=\"example\"><pre>proxy_set_header Host       $host;</pre></blockquote><p> </p><p>In addition, the server name can be passed together with the port of theproxied server:</p> <blockquote class=\"example\"><pre>proxy_set_header Host       $host:$proxy_port;</pre></blockquote><p> </p><p>If the value of a header field is an empty string then thisfield will not be passed to a proxied server:</p> <blockquote class=\"example\"><pre>proxy_set_header Accept-Encoding \"\";</pre></blockquote><p> </p>"
        },
        "proxy_store": {
            "values": ["on", "off", "string"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables saving of files to a disk.The <code>on</code> parameter saves files with pathscorresponding to the directives or.The <code>off</code> parameter disables saving of files.In addition, the file name can be set explicitly using the<code><i>string</i></code> with variables:</p> <blockquote class=\"example\"><pre>proxy_store /data/www$original_uri;</pre></blockquote><p> </p><p>The modification time of files is set according to the received“Last-Modified” response header field.The response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the persistent storecan be put on different file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both saved files and adirectory holding temporary files, set by the directive, are put on the same file system.</p><p>This directive can be used to create local copies of static unchangeablefiles, e.g.:</p> <blockquote class=\"example\"><pre>location /images/ {    root               /data/www;    error_page         404 = /fetch$uri;}location /fetch/ {    internal;    proxy_pass         http://backend/;    proxy_store        on;    proxy_store_access user:rw group:rw all:r;    proxy_temp_path    /data/temp;    alias              /data/www/;}</pre></blockquote><p> </p><p>or like this:</p> <blockquote class=\"example\"><pre>location /images/ {    root               /data/www;    error_page         404 = @fetch;}location @fetch {    internal;    proxy_pass         http://backend;    proxy_store        on;    proxy_store_access user:rw group:rw all:r;    proxy_temp_path    /data/temp;    root               /data/www;}</pre></blockquote><p> </p>"
        },
        "proxy_store_access": {
            "values": "users:permissions ...",
            "default": "user:rw",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets access permissions for newly created files and directories, e.g.:</p> <blockquote class=\"example\"><pre>proxy_store_access user:rw group:rw all:r;</pre></blockquote><p> </p><p>If any <code>group</code> or <code>all</code> access permissionsare specified then <code>user</code> permissions may be omitted:</p> <blockquote class=\"example\"><pre>proxy_store_access group:rw all:r;</pre></blockquote><p> </p>"
        },
        "proxy_temp_file_write_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the <code><i>size</i></code> of data written to a temporary fileat a time, when buffering of responses from the proxied serverto temporary files is enabled.By default, <code><i>size</i></code> is limited by two buffers set by the and  directives.The maximum size of a temporary file is set by the directive.</p>"
        },
        "proxy_temp_path": {
            "values": "path [level1 [level2 [level3]]]",
            "default": "proxy_temp",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a directory for storing temporary fileswith data received from proxied servers.Up to three-level subdirectory hierarchy can be used underneath the specifieddirectory.For example, in the following configuration</p> <blockquote class=\"example\"><pre>proxy_temp_path /spool/nginx/proxy_temp 1 2;</pre></blockquote><p> a temporary file might look like this:</p> <blockquote class=\"example\"><pre>/spool/nginx/proxy_temp/<strong>7</strong>/<strong>45</strong>/00000123<strong>457</strong></pre></blockquote><p> </p><p>See also the <code>use_temp_path</code> parameter of the directive.</p>__end"
        },
        "pop3_auth": {
            "values": "method ...",
            "default": "plain",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets permitted methods of authentication for POP3 clients.Supported methods are:</p> <dl class=\"compact\"><dt><code>plain</code></dt><dd>,,.It is not possible to disable these methods.</dd><dt><code>apop</code></dt><dd>.In order for this method to work, the password must be stored unencrypted.</dd><dt><code>cram-md5</code></dt><dd>.In order for this method to work, the password must be stored unencrypted.</dd></dl><p> </p>__end"
        },
        "perl": {
            "values": "module::function|'sub { ... }'",
            "default": "",
            "context": ["location", "limit_except"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets a Perl handler for the given location.</p>"
        },
        "perl_modules": {
            "values": "path",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets an additional path for Perl modules.</p>"
        },
        "perl_require": {
            "values": "module",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Defines the name of a module that will be loaded during eachreconfiguration.Several <code>perl_require</code> directives can be present.</p>"
        },
        "perl_set": {
            "values": "$variable module::function|'sub { ... }'",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Installs a Perl handler for the specified variable.</p>__end<center><h4>Calling Perl from SSI</h4></center><p>An SSI command calling Perl has the following format:</p> <blockquote class=\"example\"><pre>&lt;!--# perl sub=\"<code><i>module</i></code>::<code><i>function</i></code>\" arg=\"<code><i>parameter1</i></code>\" arg=\"<code><i>parameter2</i></code>\" ...--&gt;</pre></blockquote><p> </p>__end"
        },
        "mp4": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "__begin<p>Turns on module processing in a surrounding location.</p>"
        },
        "mp4_buffer_size": {
            "values": "size",
            "default": "512K",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the initial <code><i>size</i></code> of the buffer used forprocessing MP4 files.</p>"
        },
        "mp4_max_buffer_size": {
            "values": "size",
            "default": "10M",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>During metadata processing, a larger buffer may become necessary.Its size cannot exceed the specified <code><i>size</i></code>,or else nginx will return the500 (Internal Server Error) server error,and log the following message:</p> <blockquote class=\"example\"><pre>\"/some/movie/file.mp4\" mp4 moov atom is too large:12583268, you may want to increase mp4_max_buffer_size</pre></blockquote><p> </p>"
        },
        "mp4_limit_rate": {
            "values": ["on", "off", "factor"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the rate of response transmission to a client.The rate is limited based on the average bitrate of theMP4 file served.To calculate the rate, the bitrate is multiplied by the specified<code><i>factor</i></code>.The special value “<code>on</code>” corresponds to the factor of 1.1.The special value “<code>off</code>” disables rate limiting.The limit is set per a request, and so if a client simultaneously openstwo connections, the overall rate will be twice as muchas the specified limit.</p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>__end"
        },
        "memcached_bind": {
            "values": ["address", "off"],
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Makes outgoing connections to a memcached server originatefrom the specified local IP <code><i>address</i></code>.Parameter value can contain variables (1.3.12).The special value <code>off</code> (1.3.12) cancels the effectof the <code>memcached_bind</code> directiveinherited from the previous configuration level, which allows thesystem to auto-assign the local IP address.</p>"
        },
        "memcached_buffer_size": {
            "values": "size",
            "default": "4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>size</i></code> of the buffer used for reading the responsereceived from the memcached server.The response is passed to the client synchronously, as soon as it is received.</p>"
        },
        "memcached_connect_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for establishing a connection with a memcached server.It should be noted that this timeout cannot usually exceed 75 seconds.</p>"
        },
        "memcached_force_ranges": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables byte-range supportfor both cached and uncached responses from the memcached serverregardless of the “Accept-Ranges” field in these responses.</p>"
        },
        "memcached_gzip_flag": {
            "values": "flag",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables the test for the <code><i>flag</i></code> presence in the memcachedserver response and sets the “<code>Content-Encoding</code>”response header field to “<code>gzip</code>”if the flag is set.</p>"
        },
        "memcached_next_upstream": {
            "values": ["error", "timeout", "invalid_response", "not_found", "off ..."],
            "default": "error timeout",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies in which cases a request should be passed to the next server:</p> <dl class=\"compact\"><dt><code>error</code></dt><dd>an error occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>timeout</code></dt><dd>a timeout has occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>invalid_response</code></dt><dd>a server returned an empty or invalid response;</dd><dt><code>not_found</code></dt><dd>a response was not found on the server;</dd><dt><code>off</code></dt><dd>disables passing a request to the next server.</dd></dl><p> </p><p>One should bear in mind that passing a request to the next server isonly possible if nothing has been sent to a client yet.That is, if an error or timeout occurs in the middle of thetransferring of a response, fixing this is impossible.</p><p>The directive also defines what is considered an of communication with a server.The cases of <code>error</code>, <code>timeout</code> and<code>invalid_header</code> are always considered unsuccessful attempts,even if they are not specified in the directive.The case of <code>not_found</code>is never considered an unsuccessful attempt.</p><p>Passing a request to the next server can be limited byand by .</p>"
        },
        "memcached_next_upstream_timeout": {
            "values": "time",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the time allowed to pass a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "memcached_next_upstream_tries": {
            "values": "number",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the number of possible tries for passing a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "memcached_pass": {
            "values": "address",
            "default": "",
            "context": ["location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Sets the memcached server address.The address can be specified as a domain name or IP address,and a port:</p> <blockquote class=\"example\"><pre>memcached_pass localhost:11211;</pre></blockquote><p> or as a UNIX-domain socket path:</p> <blockquote class=\"example\"><pre>memcached_pass unix:/tmp/memcached.socket;</pre></blockquote><p> </p><p>If a domain name resolves to several addresses, all of them will beused in a round-robin fashion.In addition, an address can be specified as a.</p>"
        },
        "memcached_read_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for reading a response from the memcached server.The timeout is set only between two successive read operations,not for the transmission of the whole response.If the memcached server does not transmit anything within this time,the connection is closed.</p>"
        },
        "memcached_send_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for transmitting a request to the memcached server.The timeout is set only between two successive write operations,not for the transmission of the whole request.If the memcached server does not receive anything within this time,the connection is closed.</p>__end"
        },
        "map_hash_bucket_size": {
            "values": "size",
            "default": "32|64|128",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the bucket size for the  variables hash tables.Default value depends on the processor’s cache line size.The details of setting up hash tables are provided in a separate.</p>__end"
        },
        "listen": {
            "values": ["address[:port] [default_server] [ssl] [http2", "spdy] [proxy_protocol] [setfib=number] [fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [reuseport] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];listen port [default_server] [ssl] [http2", "spdy] [proxy_protocol] [setfib=number] [fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [reuseport] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];listen unix:path [default_server] [ssl] [http2", "spdy] [proxy_protocol] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]]"],
            "default": "*:80 | *:8000",
            "context": ["server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>address</i></code> and <code><i>port</i></code> for IP,or the <code><i>path</i></code> for a UNIX-domain socket on whichthe server will accept requests.Both <code><i>address</i></code> and <code><i>port</i></code>,or only <code><i>address</i></code> or only <code><i>port</i></code> can be specified.An <code><i>address</i></code> may also be a hostname, for example:</p> <blockquote class=\"example\"><pre>listen 127.0.0.1:8000;listen 127.0.0.1;listen 8000;listen *:8000;listen localhost:8000;</pre></blockquote><p> IPv6 addresses (0.7.36) are specified in square brackets:</p> <blockquote class=\"example\"><pre>listen [::]:8000;listen [::1];</pre></blockquote><p> UNIX-domain sockets (0.8.21) are specified with the “<code>unix:</code>”prefix:</p> <blockquote class=\"example\"><pre>listen unix:/var/run/nginx.sock;</pre></blockquote><p> </p><p>If only <code><i>address</i></code> is given, the port 80 is used.</p><p>If the directive is not present then either <code>*:80</code> is usedif nginx runs with the superuser privileges, or <code>*:8000</code>otherwise.</p><p>The <code>default_server</code> parameter, if present,will cause the server to become the default server for the specified<code><i>address</i></code>:<code><i>port</i></code> pair.If none of the directives have the <code>default_server</code>parameter then the first server with the<code><i>address</i></code>:<code><i>port</i></code> pair will bethe default server for this pair.</p> <blockquote class=\"note\">In versions prior to 0.8.21 this parameter is named simply<code>default</code>.</blockquote><p> </p><p>The <code>ssl</code> parameter (0.7.14) allows specifying that allconnections accepted on this port should work in SSL mode.This allows for a more compact  for the server thathandles both HTTP and HTTPS requests.</p><p>The <code>http2</code> parameter (1.9.5) configures the port to accept connections.Normally, for this to work the <code>ssl</code> parameter should bespecified as well, but nginx can also be configured to accept HTTP/2connections without SSL.</p><p>The <code>spdy</code> parameter (1.3.15-1.9.4) allows accepting connections on this port.Normally, for this to work the <code>ssl</code> parameter should bespecified as well, but nginx can also be configured to accept SPDYconnections without SSL.</p><p>The <code>proxy_protocol</code> parameter (1.5.12)allows specifying that all connections accepted on this port should use the.</p><p>The <code>listen</code> directivecan have several additional parameters specific to socket-related system calls.These parameters can be specified in any<code>listen</code> directive, but only once for a given<code><i>address</i></code>:<code><i>port</i></code> pair.</p> <blockquote class=\"note\">In versions prior to 0.8.21, they could only bespecified in the <code>listen</code> directive together with the<code>default</code> parameter.</blockquote><p> </p> <dl class=\"compact\"><dt><code>setfib</code>=<code><i>number</i></code></dt><dd>this parameter (0.8.44) sets the associated routing table, FIB(the <code>SO_SETFIB</code> option) for the listening socket.This currently works only on FreeBSD.</dd><dt><code>fastopen</code>=<code><i>number</i></code></dt><dd>enables“”for the listening socket (1.5.8) andthe maximum length for the queue of connections that have not yet completedthe three-way handshake.<blockquote class=\"note\">Do not enable this feature unless the server can handlereceiving the more than once.</blockquote></dd><dt><code>backlog</code>=<code><i>number</i></code></dt><dd>sets the <code>backlog</code> parameter in the<code>listen()</code> call that limitsthe maximum length for the queue of pending connections.By default,<code>backlog</code> is set to -1 on FreeBSD, DragonFly BSD, and Mac OS X,and to 511 on other platforms.</dd><dt><code>rcvbuf</code>=<code><i>size</i></code></dt><dd>sets the receive buffer size(the <code>SO_RCVBUF</code> option) for the listening socket.</dd><dt><code>sndbuf</code>=<code><i>size</i></code></dt><dd>sets the send buffer size(the <code>SO_SNDBUF</code> option) for the listening socket.</dd><dt><code>accept_filter</code>=<code><i>filter</i></code></dt><dd>sets the name of accept filter(the <code>SO_ACCEPTFILTER</code> option) for the listening socketthat filters incoming connections before passing them to<code>accept()</code>.This works only on FreeBSD and NetBSD&nbsp;5.0+.Possible values areand.</dd><dt><code>deferred</code></dt><dd>instructs to use a deferred <code>accept()</code>(the <code>TCP_DEFER_ACCEPT</code> socket option) on Linux.</dd><dt><code>bind</code></dt><dd>instructs to make a separate <code>bind()</code> call for a given<code><i>address</i></code>:<code><i>port</i></code> pair.This is useful because if there are several <code>listen</code>directives with the same port but different addresses, and one of the<code>listen</code> directives listens on all addressesfor the given port (<code>*:</code><code><i>port</i></code>), nginxwill <code>bind()</code> only to <code>*:</code><code><i>port</i></code>.It should be noted that the <code>getsockname()</code> system call will bemade in this case to determine the address that accepted the connection.If the <code>setfib</code>,<code>backlog</code>, <code>rcvbuf</code>,<code>sndbuf</code>, <code>accept_filter</code>,<code>deferred</code>, <code>ipv6only</code>,or <code>so_keepalive</code> parametersare used then for a given<code><i>address</i></code>:<code><i>port</i></code> paira separate <code>bind()</code> call will always be made.</dd><dt><code>ipv6only</code>=<code>on</code>|<code>off</code></dt><dd>this parameter (0.7.42) determines(via the <code>IPV6_V6ONLY</code> socket option)whether an IPv6 socket listening on a wildcard address <code>[::]</code>will accept only IPv6 connections or both IPv6 and IPv4 connections.This parameter is turned on by default.It can only be set once on start.<blockquote class=\"note\">Prior to version 1.3.4,if this parameter was omitted then the operating system’s settings werein effect for the socket.</blockquote></dd><dt id=\"reuseport\"><code>reuseport</code></dt><dd>this parameter (1.9.1) instructs to create an individual listening socketfor each worker process(using the <code>SO_REUSEPORT</code> socket option), allowing a kernelto distribute incoming connections between worker processes.This currently works only on Linux&nbsp;3.9+ and DragonFly BSD.<blockquote class=\"note\">Inappropriate use of this option may have its security.</blockquote></dd><dt><code>so_keepalive</code>=<code>on</code>|<code>off</code>|[<code><i>keepidle</i></code>]:[<code><i>keepintvl</i></code>]:[<code><i>keepcnt</i></code>]</dt><dd>this parameter (1.1.11) configures the “TCP keepalive” behaviorfor the listening socket.If this parameter is omitted then the operating system’s settings will bein effect for the socket.If it is set to the value “<code>on</code>”, the<code>SO_KEEPALIVE</code> option is turned on for the socket.If it is set to the value “<code>off</code>”, the<code>SO_KEEPALIVE</code> option is turned off for the socket.Some operating systems support setting of TCP keepalive parameters ona per-socket basis using the <code>TCP_KEEPIDLE</code>,<code>TCP_KEEPINTVL</code>, and <code>TCP_KEEPCNT</code> socket options.On such systems (currently, Linux&nbsp;2.4+, NetBSD&nbsp;5+, andFreeBSD&nbsp;9.0-STABLE), they can be configuredusing the <code><i>keepidle</i></code>, <code><i>keepintvl</i></code>, and<code><i>keepcnt</i></code> parameters.One or two parameters may be omitted, in which case the system default settingfor the corresponding socket option will be in effect.For example,<blockquote class=\"example\"><pre>so_keepalive=30m::10</pre></blockquote>will set the idle timeout (<code>TCP_KEEPIDLE</code>) to 30 minutes,leave the probe interval (<code>TCP_KEEPINTVL</code>) at its system default,and set the probes count (<code>TCP_KEEPCNT</code>) to 10 probes.</dd></dl><p> </p><p>Example:</p> <blockquote class=\"example\"><pre>listen 127.0.0.1 default_server accept_filter=dataready backlog=1024;</pre></blockquote><p> </p>"
        },
        "resolver": {
            "values": "address ... [valid=time] [ipv6=on|off]",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Configures name servers used to resolve names of upstream serversinto addresses, for example:</p> <blockquote class=\"example\"><pre>resolver 127.0.0.1 [::1]:5353;</pre></blockquote><p> An address can be specified as a domain name or IP address,and an optional port (1.3.1, 1.2.2).If port is not specified, the port 53 is used.Name servers are queried in a round-robin fashion.</p> <blockquote class=\"note\">Before version 1.1.7, only a single name server could be configured.Specifying name servers using IPv6 addresses is supportedstarting from versions 1.3.1 and 1.2.2.</blockquote><p> By default, nginx will look up both IPv4 and IPv6 addresses while resolving.If looking up of IPv6 addresses is not desired,the <code>ipv6=off</code> parameter can be specified.</p> <blockquote class=\"note\">Resolving of names into IPv6 addresses is supportedstarting from version 1.5.8.</blockquote><p> By default, nginx caches answers using the TTL value of a response.An optional <code>valid</code> parameter allows overriding it:</p> <blockquote class=\"example\"><pre>resolver 127.0.0.1 [::1]:5353 valid=30s;</pre></blockquote><p> </p> <blockquote class=\"note\">Before version 1.1.9, tuning of caching time was not possible,and nginx always cached answers for the duration of 5 minutes.</blockquote><p> </p>"
        },
        "resolver_timeout": {
            "values": "time",
            "default": "30s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for name resolution, for example:</p> <blockquote class=\"example\"><pre>resolver_timeout 5s;</pre></blockquote><p> </p>"
        },
        "protocol": {
            "values": ["imap", "pop3", "smtp"],
            "default": "",
            "context": ["server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the protocol for a proxied server.Supported protocols are,, and.</p><p>If the directive is not set, the protocol can be detected automaticallybased on the well-known port specified in the directive:</p> <ul class=\"compact\"><li><code>imap</code>: 143, 993</li><li><code>pop3</code>: 110, 995</li><li><code>smtp</code>: 25, 587, 465</li></ul><p> </p><p>Unnecessary protocols can be disabled using theparameters <code>--without-mail_imap_module</code>,<code>--without-mail_pop3_module</code>, and<code>--without-mail_smtp_module</code>.</p>"
        },
        "server_name": {
            "values": "name",
            "default": "hostname",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the server name that is used:</p> <ul class=\"compact\"><li>in the initial POP3/SMTP server greeting;</li><li>in the salt during the SASL CRAM-MD5 authentication;</li><li>in the <code>EHLO</code> command when connecting to the SMTP backend,if the passing of the commandis enabled.</li></ul><p> </p><p>If the directive is not specified, the machine’s hostname is used.</p>__end"
        },
        "limit_req": {
            "values": "zone=name [burst=number] [nodelay]",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the shared memory zoneand the maximum burst size of requests.If the requests rate exceeds the rate configured for a zone,their processing is delayed such that requests are processedat a defined rate.Excessive requests are delayed until their number exceeds themaximum burst sizein which case the request is terminated with an error503 (Service Temporarily Unavailable).By default, the maximum burst size is equal to zero.For example, the directives</p> <blockquote class=\"example\"><pre>limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;server {    location /search/ {        limit_req zone=one burst=5;    }</pre></blockquote><p> allow not more than 1 request per second at an average,with bursts not exceeding 5 requests.</p><p>If delaying of excessive requests while requests are being limited is notdesired, the parameter <code>nodelay</code> should be used:</p> <blockquote class=\"example\"><pre>limit_req zone=one burst=5 nodelay;</pre></blockquote><p> </p><p>There could be several <code>limit_req</code> directives.For example, the following configuration will limit the processing rateof requests coming from a single IP address and, at the same time,the request processing rate by the virtual server:</p> <blockquote class=\"example\"><pre>limit_req_zone $binary_remote_addr zone=perip:10m rate=1r/s;limit_req_zone $server_name zone=perserver:10m rate=10r/s;server {    ...    limit_req zone=perip burst=5 nodelay;    limit_req zone=perserver burst=10;}</pre></blockquote><p> </p><p>These directives are inherited from the previous level if andonly if there are no<code>limit_req</code>directives on the current level.</p>"
        },
        "limit_req_log_level": {
            "values": "info |notice |warn |error",
            "default": "error",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the desired logging levelfor cases when the server refuses to process requestsdue to rate exceeding,or delays request processing.Logging level for delays is one point less than for refusals; for example,if “<code>limit_req_log_level notice</code>” is specified,delays are logged with the <code>info</code> level.</p>"
        },
        "limit_req_status": {
            "values": "code",
            "default": "503",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the status code to return in response to rejected requests.</p>__end"
        },
        "limit_conn": {
            "values": "zone number",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the shared memory zoneand the maximum allowed number of connections for a given key value.When this limit is exceeded, the server will return the503 (Service Temporarily Unavailable)error in reply to a request.For example, the directives</p> <blockquote class=\"example\"><pre>limit_conn_zone $binary_remote_addr zone=addr:10m;server {    location /download/ {        limit_conn addr 1;    }</pre></blockquote><p> allow only one connection per an IP address at a time.</p> <blockquote class=\"note\">In HTTP/2 and SPDY, each concurrent request is considered a separate connection.</blockquote><p> </p><p>There could be several <code>limit_conn</code> directives.For example, the following configuration will limit the numberof connections to the server per a client IP and, at the same time,the total number of connections to the virtual server:</p> <blockquote class=\"example\"><pre>limit_conn_zone $binary_remote_addr zone=perip:10m;limit_conn_zone $server_name zone=perserver:10m;server {    ...    limit_conn perip 10;    limit_conn perserver 100;}</pre></blockquote><p> </p><p>These directives are inherited from the previous level if andonly if there are no<code>limit_conn</code>directives on the current level.</p>"
        },
        "limit_conn_log_level": {
            "values": "info |notice |warn |error",
            "default": "error",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the desired logging level for cases when the serverlimits the number of connections.</p>"
        },
        "limit_conn_status": {
            "values": "code",
            "default": "503",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the status code to return in response to rejected requests.</p>"
        },
        "limit_conn_zone": {
            "values": "key zone=name:size",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets parameters for a shared memory zonethat will keep states for various keys.In particular, the state includes the current number of connections.The <code><i>key</i></code> can contain text, variables, and their combination.Requests with an empty key value are not accounted.</p> <blockquote class=\"note\">Prior to version 1.7.6, a <code><i>key</i></code> could contain exactly one variable.</blockquote><p> Usage example:</p> <blockquote class=\"example\"><pre>limit_conn_zone $binary_remote_addr zone=addr:10m;</pre></blockquote><p> Here, a client IP address serves as a key.Note that instead of <code>$remote_addr</code>, the<code>$binary_remote_addr</code> variable is used here.The <code>$remote_addr</code> variable’s size canvary from 7 to 15 bytes.The stored state occupies either32 or 64 bytes of memory on 32-bit platforms and always 64bytes on 64-bit platforms.The <code>$binary_remote_addr</code> variable’s sizeis always 4 bytes.The stored state always occupies 32 byteson 32-bit platforms and 64 bytes on 64-bit platforms.One megabyte zone can keep about 32 thousand 32-byte statesor about 16 thousand 64-byte states.If the zone storage is exhausted, the server will return the503 (Service Temporarily Unavailable)error to all further requests.</p>__end"
        },
        "imap_auth": {
            "values": "method ...",
            "default": "plain",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets permitted methods of authentication for IMAP clients.Supported methods are:</p> <dl class=\"compact\"><dt><code>login</code></dt><dd></dd><dt><code>plain</code></dt><dd></dd><dt><code>cram-md5</code></dt><dd>.In order for this method to work, the password must be stored unencrypted.</dd></dl><p> </p>"
        },
        "imap_capabilities": {
            "values": "extension ...",
            "default": "IMAP4 IMAP4rev1 UIDPLUS",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets theextensions list that is passed to the client in response tothe <code>CAPABILITY</code> command.The authentication methods specified in the  and directivesare automatically added to this list if the directive is enabled.</p><p>It makes sense to specify the extensionssupported by the IMAP backendsto which the clients are proxied (if these extensions are related to commandsused after the authentication, when nginx transparently proxies a clientconnection to the backend).</p><p>The current list of standardized extensions is published at.</p>__end"
        },
        "image_filter": {
            "values": ["off;image_filter test;image_filter size;image_filter rotate 90", "180", "270;image_filter resize width height;image_filter crop width height"],
            "default": "off",
            "context": ["location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the type of transformation to perform on images:</p> <dl class=\"compact\"><dt><code>off</code></dt><dd>turns off module processing in a surrounding location.</dd><dt><code>test</code></dt><dd>ensures that responses are images in either JPEG, GIF, or PNG format.Otherwise, the415 (Unsupported Media Type)error is returned.</dd><dt><code>size</code></dt><dd>outputs information about images in a JSON format, e.g.:<blockquote class=\"example\"><pre>{ \"img\" : { \"width\": 100, \"height\": 100, \"type\": \"gif\" } }</pre></blockquote>In case of an error, the output is as follows:<blockquote class=\"example\"><pre>{}</pre></blockquote></dd><dt><code>rotate</code><code>90</code>|<code>180</code>|<code>270</code></dt><dd>rotates images counter-clockwise by the specified number of degrees.Parameter value can contain variables.This mode can be used either alone or along with the<code>resize</code> and <code>crop</code> transformations.</dd><dt><code>resize</code><code><i>width</i></code><code><i>height</i></code></dt><dd>proportionally reduces an image to the specified sizes.To reduce by only one dimension, another dimension can be specified as“<code>-</code>”.In case of an error, the server will return code415 (Unsupported Media Type).Parameter values can contain variables.When used along with the <code>rotate</code> parameter,the rotation happens <strong>after</strong> reduction.</dd><dt><code>crop</code><code><i>width</i></code><code><i>height</i></code></dt><dd>proportionally reduces an image to the larger side sizeand crops extraneous edges by another side.To reduce by only one dimension, another dimension can be specified as“<code>-</code>”.In case of an error, the server will return code415 (Unsupported Media Type).Parameter values can contain variables.When used along with the <code>rotate</code> parameter,the rotation happens <strong>before</strong> reduction.</dd></dl><p> </p>"
        },
        "image_filter_buffer": {
            "values": "size",
            "default": "1M",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum size of the buffer used for reading images.When the size is exceeded the server returns error415 (Unsupported Media Type).</p>"
        },
        "image_filter_interlace": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If enabled, final images will be interlaced.For JPEG, final images will be in “progressive JPEG” format.</p>"
        },
        "image_filter_jpeg_quality": {
            "values": "quality",
            "default": "75",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the desired <code><i>quality</i></code> of the transformed JPEG images.Acceptable values are in the range from 1 to 100.Lesser values usually imply both lower image quality and less data to transfer.The maximum recommended value is 95.Parameter value can contain variables.</p>"
        },
        "image_filter_sharpen": {
            "values": "percent",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Increases sharpness of the final image.The sharpness percentage can exceed 100.The zero value disables sharpening.Parameter value can contain variables.</p>__end"
        },
        "http2_chunk_size": {
            "values": "size",
            "default": "8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the maximum size of chunksinto which the response body is sliced.A too low value results in higher overhead.A too high value impairs prioritization due to.</p>"
        },
        "http2_idle_timeout": {
            "values": "time",
            "default": "3m",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the timeout of inactivity after which the connection is closed.</p>"
        },
        "http2_max_concurrent_streams": {
            "values": "number",
            "default": "128",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum number of concurrent HTTP/2 streamsin a connection.</p>"
        },
        "http2_max_field_size": {
            "values": "size",
            "default": "4k",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Limits the maximum size ofan -compressedrequest header field.The limit applies equally to both name and value.Note that if Huffman encoding is applied,the actual size of decompressed name and value strings may be larger.For most requests, the default limit should be enough.</p>"
        },
        "http2_max_header_size": {
            "values": "size",
            "default": "16k",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Limits the maximum size of the entire request header list after decompression.For most requests, the default limit should be enough.</p>"
        },
        "http2_recv_buffer_size": {
            "values": "size",
            "default": "256k",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the size of the per worker input buffer.</p>"
        },
        "http2_recv_timeout": {
            "values": "time",
            "default": "30s",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the timeout for expecting more data from the client,after which the connection is closed.</p>__end"
        },
        "hls": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "__begin<p>Turns on HLS streaming in the surrounding location.</p>"
        },
        "hls_buffers": {
            "values": "number size",
            "default": "8 2m",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum <code><i>number</i></code> and <code><i>size</i></code> of buffersthat are used for reading and writing data frames.</p>"
        },
        "hls_forward_args": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Adds arguments from a playlist request to URIs of fragments.This may be useful for performing client authorization at the moment ofrequesting a fragment, or when protecting an HLS stream with themodule.</p><p>For example, if a client requests a playlist<code>http://example.com/hls/test.mp4.m3u8?a=1&amp;b=2</code>,the arguments <code>a=1</code> and <code>b=2</code>will be added to URIs of fragments after the arguments<code>start</code> and <code>end</code>:</p> <blockquote class=\"example\"><pre>#EXTM3U#EXT-X-VERSION:3#EXT-X-TARGETDURATION:15#EXT-X-PLAYLIST-TYPE:VOD#EXTINF:9.333,test.mp4.ts?start=0.000&amp;end=9.333&amp;a=1&amp;b=2#EXTINF:7.167,test.mp4.ts?start=9.333&amp;end=16.500&amp;a=1&amp;b=2#EXTINF:5.416,test.mp4.ts?start=16.500&amp;end=21.916&amp;a=1&amp;b=2#EXTINF:5.500,test.mp4.ts?start=21.916&amp;end=27.416&amp;a=1&amp;b=2#EXTINF:15.167,test.mp4.ts?start=27.416&amp;end=42.583&amp;a=1&amp;b=2#EXTINF:9.626,test.mp4.ts?start=42.583&amp;end=52.209&amp;a=1&amp;b=2#EXT-X-ENDLIST</pre></blockquote><p> </p><p>If an HLS stream is protected with themodule, <code>$uri</code> should not be used in theexpression because this will cause errors when requesting the fragments. should be usedinstead of <code>$uri</code>(<code>$hls_uri</code> in the example):</p> <blockquote class=\"example\"><pre>http {    ...    map $uri $hls_uri {        ~^(?&lt;base_uri&gt;.*).m3u8$ $base_uri;        ~^(?&lt;base_uri&gt;.*).ts$   $base_uri;        default                 $uri;    }    server {        ...        location /hls {            hls;            hls_forward_args on;            alias /var/videos;            secure_link $arg_md5,$arg_expires;            secure_link_md5 \"$secure_link_expires$hls_uri$remote_addr secret\";            if ($secure_link = \"\") {                return 403;            }            if ($secure_link = \"0\") {                return 410;            }        }    }}</pre></blockquote><p> </p>"
        },
        "hls_fragment": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines the default fragment length for playlist URIs requested without the“<code>len</code>” argument.</p>"
        },
        "hls_mp4_buffer_size": {
            "values": "size",
            "default": "512k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the initial <code><i>size</i></code> of the buffer used forprocessing MP4 and MOV files.</p>__end"
        },
        "server": {
            "values": "address [parameters]",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>Defines the <code><i>address</i></code> and other <code><i>parameters</i></code>of a server.The address can be specified as a domain name or IP address,with an optional port, or as a UNIX-domain socket pathspecified after the “<code>unix:</code>” prefix.If a port is not specified, the port 80 is used.A domain name that resolves to several IP addresses definesmultiple servers at once.</p><p>The following parameters can be defined:</p> <dl class=\"compact\"><dt id=\"weight\"><code>weight</code>=<code><i>number</i></code></dt><dd>sets the weight of the server, by default, 1.</dd><dt id=\"max_fails\"><code>max_fails</code>=<code><i>number</i></code></dt><dd>sets the number of unsuccessful attempts to communicate with the serverthat should happen in the duration set by the <code>fail_timeout</code>parameter to consider the server unavailable for a duration also set by the<code>fail_timeout</code> parameter.By default, the number of unsuccessful attempts is set to 1.The zero value disables the accounting of attempts.What is considered an unsuccessful attempt is defined by the,,,, anddirectives.</dd><dt id=\"fail_timeout\"><code>fail_timeout</code>=<code><i>time</i></code></dt><dd>sets<ul class=\"compact\"><li>the time during which the specified number of unsuccessful attempts tocommunicate with the server should happen to consider the server unavailable;</li><li>and the period of time the server will be considered unavailable.</li></ul>By default, the parameter is set to 10 seconds.</dd><dt id=\"backup\"><code>backup</code></dt><dd>marks the server as a backup server.It will be passed requests when the primary servers are unavailable.</dd><dt id=\"down\"><code>down</code></dt><dd>marks the server as permanently unavailable.</dd></dl><p> </p><p>Additionally,the following parameters are available as part of our:</p> <dl class=\"compact\"><dt id=\"max_conns\"><code>max_conns</code>=<code><i>number</i></code></dt><dd>limits the maximum <code><i>number</i></code> of simultaneous activeconnections to the proxied server (1.5.9).Default value is zero, meaning there is no limit.<blockquote class=\"note\">When  connections and multipleare enabled,the total number of connections to the proxied servermay exceed the <code>max_conns</code> value.</blockquote></dd><dt id=\"resolve\"><code>resolve</code></dt><dd>monitors changes of the IP addressesthat correspond to a domain name of the server,and automatically modifies the upstream configurationwithout the need of restarting nginx (1.5.12).The server group must reside in the .<p>In order for this parameter to work,the  directivemust be specified in the block.Example:</p> <blockquote class=\"example\"><pre>http {    resolver 10.0.0.1;    upstream u {        zone ...;        ...        server example.com resolve;    }}</pre></blockquote><p> </p></dd><dt id=\"route\"><code>route</code>=<code><i>string</i></code></dt><dd>sets the server route name.</dd><dt id=\"slow_start\"><code>slow_start</code>=<code><i>time</i></code></dt><dd>sets the <code><i>time</i></code> during which the server will recover its weightfrom zero to a nominal value, when unhealthy server becomes,or when the server becomes available after a period of timeit was considered .Default value is zero, i.e. slow start is disabled.</dd></dl><p> </p><p></p> <blockquote class=\"note\">If there is only a single server in a group, <code>max_fails</code>,<code>fail_timeout</code> and <code>slow_start</code> parametersare ignored, and such a server will never be considered unavailable.</blockquote><p> </p>"
        },
        "zone": {
            "values": "name [size]",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>Defines the <code><i>name</i></code> and <code><i>size</i></code> of the sharedmemory zone that keeps the group’s configuration and run-time state that areshared between worker processes.Several groups may share the same zone.In this case, it is enough to specify the <code><i>size</i></code> only once.</p><p>Additionally,as part of our ,such groups allow changing the group membershipor modifying the settings of a particular serverwithout the need of restarting nginx.The configuration is accessible via a special locationhandled by.</p>"
        },
        "state": {
            "values": "file",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a <code><i>file</i></code> that keeps the stateof the dynamically configurable group.The state is currently limited to the list of servers with their parameters.The file is read when parsing the configuration and is updated each timethe upstream configuration is.Changing the file content directly should be avoided.The directive cannot be usedalong with the  directive.</p><p></p> <blockquote class=\"note\">Changes made duringor can be lost.</blockquote><p> </p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>"
        },
        "hash": {
            "values": "key [consistent]",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a load balancing method for a server groupwhere the client-server mapping is based on the hashed <code><i>key</i></code> value.The <code><i>key</i></code> can contain text, variables, and their combinations.Note that adding or removing a server from the groupmay result in remapping most of the keys to different servers.The method is compatible with thePerl library.</p><p>If the <code>consistent</code> parameter is specifiedthe consistent hashing method will be used instead.The method ensures that only a few keyswill be remapped to different serverswhen a server is added to or removed from the group.This helps to achieve a higher cache hit ratio for caching servers.The method is compatible with thePerl library with the <code><i>ketama_points</i></code> parameter set to 160.</p>"
        },
        "least_conn": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "<p>Specifies that a group should use a load balancing method where a requestis passed to the server with the least number of active connections,taking into account weights of servers.If there are several such servers, they are tried in turn using aweighted round-robin balancing method.</p>"
        },
        "least_time": {
            "values": ["header", "last_byte"],
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>Specifies that a group should use a load balancing method where a requestis passed to the server with the least average response time andleast number of active connections, taking into account weights of servers.If there are several such servers, they are tried in turn using aweighted round-robin balancing method.</p><p>If the <code>header</code> parameter is specified,time to receive the is used.If the <code>last_byte</code> parameter is specified,time to receive the is used.</p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>"
        },
        "health_check": {
            "values": "[parameters]",
            "default": "",
            "context": ["location"],
            "isIn": isIn,
            "tooltip": "<p>Enables periodic health checks of the servers in a referenced in the surrounding location.</p><p>The following optional parameters are supported:</p> <dl class=\"compact\"><dt id=\"interval\"><code>interval</code>=<code><i>time</i></code></dt><dd>sets the interval between two consecutive health checks,by default, 5 seconds;</dd><dt id=\"fails\"><code>fails</code>=<code><i>number</i></code></dt><dd>sets the number of consecutive failed health checks of a particular serverafter which this server will be considered unhealthy,by default, 1;</dd><dt id=\"passes\"><code>passes</code>=<code><i>number</i></code></dt><dd>sets the number of consecutive passed health checks of a particular serverafter which the server will be considered healthy,by default, 1;</dd><dt id=\"uri\"><code>uri</code>=<code><i>uri</i></code></dt><dd>defines the URI used in health check requests,by default, “<code>/</code>”;</dd><dt id=\"hc_match\"><code>match</code>=<code><i>name</i></code></dt><dd>specifies the <code>match</code> block configuring the tests that aresponse should pass in order for a health check to pass;by default, the response should have status code 2xx or 3xx;</dd><dt id=\"health_check_port\"><code>port</code>=<code><i>number</i></code></dt><dd>defines the port used when connecting to a serverto perform a health check (1.9.7);by default, equals the  port.</dd></dl><p> </p><p>For example,</p> <blockquote class=\"example\"><pre>location / {    proxy_pass http://backend;    health_check;}</pre></blockquote><p> will send “<code>/</code>” requests to eachserver in the <code>backend</code> group every five seconds.If any communication error or timeout occurs, or aproxied server responds with the status code other than2xx or 3xx, the health check will fail, and the server willbe considered unhealthy.Client requests are not passed to unhealthy servers.</p><p>Health checks can be configured to test the status code of a response,presence of certain header fields and their values,and the body contents.Tests are configured separately using the  directiveand referenced in the <code>match</code> parameter.For example:</p> <blockquote class=\"example\"><pre>http {    server {    ...        location / {            proxy_pass http://backend;            health_check match=welcome;        }    }    match welcome {        status 200;        header Content-Type = text/html;        body ~ \"Welcome to nginx!\";    }}</pre></blockquote><p> This configuration tells that for a health check to pass, the response to ahealth check request should succeed,have status 200, content type “<code>text/html</code>”,and contain “<code>Welcome to nginx!</code>” in the body.</p><p>The server group must reside in the .</p><p>If several health checks are defined for the same group of servers,a single failure of any check will make the corresponding server beconsidered unhealthy.</p><p></p> <blockquote class=\"note\">Please note that most of the variables will have empty valueswhen used with health checks.</blockquote><p> </p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>"
        },
        "health_check_timeout": {
            "values": "timeout",
            "default": "5s",
            "context": ["stream", "server"],
            "isIn": isIn,
            "tooltip": "<p>Overrides thevalue for health checks.</p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>__end"
        },
        "ip_hash": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "<p>Specifies that a group should use a load balancing method where requestsare distributed between servers based on client IP addresses.The first three octets of the client IPv4 address, or the entire IPv6 address,are used as a hashing key.The method ensures that requests from the same client will always bepassed to the same server except when this server is unavailable.In the latter case client requests will be passed to another server.Most probably, it will always be the same server as well.</p> <blockquote class=\"note\">IPv6 addresses are supported starting from versions 1.3.2 and 1.2.2.</blockquote><p> </p><p>If one of the servers needs to be temporarily removed, it shouldbe marked with the <code>down</code> parameter inorder to preserve the current hashing of client IP addresses.</p><p>Example:</p> <blockquote class=\"example\"><pre>upstream backend {    ip_hash;    server backend1.example.com;    server backend2.example.com;    server backend3.example.com <strong>down</strong>;    server backend4.example.com;}</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">Until versions 1.3.1 and 1.2.2, it was not possible to specify a weight forservers using the <code>ip_hash</code> load balancing method.</blockquote><p> </p>"
        },
        "keepalive": {
            "values": "connections",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>Activates the cache for connections to upstream servers.</p><p>The <code><i>connections</i></code> parameter sets the maximum number ofidle keepalive connections to upstream servers that are preserved inthe cache of each worker process.When this number is exceeded, the least recently used connectionsare closed.</p> <blockquote class=\"note\">It should be particularly noted that the <code>keepalive</code> directivedoes not limit the total number of connections to upstream serversthat an nginx worker process can open.The <code><i>connections</i></code> parameter should be set to a number small enoughto let upstream servers process new incoming connections as well.</blockquote><p> </p><p>Example configuration of memcached upstream with keepalive connections:</p> <blockquote class=\"example\"><pre>upstream memcached_backend {    server 127.0.0.1:11211;    server 10.0.0.2:11211;    keepalive 32;}server {    ...    location /memcached/ {        set $memcached_key $uri;        memcached_pass memcached_backend;    }}</pre></blockquote><p> </p><p>For HTTP, the directive should be set to “<code>1.1</code>”and the “Connection” header field should be cleared:</p> <blockquote class=\"example\"><pre>upstream http_backend {    server 127.0.0.1:8080;    keepalive 16;}server {    ...    location /http/ {        proxy_pass http://http_backend;        proxy_http_version 1.1;        proxy_set_header Connection \"\";        ...    }}</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">Alternatively, HTTP/1.0 persistent connections can be used by passing the“Connection: Keep-Alive” header field to an upstream server,though this method is not recommended.</blockquote><p> </p><p>For FastCGI servers, it is required to setfor keepalive connections to work:</p> <blockquote class=\"example\"><pre>upstream fastcgi_backend {    server 127.0.0.1:9000;    keepalive 8;}server {    ...    location /fastcgi/ {        fastcgi_pass fastcgi_backend;        fastcgi_keep_conn on;        ...    }}</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">When using load balancer methods other than the defaultround-robin method, it is necessary to activate them beforethe <code>keepalive</code> directive.</blockquote><p> </p> <blockquote class=\"note\">SCGI and uwsgi protocols do not have a notion of keepalive connections.</blockquote><p> </p>"
        },
        "ntlm": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "<p>Allows proxying requests with.The upstream connection is bound to the client connectiononce the client sends a request with the “Authorization”header field valuestarting with “<code>Negotiate</code>” or “<code>NTLM</code>”.Further client requests will be proxied through the same upstream connection,keeping the authentication context.</p><p>In order for NTLM authentication to work,it is necessary to enable keepalive connections to upstream servers.The directive should be set to “<code>1.1</code>”and the “Connection” header field should be cleared:</p> <blockquote class=\"example\"><pre>upstream http_backend {    server 127.0.0.1:8080;    ntlm;}server {    ...    location /http/ {        proxy_pass http://http_backend;        proxy_http_version 1.1;        proxy_set_header Connection \"\";        ...    }}</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">When using load balancer methods other than the defaultround-robin method, it is necessary to activate them beforethe <code>ntlm</code> directive.</blockquote><p> </p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>"
        },
        "queue": {
            "values": "number[timeout=time]",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>If an upstream server cannot be selected immediatelywhile processing a request,and there are the servers in the group that have reached the limit,the request will be placed into the queue.The directive specifies the maximum number of requests that can be in the queueat the same time.If the queue is filled up,or the server to pass the request to cannot be selected withinthe time period specified in the <code>timeout</code> parameter,the 502 (Bad Gateway)error will be returned to the client.</p><p>The default value of the <code>timeout</code> parameter is 60 seconds.</p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>"
        },
        "sticky": {
            "values": "cookie name [expires=time] [domain=domain] [httponly] [secure] [path=path];sticky route $variable ...;sticky learn create=$variable lookup=$variable zone=name:size [timeout=time]",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>Enables session affinity, which causes requests from the same client to bepassed to the same server in a group of servers.Three methods are available:</p> <dl class=\"compact\"><dt id=\"sticky_cookie\"><code>cookie</code></dt><dd><p>When the <code>cookie</code> method is used, information about thedesignated server is passed in an HTTP cookie generated by nginx:</p> <blockquote class=\"example\"><pre>upstream backend {    server backend1.example.com;    server backend2.example.com;    sticky cookie srv_id expires=1h domain=.example.com path=/;}</pre></blockquote><p> </p><p>A request that comes from a client not yet bound to a particular serveris passed to the server selected by the configured balancing method.Further requests with this cookie will be passed to the designated server.If the designated server cannot process a request, the new server isselected as if the client has not been bound yet.</p><p>The first parameter sets the name of the cookie to be set or inspected.Additional parameters may be as follows:</p> <dl class=\"compact\"><dt><code>expires=</code><code><i>time</i></code></dt><dd>Sets the <code><i>time</i></code> for which a browser should keep the cookie.The special value <code>max</code> will cause the cookie to expire on“<code>31 Dec 2037 23:55:55 GMT</code>”.If the parameter is not specified, it will cause the cookie to expire atthe end of a browser session.</dd><dt><code>domain=</code><code><i>domain</i></code></dt><dd>Defines the <code><i>domain</i></code> for which the cookie is set.</dd><dt><code>httponly</code></dt><dd>Adds the <code>HttpOnly</code> attribute to the cookie (1.7.11).</dd><dt><code>secure</code></dt><dd>Adds the <code>Secure</code> attribute to the cookie (1.7.11).</dd><dt><code>path=</code><code><i>path</i></code></dt><dd>Defines the <code><i>path</i></code> for which the cookie is set.</dd></dl><p> If any parameters are omitted, the corresponding cookie fields are not set.</p></dd><dt id=\"sticky_route\"><code>route</code></dt><dd><p>When the <code>route</code> method is used, proxied server assignsclient a route on receipt of the first request.All subsequent requests from this client will carry routing informationin a cookie or URI.This information is compared with the “<code>route</code>” parameterof the  directive to identify the server to which therequest should be proxied.If the designated server cannot process a request, the new server isselected by the configured balancing method as if there is no routinginformation in the request.</p><p>The parameters of the <code>route</code> method specify variables thatmay contain routing information.The first non-empty variable is used to find the matching server.</p><p>Example:</p> <blockquote class=\"example\"><pre>map $cookie_jsessionid $route_cookie {    ~.+\\.(?P&lt;route&gt;\\w+)$ $route;}map $request_uri $route_uri {    ~jsessionid=.+\\.(?P&lt;route&gt;\\w+)$ $route;}upstream backend {    server backend1.example.com route=a;    server backend2.example.com route=b;    sticky route $route_cookie $route_uri;}</pre></blockquote><p> Here, the route is taken from the “<code>JSESSIONID</code>” cookieif present in a request.Otherwise, the route from the URI is used.</p></dd><dt id=\"sticky_learn\"><code>learn</code></dt><dd><p>When the <code>learn</code> method (1.7.1) is used, nginxanalyzes upstream server responses and learns server-initiated sessionsusually passed in an HTTP cookie.</p> <blockquote class=\"example\"><pre>upstream backend {   server backend1.example.com:8080;   server backend2.example.com:8081;   sticky learn          create=$upstream_cookie_examplecookie          lookup=$cookie_examplecookie          zone=client_sessions:1m;}</pre></blockquote><p> In the example, the upstream server creates a session by setting thecookie “<code>EXAMPLECOOKIE</code>” in the response.Further requests with this cookie will be passed to the same server.If the server cannot process the request, the new server isselected as if the client has not been bound yet.</p><p>The parameters <code>create</code> and <code>lookup</code>specify variables that indicate how new sessions are created and existingsessions are searched, respectively.Both parameters may be specified more than once, in which case the firstnon-empty variable is used.</p><p>Sessions are stored in a shared memory zone, whose <code><i>name</i></code> and<code><i>size</i></code> are configured by the <code>zone</code> parameter.One megabyte zone can store about 8000 sessions on the 64-bit platform.The sessions that are not accessed during the time specified by the<code>timeout</code> parameter get removed from the zone.By default, <code>timeout</code> is set to 10 minutes.</p></dd></dl><p> </p><p></p> <blockquote class=\"note\">This directive is available as part of our.</blockquote><p> </p>"
        },
        "sticky_cookie_insert": {
            "values": "name[expires=time][domain=domain][path=path]",
            "default": "",
            "context": ["upstream"],
            "isIn": isIn,
            "tooltip": "<p>This directive is obsolete since version 1.5.7.An equivalent directive with a new syntax should be used instead:</p> <blockquote class=\"note\"><code>sticky cookie</code> <code><i>name</i></code>[<code>expires=</code><code><i>time</i></code>][<code>domain=</code><code><i>domain</i></code>][<code>path=</code><code><i>path</i></code>];</blockquote><p> </p>__end"
        },
        "gzip": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables or disables gzipping of responses.</p>"
        },
        "gzip_buffers": {
            "values": "number size",
            "default": "32 4k|16 8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> and <code><i>size</i></code> of buffersused to compress a response.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.</p> <blockquote class=\"note\">Until version 0.7.28, four 4K or 8K buffers were used by default.</blockquote><p> </p>"
        },
        "gzip_comp_level": {
            "values": "level",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a gzip compression <code><i>level</i></code> of a response.Acceptable values are in the range from 1 to 9.</p>"
        },
        "gzip_disable": {
            "values": "regex ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Disables gzipping of responses for requests with“User-Agent” header fields matchingany of the specified regular expressions.</p><p>The special mask “<code>msie6</code>” (0.7.12) corresponds tothe regular expression “<code>MSIE [4-6]\\.</code>”, but works faster.Starting from version 0.8.11, “<code>MSIE 6.0; ... SV1</code>”is excluded from this mask.</p>"
        },
        "gzip_min_length": {
            "values": "length",
            "default": "20",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the minimum length of a response that will be gzipped.The length is determined only from the “Content-Length”response header field.</p>"
        },
        "gzip_http_version": {
            "values": ["1.0", "1.1"],
            "default": "1.1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the minimum HTTP version of a request required to compress a response.</p>"
        },
        "gzip_proxied": {
            "values": ["off", "expired", "no-cache", "no-store", "private", "no_last_modified", "no_etag", "auth", "any ..."],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables gzipping of responses for proxiedrequests depending on the request and response.The fact that the request is proxied is determined bythe presence of the “Via” request header field.The directive accepts multiple parameters:</p> <dl class=\"compact\"><dt><code>off</code></dt><dd>disables compression for all proxied requests,ignoring other parameters;</dd><dt><code>expired</code></dt><dd>enables compression if a response header includes the“Expires” field with a value that disables caching;</dd><dt><code>no-cache</code></dt><dd>enables compression if a response header includes the“Cache-Control” field with the“<code>no-cache</code>” parameter;</dd><dt><code>no-store</code></dt><dd>enables compression if a response header includes the“Cache-Control” field with the“<code>no-store</code>” parameter;</dd><dt><code>private</code></dt><dd>enables compression if a response header includes the“Cache-Control” field with the“<code>private</code>” parameter;</dd><dt><code>no_last_modified</code></dt><dd>enables compression if a response header does not include the“Last-Modified” field;</dd><dt><code>no_etag</code></dt><dd>enables compression if a response header does not include the“ETag” field;</dd><dt><code>auth</code></dt><dd>enables compression if a request header includes the“Authorization” field;</dd><dt><code>any</code></dt><dd>enables compression for all proxied requests.</dd></dl><p> </p>"
        },
        "gzip_types": {
            "values": "mime-type ...",
            "default": "text/html",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables gzipping of responses for the specified MIME types in additionto “<code>text/html</code>”.The special value “<code>*</code>” matches any MIME type (0.8.29).Responses with the “<code>text/html</code>” type are always compressed.</p>"
        },
        "gzip_vary": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables inserting the “Vary: Accept-Encoding”response header field if the directives,, orare active.</p>__end"
        },
        "gunzip": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables or disables decompression of gzipped responsesfor clients that lack gzip support.If enabled, the following directives are also taken into accountwhen determining if clients support gzip:,, and.See also the  directive.</p>__end"
        },
        "geoip_country": {
            "values": "file",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "__begin<p>Specifies a database used to determine the countrydepending on the client IP address.The following variables are available when using this database:</p> <dl class=\"compact\"><dt id=\"var_geoip_country_code\"><code>$geoip_country_code</code></dt><dd>two-letter country code, for example,“<code>RU</code>”, “<code>US</code>”.</dd><dt id=\"var_geoip_country_code3\"><code>$geoip_country_code3</code></dt><dd>three-letter country code, for example,“<code>RUS</code>”, “<code>USA</code>”.</dd><dt id=\"var_geoip_country_name\"><code>$geoip_country_name</code></dt><dd>country name, for example,“<code>Russian Federation</code>”, “<code>United States</code>”.</dd></dl><p> </p>"
        },
        "geoip_city": {
            "values": "file",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a database used to determine the country, region, and citydepending on the client IP address.The following variables are available when using this database:</p> <dl class=\"compact\"><dt id=\"var_geoip_area_code\"><code>$geoip_area_code</code></dt><dd>telephone area code (US only).<blockquote class=\"note\">This variable may contain outdated information sincethe corresponding database field is deprecated.</blockquote></dd><dt id=\"var_geoip_city_continent_code\"><code>$geoip_city_continent_code</code></dt><dd>two-letter continent code, for example,“<code>EU</code>”, “<code>NA</code>”.</dd><dt id=\"var_geoip_city_country_code\"><code>$geoip_city_country_code</code></dt><dd>two-letter country code, for example,“<code>RU</code>”, “<code>US</code>”.</dd><dt id=\"var_geoip_city_country_code3\"><code>$geoip_city_country_code3</code></dt><dd>three-letter country code, for example,“<code>RUS</code>”, “<code>USA</code>”.</dd><dt id=\"var_geoip_city_country_name\"><code>$geoip_city_country_name</code></dt><dd>country name, for example,“<code>Russian Federation</code>”, “<code>United States</code>”.</dd><dt id=\"var_geoip_dma_code\"><code>$geoip_dma_code</code></dt><dd>DMA region code in US (also known as “metro code”), according to thein Google AdWords API.</dd><dt id=\"var_geoip_latitude\"><code>$geoip_latitude</code></dt><dd>latitude.</dd><dt id=\"var_geoip_longitude\"><code>$geoip_longitude</code></dt><dd>longitude.</dd><dt id=\"var_geoip_region\"><code>$geoip_region</code></dt><dd>two-symbol country region code (region, territory, state, province, federal landand the like), for example,“<code>48</code>”, “<code>DC</code>”.</dd><dt id=\"var_geoip_region_name\"><code>$geoip_region_name</code></dt><dd>country region name (region, territory, state, province, federal landand the like), for example,“<code>Moscow City</code>”, “<code>District of Columbia</code>”.</dd><dt id=\"var_geoip_city\"><code>$geoip_city</code></dt><dd>city name, for example,“<code>Moscow</code>”, “<code>Washington</code>”.</dd><dt id=\"var_geoip_postal_code\"><code>$geoip_postal_code</code></dt><dd>postal code.</dd></dl><p> </p>"
        },
        "geoip_org": {
            "values": "file",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a database used to determine the organizationdepending on the client IP address.The following variable is available when using this database:</p> <dl class=\"compact\"><dt id=\"var_geoip_org\"><code>$geoip_org</code></dt><dd>organization name, for example, “The University of Melbourne”.</dd></dl><p> </p>"
        },
        "geoip_proxy": {
            "values": ["address", "CIDR"],
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Defines trusted addresses.When a request comes from a trusted address,an address from the “X-Forwarded-For” requestheader field will be used instead.</p>__end"
        },
        "fastcgi_bind": {
            "values": ["address", "off"],
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Makes outgoing connections to a FastCGI server originatefrom the specified local IP <code><i>address</i></code>.Parameter value can contain variables (1.3.12).The special value <code>off</code> (1.3.12) cancels the effectof the <code>fastcgi_bind</code> directiveinherited from the previous configuration level, which allows thesystem to auto-assign the local IP address.</p>"
        },
        "fastcgi_buffer_size": {
            "values": "size",
            "default": "4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>size</i></code> of the buffer used for reading the first partof the response received from the FastCGI server.This part usually contains a small response header.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.It can be made smaller, however.</p>"
        },
        "fastcgi_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of responses from the FastCGI server.</p><p>When buffering is enabled, nginx receives a response from the FastCGI serveras soon as possible, saving it into the buffers set by the and  directives.If the whole response does not fit into memory, a part of it can be savedto a  on the disk.Writing to temporary files is controlled by the and directives.</p><p>When buffering is disabled, the response is passed to a client synchronously,immediately as it is received.nginx will not try to read the whole response from the FastCGI server.The maximum size of the data that nginx can receive from the serverat a time is set by the  directive.</p><p>Buffering can also be enabled or disabled by passing“<code>yes</code>” or “<code>no</code>” in the“X-Accel-Buffering” response header field.This capability can be disabled using the directive.</p>"
        },
        "fastcgi_buffers": {
            "values": "number size",
            "default": "8 4k|8k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> and <code><i>size</i></code> of thebuffers used for reading a response from the FastCGI server,for a single connection.By default, the buffer size is equal to one memory page.This is either 4K or 8K, depending on a platform.</p>"
        },
        "fastcgi_busy_buffers_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the FastCGIserver is enabled, limits the total <code><i>size</i></code> of buffers thatcan be busy sending a response to the client while the response is notyet fully read.In the meantime, the rest of the buffers can be used for reading the responseand, if needed, buffering part of the response to a temporary file.By default, <code><i>size</i></code> is limited by the size of two buffers set by the and  directives.</p>"
        },
        "fastcgi_cache": {
            "values": ["zone", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a shared memory zone used for caching.The same zone can be used in several places.Parameter value can contain variables (1.7.9).The <code>off</code> parameter disables caching inheritedfrom the previous configuration level.</p>"
        },
        "fastcgi_cache_bypass": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be taken from a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be taken from the cache:</p> <blockquote class=\"example\"><pre>fastcgi_cache_bypass $cookie_nocache $arg_nocache$arg_comment;fastcgi_cache_bypass $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "fastcgi_cache_key": {
            "values": "string",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a key for caching, for example</p> <blockquote class=\"example\"><pre>fastcgi_cache_key localhost:9000$request_uri;</pre></blockquote><p> </p>"
        },
        "fastcgi_cache_lock": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When enabled, only one request at a time will be allowed to populatea new cache element identified according to the directive by passing a request to a FastCGI server.Other requests of the same cache element will either waitfor a response to appear in the cache or the cache lock forthis element to be released, up to the time set by the directive.</p>"
        },
        "fastcgi_cache_lock_age": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the last request passed to the FastCGI serverfor populating a new cache elementhas not completed for the specified <code><i>time</i></code>,one more request may be passed to the FastCGI server.</p>"
        },
        "fastcgi_cache_lock_timeout": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for .When the <code><i>time</i></code> expires,the request will be passed to the FastCGI server,however, the response will not be cached.</p> <blockquote class=\"note\">Before 1.7.8, the response could be cached.</blockquote><p> </p>"
        },
        "fastcgi_cache_methods": {
            "values": ["GET", "HEAD", "POST ..."],
            "default": "GET HEAD",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the client request method is listed in this directive thenthe response will be cached.“<code>GET</code>” and “<code>HEAD</code>” methods are alwaysadded to the list, though it is recommended to specify them explicitly.See also the  directive.</p>"
        },
        "fastcgi_cache_min_uses": {
            "values": "number",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> of requests after which the responsewill be cached.</p>"
        },
        "fastcgi_cache_path": {
            "values": "path [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] [loader_files=number] [loader_sleep=time] [loader_threshold=time] [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]",
            "default": "",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the path and other parameters of a cache.Cache data are stored in files.Both the key and file name in a cache are a result ofapplying the MD5 function to the proxied URL.The <code>levels</code> parameter defines hierarchy levels of a cache.For example, in the following configuration</p> <blockquote class=\"example\"><pre>fastcgi_cache_path /data/nginx/cache levels=1:2 keys_zone=one:10m;</pre></blockquote><p> file names in a cache will look like this:</p> <blockquote class=\"example\"><pre>/data/nginx/cache/<strong>c</strong>/<strong>29</strong>/b7f54b2df7773722d382f4809d650<strong>29c</strong></pre></blockquote><p> </p><p>A cached response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the cache can be put ondifferent file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both cache and a directoryholding temporary filesare put on the same file system.A directory for temporary files is set based onthe <code>use_temp_path</code> parameter (1.7.10).If this parameter is omitted or set to the value <code>on</code>,the directory set by the  directivefor the given location will be used.If the value is set to <code>off</code>,temporary files will be put directly in the cache directory.</p><p>In addition, all active keys and information about data are storedin a shared memory zone, whose <code><i>name</i></code> and <code><i>size</i></code>are configured by the <code>keys_zone</code> parameter.One megabyte zone can store about 8 thousand keys.</p><p>Cached data that are not accessed during the time specified by the<code>inactive</code> parameter get removed from the cacheregardless of their freshness.By default, <code>inactive</code> is set to 10 minutes.</p><p>The special “cache manager” process monitors the maximum cache size setby the <code>max_size</code> parameter.When this size is exceeded, it removes the least recently used data.</p><p>A minute after the start the special “cache loader” process is activated.It loads information about previously cached data stored on file systeminto a cache zone.The loading is done in iterations.During one iteration no more than <code>loader_files</code> itemsare loaded (by default, 100).Besides, the duration of one iteration is limited by the<code>loader_threshold</code> parameter (by default, 200 milliseconds).Between iterations, a pause configured by the <code>loader_sleep</code>parameter (by default, 50 milliseconds) is made.</p><p>Additionally,the following parameters are available as part of our:</p><p></p> <dl class=\"compact\"><dt id=\"purger\"><code>purger</code>=<code>on</code>|<code>off</code></dt><dd>Instructs whether cache entries that match awill be removed from the disk by the cache purger (1.7.12).Setting the parameter to <code>on</code>(default is <code>off</code>)will activate the “cache purger” process thatpermanently iterates through all cache entriesand deletes the entries that match the wildcard key.</dd><dt id=\"purger_files\"><code>purger_files</code>=<code><i>number</i></code></dt><dd>Sets the number of items that will be scanned during one iteration (1.7.12).By default, <code>purger_files</code> is set to 10.</dd><dt id=\"purger_threshold\"><code>purger_threshold</code>=<code><i>number</i></code></dt><dd>Sets the duration of one iteration (1.7.12).By default, <code>purger_threshold</code> is set to 50 milliseconds.</dd><dt id=\"purger_sleep\"><code>purger_sleep</code>=<code><i>number</i></code></dt><dd>Sets a pause between iterations (1.7.12).By default, <code>purger_sleep</code> is set to 50 milliseconds.</dd></dl><p> </p>"
        },
        "fastcgi_cache_purge": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the request will be considered a cachepurge request.If at least one value of the string parameters is not empty and is not equalto “0” then the cache entry with a corresponding is removed.The result of successful operation is indicated by returningthe 204 (No Content) response.</p><p>If the  of a purge request endswith an asterisk (“<code>*</code>”), all cache entries matching thewildcard key will be removed from the cache.However, these entries will remain on the disk until they are deletedfor either ,or processed by the  (1.7.12),or a client attempts to access them.</p><p>Example configuration:</p> <blockquote class=\"example\"><pre>fastcgi_cache_path /data/nginx/cache keys_zone=cache_zone:10m;map $request_method $purge_method {    PURGE   1;    default 0;}server {    ...    location / {        fastcgi_pass        backend;        fastcgi_cache       cache_zone;        fastcgi_cache_key   $uri;        fastcgi_cache_purge $purge_method;    }}</pre></blockquote><p> </p> <blockquote class=\"note\">This functionality is available as part of our.</blockquote><p> </p>"
        },
        "fastcgi_cache_revalidate": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables revalidation of expired cache items using conditional requests withthe “If-Modified-Since” and “If-None-Match”header fields.</p>"
        },
        "fastcgi_cache_use_stale": {
            "values": ["error", "timeout", "invalid_header", "updating", "http_500", "http_503", "http_403", "http_404", "off ..."],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines in which cases a stale cached response can be usedwhen an error occurs during communication with the FastCGI server.The directive’s parameters match the parameters of the directive.</p><p>The <code>error</code> parameter also permitsusing a stale cached response if a FastCGI server to process a requestcannot be selected.</p><p>Additionally, the <code>updating</code> parameter permitsusing a stale cached response if it is currently being updated.This allows minimizing the number of accesses to FastCGI serverswhen updating cached data.</p><p>To minimize the number of accesses to FastCGI servers whenpopulating a new cache element, the directive can be used.</p>"
        },
        "fastcgi_cache_valid": {
            "values": "[code ...] time",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets caching time for different response codes.For example, the following directives</p> <blockquote class=\"example\"><pre>fastcgi_cache_valid 200 302 10m;fastcgi_cache_valid 404      1m;</pre></blockquote><p> set 10 minutes of caching for responses with codes 200 and 302and 1 minute for responses with code 404.</p><p>If only caching <code><i>time</i></code> is specified</p> <blockquote class=\"example\"><pre>fastcgi_cache_valid 5m;</pre></blockquote><p> then only 200, 301, and 302 responses are cached.</p><p>In addition, the <code>any</code> parameter can be specifiedto cache any responses:</p> <blockquote class=\"example\"><pre>fastcgi_cache_valid 200 302 10m;fastcgi_cache_valid 301      1h;fastcgi_cache_valid any      1m;</pre></blockquote><p> </p><p>Parameters of caching can also be set directlyin the response header.This has higher priority than setting of caching time using the directive.</p> <ul><li>The “X-Accel-Expires” header field sets caching time of aresponse in seconds.The zero value disables caching for a response.If the value starts with the <code>@</code> prefix, it sets an absolutetime in seconds since Epoch, up to which the response may be cached.</li><li>If the header does not include the “X-Accel-Expires” field,parameters of caching may be set in the header fields“Expires” or “Cache-Control”.</li><li>If the header includes the “Set-Cookie” field, such aresponse will not be cached.</li><li>If the header includes the “Vary” fieldwith the special value “<code>*</code>”, such aresponse will not be cached (1.7.7).If the header includes the “Vary” fieldwith another value, such a response will be cachedtaking into account the corresponding request header fields (1.7.7).</li></ul><p> Processing of one or more of these response header fields can be disabledusing the  directive.</p>"
        },
        "fastcgi_catch_stderr": {
            "values": "string",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a string to search for in the error stream of a responsereceived from a FastCGI server.If the <code><i>string</i></code> is found then it is considered that the FastCGIserver has returned an .This allows handling application errors in nginx, for example:</p> <blockquote class=\"example\"><pre>location /php {    fastcgi_pass backend:9000;    ...    fastcgi_catch_stderr \"PHP Fatal error\";    fastcgi_next_upstream error timeout invalid_header;}</pre></blockquote><p> </p>"
        },
        "fastcgi_connect_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for establishing a connection with a FastCGI server.It should be noted that this timeout cannot usually exceed 75 seconds.</p>"
        },
        "fastcgi_force_ranges": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables byte-range supportfor both cached and uncached responses from the FastCGI serverregardless of the “Accept-Ranges” field in these responses.</p>"
        },
        "fastcgi_hide_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>By default,nginx does not pass the header fields “Status” and“X-Accel-...” from the response of a FastCGIserver to a client.The <code>fastcgi_hide_header</code> directive sets additional fieldsthat will not be passed.If, on the contrary, the passing of fields needs to be permitted,the  directive can be used.</p>"
        },
        "fastcgi_ignore_client_abort": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether the connection with a FastCGI server should beclosed when a client closes the connection without waitingfor a response.</p>"
        },
        "fastcgi_ignore_headers": {
            "values": "field ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Disables processing of certain response header fields from the FastCGI server.The following fields can be ignored: “X-Accel-Redirect”,“X-Accel-Expires”, “X-Accel-Limit-Rate” (1.1.6),“X-Accel-Buffering” (1.1.6),“X-Accel-Charset” (1.1.6), “Expires”,“Cache-Control”, “Set-Cookie” (0.8.44),and “Vary” (1.7.7).</p><p>If not disabled, processing of these header fields has the followingeffect:</p> <ul><li>“X-Accel-Expires”, “Expires”,“Cache-Control”, “Set-Cookie”,and “Vary”set the parameters of response ;</li><li>“X-Accel-Redirect” performs an to the specified URI;</li><li>“X-Accel-Limit-Rate” sets the for transmission of a response to a client;</li><li>“X-Accel-Buffering” enables or disables of a response;</li><li>“X-Accel-Charset” sets the desiredof a response.</li></ul><p> </p>"
        },
        "fastcgi_index": {
            "values": "name",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a file name that will be appended after a URI that ends witha slash, in the value of the <code>$fastcgi_script_name</code> variable.For example, with these settings</p> <blockquote class=\"example\"><pre>fastcgi_index index.php;fastcgi_param SCRIPT_FILENAME /home/www/scripts/php$fastcgi_script_name;</pre></blockquote><p> and the “<code>/page.php</code>” request,the <code>SCRIPT_FILENAME</code> parameter will be equal to“<code>/home/www/scripts/php/page.php</code>”,and with the “<code>/</code>” request it will be equal to“<code>/home/www/scripts/php/index.php</code>”.</p>"
        },
        "fastcgi_intercept_errors": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether FastCGI server responses with codes greater than or equalto 300 should be passed to a client or be redirected to nginx for processingwith the  directive.</p>"
        },
        "fastcgi_keep_conn": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>By default, a FastCGI server will close a connection right aftersending the response.However, when this directive is set to the value <code>on</code>,nginx will instruct a FastCGI server to keep connections open.This is necessary, in particular, forconnections to FastCGI servers to function.</p>"
        },
        "fastcgi_limit_rate": {
            "values": "rate",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the speed of reading the response from the FastCGI server.The <code><i>rate</i></code> is specified in bytes per second.The zero value disables rate limiting.The limit is set per a request, and so if nginx simultaneously openstwo connections to the FastCFI server,the overall rate will be twice as much as the specified limit.The limitation works only if of responses from the FastCGIserver is enabled.</p>"
        },
        "fastcgi_max_temp_file_size": {
            "values": "size",
            "default": "1024m",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  of responses from the FastCGIserver is enabled, and the whole response does not fit into the buffersset by the  and directives, a part of the response can be saved to a temporary file.This directive sets the maximum <code><i>size</i></code> of the temporary file.The size of data written to the temporary file at a time is setby the  directive.</p><p>The zero value disables buffering of responses to temporary files.</p><p></p> <blockquote class=\"note\">This restriction does not apply to responsesthat will be or  on disk.</blockquote><p> </p>"
        },
        "fastcgi_next_upstream": {
            "values": ["error", "timeout", "invalid_header", "http_500", "http_503", "http_403", "http_404", "off ..."],
            "default": "error timeout",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies in which cases a request should be passed to the next server:</p> <dl class=\"compact\"><dt><code>error</code></dt><dd>an error occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>timeout</code></dt><dd>a timeout has occurred while establishing a connection with theserver, passing a request to it, or reading the response header;</dd><dt><code>invalid_header</code></dt><dd>a server returned an empty or invalid response;</dd><dt><code>http_500</code></dt><dd>a server returned a response with the code 500;</dd><dt><code>http_503</code></dt><dd>a server returned a response with the code 503;</dd><dt><code>http_403</code></dt><dd>a server returned a response with the code 403;</dd><dt><code>http_404</code></dt><dd>a server returned a response with the code 404;</dd><dt><code>off</code></dt><dd>disables passing a request to the next server.</dd></dl><p> </p><p>One should bear in mind that passing a request to the next server isonly possible if nothing has been sent to a client yet.That is, if an error or timeout occurs in the middle of thetransferring of a response, fixing this is impossible.</p><p>The directive also defines what is considered an of communication with a server.The cases of <code>error</code>, <code>timeout</code> and<code>invalid_header</code> are always considered unsuccessful attempts,even if they are not specified in the directive.The cases of <code>http_500</code> and <code>http_503</code> areconsidered unsuccessful attempts only if they are specified in the directive.The cases of <code>http_403</code> and <code>http_404</code>are never considered unsuccessful attempts.</p><p>Passing a request to the next server can be limited byand by .</p>"
        },
        "fastcgi_next_upstream_timeout": {
            "values": "time",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the time allowed to pass a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "fastcgi_next_upstream_tries": {
            "values": "number",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the number of possible tries for passing a request to the.The <code>0</code> value turns off this limitation.</p>"
        },
        "fastcgi_no_cache": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines conditions under which the response will not be saved to a cache.If at least one value of the string parameters is not empty and is notequal to “0” then the response will not be saved:</p> <blockquote class=\"example\"><pre>fastcgi_no_cache $cookie_nocache $arg_nocache$arg_comment;fastcgi_no_cache $http_pragma    $http_authorization;</pre></blockquote><p> Can be used along with the  directive.</p>"
        },
        "fastcgi_param": {
            "values": "parameter value [if_not_empty]",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a <code><i>parameter</i></code> that should be passed to the FastCGI server.The <code><i>value</i></code> can contain text, variables, and their combination.These directives are inherited from the previous level if andonly if there are no<code>fastcgi_param</code>directives defined on the current level.</p><p>The following example shows the minimum required settings for PHP:</p> <blockquote class=\"example\"><pre>fastcgi_param SCRIPT_FILENAME /home/www/scripts/php$fastcgi_script_name;fastcgi_param QUERY_STRING    $query_string;</pre></blockquote><p> </p><p>The <code>SCRIPT_FILENAME</code> parameter is used in PHP fordetermining the script name, and the <code>QUERY_STRING</code>parameter is used to pass request parameters.</p><p>For scripts that process <code>POST</code> requests, thefollowing three parameters are also required:</p> <blockquote class=\"example\"><pre>fastcgi_param REQUEST_METHOD  $request_method;fastcgi_param CONTENT_TYPE    $content_type;fastcgi_param CONTENT_LENGTH  $content_length;</pre></blockquote><p> </p><p>If PHP was built with the <code>--enable-force-cgi-redirect</code>configuration parameter, the <code>REDIRECT_STATUS</code> parametershould also be passed with the value “200”:</p> <blockquote class=\"example\"><pre>fastcgi_param REDIRECT_STATUS 200;</pre></blockquote><p> </p><p>If a directive is specified with <code>if_not_empty</code> (1.1.11) thensuch a parameter will not be passed to the server until its value is not empty:</p> <blockquote class=\"example\"><pre>fastcgi_param HTTPS           $https if_not_empty;</pre></blockquote><p> </p>"
        },
        "fastcgi_pass": {
            "values": "address",
            "default": "",
            "context": ["location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Sets the address of a FastCGI server.The address can be specified as a domain name or IP address,and a port:</p> <blockquote class=\"example\"><pre>fastcgi_pass localhost:9000;</pre></blockquote><p> or as a UNIX-domain socket path:</p> <blockquote class=\"example\"><pre>fastcgi_pass unix:/tmp/fastcgi.socket;</pre></blockquote><p> </p><p>If a domain name resolves to several addresses, all of them will beused in a round-robin fashion.In addition, an address can be specified as a.</p>"
        },
        "fastcgi_pass_header": {
            "values": "field",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Permits passing  headerfields from a FastCGI server to a client.</p>"
        },
        "fastcgi_pass_request_body": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the original request body is passedto the FastCGI server.See also the  directive.</p>"
        },
        "fastcgi_pass_request_headers": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Indicates whether the header fields of the original request are passedto the FastCGI server.See also the  directive.</p>"
        },
        "fastcgi_read_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for reading a response from the FastCGI server.The timeout is set only between two successive read operations,not for the transmission of the whole response.If the FastCGI server does not transmit anything within this time,the connection is closed.</p>"
        },
        "fastcgi_request_buffering": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables buffering of a client request body.</p><p>When buffering is enabled, the entire request body isfrom the client before sending the request to a FastCGI server.</p><p>When buffering is disabled, the request body is sent to the FastCGI serverimmediately as it is received.In this case, the request cannot be passed to theif nginx already started sending the request body.</p>"
        },
        "fastcgi_send_lowat": {
            "values": "size",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the directive is set to a non-zero value, nginx will try tominimize the numberof send operations on outgoing connections to a FastCGI server by using either<code>NOTE_LOWAT</code> flag of the method,or the <code>SO_SNDLOWAT</code> socket option,with the specified <code><i>size</i></code>.</p><p>This directive is ignored on Linux, Solaris, and Windows.</p>"
        },
        "fastcgi_send_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for transmitting a request to the FastCGI server.The timeout is set only between two successive write operations,not for the transmission of the whole request.If the FastCGI server does not receive anything within this time,the connection is closed.</p>"
        },
        "fastcgi_split_path_info": {
            "values": "regex",
            "default": "",
            "context": ["location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a regular expression that captures a value for the<code>$fastcgi_path_info</code> variable.The regular expression should have two captures: the first becomesa value of the <code>$fastcgi_script_name</code> variable, the secondbecomes a value of the <code>$fastcgi_path_info</code> variable.For example, with these settings</p> <blockquote class=\"example\"><pre>location ~ ^(.+\\.php)(.*)$ {    fastcgi_split_path_info       ^(.+\\.php)(.*)$;    fastcgi_param SCRIPT_FILENAME /path/to/php$fastcgi_script_name;    fastcgi_param PATH_INFO       $fastcgi_path_info;</pre></blockquote><p> and the “<code>/show.php/article/0001</code>” request,the <code>SCRIPT_FILENAME</code> parameter will be equal to“<code>/path/to/php/show.php</code>”, and the<code>PATH_INFO</code> parameter will be equal to“<code>/article/0001</code>”.</p>"
        },
        "fastcgi_store": {
            "values": ["on", "off", "string"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables saving of files to a disk.The <code>on</code> parameter saves files with pathscorresponding to the directives or.The <code>off</code> parameter disables saving of files.In addition, the file name can be set explicitly using the<code><i>string</i></code> with variables:</p> <blockquote class=\"example\"><pre>fastcgi_store /data/www$original_uri;</pre></blockquote><p> </p><p>The modification time of files is set according to the received“Last-Modified” response header field.The response is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the persistent storecan be put on different file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both saved files and adirectory holding temporary files, set by the directive, are put on the same file system.</p><p>This directive can be used to create local copies of static unchangeablefiles, e.g.:</p> <blockquote class=\"example\"><pre>location /images/ {    root                 /data/www;    error_page           404 = /fetch$uri;}location /fetch/ {    internal;    fastcgi_pass         backend:9000;    ...    fastcgi_store        on;    fastcgi_store_access user:rw group:rw all:r;    fastcgi_temp_path    /data/temp;    alias                /data/www/;}</pre></blockquote><p> </p>"
        },
        "fastcgi_store_access": {
            "values": "users:permissions ...",
            "default": "user:rw",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets access permissions for newly created files and directories, e.g.:</p> <blockquote class=\"example\"><pre>fastcgi_store_access user:rw group:rw all:r;</pre></blockquote><p> </p><p>If any <code>group</code> or <code>all</code> access permissionsare specified then <code>user</code> permissions may be omitted:</p> <blockquote class=\"example\"><pre>fastcgi_store_access group:rw all:r;</pre></blockquote><p> </p>"
        },
        "fastcgi_temp_file_write_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the <code><i>size</i></code> of data written to a temporary fileat a time, when buffering of responses from the FastCGI serverto temporary files is enabled.By default, <code><i>size</i></code> is limited by two buffers set by the and  directives.The maximum size of a temporary file is set by the directive.</p>"
        },
        "fastcgi_temp_path": {
            "values": "path [level1 [level2 [level3]]]",
            "default": "fastcgi_temp",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a directory for storing temporary fileswith data received from FastCGI servers.Up to three-level subdirectory hierarchy can be used underneath the specifieddirectory.For example, in the following configuration</p> <blockquote class=\"example\"><pre>fastcgi_temp_path /spool/nginx/fastcgi_temp 1 2;</pre></blockquote><p> a temporary file might look like this:</p> <blockquote class=\"example\"><pre>/spool/nginx/fastcgi_temp/<strong>7</strong>/<strong>45</strong>/00000123<strong>457</strong></pre></blockquote><p> </p><p>See also the <code>use_temp_path</code> parameter of the directive.</p>__end<center><h4>Parameters Passed to a FastCGI Server</h4></center><p>HTTP request header fields are passed to a FastCGI server as parameters.In applications and scripts running as FastCGI servers,these parameters are usually made available as environment variables.For example, the “User-Agent” header field is passed as the<code>HTTP_USER_AGENT</code> parameter.In addition to HTTP request header fields, it is possible to pass arbitraryparameters using the  directive.</p>__end"
        },
        "f4f": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "__begin<p>Turns on module processing in the surrounding location.</p>__end"
        },
        "dav_access": {
            "values": "users:permissions ...",
            "default": "user:rw",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets access permissions for newly created files and directories, e.g.:</p> <blockquote class=\"example\"><pre>dav_access user:rw group:rw all:r;</pre></blockquote><p> </p><p>If any <code>group</code> or <code>all</code> access permissionsare specified then <code>user</code> permissions may be omitted:</p> <blockquote class=\"example\"><pre>dav_access group:rw all:r;</pre></blockquote><p> </p>"
        },
        "dav_methods": {
            "values": ["off", "method ..."],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows the specified HTTP and WebDAV methods.The parameter <code>off</code> denies all methods processedby this module.The following methods are supported:<code>PUT</code>, <code>DELETE</code>, <code>MKCOL</code>,<code>COPY</code>, and <code>MOVE</code>.</p><p>A file uploaded with the PUT method is first written to a temporary file,and then the file is renamed.Starting from version 0.8.9, temporary files and the persistent storecan be put on different file systems.However, be aware that in this case a file is copiedacross two file systems instead of the cheap renaming operation.It is thus recommended that for any given location both saved files and adirectory holding temporary files, set by thedirective, are put on the same file system.</p><p>When creating a file with the PUT method, it is possible to specifythe modification date by passing it in the “Date”header field.</p>"
        },
        "create_full_put_path": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>The WebDAV specification only allows creating files in alreadyexisting directories.This directive allows creating all needed intermediate directories.</p>__end"
        },
        "charset": {
            "values": ["charset", "off"],
            "default": "off",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "__begin<p>Adds the specified charset to the “Content-Type”response header field.If this charset is different from the charset specifiedin the  directive, a conversion is performed.</p><p>The parameter <code>off</code> cancels the addition of charsetto the “Content-Type” response header field.</p><p>A charset can be defined with a variable:</p> <blockquote class=\"example\"><pre>charset $charset;</pre></blockquote><p> In such a case, all possible values of a variable need to be presentin the configuration at least once in the form of the, , or directives.For <code>utf-8</code>, <code>windows-1251</code>, and<code>koi8-r</code> charsets, it is sufficient to include the files<code>conf/koi-win</code>, <code>conf/koi-utf</code>, and<code>conf/win-utf</code> into configuration.For other charsets, simply making a fictitious conversion table works,for example:</p> <blockquote class=\"example\"><pre>charset_map iso-8859-5 _ { }</pre></blockquote><p> </p><p>In addition, a charset can be set in the“X-Accel-Charset” response header field.This capability can be disabled using the,,,anddirectives.</p>"
        },
        "charset_types": {
            "values": "mime-type ...",
            "default": "text/html text/xml text/plain text/vnd.wap.wmlapplication/javascript application/rss+xml",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables module processing in responses with the specified MIME typesin addition to “<code>text/html</code>”.The special value “<code>*</code>” matches any MIME type (0.8.29).</p><p></p> <blockquote class=\"note\">Until version 1.5.4, “<code>application/x-javascript</code>” was usedas the default MIME type instead of “<code>application/javascript</code>”.</blockquote><p> </p>"
        },
        "override_charset": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether a conversion should be performed for answersreceived from a proxied or a FastCGI/uwsgi/SCGI serverwhen the answers already carry a charset in the “Content-Type”response header field.If conversion is enabled, a charset specified in the receivedresponse is used as a source charset.</p> <blockquote class=\"note\">It should be noted that if a response is received in a subrequestthen the conversion from the response charset to the main request charsetis always performed, regardless of the <code>override_charset</code>directive setting.</blockquote><p> </p>__end"
        },
        "break": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "__begin<p>Stops processing the current set of<code>ngx_http_rewrite_module</code> directives.</p><p>If a directive is specified inside the,further processing of the request continues in this location.</p><p>Example:</p> <blockquote class=\"example\"><pre>if ($slow) {    limit_rate 10k;    break;}</pre></blockquote><p> </p>"
        },
        "return": {
            "values": "code [text];return code URL;return URL",
            "default": "",
            "context": ["server", "location", "if"],
            "isIn": isIn,
            "tooltip": "<p>Stops processing and returns the specified <code><i>code</i></code> to a client.The non-standard code 444 closes a connection without sendinga response header.</p><p>Starting from version 0.8.42, it is possible to specifyeither a redirect URL (for codes 301, 302, 303, and 307),or the response body <code><i>text</i></code> (for other codes).A response body text and redirect URL can contain variables.As a special case, a redirect URL can be specified as a URIlocal to this server, in which case the full redirect URLis formed according to the request scheme (<code>$scheme</code>) and the and directives.</p><p>In addition, a <code><i>URL</i></code> for temporary redirect with the code 302can be specified as the sole parameter.Such a parameter should start with the “<code>http://</code>”,“<code>https://</code>”, or “<code>$scheme</code>” string.A <code><i>URL</i></code> can contain variables.</p><p></p> <blockquote class=\"note\">Only the following codes could be returned before version 0.7.51:204, 400, 402&nbsp;— 406, 408, 410, 411, 413, 416, and 500&nbsp;— 504.</blockquote><p> </p> <blockquote class=\"note\">The code 307 was not treated as a redirect until versions 1.1.16 and 1.0.13.</blockquote><p> </p><p>See also the  directive.</p>"
        },
        "rewrite": {
            "values": "regex replacement [flag]",
            "default": "",
            "context": ["server", "location", "if"],
            "isIn": isIn,
            "tooltip": "<p>If the specified regular expression matches a request URI, URI is changedas specified in the <code><i>replacement</i></code> string.The <code>rewrite</code> directives are executed sequentiallyin order of their appearance in the configuration file.It is possible to terminate further processing of the directives using flags.If a replacement string starts with “<code>http://</code>”or “<code>https://</code>”, the processing stops and theredirect is returned to a client.</p><p>An optional <code><i>flag</i></code> parameter can be one of:</p> <dl class=\"compact\"><dt><code>last</code></dt><dd>stops processing the current set of<code>ngx_http_rewrite_module</code> directives and startsa search for a new location matching the changed URI;</dd><dt><code>break</code></dt><dd>stops processing the current set of<code>ngx_http_rewrite_module</code> directivesas with the  directive;</dd><dt><code>redirect</code></dt><dd>returns a temporary redirect with the 302 code;used if a replacement string does not start with“<code>http://</code>” or “<code>https://</code>”;</dd><dt><code>permanent</code></dt><dd>returns a permanent redirect with the 301 code.</dd></dl><p> The full redirect URL is formed according to therequest scheme (<code>$scheme</code>) and the and directives.</p><p>Example:</p> <blockquote class=\"example\"><pre>server {    ...    rewrite ^(/download/.*)/media/(.*)\\..*$ $1/mp3/$2.mp3 last;    rewrite ^(/download/.*)/audio/(.*)\\..*$ $1/mp3/$2.ra  last;    return  403;    ...}</pre></blockquote><p> </p><p>But if these directives are put inside the “<code>/download/</code>”location, the <code>last</code> flag should be replaced by<code>break</code>, or otherwise nginx will make 10 cycles andreturn the 500 error:</p> <blockquote class=\"example\"><pre>location /download/ {    rewrite ^(/download/.*)/media/(.*)\\..*$ $1/mp3/$2.mp3 break;    rewrite ^(/download/.*)/audio/(.*)\\..*$ $1/mp3/$2.ra  break;    return  403;}</pre></blockquote><p> </p><p>If a <code><i>replacement</i></code> string includes the new request arguments,the previous request arguments are appended after them.If this is undesired, putting a question mark at the end of a replacementstring avoids having them appended, for example:</p> <blockquote class=\"example\"><pre>rewrite ^/users/(.*)$ /show?user=$1? last;</pre></blockquote><p> </p><p>If a regular expression includes the “<code>}</code>”or “<code>;</code>” characters, the whole expressions should be enclosedin single or double quotes.</p>"
        },
        "rewrite_log": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location", "if"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables logging of <code>ngx_http_rewrite_module</code>module directives processing resultsinto the  atthe <code>notice</code> level.</p>"
        },
        "set": {
            "values": "$variable value",
            "default": "",
            "context": ["server", "location", "if"],
            "isIn": isIn,
            "tooltip": "<p>Sets a <code><i>value</i></code> for the specified <code><i>variable</i></code>.The <code><i>value</i></code> can contain text, variables, and their combination.</p>"
        },
        "uninitialized_variable_warn": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location", "if"],
            "isIn": isIn,
            "tooltip": "<p>Controls whether warnings about uninitialized variables are logged.</p>__end"
        },
        "autoindex": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables or disables the directory listing output.</p>"
        },
        "autoindex_exact_size": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>For the HTML ,specifies whether exact file sizes should be output in the directory listing,or rather rounded to kilobytes, megabytes, and gigabytes.</p>"
        },
        "autoindex_format": {
            "values": ["html", "xml", "json", "jsonp"],
            "default": "html",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the format of a directory listing.</p><p>When the JSONP format is used, the name of a callback function is setwith the <code>callback</code> request argument.If the argument is missing or has an empty value,then the JSON format is used.</p><p>The XML output can be transformed using the module.</p>__end"
        },
        "auth_request": {
            "values": ["uri", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables authorization based on the result of a subrequest and setsthe URI to which the subrequest will be sent.</p>__end"
        },
        "auth_http": {
            "values": "URL",
            "default": "",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the URL of the HTTP authentication server.The protocol is described .</p>"
        },
        "auth_http_header": {
            "values": "header value",
            "default": "",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "<p>Appends the specified header to requests sent to the authentication server.This header can be used as the shared secret to verifythat the request comes from nginx.For example:</p> <blockquote class=\"example\"><pre>auth_http_header X-Auth-Key \"secret_string\";</pre></blockquote><p> </p>"
        },
        "auth_http_pass_client_cert": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "<p>Appends the “Auth-SSL-Cert” header with thecertificate in the PEM format (urlencoded)to requests sent to the authentication server.</p>"
        },
        "auth_http_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["mail", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the timeout for communication with the authentication server.</p>__end"
        },
        "auth_basic": {
            "values": ["string", "off"],
            "default": "off",
            "context": ["http", "server", "location", "limit_except"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables validation of user name and password using the“HTTP Basic Authentication” protocol.The specified parameter is used as a <code><i>realm</i></code>.Parameter value can contain variables (1.3.10, 1.2.7).The special value <code>off</code> allows cancelling the effectof the <code>auth_basic</code> directiveinherited from the previous configuration level.</p>__end"
        },
        "ancient_browser": {
            "values": "string ...",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>If any of the specified substrings is found in the “User-Agent”request header field, the browser will be considered ancient.The special string “<code>netscape4</code>” corresponds to theregular expression “<code>^Mozilla/[1-4]</code>”.</p>"
        },
        "ancient_browser_value": {
            "values": "string",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a value for the <code>$ancient_browser</code> variables.</p>"
        },
        "modern_browser": {
            "values": "browser version;modern_browser unlisted",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies a version starting from which a browser is considered modern.A browser can be any one of the following: <code>msie</code>,<code>gecko</code> (browsers based on Mozilla),<code>opera</code>, <code>safari</code>,or <code>konqueror</code>.</p><p>Versions can be specified in the following formats: X, X.X, X.X.X, or X.X.X.X.The maximum values for each of the format are4000, 4000.99, 4000.99.99, and 4000.99.99.99, respectively.</p><p>The special value <code>unlisted</code> specifies to considera browser as modern if it was not listed by the<code>modern_browser</code> and directives.Otherwise such a browser is considered ancient.If a request does not provide the “User-Agent” fieldin the header, the browser is treated as not being listed.</p>__end"
        },
        "allow": {
            "values": ["address", "CIDR", "unix:", "all"],
            "default": "",
            "context": ["http", "server", "location", "limit_except"],
            "isIn": isIn,
            "tooltip": "__begin<p>Allows access for the specified network or address.If the special value <code>unix:</code> is specified (1.5.1),allows access for all UNIX-domain sockets.</p>__end"
        },
        "aio": {
            "values": ["on", "off", "threads[=pool]"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Enables or disables the use of asynchronous file I/O (AIO)on FreeBSD and Linux:</p> <blockquote class=\"example\"><pre>location /video/ {    aio            on;    output_buffers 1 64k;}</pre></blockquote><p> </p><p>On FreeBSD, AIO can be used starting from FreeBSD&nbsp;4.3.AIO can either be linked statically into a kernel:</p> <blockquote class=\"example\"><pre>options VFS_AIO</pre></blockquote><p> or loaded dynamically as a kernel loadable module:</p> <blockquote class=\"example\"><pre>kldload aio</pre></blockquote><p> </p><p>On Linux, AIO can be used starting from kernel version 2.6.22.Also, it is necessary to enable,or otherwise reading will be blocking:</p> <blockquote class=\"example\"><pre>location /video/ {    aio            on;    directio       512;    output_buffers 1 128k;}</pre></blockquote><p> </p><p>On Linux,can only be used for reading blocks that are aligned on 512-byteboundaries (or 4K for XFS).File’s unaligned end is read in blocking mode.The same holds true for byte range requests and for FLV requestsnot from the beginning of a file: reading of unaligned data at thebeginning and end of a file will be blocking.</p><p>When both AIO and  are enabled on Linux,AIO is used for files that are larger than or equal tothe size specified in the  directive,while  is used for files of smaller sizesor when  is disabled.</p> <blockquote class=\"example\"><pre>location /video/ {    sendfile       on;    aio            on;    directio       8m;}</pre></blockquote><p> </p><p>Finally, files can be read and using multi-threading (1.7.11),without blocking a worker process:</p> <blockquote class=\"example\"><pre>location /video/ {    sendfile       on;    aio            threads;}</pre></blockquote><p> Read and send file operations are offloaded to threads of the specified.If the pool name is omitted,the pool with the name “<code>default</code>” is used.The pool name can also be set with variables:</p> <blockquote class=\"example\"><pre>aio threads=pool$disk;</pre></blockquote><p> By default, multi-threading is disabled, it should beenabled with the<code>--with-threads</code> configuration parameter.Currently, multi-threading is compatible only with the,,and methods.Multi-threaded sending of files is only supported on Linux.</p><p>See also the  directive.</p>"
        },
        "alias": {
            "values": "path",
            "default": "",
            "context": ["location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a replacement for the specified location.For example, with the following configuration</p> <blockquote class=\"example\"><pre>location /i/ {    alias /data/w3/images/;}</pre></blockquote><p> on request of“<code>/i/top.gif</code>”, the file<code>/data/w3/images/top.gif</code> will be sent.</p><p>The <code><i>path</i></code> value can contain variables,except <code>$document_root</code> and <code>$realpath_root</code>.</p><p>If <code>alias</code> is used inside a location definedwith a regular expression then such regular expression shouldcontain captures and <code>alias</code> should refer tothese captures (0.7.40), for example:</p> <blockquote class=\"example\"><pre>location ~ ^/users/(.+\\.(?:gif|jpe?g|png))$ {    alias /data/w3/images/$1;}</pre></blockquote><p> </p><p>When location matches the last part of the directive’s value:</p> <blockquote class=\"example\"><pre>location /images/ {    alias /data/w3/images/;}</pre></blockquote><p> it is better to use thedirective instead:</p> <blockquote class=\"example\"><pre>location /images/ {    root /data/w3;}</pre></blockquote><p> </p>"
        },
        "chunked_transfer_encoding": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows disabling chunked transfer encoding in HTTP/1.1.It may come in handy when using a software failing to supportchunked encoding despite the standard’s requirement.</p>"
        },
        "client_body_buffer_size": {
            "values": "size",
            "default": "8k|16k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets buffer size for reading client request body.In case the request body is larger than the buffer,the whole body or only its part is written to a.By default, buffer size is equal to two memory pages.This is 8K on x86, other 32-bit platforms, and x86-64.It is usually 16K on other 64-bit platforms.</p>"
        },
        "client_body_in_file_only": {
            "values": ["on", "clean", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether nginx should save the entire client request bodyinto a file.This directive can be used during debugging, or when using the<code>$request_body_file</code>variable, or themethod of the module.</p><p>When set to the value <code>on</code>, temporary files are notremoved after request processing.</p><p>The value <code>clean</code> will cause the temporary filesleft after request processing to be removed.</p>"
        },
        "client_body_in_single_buffer": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether nginx should save the entire client request bodyin a single buffer.The directive is recommended when using the<code>$request_body</code>variable, to save the number of copy operations involved.</p>"
        },
        "client_body_temp_path": {
            "values": "path [level1 [level2 [level3]]]",
            "default": "client_body_temp",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a directory for storing temporary files holding client request bodies.Up to three-level subdirectory hierarchy can be used under the specifieddirectory.For example, in the following configuration</p> <blockquote class=\"example\"><pre>client_body_temp_path /spool/nginx/client_temp 1 2;</pre></blockquote><p> a path to a temporary file might look like this:</p> <blockquote class=\"example\"><pre>/spool/nginx/client_temp/7/45/00000123457</pre></blockquote><p> </p>"
        },
        "client_body_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for reading client request body.The timeout is set only for a period between two successive read operations,not for the transmission of the whole request body.If a client does not transmit anything within this time, the408 (Request Time-out)error is returned to the client.</p>"
        },
        "client_header_buffer_size": {
            "values": "size",
            "default": "1k",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets buffer size for reading client request header.For most requests, a buffer of 1K bytes is enough.However, if a request includes long cookies, or comes from a WAP client,it may not fit into 1K.If a request line or a request header field does not fit intothis buffer then larger buffers, configured by the directive,are allocated.</p>"
        },
        "client_header_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Defines a timeout for reading client request header.If a client does not transmit the entire header within this time, the408 (Request Time-out)error is returned to the client.</p>"
        },
        "client_max_body_size": {
            "values": "size",
            "default": "1m",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum allowed size of the client request body,specified in the“Content-Length”request header field.If the size in a request exceeds the configured value, the413 (Request Entity Too Large)error is returned to the client.Please be aware thatbrowsers cannot correctly displaythis error.Setting <code><i>size</i></code> to 0 disables checking of clientrequest body size.</p>"
        },
        "connection_pool_size": {
            "values": "size",
            "default": "256|512",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Allows accurate tuning of per-connection memory allocations.This directive has minimal impact on performanceand should not generally be used.By default, the size is equal to256 bytes on 32-bit platforms and 512 bytes on 64-bit platforms.</p> <blockquote class=\"note\">Prior to version 1.9.8, the default value was 256 on all platforms.</blockquote><p> </p>"
        },
        "default_type": {
            "values": "mime-type",
            "default": "text/plain",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Defines the default MIME type of a response.Mapping of file name extensions to MIME types can be setwith the  directive.</p>"
        },
        "directio": {
            "values": ["size", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables the use ofthe <code>O_DIRECT</code> flag (FreeBSD, Linux),the <code>F_NOCACHE</code> flag (Mac OS X),or the <code>directio()</code> function (Solaris),when reading files that are larger than or equal tothe specified <code><i>size</i></code>.The directive automatically disables (0.7.15) the use offor a given request.It can be useful for serving large files:</p> <blockquote class=\"example\"><pre>directio 4m;</pre></blockquote><p> or when using  on Linux.</p>"
        },
        "directio_alignment": {
            "values": "size",
            "default": "512",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the alignment for.In most cases, a 512-byte alignment is enough.However, when using XFS under Linux, it needs to be increased to 4K.</p>"
        },
        "disable_symlinks": {
            "values": ["off;disable_symlinks on", "if_not_owner [from=part]"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Determines how symbolic links should be treated when opening files:</p> <dl class=\"compact\"><dt><code>off</code></dt><dd>Symbolic links in the pathname are allowed and not checked.This is the default behavior.</dd><dt><code>on</code></dt><dd>If any component of the pathname is a symbolic link,access to a file is denied.</dd><dt><code>if_not_owner</code></dt><dd>Access to a file is denied if any component of the pathnameis a symbolic link, and the link and object that the linkpoints to have different owners.</dd><dt><code>from</code>=<code><i>part</i></code></dt><dd>When checking symbolic links(parameters <code>on</code> and <code>if_not_owner</code>),all components of the pathname are normally checked.Checking of symbolic links in the initial part of the pathnamemay be avoided by specifying additionally the<code>from</code>=<code><i>part</i></code> parameter.In this case, symbolic links are checked only fromthe pathname component that follows the specified initial part.If the value is not an initial part of the pathname checked, the wholepathname is checked as if this parameter was not specified at all.If the value matches the whole file name,symbolic links are not checked.The parameter value can contain variables.</dd></dl><p> </p><p>Example:</p> <blockquote class=\"example\"><pre>disable_symlinks on from=$document_root;</pre></blockquote><p> </p><p>This directive is only available on systems that have the<code>openat()</code> and <code>fstatat()</code> interfaces.Such systems include modern versions of FreeBSD, Linux, and Solaris.</p><p>Parameters <code>on</code> and <code>if_not_owner</code>add a processing overhead.</p> <blockquote class=\"note\">On systems that do not support opening of directories only for search,to use these parameters it is required that worker processeshave read permissions for all directories being checked.</blockquote><p> </p><p></p> <blockquote class=\"note\">The,,and modules currently ignore this directive.</blockquote><p> </p>"
        },
        "error_page": {
            "values": "code ... [=[response]] uri",
            "default": "",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Defines the URI that will be shown for the specified errors.<code>error_page</code> directives are inherited from the previouslevel only if there are no <code>error_page</code>directives defined on the current level.A <code>uri</code> value can contain variables.</p><p>Example:</p> <blockquote class=\"example\"><pre>error_page 404             /404.html;error_page 500 502 503 504 /50x.html;</pre></blockquote><p> </p><p>Furthermore, it is possible to change the response code to anotherusing the “<code>=</code><code><i>response</i></code>” syntax, for example:</p> <blockquote class=\"example\"><pre>error_page 404 =200 /empty.gif;</pre></blockquote><p> </p><p>If an error response is processed by a proxied serveror a FastCGI/uwsgi/SCGI server,and the server may return different response codes (e.g., 200, 302, 401or 404), it is possible to respond with the code it returns:</p> <blockquote class=\"example\"><pre>error_page 404 = /404.php;</pre></blockquote><p> </p><p>It is also possible to use redirects for error processing:</p> <blockquote class=\"example\"><pre>error_page 403      http://example.com/forbidden.html;error_page 404 =301 http://example.com/notfound.html;</pre></blockquote><p> In this case, by default, the response code 302 is returned to the client.It can only be changed to one of the redirect statuscodes (301, 302, 303, and 307).</p><p>If there is no need to change URI during internal redirection it ispossible to pass error processing into a named location:</p> <blockquote class=\"example\"><pre>location / {    error_page 404 = @fallback;}location @fallback {    proxy_pass http://backend;}</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">If <code>uri</code> processing leads to an error,the status code of the last occurred error is returned to the client.</blockquote><p> </p>"
        },
        "etag": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables automatic generation of the “ETag”response header field for static resources.</p>"
        },
        "if_modified_since": {
            "values": ["off", "exact", "before"],
            "default": "exact",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Specifies how to compare modification time of a responsewith the time in the“If-Modified-Since”request header field:</p> <dl class=\"compact\"><dt><code>off</code></dt><dd>the“If-Modified-Since” request header field is ignored (0.7.34);</dd><dt><code>exact</code></dt><dd>exact match;</dd><dt><code>before</code></dt><dd>modification time of a response isless than or equal to the time in the “If-Modified-Since”request header field.</dd></dl><p> </p>"
        },
        "ignore_invalid_headers": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Controls whether header fields with invalid names should be ignored.Valid names are composed of English letters, digits, hyphens, and possiblyunderscores (as controlled by the directive).</p><p>If the directive is specified on the  level,its value is only used if a server is a default one.The value specified also applies to all virtual serverslistening on the same address and port.</p>"
        },
        "internal": {
            "values": "—",
            "default": "$4",
            "context": ["$5"],
            "isIn": isIn,
            "tooltip": "<p>Specifies that a given location can only be used for internal requests.For external requests, the client error404 (Not Found)is returned.Internal requests are the following:</p> <ul class=\"compact\"><li>requests redirected by the,,, and directives;</li><li>requests redirected by the “X-Accel-Redirect”response header field from an upstream server;</li><li>subrequests formed by the“<code>include virtual</code>”command of themodule and by themodule directives;</li><li>requests changed by the directive.</li></ul><p> </p><p>Example:</p> <blockquote class=\"example\"><pre>error_page 404 /404.html;location /404.html {    internal;}</pre></blockquote><p> </p> <blockquote class=\"note\">There is a limit of 10 internal redirects per request to preventrequest processing cycles that can occur in incorrect configurations.If this limit is reached, the error500 (Internal Server Error) is returned.In such cases, the “rewrite or internal redirection cycle” messagecan be seen in the error log.</blockquote><p> </p>"
        },
        "keepalive_disable": {
            "values": ["none", "browser ..."],
            "default": "msie6",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Disables keep-alive connections with misbehaving browsers.The <code><i>browser</i></code> parameters specify whichbrowsers will be affected.The value <code>msie6</code> disables keep-alive connectionswith old versions of MSIE, once a POST request is received.The value <code>safari</code> disables keep-alive connectionswith Safari and Safari-like browsers on Mac OS X and Mac OS X-likeoperating systems.The value <code>none</code> enables keep-alive connectionswith all browsers.</p> <blockquote class=\"note\">Prior to version 1.1.18, the value <code>safari</code> matchedall Safari and Safari-like browsers on all operating systems, andkeep-alive connections with them were disabled by default.</blockquote><p> </p>"
        },
        "keepalive_requests": {
            "values": "number",
            "default": "100",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum number of requests that can beserved through one keep-alive connection.After the maximum number of requests are made, the connection is closed.</p>"
        },
        "keepalive_timeout": {
            "values": "timeout [header_timeout]",
            "default": "75s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>The first parameter sets a timeout during which a keep-aliveclient connection will stay open on the server side.The zero value disables keep-alive client connections.The optional second parameter sets a value in the“Keep-Alive: timeout=<code><i>time</i></code>”response header field.Two parameters may differ.</p><p>The“Keep-Alive: timeout=<code><i>time</i></code>”header field is recognized by Mozilla and Konqueror.MSIE closes keep-alive connections by itself in about 60 seconds.</p>"
        },
        "large_client_header_buffers": {
            "values": "number size",
            "default": "4 8k",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum <code><i>number</i></code> and <code><i>size</i></code> ofbuffers used for reading large client request header.A request line cannot exceed the size of one buffer, or the414 (Request-URI Too Large)error is returned to the client.A request header field cannot exceed the size of one buffer as well, or the400 (Bad Request)error is returned to the client.Buffers are allocated only on demand.By default, the buffer size is equal to 8K bytes.If after the end of request processing a connection is transitionedinto the keep-alive state, these buffers are released.</p>"
        },
        "limit_rate": {
            "values": "rate",
            "default": "0",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Limits the rate of response transmission to a client.The <code><i>rate</i></code> is specified in bytes per second.The zero value disables rate limiting.The limit is set per a request, and so if a client simultaneously openstwo connections, the overall rate will be twice as muchas the specified limit.</p><p>Rate limit can also be set in the <code>$limit_rate</code> variable.It may be useful in cases where rate should be limiteddepending on a certain condition:</p> <blockquote class=\"example\"><pre>server {    if ($slow) {        set $limit_rate 4k;    }    ...}</pre></blockquote><p> </p><p>Rate limit can also be set in the“X-Accel-Limit-Rate” header field of a proxied server response.This capability can be disabled using the,,,anddirectives.</p>"
        },
        "limit_rate_after": {
            "values": "size",
            "default": "0",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Sets the initial amount after which the further transmissionof a response to a client will be rate limited.</p><p>Example:</p> <blockquote class=\"example\"><pre>location /flv/ {    flv;    limit_rate_after 500k;    limit_rate       50k;}</pre></blockquote><p> </p>"
        },
        "lingering_close": {
            "values": ["off", "on", "always"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Controls how nginx closes client connections.</p><p>The default value “<code>on</code>” instructs nginx to and additional data from a clientbefore fully closing a connection, but onlyif heuristics suggests that a client may be sending more data.</p><p>The value “<code>always</code>” will cause nginx to unconditionallywait for and process additional client data.</p><p>The value “<code>off</code>” tells nginx to never wait formore data and close the connection immediately.This behavior breaks the protocol and should not be used under normalcircumstances.</p>"
        },
        "lingering_time": {
            "values": "time",
            "default": "30s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  is in effect,this directive specifies the maximum time during which nginxwill process (read and ignore) additional data coming from a client.After that, the connection will be closed, even if there will bemore data.</p>"
        },
        "lingering_timeout": {
            "values": "time",
            "default": "5s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When  is in effect, this directive specifiesthe maximum waiting time for more client data to arrive.If data are not received during this time, the connection is closed.Otherwise, the data are read and ignored, and nginx starts waitingfor more data again.The “wait-read-ignore” cycle is repeated, but no longer than specified by the directive.</p>"
        },
        "log_not_found": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables logging of errors about not found files into.</p>"
        },
        "log_subrequest": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables logging of subrequests into.</p>"
        },
        "max_ranges": {
            "values": "number",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Limits the maximum allowed number of ranges in byte-range requests.Requests that exceed the limit are processed as if there were nobyte ranges specified.By default, the number of ranges is not limited.The zero value disables the byte-range support completely.</p>"
        },
        "merge_slashes": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables compression of two or more adjacent slashesin a URI into a single slash.</p><p>Note that compression is essential for the correct matching of prefix stringand regular expression locations.Without it, the “<code>//scripts/one.php</code>” request would not match</p> <blockquote class=\"example\"><pre>location /scripts/ {    ...}</pre></blockquote><p> and might be processed as a static file.So it gets converted to “<code>/scripts/one.php</code>”.</p><p>Turning the compression <code>off</code> can become necessary if a URIcontains base64-encoded names, since base64 uses the “<code>/</code>”character internally.However, for security considerations, it is better to avoid turningthe compression off.</p><p>If the directive is specified on the  level,its value is only used if a server is a default one.The value specified also applies to all virtual serverslistening on the same address and port.</p>"
        },
        "msie_padding": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables adding comments to responses for MSIE clients with statusgreater than 400 to increase the response size to 512 bytes.</p>"
        },
        "msie_refresh": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables issuing refreshes instead of redirects for MSIE clients.</p>"
        },
        "open_file_cache": {
            "values": "off;open_file_cache max=N[inactive=time]",
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Configures a cache that can store:</p> <ul class=\"compact\"><li>open file descriptors, their sizes and modification times;</li><li>information on existence of directories;</li><li>file lookup errors, such as “file not found”, “no read permission”,and so on.<blockquote class=\"note\">Caching of errors should be enabled separately by thedirective.</blockquote></li></ul><p> </p><p>The directive has the following parameters:</p> <dl class=\"compact\"><dt><code>max</code></dt><dd>sets the maximum number of elements in the cache;on cache overflow the least recently used (LRU) elements are removed;</dd><dt><code>inactive</code></dt><dd>defines a time after which an element is removed from the cacheif it has not been accessed during this time;by default, it is 60 seconds;</dd><dt><code>off</code></dt><dd>disables the cache.</dd></dl><p> </p><p>Example:</p> <blockquote class=\"example\"><pre>open_file_cache          max=1000 inactive=20s;open_file_cache_valid    30s;open_file_cache_min_uses 2;open_file_cache_errors   on;</pre></blockquote><p> </p>"
        },
        "open_file_cache_errors": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables caching of file lookup errors by.</p>"
        },
        "open_file_cache_min_uses": {
            "values": "number",
            "default": "1",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the minimum <code><i>number</i></code> of file accesses duringthe period configured by the <code>inactive</code> parameterof the  directive, required for a filedescriptor to remain open in the cache.</p>"
        },
        "open_file_cache_valid": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a time after whichelements should be validated.</p>"
        },
        "output_buffers": {
            "values": "number size",
            "default": "2 32k",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the <code><i>number</i></code> and <code><i>size</i></code> of thebuffers used for reading a response from a disk.</p> <blockquote class=\"note\">Prior to version 1.9.5, the default value was 1 32k.</blockquote><p> </p>"
        },
        "port_in_redirect": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables specifying the port in redirects issued by nginx.</p><p>The use of the primary server name in redirects is controlled bythe  directive.</p>"
        },
        "postpone_output": {
            "values": "size",
            "default": "1460",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If possible, the transmission of client data will be postponed untilnginx has at least <code><i>size</i></code> bytes of data to send.The zero value disables postponing data transmission.</p>"
        },
        "read_ahead": {
            "values": "size",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the amount of pre-reading for the kernel when working with file.</p><p>On Linux, the<code>posix_fadvise(0, 0, 0, POSIX_FADV_SEQUENTIAL)</code>system call is used, and so the <code><i>size</i></code> parameter is ignored.</p><p>On FreeBSD, the<code>fcntl(O_READAHEAD,</code><code><i>size</i></code><code>)</code>system call, supported since FreeBSD&nbsp;9.0-CURRENT, is used.FreeBSD&nbsp;7 has to be.</p>"
        },
        "recursive_error_pages": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables doing several redirects using thedirective.The number of such redirects is .</p>"
        },
        "request_pool_size": {
            "values": "size",
            "default": "4k",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Allows accurate tuning of per-request memory allocations.This directive has minimal impact on performanceand should not generally be used.</p>"
        },
        "reset_timedout_connection": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables resetting timed out connections.The reset is performed as follows.Before closing a socket, the<code>SO_LINGER</code>option is set on it with a timeout value of 0.When the socket is closed, TCP RST is sent to the client, and all memoryoccupied by this socket is released.This helps avoid keeping an already closed socket with filled buffersin a FIN_WAIT1 state for a long time.</p><p>It should be noted that timed out keep-alive connections areclosed normally.</p>"
        },
        "root": {
            "values": "path",
            "default": "html",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Sets the root directory for requests.For example, with the following configuration</p> <blockquote class=\"example\"><pre>location /i/ {    root /data/w3;}</pre></blockquote><p> The <code>/data/w3/i/top.gif</code> file will be sent in response tothe “<code>/i/top.gif</code>” request.</p><p>The <code><i>path</i></code> value can contain variables,except <code>$document_root</code> and <code>$realpath_root</code>.</p><p>A path to the file is constructed by merely adding a URI to the valueof the <code>root</code> directive.If a URI has to be modified, the directive should be used.</p>"
        },
        "satisfy": {
            "values": ["all", "any"],
            "default": "all",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Allows access if all (<code>all</code>) or at least one(<code>any</code>) of the, ormodules allow access.</p><p>Example:</p> <blockquote class=\"example\"><pre>location / {    satisfy any;    allow 192.168.1.0/32;    deny  all;    auth_basic           \"closed site\";    auth_basic_user_file conf/htpasswd;}</pre></blockquote><p> </p>"
        },
        "send_lowat": {
            "values": "size",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>If the directive is set to a non-zero value, nginx will try to minimizethe number of send operations on client sockets by using either<code>NOTE_LOWAT</code> flag of the methodor the <code>SO_SNDLOWAT</code> socket option.In both cases the specified <code><i>size</i></code> is used.</p><p>This directive is ignored on Linux, Solaris, and Windows.</p>"
        },
        "send_timeout": {
            "values": "time",
            "default": "60s",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets a timeout for transmitting a response to the client.The timeout is set only between two successive write operations,not for the transmission of the whole response.If the client does not receive anything within this time,the connection is closed.</p>"
        },
        "sendfile": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables the use of<code>sendfile()</code>.</p><p>Starting from nginx&nbsp;0.8.12 and FreeBSD&nbsp;5.2.1, can be used to pre-load datafor <code>sendfile()</code>:</p> <blockquote class=\"example\"><pre>location /video/ {    sendfile       on;    tcp_nopush     on;    aio            on;}</pre></blockquote><p> In this configuration, <code>sendfile()</code> is called withthe <code>SF_NODISKIO</code> flag which causes it not to block on disk I/O,but, instead, report back that the data are not in memory.nginx then initiates an asynchronous data load by reading one byte.On the first read, the FreeBSD kernel loads the first 128K bytesof a file into memory, although next reads will only load data in 16K chunks.This can be changed using the directive.</p> <blockquote class=\"note\">Before version 1.7.11, pre-loading could be enabled with<code>aio sendfile;</code>.</blockquote><p> </p>"
        },
        "sendfile_max_chunk": {
            "values": "size",
            "default": "0",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>When set to a non-zero value, limits the amount of data that can betransferred in a single <code>sendfile()</code> call.Without the limit, one fast connection may seize the worker process entirely.</p>"
        },
        "server_name_in_redirect": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables the use of the primary server name, specified by thedirective, in redirects issued by nginx.When the use of the primary server name is disabled, the name from the“Host” request header field is used.If this field is not present, the IP address of the server is used.</p><p>The use of a port in redirects is controlled bythe  directive.</p>"
        },
        "server_names_hash_bucket_size": {
            "values": "size",
            "default": "32|64|128",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the bucket size for the server names hash tables.The default value depends on the size of the processor’s cache line.The details of setting up hash tables are provided in a separate.</p>"
        },
        "server_names_hash_max_size": {
            "values": "size",
            "default": "512",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum <code><i>size</i></code> of the server names hash tables.The details of setting up hash tables are provided in a separate.</p>"
        },
        "server_tokens": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables emitting nginx version in error messages and in the“Server” response header field.</p>"
        },
        "tcp_nodelay": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables the use of the <code>TCP_NODELAY</code> option.The option is enabled only when a connection is transitioned into thekeep-alive state.</p>"
        },
        "tcp_nopush": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables the use ofthe <code>TCP_NOPUSH</code> socket option on FreeBSDor the <code>TCP_CORK</code> socket option on Linux.The options are enabled only when  is used.Enabling the option allows</p> <ul class=\"compact\"><li>sending the response header and the beginning of a file in one packet,on Linux and FreeBSD&nbsp;4.*;</li><li>sending a file in full packets.</li></ul><p> </p>"
        },
        "try_files": {
            "values": "file ... uri;try_files file ... =code",
            "default": "",
            "context": ["server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Checks the existence of files in the specified order and usesthe first found file for request processing; the processingis performed in the current context.The path to a file is constructed from the<code><i>file</i></code> parameteraccording to the and  directives.It is possible to check directory’s existence by specifyinga slash at the end of a name, e.g. “<code>$uri/</code>”.If none of the files were found, an internal redirect to the<code><i>uri</i></code> specified in the last parameter is made.For example:</p> <blockquote class=\"example\"><pre>location /images/ {    try_files $uri /images/default.gif;}location = /images/default.gif {    expires 30s;}</pre></blockquote><p> The last parameter can also point to a named location,as shown in examples below.Starting from version 0.7.51, the last parameter can also be a<code><i>code</i></code>:</p> <blockquote class=\"example\"><pre>location / {    try_files $uri $uri/index.html $uri.html =404;}</pre></blockquote><p> </p><p>Example in proxying Mongrel:</p> <blockquote class=\"example\"><pre>location / {    try_files /system/maintenance.html              $uri $uri/index.html $uri.html              @mongrel;}location @mongrel {    proxy_pass http://mongrel;}</pre></blockquote><p> </p><p>Example for Drupal/FastCGI:</p> <blockquote class=\"example\"><pre>location / {    try_files $uri $uri/ @drupal;}location ~ \\.php$ {    try_files $uri @drupal;    fastcgi_pass ...;    fastcgi_param SCRIPT_FILENAME /path/to$fastcgi_script_name;    fastcgi_param SCRIPT_NAME     $fastcgi_script_name;    fastcgi_param QUERY_STRING    $args;    ... other fastcgi_param's}location @drupal {    fastcgi_pass ...;    fastcgi_param SCRIPT_FILENAME /path/to/index.php;    fastcgi_param SCRIPT_NAME     /index.php;    fastcgi_param QUERY_STRING    q=$uri&amp;$args;    ... other fastcgi_param's}</pre></blockquote><p> In the following example,</p> <blockquote class=\"example\"><pre>location / {    try_files $uri $uri/ @drupal;}</pre></blockquote><p> the <code>try_files</code> directive is equivalent to</p> <blockquote class=\"example\"><pre>location / {    error_page 404 = @drupal;    log_not_found off;}</pre></blockquote><p> And here,</p> <blockquote class=\"example\"><pre>location ~ \\.php$ {    try_files $uri @drupal;    fastcgi_pass ...;    fastcgi_param SCRIPT_FILENAME /path/to$fastcgi_script_name;    ...}</pre></blockquote><p> <code>try_files</code> checks the existence of the PHP filebefore passing the request to the FastCGI server.</p><p>Example for Wordpress and Joomla:</p> <blockquote class=\"example\"><pre>location / {    try_files $uri $uri/ @wordpress;}location ~ \\.php$ {    try_files $uri @wordpress;    fastcgi_pass ...;    fastcgi_param SCRIPT_FILENAME /path/to$fastcgi_script_name;    ... other fastcgi_param's}location @wordpress {    fastcgi_pass ...;    fastcgi_param SCRIPT_FILENAME /path/to/index.php;    ... other fastcgi_param's}</pre></blockquote><p> </p>"
        },
        "types_hash_bucket_size": {
            "values": "size",
            "default": "64",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the bucket size for the types hash tables.The details of setting up hash tables are provided in a separate.</p> <blockquote class=\"note\">Prior to version 1.5.13,the default value depended on the size of the processor’s cache line.</blockquote><p> </p>"
        },
        "types_hash_max_size": {
            "values": "size",
            "default": "1024",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum <code><i>size</i></code> of the types hash tables.The details of setting up hash tables are provided in a separate.</p>"
        },
        "underscores_in_headers": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["http", "server"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables the use of underscores in client request header fields.When the use of underscores is disabled, request header fields whose namescontain underscores aremarked as invalid and become subject to the directive.</p><p>If the directive is specified on the  level,its value is only used if a server is a default one.The value specified also applies to all virtual serverslistening on the same address and port.</p>"
        },
        "variables_hash_bucket_size": {
            "values": "size",
            "default": "64",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the bucket size for the variables hash table.The details of setting up hash tables are provided in a separate.</p>"
        },
        "variables_hash_max_size": {
            "values": "size",
            "default": "1024",
            "context": ["http"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum <code><i>size</i></code> of the variables hash table.The details of setting up hash tables are provided in a separate.</p> <blockquote class=\"note\">Prior to version 1.5.13, the default value was 512.</blockquote><p> </p>__end"
        },
        "add_header": {
            "values": "name value[always]",
            "default": "",
            "context": ["http", "server", "location", "ifinlocation"],
            "isIn": isIn,
            "tooltip": "__begin<p>Adds the specified field to a response header provided thatthe response code equals 200, 201, 204, 206, 301, 302, 303, 304, or 307.A value can contain variables.</p><p>There could be several <code>add_header</code> directives.These directives are inherited from the previous level if andonly if there are no<code>add_header</code>directives defined on the current level.</p><p>If the <code>always</code> parameter is specified (1.7.5),the header field will be added regardless of the response code.</p>__end"
        },
        "add_before_body": {
            "values": "uri",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "__begin<p>Adds the text returned as a result of processing a given subrequestbefore the response body.An empty string (<code>\"\"</code>) as a parameter cancels additioninherited from the previous configuration level.</p>"
        },
        "add_after_body": {
            "values": "uri",
            "default": "",
            "context": ["http", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Adds the text returned as a result of processing a given subrequestafter the response body.An empty string (<code>\"\"</code>) as a parameter cancels additioninherited from the previous configuration level.</p>__end"
        },
        "access_log": {
            "values": "path [format [buffer=size [flush=time]] [if=condition]];access_log path format gzip[=level] [buffer=size] [flush=time] [if=condition];access_log syslog:server=address[,parameter=value] [format [if=condition]];access_log off",
            "default": "logs/access.log combined",
            "context": ["http", "server", "location", "ifinlocation", "limit_except"],
            "isIn": isIn,
            "tooltip": "__begin<p>Sets the path, format, and configuration for a buffered log write.Several logs can be specified on the same level.Logging to can be configured by specifyingthe “<code>syslog:</code>” prefix in the first parameter.The special value <code>off</code> cancels all<code>access_log</code> directives on the current level.If the format is not specified then the predefined“<code>combined</code>” format is used.</p><p>If either the <code>buffer</code> or <code>gzip</code>(1.3.10, 1.2.7)parameter is used, writes to log will be buffered.</p> <blockquote class=\"note\">The buffer size must not exceed the size of an atomic write to a disk file.For FreeBSD this size is unlimited.</blockquote><p> </p><p>When buffering is enabled, the data will be written to the file:</p> <ul class=\"compact\"><li>if the next log line does not fit into the buffer;</li><li>if the buffered data is older than specified by the <code>flush</code>parameter (1.3.10, 1.2.7);</li><li>when a worker process is  logfiles or is shutting down.</li></ul><p> </p><p>If the <code>gzip</code> parameter is used, then the buffered data willbe compressed before writing to the file.The compression level can be set between 1 (fastest, less compression)and 9 (slowest, best compression).By default, the buffer size is equal to 64K bytes, and the compression levelis set to 1.Since the data is compressed in atomic blocks, the log file can be decompressedor read by “<code>zcat</code>” at any time.</p><p>Example:</p> <blockquote class=\"example\"><pre>access_log /path/to/log.gz combined gzip flush=5m;</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">For gzip compression to work, nginx must be built with the zlib library.</blockquote><p> </p><p>The file path can contain variables (0.7.6+),but such logs have some constraints:</p> <ul class=\"compact\"><li>the whose credentials are used by worker processes shouldhave permissions to create files in a directory withsuch logs;</li><li>buffered writes do not work;</li><li>the file is opened and closed for each log write.However, since the descriptors of frequently used files can be storedin a , writing to the old filecan continue during the time specified by the directive’s <code>valid</code> parameter</li><li>during each log write the existence of the request’sis checked, and if it does not exist the log is notcreated.It is thus a good idea to specify bothand <code>access_log</code> on the same level:<blockquote class=\"example\"><pre>server {    root       /spool/vhost/data/$host;    access_log /spool/vhost/logs/$host;    ...</pre></blockquote></li></ul><p> </p><p>The <code>if</code> parameter (1.7.0) enables conditional logging.A request will not be logged if the <code><i>condition</i></code> evaluates to “0”or an empty string.In the following example, the requests with response codes 2xx and 3xxwill not be logged:</p> <blockquote class=\"example\"><pre>map $status $loggable {    ~^[23]  0;    default 1;}access_log /path/to/access.log combined if=$loggable;</pre></blockquote><p> </p>"
        },
        "accept_mutex": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["events"],
            "isIn": isIn,
            "tooltip": "__begin<p>If <code>accept_mutex</code> is enabled,worker processes will accept new connections by turn.Otherwise, all worker processes will be notified about new connections,and if volume of new connections is low, some of the worker processesmay just waste system resources.</p>"
        },
        "accept_mutex_delay": {
            "values": "time",
            "default": "500ms",
            "context": ["events"],
            "isIn": isIn,
            "tooltip": "<p>If  is enabled, specifies the maximum timeduring which a worker process will try to restart accepting newconnections if another worker process is currently acceptingnew connections.</p>"
        },
        "daemon": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether nginx should become a daemon.Mainly used during development.</p>"
        },
        "debug_connection": {
            "values": ["address", "CIDR", "unix:"],
            "default": "",
            "context": ["events"],
            "isIn": isIn,
            "tooltip": "<p>Enables debugging log for selected client connections.Other connections will use logging level set by the directive.Debugged connections are specified by IPv4 or IPv6 (1.3.0, 1.2.1)address or network.A connection may also be specified using a hostname.For connections using UNIX-domain sockets (1.3.0, 1.2.1),debugging log is enabled by the “<code>unix:</code>” parameter.</p> <blockquote class=\"example\"><pre>events {    debug_connection 127.0.0.1;    debug_connection localhost;    debug_connection 192.0.2.0/24;    debug_connection ::1;    debug_connection 2001:0db8::/32;    debug_connection unix:;    ...}</pre></blockquote><p> </p> <blockquote class=\"note\">For this directive to work, nginx needs tobe built with <code>--with-debug</code>,see “”.</blockquote><p> </p>"
        },
        "debug_points": {
            "values": ["abort", "stop"],
            "default": "",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>This directive is used for debugging.</p><p>When internal error is detected, e.g. the leak of sockets onrestart of working processes, enabling <code>debug_points</code>leads to a core file creation (<code>abort</code>)or to stopping of a process (<code>stop</code>) for furtheranalysis using a system debugger.</p>"
        },
        "error_log": {
            "values": ["file", "stderr |syslog:server=address[,parameter=value] |memory:size[debug |info |notice |warn |error |crit |alert |emerg]"],
            "default": "logs/error.log error",
            "context": ["main", "http", "mail", "stream", "server", "location"],
            "isIn": isIn,
            "tooltip": "<p>Configures logging.Several logs can be specified on the same level (1.5.2).</p><p>The first parameter defines a file that will store the log.The special value <code>stderr</code> selects the standard error file.Logging to  can be configured by specifyingthe “<code>syslog:</code>” prefix.Logging to acan be configured by specifying the “<code>memory:</code>” prefix andbuffer <code><i>size</i></code>, and is generally used for debugging (1.7.11).</p><p>The second parameter determines the level of logging.Log levels above are listed in the order of increasing severity.Setting a certain log level will cause all messages ofthe specified and more severe log levels to be logged.For example, the default level <code>error</code> willcause <code>error</code>, <code>crit</code>,<code>alert</code>, and <code>emerg</code> messagesto be logged.If this parameter is omitted then <code>error</code> is used.</p> <blockquote class=\"note\">For <code>debug</code> logging to work, nginx needs tobe built with <code>--with-debug</code>,see “”.</blockquote><p> </p> <blockquote class=\"note\">The directive can be specified on the<code>stream</code> levelstarting from version 1.7.11.</blockquote><p> </p> <blockquote class=\"note\">The directive can be specified on the<code>mail</code> levelstarting from version 1.9.0.</blockquote><p> </p>"
        },
        "env": {
            "values": "variable[=value]",
            "default": "TZ",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>By default, nginx removes all environment variables inheritedfrom its parent process except the TZ variable.This directive allows preserving some of the inherited variables,changing their values, or creating new environment variables.These variables are then:</p> <ul class=\"compact\"><li>inherited during a of an executable file;</li><li>used by the module;</li><li>used by worker processes.One should bear in mind that controlling system libraries in this wayis not always possible as it is common for libraries to checkvariables only during initialization, well before they can be setusing this directive.An exception from this is an above mentionedof an executable file.</li></ul><p> </p><p>The TZ variable is always inherited and available to themodule, unless it is configured explicitly.</p><p>Usage example:</p> <blockquote class=\"example\"><pre>env MALLOC_OPTIONS;env PERL5LIB=/data/site/modules;env OPENSSL_ALLOW_PROXY_CERTS=1;</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">The NGINX environment variable is used internally by nginxand should not be set directly by the user.</blockquote><p> </p>"
        },
        "include": {
            "values": ["file", "mask"],
            "default": "",
            "context": ["any"],
            "isIn": isIn,
            "tooltip": "<p>Includes another <code><i>file</i></code>, or files matching thespecified <code><i>mask</i></code>, into configuration.Included files should consist ofsyntactically correct directives and blocks.</p><p>Usage example:</p> <blockquote class=\"example\"><pre>include mime.types;include vhosts/*.conf;</pre></blockquote><p> </p>"
        },
        "load_module": {
            "values": "file",
            "default": "",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Loads a dynamic module.</p><p>Example:</p> <blockquote class=\"example\"><pre>load_module modules/ngx_mail_module.so;</pre></blockquote><p> </p>"
        },
        "lock_file": {
            "values": "file",
            "default": "logs/nginx.lock",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>nginx uses the locking mechanism to implement and serialize access to shared memory.On most systems the locks are implemented using atomic operations,and this directive is ignored.On other systems the “lock file” mechanism is used.This directive specifies a prefix for the names of lock files.</p>"
        },
        "master_process": {
            "values": ["on", "off"],
            "default": "on",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Determines whether worker processes are started.This directive is intended for nginx developers.</p>"
        },
        "multi_accept": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["events"],
            "isIn": isIn,
            "tooltip": "<p>If <code>multi_accept</code> is disabled, a worker processwill accept one new connection at a time.Otherwise, a worker processwill accept all new connections at a time.</p> <blockquote class=\"note\">The directive is ignored if connection processing method is used, because it reportsthe number of new connections waiting to be accepted.</blockquote><p> </p>"
        },
        "pcre_jit": {
            "values": ["on", "off"],
            "default": "off",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Enables or disables the use of “just-in-time compilation” (PCRE JIT)for the regular expressions known by the time of configuration parsing.</p><p>PCRE JIT can speed up processing of regular expressions significantly.</p> <blockquote class=\"note\">The JIT is available in PCRE libraries starting from version 8.20built with the <code>--enable-jit</code> configuration parameter.When the PCRE library is built with nginx (<code>--with-pcre=</code>),the JIT support is enabled via the<code>--with-pcre-jit</code> configuration parameter.</blockquote><p> </p>"
        },
        "pid": {
            "values": "file",
            "default": "nginx.pid",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Defines a <code><i>file</i></code> that will store the process ID of the main process.</p>"
        },
        "ssl_engine": {
            "values": "device",
            "default": "",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Defines the name of the hardware SSL accelerator.</p>"
        },
        "thread_pool": {
            "values": "name threads=number [max_queue=number]",
            "default": "default threads=32 max_queue=65536",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Defines named thread poolsused for multi-threaded reading and sending of filesworker processes.</p><p>The <code>threads</code> parameterdefines the number of threads in the pool.</p><p>In the event that all threads in the pool are busy,a new task will wait in the queue.The <code>max_queue</code> parameter limits the numberof tasks allowed to be waiting in the queue.By default, up to 65536 tasks can wait in the queue.When the queue overflows, the task is completed with an error.</p>"
        },
        "timer_resolution": {
            "values": "interval",
            "default": "",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Reduces timer resolution in worker processes, thus reducing thenumber of <code>gettimeofday()</code> system calls made.By default, <code>gettimeofday()</code> is called each timea kernel event is received.With reduced resolution, <code>gettimeofday()</code> is onlycalled once per specified <code><i>interval</i></code>.</p><p>Example:</p> <blockquote class=\"example\"><pre>timer_resolution 100ms;</pre></blockquote><p> </p><p>Internal implementation of the interval depends on the method used:</p> <ul class=\"compact\"><li>the <code>EVFILT_TIMER</code> filter if <code>kqueue</code> is used;</li><li><code>timer_create()</code> if <code>eventport</code> is used;</li><li><code>setitimer()</code> otherwise.</li></ul><p> </p>"
        },
        "use": {
            "values": "method",
            "default": "",
            "context": ["events"],
            "isIn": isIn,
            "tooltip": "<p>Specifies the <code><i>method</i></code> to use.There is normally no need to specify it explicitly, because nginx willby default use the most efficient method.</p>"
        },
        "user": {
            "values": "user [group]",
            "default": "nobody nobody",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Defines <code><i>user</i></code> and <code><i>group</i></code>credentials used by worker processes.If <code><i>group</i></code> is omitted, a group whose name equalsthat of <code><i>user</i></code> is used.</p>"
        },
        "worker_aio_requests": {
            "values": "number",
            "default": "32",
            "context": ["events"],
            "isIn": isIn,
            "tooltip": "<p>When using with the connection processing method, sets the maximum <code><i>number</i></code> ofoutstanding asynchronous I/O operationsfor a single worker process.</p>"
        },
        "worker_connections": {
            "values": "number",
            "default": "512",
            "context": ["events"],
            "isIn": isIn,
            "tooltip": "<p>Sets the maximum number of simultaneous connections thatcan be opened by a worker process.</p><p>It should be kept in mind that this number includes all connections(e.g. connections with proxied servers, among others),not only connections with clients.Another consideration is that the actual number of simultaneousconnections cannot exceed the current limit onthe maximum number of open files, which can be changed by.</p>"
        },
        "worker_cpu_affinity": {
            "values": "cpumask ...;worker_cpu_affinity auto [cpumask]",
            "default": "",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Binds worker processes to the sets of CPUs.Each CPU set is represented by a bitmask of allowed CPUs.There should be a separate set defined for each of the worker processes.By default, worker processes are not bound to any specific CPUs.</p><p>For example,</p> <blockquote class=\"example\"><pre>worker_processes    4;worker_cpu_affinity 0001 0010 0100 1000;</pre></blockquote><p> binds each worker process to a separate CPU, while</p> <blockquote class=\"example\"><pre>worker_processes    2;worker_cpu_affinity 0101 1010;</pre></blockquote><p> binds the first worker process to CPU0/CPU2,and the second worker process to CPU1/CPU3.The second example is suitable for hyper-threading.</p><p>The special value <code>auto</code> (1.9.10) allowsbinding worker processes automatically to available CPUs:</p> <blockquote class=\"example\"><pre>worker_processes auto;worker_cpu_affinity auto;</pre></blockquote><p> The optional mask parameter can be used to limit the CPUsavailable for automatic binding:</p> <blockquote class=\"example\"><pre>worker_cpu_affinity auto 01010101;</pre></blockquote><p> </p><p></p> <blockquote class=\"note\">The directive is only available on FreeBSD and Linux.</blockquote><p> </p>"
        },
        "worker_priority": {
            "values": "number",
            "default": "0",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Defines the scheduling priority for worker processes like it isdone by the <code>nice</code> command: a negative<code><i>number</i></code>means higher priority.Allowed range normally varies from -20 to 20.</p><p>Example:</p> <blockquote class=\"example\"><pre>worker_priority -10;</pre></blockquote><p> </p>"
        },
        "worker_processes": {
            "values": ["number", "auto"],
            "default": "1",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Defines the number of worker processes.</p><p>The optimal value depends on many factors including (but notlimited to) the number of CPU cores, the number of hard diskdrives that store data, and load pattern.When one is in doubt, setting it to the number of available CPU coreswould be a good start (the value “<code>auto</code>”will try to autodetect it).</p> <blockquote class=\"note\">The <code>auto</code> parameter is supported starting fromversions 1.3.8 and 1.2.5.</blockquote><p> </p>"
        },
        "worker_rlimit_core": {
            "values": "size",
            "default": "",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Changes the limit on the largest size of a core file(<code>RLIMIT_CORE</code>) for worker processes.Used to increase the limit without restarting the main process.</p>"
        },
        "worker_rlimit_nofile": {
            "values": "number",
            "default": "",
            "context": ["main"],
            "isIn": isIn,
            "tooltip": "<p>Changes the limit on the maximum number of open files(<code>RLIMIT_NOFILE</code>) for worker processes.Used to increase the limit without restarting the main process.</p>__end"
        }
    };

    function isIn(context) {
        return this.context.some(function (ctx) {
            return ctx == context;
        });
    }

    function filter(context) {
        var filt = {};
        for (var dir in directives) {
            if (directives[dir].isIn(context)) {
                filt[dir] = directives[dir];
            }
        }
        return filt;
    }
    return {
        directives: directives,
        byContext: {
            http: filter('http'),
            server: filter('server'),
            location: filter('location'),
            events: filter('events'),
            main: filter('main')
        }
    };
});
