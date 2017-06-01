//Adapted from https://github.com/johnculviner/jquery.fileDownload/blob/master/src/Scripts/jquery.fileDownload.js
(function (window) {
    window.RUFUtilities = window.RUFUtilities || {};
    var htmlSpecialCharsRegEx = /[<>&\r\n"']/gm;
    var htmlSpecialCharsPlaceHolders = {
        '<': 'lt;',
        '>': 'gt;',
        '&': 'amp;',
        '\r': "#13;",
        '\n': "#10;",
        '"': 'quot;',
        "'": '#39;'
    };
    //
    //RUFUtilities.fileDownload('/path/to/url/', options)
    //  see directly below for possible 'options'
    RUFUtilities.fileDownload = function (fileUrl, options) {

         // Pass in the objects to merge as arguments.
        // For a deep extend, set the first argument to `true`.
        var extend = function () {

            // Variables
            var extended = {};
            var deep = false;
            var i = 0;
            var length = arguments.length;

            // Check if a deep merge
            if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
                deep = arguments[0];
                i++;
            }

            // Merge the object into the extended object
            var merge = function (obj) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        // If deep merge and property is an object, merge properties
                        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                            extended[prop] = extend(true, extended[prop], obj[prop]);
                        } else {
                            extended[prop] = obj[prop];
                        }
                    }
                }
            };

            // Loop through each object and conduct a merge
            for (; i < length; i++) {
                var obj = arguments[i];
                merge(obj);
            }

            return extended;

        };

        //provide some reasonable defaults to any unspecified options below
        var settings = extend({
            //
            //a function to call while the dowload is being prepared before the browser's dialog appears
            //Args:
            //  url - the original url attempted
            //
            prepareCallback: function (url) { },
            //
            //a function to call after a file download successfully completed
            //Args:
            //  url - the original url attempted
            //
            successCallback: function (url) { },
            //
            //a function to call after a file download request was canceled
            //Args:
            //  url - the original url attempted
            //
            abortCallback: function (url) { },
            //
            //a function to call after a file download failed
            //Args:
            //  responseHtml    - the html that came back in response to the file download. this won't necessarily come back depending on the browser.
            //                      in less than IE9 a cross domain error occurs because 500+ errors cause a cross domain issue due to IE subbing out the
            //                      server's error message with a "helpful" IE built in message
            //  url             - the original url attempted
            //  error           - original error cautch from exception
            //
            failCallback: function (responseHtml, url, error) { },
            //
            // the HTTP method to use. Defaults to "GET".
            //
            httpMethod: "GET",
            //
            // if specified will perform a "httpMethod" request to the specified 'fileUrl' using the specified data.
            // data must be an object (which will be $.param serialized) or already a key=value param string
            //
            data: null,
            //
            //a period in milliseconds to poll to determine if a successful file download has occured or not
            //
            checkInterval: 100,
            //
            //the cookie name to indicate if a file download has occured
            //
            cookieName: "fileDownload",
            //
            //the cookie value for the above name to indicate that a file download has occured
            //
            cookieValue: "true",
            //
            //the cookie path for above name value pair
            //
            cookiePath: "/",
            //
            //if specified it will be used when attempting to clear the above name value pair
            //useful for when downloads are being served on a subdomain (e.g. downloads.example.com)
            //
            cookieDomain: null,
            //
            //the title for the popup second window as a download is processing in the case of a mobile browser
            //
            popupWindowTitle: "Initiating file download...",
            //
            //Functionality to encode HTML entities for a POST, need this if data is an object with properties whose values contains strings with quotation marks.
            //HTML entity encoding is done by replacing all &,<,>,',",\r,\n characters.
            //Note that some browsers will POST the string htmlentity-encoded whilst others will decode it before POSTing.
            //It is recommended that on the server, htmlentity decoding is done irrespective.
            //
            encodeHTMLEntities: true

        }, options);

        var httpMethodUpper = settings.httpMethod.toUpperCase();
        var internalCallbacks = {
            onPrepare: function (url) {
                if (settings.prepareCallback) {
                    settings.prepareCallback(url);
                }
            },

            onSuccess: function (url) {
                settings.successCallback(url);
            },

            onAbort: function (url) {
                settings.abortCallback(url);
            },

            onFail: function (responseHtml, url, error) {
                settings.failCallback(responseHtml, url, error);
            }
        };

        internalCallbacks.onPrepare(fileUrl);

        //make settings.data a param string if it exists and isn't already
        if (settings.data !== null && typeof settings.data !== "string") {
            settings.data = Object.keys(settings.data).map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(settings.data[k]);
            }).join('&');
        }
        var $iframe,
            formDoc,
            $form;

        if (httpMethodUpper === "GET") {
            if (settings.data !== null) {
                //need to merge any fileUrl params with the data object
                var qsStart = fileUrl.indexOf('?');
                if (qsStart !== -1) {
                    //we have a querystring in the url
                    if (fileUrl.substring(fileUrl.length - 1) !== "&") {
                        fileUrl = fileUrl + "&";
                    }
                } else {
                    fileUrl = fileUrl + "?";
                }
                fileUrl = fileUrl + settings.data;
            }
            //create a temporary iframe that is used to request the fileUrl as a GET request
            $iframe = document.createElement("iframe");
            $iframe.style.display = 'none';
            $iframe.setAttribute("src", fileUrl);
            document.body.appendChild($iframe);
        } else {
            var formInnerHtml = "";
            if (settings.data !== null) {
                var dataTokens = settings.data.replace(/\+/g, ' ').split("&");
                if (dataTokens.length) {
                    for (var i = 0; i < dataTokens.length; i++) {
                        var kvp = dataTokens[i].split("=");
                        //Issue: When value contains sign '=' then the kvp array does have more than 2 items. We have to join value back
                        var k = kvp[0];
                        kvp.shift();
                        var v = kvp.join("=");
                        kvp = [k, v];
                        var key = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[0])) : decodeURIComponent(kvp[0]);
                        if (key) {
                            var value = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[1])) : decodeURIComponent(kvp[1]);
                            formInnerHtml += '<input type="hidden" name="' + key + '" value="' + value + '" />';
                        }
                    }
                }
            }
            $iframe = document.createElement("iframe");
            $iframe.style.display = 'none';
            $iframe.setAttribute("src", 'about:blank');
            document.body.appendChild($iframe);
            formDoc = getiframeDocument($iframe);
            formDoc.write("<html><head></head><body><form method='" + settings.httpMethod + "' action='" + fileUrl + "'>" + formInnerHtml + "</form>" + settings.popupWindowTitle + "</body></html>");
            $form = formDoc.getElementsByTagName('form')[0];
        }

        $form.submit();

        //check if the file download has completed every checkInterval ms
        setTimeout(checkFileDownloadComplete, settings.checkInterval);

        function checkFileDownloadComplete() {
            //has the cookie been written due to a file download occuring?
            var cookieValue = settings.cookieValue;
            if (typeof cookieValue == 'string') {
                cookieValue = cookieValue.toLowerCase();
            }
            var lowerCaseCookie = settings.cookieName.toLowerCase() + "=" + cookieValue;
            if (document.cookie.toLowerCase().indexOf(lowerCaseCookie) > -1) {
                //execute specified callback
                internalCallbacks.onSuccess(fileUrl);

                //remove cookie
                var cookieData = settings.cookieName + "=; path=" + settings.cookiePath + "; expires=" + new Date(0).toUTCString() + ";";
                if (settings.cookieDomain) cookieData += " domain=" + settings.cookieDomain + ";";
                document.cookie = cookieData;
                return;
            }

            //has an error occured?
            //if neither containers exist below then the file download is occuring on the current window
            if ($iframe) {

                //has an error occured?
                try {
                    var formDoc = getiframeDocument($iframe);
                    if (formDoc && formDoc.body !== null && formDoc.body.innerHTML.length) {
                        var isFailure = false;
                        if ($form && $form.length) {
                            var $contents = formDoc.body.getElementsByTagName("form");
                            try {
                                if ($contents.length && $contents[0] === $form[0]) {
                                    isFailure = false;
                                }
                            } catch (e) {
                                if (e && e.number == -2146828218) {
                                    // IE 8-10 throw a permission denied after the form reloads on the "$contents[0] === $form[0]" comparison
                                    isFailure = true;
                                } else {
                                    throw e;
                                }
                            }
                        }

                        if (isFailure) {
                            // IE 8-10 don't always have the full content available right away, they need a litle bit to finish
                            setTimeout(function () {
                                internalCallbacks.onFail(formDoc.body.innerHTML, fileUrl);
                            }, 100);
                            return;
                        }
                    }
                }
                catch (err) {
                    //500 error less than IE9
                    internalCallbacks.onFail('', fileUrl, err);
                    return;
                }
            }
            //keep checking...
            setTimeout(checkFileDownloadComplete, settings.checkInterval);
        }

        //gets an iframes document in a cross browser compatible manner
        function getiframeDocument($iframe) {
            var iframeDoc = $iframe.contentWindow || $iframe.contentDocument;
            if (iframeDoc.document) {
                iframeDoc = iframeDoc.document;
            }
            return iframeDoc;
        }

        function htmlSpecialCharsEntityEncode(str) {
            return str.replace(htmlSpecialCharsRegEx, function (match) {
                return '&' + htmlSpecialCharsPlaceHolders[match];
            });
        }

       
    };

})(this || window);