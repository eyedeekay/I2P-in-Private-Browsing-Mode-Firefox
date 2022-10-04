var titlepref = chrome.i18n.getMessage('titlePreface');
var webpref = chrome.i18n.getMessage('webPreface');
var routerpref = chrome.i18n.getMessage('routerPreface');
var mailpref = chrome.i18n.getMessage('mailPreface');
var torrentpref = chrome.i18n.getMessage('torrentPreface');
var tunnelpref = chrome.i18n.getMessage('i2ptunnelPreface');
var ircpref = chrome.i18n.getMessage('ircPreface');
var extensionpref = chrome.i18n.getMessage('extensionPreface');
var muwirepref = chrome.i18n.getMessage('muwirePreface');
var botepref = chrome.i18n.getMessage('botePreface');
var blogpref = chrome.i18n.getMessage('blogPreface');
var blogprefpriv = chrome.i18n.getMessage('blogPrefacePrivate');
var torpref = chrome.i18n.getMessage('torPreface');
var torprefpriv = chrome.i18n.getMessage('torPrefacePrivate');

var contextScrub = async function(requestDetails) {
    function onHeaderError() {
        console.log('Header scrub error');
    }
    try {
        var headerScrub = function(context) {
            var ua = 'MYOB/6.66 (AN/ON)';
            if (!context) {} else if (context.name == titlepref) {
                for (var header of requestDetails.requestHeaders) {
                    if (header.name.toLowerCase() === 'user-agent') {
                        header.value = ua;
                    }
                }
                return {
                    requestHeaders: requestDetails.requestHeaders
                };
            }
        };
        var contextGet = async function(tabInfo) {
            try {
                //console.log("(scrub)Tab info from Function", tabInfo);
                let context = await browser.contextualIdentities.get(
                    tabInfo.cookieStoreId
                );
                return context;
            } catch (error) {
                return undefined;
            }
        };
        var tabGet = async function(tabId) {
            try {
                //console.log("(scrub)Tab ID from Request", tabId);
                let tabInfo = await browser.tabs.get(tabId);
                return tabInfo;
            } catch (error) {
                return undefined;
            }
        };
        if (requestDetails.tabId > 0) {
            tab = tabGet(requestDetails.tabId);
            context = tab.then(contextGet, onHeaderError);
            req = context.then(headerScrub, onHeaderError);
            //console.log("(scrub)Scrubbing I2P Request", req);
            return req;
        }
    } catch (error) {
        console.log('(scrub)Not scrubbing non-I2P request.', error);
    }
}

var notMyContextNotMyProblem = async function() {
    var contexts = await browser.contextualIdentities.query({});
    var context1 = await browser.contextualIdentities.query({
        name: titlepref
    });
    var context2 = await browser.contextualIdentities.query({
        name: routerpref
    });
    var context3 = await browser.contextualIdentities.query({
        name: mailpref
    });
    var context4 = await browser.contextualIdentities.query({
        name: torrentpref
    });
    var context5 = await browser.contextualIdentities.query({
        name: tunnelpref
    });
    var context6 = await browser.contextualIdentities.query({
        name: ircpref
    });
    var context7 = await browser.contextualIdentities.query({
        name: muwirepref
    });
    var context8 = await browser.contextualIdentities.query({
        name: botepref
    });
    var context9 = await browser.contextualIdentities.query({
        name: blogpref
    });
    var context10 = await browser.contextualIdentities.query({
        name: torpref
    });
    var othercontexts = [];
    console.log('Contexts:', contexts);
    for (context in contexts) {
        if (
            contexts[context].cookieStoreId == context1[0].cookieStoreId ||
            contexts[context].cookieStoreId == context2[0].cookieStoreId ||
            contexts[context].cookieStoreId == context3[0].cookieStoreId ||
            contexts[context].cookieStoreId == context4[0].cookieStoreId ||
            contexts[context].cookieStoreId == context5[0].cookieStoreId ||
            contexts[context].cookieStoreId == context6[0].cookieStoreId ||
            contexts[context].cookieStoreId == context7[0].cookieStoreId ||
            contexts[context].cookieStoreId == context8[0].cookieStoreId ||
            contexts[context].cookieStoreId == context9[0].cookieStoreId ||
            contexts[context].cookieStoreId == context10[0].cookieStoreId
        ) {
            console.log(
                'Context found',
                contexts[context].cookieStoreId,
                'is my responsibility'
            );
        } else {
            //console.log("Context found", contexts[context].cookieStoreId, "is not my responsibility")
            othercontexts.push(contexts[context]);
        }
    }
    return othercontexts;
}

