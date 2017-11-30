/**
 * Created by Louis Hache
 * Forked by Guilherme Redü
 * https://github.com/guiliredu/deviant.popunder
 */
if (window.DeviantPop === undefined) {

    window.DeviantPop = new (function() {

        this.config = {
            chrome: {
                callback: 'fakeClickNewTab'
            },
            opera: {
                callback: 'fakeClick'
            },
            safari: {
                callback: 'fakeClick'
            },
            firefox: {
                callback: 'doubleWindow'
            },
            msie: {
                callback: 'simpleWindow'
            }
        };

        this.parseUserAgent = function parseUserAgentFn (userAgent) {

            if (/chrome/i.test(userAgent)) {
                return "chrome";
            }
            else if (/safari/i.test(userAgent)) {
                return "safari";
            }
            else if (/firefox/i.test(userAgent)) {
                return "firefox";
            }
            else if (/opera/i.test(userAgent)) {
                return "opera";
            }
            else if (/msie/i.test(userAgent)) {
                return "msie";
            }

        };

        this.openers = {

            /**
             * Chrome has disallowed window.focus so instead, create a fake click event
             *
             * @param url
             */
            fakeClick: function (url) {
                var a = document.createElement("a");
                a.href = url;

                var evt = document.createEvent("MouseEvents");

                // put metaKey param (13th param) to true for mac
                evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, true, 0, null);

                a.dispatchEvent(evt);
            },

            /**
             * For new versions of Chrome, open and close a tab after popup launch for force focus on the page
             *
             * @param url
             */
            fakeClickNewTab: function (url) {
                var windowAttrs = "width=768,height=800,status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=no,directories=no,left=200px,top=0";
                var win2 = window.open(url, "", windowAttrs);
                try {
                    win2.blur();
                    window.focus();
                }
                catch (e) {
                }

                var tab = window.open('about:blank', '_blank');
                tab.close();
            },

            /**
             * Classical way, for internet explorer
             * @param url
             */
            simpleWindow: function (url) {
                var windowAttrs = "width=768,height=800,status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=no,directories=no,left=200px,top=0";
                var win2 = window.open(url, "", windowAttrs);
                try {
                    win2.blur();
                    window.focus();
                }
                catch (e) {
                }
            },

            /**
             * Mainly for firefox
             *
             * @param url
             * @returns window
             */
            doubleWindow: function (url) {

                var windowAttrs = {
                    name: "deviantPop-" + Math.floor((Math.random() * 100) + 1),
                    attrs: 'resizable=1,toolbar=1,location=1,menubar=1,directories=0,width=768,height=800,scrollbars=1'
                };

                var newWindow = self.window.open("about:blank", windowAttrs.name, windowAttrs.attrs );
                newWindow.url = url;
                if (newWindow) {
                    newWindow.blur();
                    newWindow.Init = function (e) {
                        with (e) {
                            Params = e.Params;
                            Main = function () {
                                if (typeof window.mozPaintCount != "undefined") {
                                    var x = window.open("about:blank");
                                    x.close();
                                }
                                try {
                                    opener.window.focus();
                                }
                                catch (err) { }

                                newWindow.location = newWindow.url;

                                // key to success
                                newWindow.opener.window.open("", "_self", "");
                                newWindow.opener.window.focus();

                            };
                            Main();
                        }
                    };
                    newWindow.Init(newWindow);
                }
                return newWindow;
            }
        };

        /**
         * Open as many popunders as urls provides, according to user agent
         *
         * @param urls
         * @param callback
         */
        this.firePopunder = function firePopunderFn (urls, callback) {
            // parse user agent and get browser settings
            var userAgent = this.parseUserAgent(navigator.userAgent.toLowerCase());

            // trigger popunders for each url
            for (var i = 0, j = urls.length; i < j; i++) {
                var popWindow = this.openers[this.config[userAgent].callback](urls[i]);
            }

            // callback if necessary
            callback && callback();
        };

    });
}

