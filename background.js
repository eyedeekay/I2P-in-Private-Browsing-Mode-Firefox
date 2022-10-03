var titlepref = chrome.i18n.getMessage('titlePreface');
var titleprefpriv = chrome.i18n.getMessage('titlePrefacePrivate');
var webpref = chrome.i18n.getMessage('webPreface');
var webprefpriv = chrome.i18n.getMessage('webPrefacePrivate');
var routerpref = chrome.i18n.getMessage('routerPreface');
var routerprefpriv = chrome.i18n.getMessage('routerPrefacePrivate');
var mailpref = chrome.i18n.getMessage('mailPreface');
var mailprefpriv = chrome.i18n.getMessage('mailPrefacePrivate');
var torrentpref = chrome.i18n.getMessage('torrentPreface');
var torrentprefpriv = chrome.i18n.getMessage('torrentPrefacePrivate');
var tunnelpref = chrome.i18n.getMessage('i2ptunnelPreface');
var tunnelprefpriv = chrome.i18n.getMessage('i2ptunnelPrefacePrivate');
var ircpref = chrome.i18n.getMessage('ircPreface');
var ircprefpriv = chrome.i18n.getMessage('ircPrefacePrivate');
var extensionpref = chrome.i18n.getMessage('extensionPreface');
var muwirepref = chrome.i18n.getMessage('muwirePreface');
var muwireprefpriv = chrome.i18n.getMessage('muwirePrefacePrivate');
var botepref = chrome.i18n.getMessage('botePreface');
var blogpref = chrome.i18n.getMessage('blogPreface');
var blogprefpriv = chrome.i18n.getMessage('blogPrefacePrivate');
var torpref = chrome.i18n.getMessage('torPreface');
var torprefpriv = chrome.i18n.getMessage('torPrefacePrivate');

function onError(err) {
    console.log('(background)', err);
}

function onContextGotLog(contexts) {
    if (contexts != null) {
        console.log(contexts);
    }
}