var contextSetup = function(requestDetails) {
    function onContextError() {
        console.error('Context launcher error');
    }
    async function forceIntoIsolation(tabId, contextidentifier, tab, pin = true) {
        console.info(
            '(isolate) forcing context for',
            tabId,
            contextidentifier,
            tab
        );
        try {
            var context = await browser.contextualIdentities.query({
                name: contextidentifier
            });
            if (tabId.cookieStoreId != context[0].cookieStoreId) {
                function Create() {
                    function onCreated(tab) {
                        function closeOldTab(tabs) {
                            if (tabId.id != tab.id) {
                                console.log(
                                    '(isolate) Closing un-isolated tab',
                                    tabId.id,
                                    'in favor of',
                                    tab.id,
                                    'with context',
                                    tab.cookieStoreId
                                );
                                browser.tabs.remove(tabId.id);
                                if (pin) {
                                    browser.tabs.move(tab.id, { index: 0 });
                                    for (index = 0; index < tabs.length; index++) {
                                        if (index != tabs.length - 1)
                                            browser.tabs.remove(tabs[index].id);
                                    }
                                }
                            }
                            browser.pageAction.setPopup({
                                tabId: tabId.id,
                                popup: 'security.html'
                            });
                            browser.pageAction.show(tabId.id);
                        }
                        var pins = browser.tabs.query({
                            cookieStoreId: context[0].cookieStoreId
                        });
                        pins.then(closeOldTab, onError);
                        //            closeOldTab(tab);
                    }
                    var created = browser.tabs.create({
                        active: true,
                        cookieStoreId: context[0].cookieStoreId,
                        url: requestDetails.url,
                        pinned: pin
                    });
                    created.then(onCreated, onContextError);
                }
                var gettab = browser.tabs.get(tabId.id);
                gettab.then(Create, onContextError);
                return tabId;
            }
        } catch (error) {
            console.error('(isolate)Context Error', error);
        }
    }
    try {
        var i2pTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery browser');
            try {
                var context = await browser.contextualIdentities.query({
                    name: titlepref
                });
                return forceIntoIsolation(tabId, titlepref, tab, false);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var routerTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery console');
            try {
                var context = await browser.contextualIdentities.query({
                    name: routerpref
                });
                return forceIntoIsolation(tabId, routerpref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var i2ptunnelTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery browser');
            try {
                var context = await browser.contextualIdentities.query({
                    name: tunnelpref
                });
                return forceIntoIsolation(tabId, tunnelpref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var snarkTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery torrents');
            try {
                var context = await browser.contextualIdentities.query({
                    name: torrentpref
                });
                if (tabId.cookieStoreId != context[0].cookieStoreId) {
                    var exemptContext = await browser.contextualIdentities.query({
                        name: titlepref
                    });
                    let tmp = new URL(tabId.url);
                    console.log('(isolate)tabid host', tmp.host);
                    if (!requestDetails.url.includes('snark/' + tmp.host)) {
                        //          if (tabId.cookieStoreId != exemptContext[0].cookieStoreId){
                        function Create() {
                            function onCreated(tab) {
                                function closeOldTab(tabs) {
                                    if (tabId.id != tab.id) {
                                        console.log(
                                            '(isolate) Closing un-isolated tab',
                                            tabId.id,
                                            'in favor of',
                                            tab.id,
                                            'with context',
                                            tab.cookieStoreId
                                        );
                                        browser.tabs.remove(tabId.id);
                                        browser.tabs.move(tab.id, { index: 0 });
                                    }
                                    for (index = 0; index < tabs.length; index++) {
                                        if (index != tabs.length - 1)
                                            browser.tabs.remove(tabs[index].id);
                                    }
                                }
                                var pins = browser.tabs.query({
                                    cookieStoreId: context[0].cookieStoreId
                                });
                                pins.then(closeOldTab, onError);
                            }
                            if (requestDetails.url.endsWith('xhr1.html')) {
                                hostname = url.split('/')[2];
                                let prefix = url.substr(0, url.indexOf('://') + 3);
                                requestDetails.url = prefix + hostname + '/i2psnark/';
                            }
                            var created = browser.tabs.create({
                                active: true,
                                pinned: true,
                                cookieStoreId: context[0].cookieStoreId,
                                url: requestDetails.url
                            });
                            created.then(onCreated, onContextError);
                        }
                        var gettab = browser.tabs.get(tabId.id);
                        gettab.then(Create, onContextError);
                        return tabId;
                    }
                }
            } catch (error) {
                console.log('(isolate)Context Error', error);
            }
        };
        var muwireTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery muwire');
            try {
                var context = await browser.contextualIdentities.query({
                    name: muwirepref
                });
                return forceIntoIsolation(tabId, muwirepref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var i2pboteTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery bote');
            try {
                var context = await browser.contextualIdentities.query({
                    name: botepref
                });
                return forceIntoIsolation(tabId, botepref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var mailTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery mail');
            try {
                var context = await browser.contextualIdentities.query({
                    name: mailpref
                });
                return forceIntoIsolation(tabId, mailpref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var ircTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery irc');
            try {
                var context = await browser.contextualIdentities.query({
                    name: ircpref
                });
                return forceIntoIsolation(tabId, ircpref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var torTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery tor');
            try {
                var context = await browser.contextualIdentities.query({
                    name: torpref
                });
                return forceIntoIsolation(tabId, torpref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var blogTabFind = async function(tabId) {
            console.info('(isolate)Context Discovery blog');
            try {
                var context = await browser.contextualIdentities.query({
                    name: blogpref
                });
                return forceIntoIsolation(tabId, blogpref, tab);
            } catch (error) {
                console.error('(isolate)Context Error', error);
            }
        };
        var tabGet = async function(tabId) {
            try {
                //console.log("(isolate)Tab ID from Request", tabId);
                let tabInfo = await browser.tabs.get(tabId);
                return tabInfo;
            } catch (error) {
                console.log('(isolate)Tab error', error);
            }
        };
        if (requestDetails == undefined) {
            return requestDetails;
        }
        if (proxyHost(requestDetails.url)) {
            setcookie = browser.cookies.set({
                firstPartyDomain: i2pHostName(requestDetails.url),
                url: requestDetails.url,
                secure: true
            });
            setcookie.then(onContextGotLog, onContextError);
            return requestDetails;
        }

        if (requestDetails.tabId > 0) {
            var tab = tabGet(requestDetails.tabId);
            tab.then(isolate);

            function isolate(oldtab) {
                let localhost = localHost(requestDetails.url);
                let routerhost = routerHost(requestDetails.url);
                if (routerhost) {
                    if (routerhost === 'i2ptunnelmgr') {
                        var tunneltab = tab.then(i2ptunnelTabFind, onContextError);
                        return requestDetails;
                    } else if (routerhost === 'i2psnark') {
                        var snarktab = tab.then(snarkTabFind, onContextError);
                        return requestDetails;
                    } else if (routerhost === 'webmail') {
                        var mailtab = tab.then(mailTabFind, onContextError);
                        return requestDetails;
                    } else if (routerhost === 'muwire') {
                        var routertab = tab.then(muwireTabFind, onContextError);
                        return requestDetails;
                    } else if (routerhost === 'i2pbote') {
                        var routertab = tab.then(i2pboteTabFind, onContextError);
                        return requestDetails;
                    } else if (routerhost === 'routerconsole') {
                        var routertab = tab.then(routerTabFind, onContextError);
                        return requestDetails;
                    }
                } else {
                    if (localhost) {
                        if (localhost === 'blog') {
                            var routertab = tab.then(blogTabFind, onContextError);
                            return requestDetails;
                        } else if (localhost === 'irc') {
                            var irctab = tab.then(ircTabFind, onContextError);
                            return requestDetails;
                        } else if (localhost === 'tor') {
                            var tortab = tab.then(torTabFind, onContextError);
                            return requestDetails;
                        }
                    }
                }
                //        if (oldtab.cookieStoreId == 'firefox-default') {
                if (i2pHost(requestDetails.url)) {
                    var thn = i2pHostName(requestDetails.url);
                    if (requestDetails.url.includes('=' + thn)) {
                        if (!requestDetails.url.includes('://github.com') ||
                            !requestDetails.url.includes('://notabug.org') ||
                            !requestDetails.url.includes('://i2pgit.org') ||
                            !requestDetails.url.includes('://gitlab.com')
                        ) {
                            if (!localhost) {
                                console.log('(scrub)checking search hostnames =' + thn);
                                var tpt = requestDetails.url.split('=' + thn, 2);
                                requestDetails.url =
                                    'http://' + thn + '/' + tpt[1].replace('%2F', '');
                            }
                        }
                    }
                    console.log('(scrub) new hostname', requestDetails.url);
                    var setcookie = browser.cookies.set({
                        firstPartyDomain: i2pHostName(requestDetails.url),
                        url: requestDetails.url,
                        secure: true
                    });
                    setcookie.then(onContextGotLog, onContextError);
                    if (!routerhost) {
                        var i2ptab = tab.then(i2pTabFind, onContextError);
                    }
                    return requestDetails;
                }
                if (extensionHost(requestDetails)) {
                    return requestDetails;
                }

                //}
            }
        }
    } catch (error) {
        console.log('(isolate)Not an I2P request, blackholing', error);
    }
};

var coolheadersSetup = function(e) {
    var asyncSetPageAction = new Promise((resolve, reject) => {
        window.setTimeout(() => {
            if (e.tabId != undefined) {
                popup = browser.pageAction.getPopup({ tabId: e.tabId });
                popup.then(gotPopup);
            }

            function gotPopup(p) {
                console.log('(scrub)(header check) checking popup', p);
                console.log(
                    '(scrub)(header check) checking headers',
                    e.responseHeaders
                );
                let headers = e.responseHeaders.filter((word) =>
                    word.name.toUpperCase().includes('I2P')
                );
                console.log('(scrub)(header check) checking filtered headers', headers);
                for (i = headers.length - 1; i >= 0; i--) {
                    let header = headers[i];
                    console.log('(scrub)(header check) checking header', header);
                    if (header.name.toUpperCase().endsWith('I2P-LOCATION')) {
                        var tab = browser.tabs.get(e.tabId);
                        tab.then(altSrc);

                        function altSrc(tab) {
                            console.log('(scrub) X-I2P-LOCATION', header.value);
                            let url = new URL(header.value);
                            browser.pageAction.setPopup({
                                tabId: e.tabId,
                                popup: 'location.html'
                            });
                            browser.pageAction.setIcon({
                                path: 'icons/i2plogo.png',
                                tabId: e.tabId
                            });
                            let eurl = new URL(tab.url);
                            browser.pageAction.setTitle({
                                tabId: e.tabId,
                                title: 'http://' + url.host + eurl.pathname
                            });
                            browser.pageAction.show(e.tabId);
                        }
                        break;
                    }
                    if (header.name.toUpperCase().endsWith('I2P-TORRENTLOCATION')) {
                        console.log(
                            '(scrub)(header check) checking header torrentlocation',
                            header
                        );
                        var imgs = document.getElementsByTagName('img');
                        for (let img of imgs) {
                            if (tmpsrc.host == location.host) {
                                img.src =
                                    'http://127.0.0.1:7657/i2psnark/' +
                                    tmpsrc.host +
                                    tmpsrc.pathname;
                                img.onerror = function() {
                                    img.src = tmpsrc;
                                };
                            }
                        }
                        var videos = document.getElementsByTagName('video');
                        for (let video of videos) {
                            let tmpsrc = new URL(video.currentSrc);
                            if (tmpsrc.host == location.host) {
                                if (!video.innerHTML.includes('127.0.0.1')) {
                                    innerHTML = video.innerHTML;
                                    topInnerHTML = video.innerHTML.replace(
                                        'src="',
                                        'src="http://127.0.0.1:7657/i2psnark/' + location.host + '/'
                                    );
                                    video.innerHTML = topInnerHTML; // + innerHTML;
                                    video.onerror = function() {
                                        video.innerHTML = topInnerHTML + innerHTML;
                                    };
                                }
                            }
                        }
                        var audios = document.getElementsByTagName('audio');
                        for (let audio of audios) {
                            let tmpsrc = new URL(audio.currentSrc);
                            if (tmpsrc.host == location.host) {
                                if (!audio.innerHTML.includes('127.0.0.1')) {
                                    innerHTML = audio.innerHTML;
                                    topInnerHTML = audio.innerHTML.replace(
                                        'src="',
                                        'src="http://127.0.0.1:7657/i2psnark/' + location.host + '/'
                                    );
                                    audio.innerHTML = topInnerHTML; // + innerHTML;
                                    audio.onerror = function() {
                                        audio.innerHTML = topInnerHTML + innerHTML;
                                    };
                                }
                            }
                        }
                        browser.pageAction.setPopup({
                            tabId: e.tabId,
                            popup: 'torrent.html'
                        });
                        if (tab != undefined && tab.url.startsWith('https')) {
                            browser.pageAction.setIcon({
                                path: 'icons/infotoopiesbt.png',
                                tabId: e.tabId
                            });
                        } else {
                            browser.pageAction.setIcon({
                                path: 'icons/infotoopiebt.png',
                                tabId: e.tabId
                            });
                        }
                        browser.pageAction.setTitle({
                            tabId: e.tabId,
                            title: header.value
                        });
                        browser.pageAction.show(e.tabId);
                        break;
                    }
                }
            }
            resolve({ responseHeaders: e.responseHeaders });
        }, 2000);
    });
    return asyncSetPageAction;
};

function getTabURL(tab) {
    console.log("(scrub)(equiv check) popup check", tab);

    if (tab.id != undefined) {
        popup = browser.pageAction.getPopup({ tabId: tab.id });
        console.log("(scrub)(equiv check) popup check");
        popup.then(gotPopup);
    }

    function gotPopup(p) {
        if (p.length != 0) return;
        if (tab.url.startsWith("https")) {
            if (tab.url.includes(".i2p")) {
                browser.pageAction.setPopup({
                    tabId: tab.id,
                    popup: "security.html",
                });
                browser.pageAction.setIcon({
                    path: "icons/infotoopies.png",
                    tabId: tab.id,
                });
                console.log(tab.url);
                //console.log("(background) tabinfo", tabInfo[0].id)
                try {
                    browser.tabs
                        .sendMessage(tab.id, { req: "i2p-torrentlocation" })
                        .then((response) => {
                            if (response != undefined && response != "") {
                                console.log(
                                    "(scrub)(equiv check) i2p-torrentlocation response object",
                                    response
                                );
                                if (response.content.toUpperCase() != "NO-ALT-LOCATION") {
                                    browser.pageAction.setPopup({
                                        tabId: tab.id,
                                        popup: "torrent.html",
                                    });
                                    browser.pageAction.setIcon({
                                        path: "icons/infotoopiesbt.png",
                                        tabId: tab.id,
                                    });
                                    browser.pageAction.setTitle({
                                        tabId: tab.id,
                                        title: response.content,
                                    });
                                    browser.pageAction.show(tab.id);
                                }
                            }
                        });
                    console.log("(scrub)(equiv check)", tab.id, tab.url);
                } catch (e) {
                    console.log("(scrub)(equiv check)", e);
                }
            } else {
                try {
                    browser.tabs
                        .sendMessage(tab.id, { req: "i2p-location" })
                        .then((response) => {
                            if (response != undefined) {
                                console.log(
                                    "(scrub)(equiv check) i2p-location response object",
                                    response
                                );
                                if (response.content.toUpperCase() != "NO-ALT-LOCATION") {
                                    browser.pageAction.setPopup({
                                        tabId: tab.id,
                                        popup: "location.html",
                                    });
                                    browser.pageAction.setIcon({
                                        path: "icons/i2plogo.png",
                                        tabId: tab.id,
                                    });
                                    browser.pageAction.setTitle({
                                        tabId: tab.id,
                                        title: response.content,
                                    });
                                    browser.pageAction.show(tab.id);
                                }
                            }
                        });
                    console.log("(scrub)(equiv check)", tab.id, tab.url);
                } catch (e) {
                    console.log("(scrub)(equiv check)", e);
                }
            }
        } else {
            if (tab.url.includes(".i2p")) {
                browser.pageAction.setPopup({
                    tabId: tab.id,
                    popup: "security.html",
                });
                browser.pageAction.setIcon({
                    path: "icons/infotoopie.png",
                    tabId: tab.id,
                });
                console.log(tab.url);
            }
            try {
                browser.tabs
                    .sendMessage(tab.id, { req: "i2p-torrentlocation" })
                    .then((response) => {
                        if (response != undefined) {
                            console.log(
                                "(pageaction) i2p-torrentlocation response object",
                                response
                            );
                            if (response.content.toUpperCase() != "NO-ALT-LOCATION") {
                                browser.pageAction.setPopup({
                                    tabId: tab.id,
                                    popup: "torrent.html",
                                });
                                browser.pageAction.setIcon({
                                    path: "icons/infotoopiebt.png",
                                    tabId: tab.id,
                                });
                                browser.pageAction.setTitle({
                                    tabId: tab.id,
                                    title: response.content,
                                });
                                browser.pageAction.show(tab.id);
                            }
                        }
                    });
                console.log("(pageaction)", tab.id, tab.url);
            } catch (e) {
                console.log("(pageaction)", e);
            }
        }
    }
}

function getClearTab(tobj) {
    function setupTabs(tobj) {
        if (typeof tobj == "number") {
            browser.tabs.get(tobj).then(getTabURL, onError);
        }
        if (typeof tobj.tabId == "number") {
            console.log("(scrub) tobj", tobj);
            browser.tabs.get(tobj.tabId).then(getTabURL, onError);
        } else {
            for (let tab in tobj.tabIds) {
                console.log("(scrub) tab", tobj.tabIds[tab]);
                browser.tabs.get(tobj.tabIds[tab]).then(getTabURL, onError);
            }
        }
    }
    if (tobj != undefined) {
        setupTabs(tobj);
    } else {
        browser.tabs.query({}).then(setupTabs);
    }
}

const filter = {
    url: [{ hostContains: ".i2p" }],
};

function logOnDOMContentLoaded(details) {
    console.log(`onDOMContentLoaded: ${details.url}`);
}

browser.tabs.onActivated.addListener(getClearTab);
browser.tabs.onAttached.addListener(getClearTab);
browser.tabs.onCreated.addListener(getClearTab);
browser.tabs.onDetached.addListener(getClearTab);
browser.tabs.onHighlighted.addListener(getClearTab);
browser.tabs.onMoved.addListener(getClearTab);
browser.tabs.onReplaced.addListener(getClearTab);

browser.pageAction.onClicked.addListener(getClearTab);

function reloadTabs(tabs) {
    for (let tab of tabs) {
        browser.tabs.reload(tab.id);
    }
}

function reloadError(error) {
    console.log(`Error: ${error}`);
}

let querying = browser.tabs.query({});
querying.then(reloadTabs, onError);

// Listen for onHeaderReceived for the target page.
// Set "blocking" and "responseHeaders".
browser.webRequest.onHeadersReceived.addListener(
    coolheadersSetup, { urls: ["*://*.i2p/*", "https://*/*"] }, ["responseHeaders"]
);

browser.webNavigation.onDOMContentLoaded.addListener(getClearTab, filter);
browser.webNavigation.onDOMContentLoaded.addListener(
    logOnDOMContentLoaded,
    filter
);

browser.webRequest.onBeforeRequest.addListener(contextSetup, {
    urls: ["*://*.i2p/*", "*://localhost/*", "*://127.0.0.1/*", "*://*/*i2p*"],
});

browser.webRequest.onBeforeSendHeaders.addListener(
    contextScrub, { urls: ["*://*.i2p/*"] }, ["requestHeaders"]
);