function onContextsGot(contexts) {
    var ids = [];
    for (let context of contexts) {
        console.log(`Name : ${context.name}`);
        ids.push(context.name);
    }
    console.log('Checking new contexts');
    if (ids.indexOf(titlepref) == -1) {
        browser.contextualIdentities
            .create({
                name: titlepref,
                color: 'orange',
                icon: 'fingerprint'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(blogpref) == -1) {
        browser.contextualIdentities
            .create({
                name: blogpref,
                color: 'pink',
                icon: 'pet'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(webpref) == -1) {
        browser.contextualIdentities
            .create({
                name: webpref,
                color: 'red',
                icon: 'circle'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(routerpref) == -1) {
        browser.contextualIdentities
            .create({
                name: routerpref,
                color: 'blue',
                icon: 'briefcase'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(tunnelpref) == -1) {
        browser.contextualIdentities
            .create({
                name: tunnelpref,
                color: 'green',
                icon: 'tree'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(mailpref) == -1) {
        browser.contextualIdentities
            .create({
                name: mailpref,
                color: 'yellow',
                icon: 'briefcase'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(torrentpref) == -1) {
        browser.contextualIdentities
            .create({
                name: torrentpref,
                color: 'purple',
                icon: 'chill'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(ircpref) == -1) {
        browser.contextualIdentities
            .create({
                name: ircpref,
                color: 'red',
                icon: 'vacation'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(torpref) == -1) {
        browser.contextualIdentities
            .create({
                name: torpref,
                color: 'purple',
                icon: 'circle'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(muwirepref) == -1) {
        browser.contextualIdentities
            .create({
                name: muwirepref,
                color: 'turquoise',
                icon: 'gift'
            })
            .then(onCreated, onNotCreated);
    }
    if (ids.indexOf(botepref) == -1) {
        browser.contextualIdentities
            .create({
                name: botepref,
                color: 'blue',
                icon: 'fence'
            })
            .then(onCreated, onNotCreated);
    }
}

function onContextsError() {
    console.log('Error finding contextual identities, is the API enabled?');
}

function onCreated(context) {
    console.log(' ID:', context.cookieStoreId, 'created.');
}

function onNotCreated(context) {
    console.log('ID:', context.cookieStoreId, 'not created.');
}

browser.contextualIdentities.query({}).then(onContextsGot, onContextsError);

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then((got) => {
    if (got.os != 'android') {
        browser.windows.onCreated.addListener(themeWindow);
        browser.windows.onFocusChanged.addListener(themeWindow);
        browser.windows.onRemoved.addListener(themeWindow);
        browser.tabs.onUpdated.addListener(themeWindowByTab);
        browser.tabs.onActivated.addListener(themeWindowByTab);
    }
});

function themeWindowByTab(tabId) {
    function tabWindow(tab) {
        var gettingPlatformInfo = browser.runtime.getPlatformInfo();
        gettingPlatformInfo.then((got) => {
            if (got.os == 'android') {
                let getwindow = browser.tabs.get(tab.tabId);
                getwindow.then(themeWindow);
            } else {
                let getwindow = browser.windows.get(tab.windowId);
                getwindow.then(themeWindow);
            }
        });
    }
    if (typeof tabId === 'number') {
        let tab = browser.tabs.get(tabId);
        tab.then(tabWindow);
    } else {
        tabWindow(tabId);
    }
}

function isEmpty(obj) {
    if (obj === undefined || obj === null) {
        return true;
    }
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

let btheme = {
    colors: {
        frame: '#363A68',
        toolbar: '#363A68',
        tab_text: '#ECF3FF'
    }
};

let dtheme = {
    colors: {
        frame: '#4456B7',
        toolbar: '#4456B7',
        tab_text: '#ECF3FF'
    }
};

function themeWindow(window) {
    // Check if the window is in private browsing
    function onThemeError() {
        console.log('(theme) color set error');
        browserTheme();
    }

    function dynamicTheme() {
        if (window.incognito) {
            browser.theme.update(window.id, dtheme);
        } else {
            browser.theme.update(window.id, dtheme);
        }
    }

    function browserTheme() {
        console.log('(theme)Active in I2P window');
        if (window.incognito) {
            browser.theme.update(window.id, btheme);
        } else {
            browser.theme.update(window.id, btheme);
        }
    }

    function unsetTheme() {
        console.log('(theme)Resetting theme window to stored theme');

        function gotAllThemes(infoArray) {
            for (const info of infoArray) {
                if (info.type === 'theme') {
                    if (info.enabled) {
                        console.log('(theme) found enabled theme in list', info.id);

                        async function resetEnabled(disabled) {
                            console.log('(theme) disabled theme temporarily', info.id);

                            function logReset(prom) {
                                console.log('(theme) re-enabled:', info.id);
                            }

                            function sleep(ms) {
                                return new Promise(resolve => setTimeout(resolve, ms));
                            }
                            var slept = await sleep(2000);

                            function sleepyTime(sleepyTimeOver) {
                                return browser.management.setEnabled(
                                    info.id,
                                    true
                                );
                            }
                            let settingEnabled = sleepyTime(slept);
                            logReset(settingEnabled);
                        }
                        let settingDisabled = browser.management.setEnabled(
                            info.id,
                            false
                        );
                        resetEnabled(settingDisabled);
                    }
                }
            }
        }
        let gettingAll = browser.management.getAll();
        gettingAll.then(gotAllThemes);
    }

    function logTabs(tabInfo) {
        function onContextGotTheme(context) {
            if (context.name == titlepref) {
                browserTheme();
                browser.pageAction.show(tabInfo[0].id);
            } else if (context.name == routerpref) {
                console.log('(theme) Active in Router Console window');
                dynamicTheme();
            } else if (context.name == tunnelpref) {
                console.log('(theme) Active in Hidden Services Manager window');
                dynamicTheme();
            } else if (context.name == mailpref) {
                console.log('(theme) Active in Web Mail window');
                dynamicTheme();
            } else if (context.name == torrentpref) {
                console.log('(theme) Active in Bittorrent window');
                dynamicTheme();
            } else if (context.name == botepref) {
                console.log('(theme) Active in Bote window');
                dynamicTheme();
            } else if (context.name == ircpref) {
                console.log('(theme) Active in IRC window');
                dynamicTheme();
            } else if (context.name == torpref) {
                console.log('(theme) Active in Tor Manager window');
                dynamicTheme();
            } else if (context.name == blogpref) {
                console.log('(theme) (theme) Active in Blog window');
                dynamicTheme();
            } else if (context.name == muwirepref) {
                console.log('(theme) Active in MuWire window');
                dynamicTheme();
            } else {
                console.log('(theme) Not active in I2P Window');
                unsetTheme();
            }
        }
        if (
            tabInfo[0].cookieStoreId != 'firefox-default' &&
            tabInfo[0].cookieStoreId != 'firefox-private'
        ) {
            browser.contextualIdentities
                .get(tabInfo[0].cookieStoreId)
                .then(onContextGotTheme, onThemeError);
        } else {
            console.log('(theme) Not active in I2P window');
            unsetTheme();
        }
    }

    var querying = browser.tabs.query({
        currentWindow: true,
        active: true
    });
    querying.then(logTabs, onThemeError);
}

function setTitle(window) {
    // Check if the window is in private browsing
    function onContextError() {
        console.log('Context Error');
    }

    function setTitle(title, privtitle) {
        if (window.incognito) {
            browser.windows.update(window.id, {
                titlePreface: privtitle + ': '
            });
        } else {
            browser.windows.update(window.id, {
                titlePreface: title + ': '
            });
        }
    }

    function logTabs(tabInfo) {
        function onContextGotTitle(context) {
            if (context.name == titlepref) {
                console.log('Active in I2P window');
                setTitle(titlepref, titleprefpriv);
            } else if (context.name == muwirepref) {
                console.log('Active in MuWire window');
                setTitle(muwirepref, muwireprefpriv);
            } else if (context.name == routerpref) {
                console.log('Active in Router Console window');
                setTitle(routerpref, routerprefpriv);
            } else if (context.name == botepref) {
                console.log('Active in Bote window');
                setTitle(botepref, boteprefpriv);
            } else if (context.name == tunnelpref) {
                console.log('Active in Hidden Services Manager window');
                setTitle(tunnelpref, tunnelprefpriv);
            } else if (context.name == mailpref) {
                console.log('Active in I2P Web Mail window');
                setTitle(mailpref, mailprefpriv);
            } else if (context.name == blogpref) {
                console.log('Active in I2P Blog window');
                setTitle(blogpref, blogprefpriv);
            } else if (context.name == torrentpref) {
                console.log('Active in I2P Torrent window');
                setTitle(torrentpref, torrentprefpriv);
            } else if (context.name == ircpref) {
                console.log('Active in IRC window');
                setTitle(ircpref, ircprefpriv);
            } else if (context.name == torpref) {
                console.log('Active in Tor Manager window');
                setTitle(torpref, torprefpriv);
            }

        }

        if (
            tabInfo[0].cookieStoreId != 'firefox-default' &&
            tabInfo[0].cookieStoreId != 'firefox-private'
        ) {
            browser.contextualIdentities
                .get(tabInfo[0].cookieStoreId)
                .then(onContextGotTitle, onContextError);
        } else if (window.incognito) {
            browser.windows.update(window.id, {
                titlePreface: ''
            });
        } else {
            browser.windows.update(window.id, {
                titlePreface: ''
            });
        }
    }

    var querying = browser.tabs.query({
        currentWindow: true,
        active: true
    });
    querying.then(logTabs, onContextError);
}

var gettingListenerInfo = browser.runtime.getPlatformInfo();
gettingListenerInfo.then((got) => {
    function onPlatformError() {
        console.log('Error finding platform info');
    }
    if (got.os != 'android') {
        browser.tabs.onCreated.addListener(() => {
            var getting = browser.windows.getCurrent({
                populate: true
            });
            getting.then(setTitle, onPlatformError);
        });
        browser.tabs.onActivated.addListener(() => {
            var getting = browser.windows.getCurrent({
                populate: true
            });
            getting.then(setTitle, onPlatformError);
        });
    }
});

function handleClick() {
    console.log("Opening page action");
    browser.pageAction.openPopup();
}
browser.pageAction.onClicked.addListener(handleClick);

async function certCheck(details) {
    if (details.url.startsWith("https")) {
        console.log("(cert) https site", details.url);
    } else {
        return;
    }

    if (!details.url.includes(".i2p")) {
        return;
    }

    var tabs = await browser.tabs.query({ active: true });

    if (tabs == null) {
        return;
    }

    console.log("(cert) checking cert", tabs);

    for (tab in tabs) {
        if (details.url == tabs[tab].url) {
            console.log("(cert) right tab", tabs[tab].id);
            try {
                let securityInfo = await browser.webRequest.getSecurityInfo(
                    details.requestId, { certificateChain: true }
                );
                console.log("(cert) state is complete", securityInfo);
                console.log("(cert) certificates", securityInfo.certificates);
            } catch (error) {
                console.error(error);
            }
        }
    }
}

// Listen for onHeaderReceived for the target page.
// Set "blocking" and "responseHeaders".
browser.webRequest.onHeadersReceived.addListener(
    certCheck, { urls: ["<all_urls>"] }, ["blocking", "responseHeaders"]
);

function onClosedWindowCheck() {
    var getContext = browser.contextualIdentities.query({ name: titlepref });

    function checkTabs(ctx) {
        for (let context in ctx) {
            function conditionallyDelete(tabs) {
                if (tabs.length == 0) {
                    browser.contextualIdentities.remove(context.cookieStoreId);
                }
            }
            var tabs = browser.tabs.query({ cookieStoreId: context.cookieStoreId });
            tabs.then(conditionallyDelete, onError);
        }
    }
    getContext.then(checkTabs, onError);
}

function onOpenedWindowCheck() {
    var getContext = browser.contextualIdentities.query({ name: titlepref });

    function checkTabs(ctx) {
        for (let context in ctx) {
            function conditionallyDelete(tabs) {
                if (tabs.length == 0 && context != 0) {
                    console.log(context);
                    browser.contextualIdentities.remove(context.cookieStoreId);
                }
            }
            var tabs = browser.tabs.query({ cookieStoreId: context.cookieStoreId });
            tabs.then(conditionallyDelete, onError);
        }
    }
    getContext.then(checkTabs, onError);
}

onOpenedWindowCheck();

browser.tabs.onRemoved.addListener(onClosedWindowCheck);

if (browser.windows != undefined) {
    console.log("windows unavailable on android", browser.runtime.PlatformOs);
    browser.windows.onRemoved.addListener(onClosedWindowCheck);
    browser.windows.onCreated.addListener(onOpenedWindowCheck);
}
