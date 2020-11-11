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
var localpref = chrome.i18n.getMessage('ircPreface');
var ircprefpriv = chrome.i18n.getMessage('ircPrefacePrivate');
var extensionpref = chrome.i18n.getMessage('extensionPreface');
var muwirepref = chrome.i18n.getMessage('muwirePreface');

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
  if (ids.indexOf(muwirepref) == -1) {
    browser.contextualIdentities
      .create({
        name: muwirepref,
        color: 'turquoise',
        icon: 'gift'
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
gettingInfo.then(got => {
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
    gettingPlatformInfo.then(got => {
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

function themeWindow(window) {
  // Check if the window is in private browsing
  function onThemeError() {
    console.log('theme color set error');
  }
  function logTabs(tabInfo) {
    function onContextGotTheme(context) {
      if (context.name == titlepref) {
        console.log('Active in I2P window');
        if (window.incognito) {
          browser.theme.update(window.id, {
            colors: {
              frame: '#363A68',
              toolbar: '#363A68'
            }
          });
        } else {
          browser.theme.update(window.id, {
            colors: {
              frame: '#363A68',
              toolbar: '#363A68'
            }
          });
        }
        if (tabInfo[0].url.startsWith('https://')) {
          browser.pageAction.setPopup({
            tabId: tabInfo[0].id,
            popup: 'security.html'
          });
          //console.log("(background) tabinfo", tabInfo[0].id)
          browser.pageAction.show(tabInfo[0].id);
        } else {
          //browser.pageAction.hide(tabInfo[0].id);
        }
      } else if (context.name == routerpref) {
        console.log('Active in Router Console window');
        if (window.incognito) {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        } else {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        }
      } else if (context.name == tunnelpref) {
        console.log('Active in Hidden Services Manager window');
        if (window.incognito) {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        } else {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        }
      } else if (context.name == mailpref) {
        console.log('Active in Web Mail window');
        if (window.incognito) {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        } else {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        }
      } else if (context.name == torrentpref) {
        console.log('Active in Bittorrent window');
        if (window.incognito) {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        } else {
          browser.theme.update(window.id, {
            colors: {
              frame: '#4456B7',
              toolbar: '#4456B7'
            }
          });
        }
      }
    }
    if (
      tabInfo[0].cookieStoreId != 'firefox-default' &&
      tabInfo[0].cookieStoreId != 'firefox-private'
    ) {
      browser.contextualIdentities
        .get(tabInfo[0].cookieStoreId)
        .then(onContextGotTheme, onThemeError);
    }else {
      console.log('Not active in I2P window');
      function unSetTheme(them) {
        console.log('unsetting theme', them);
        if (Object.keys(them).length > 0) {
          browser.theme.update(window.id, them.originalTheme);
        }else {
          browser.theme.update(window.id, { colors: null });
        }
      }
      browser.storage.local.get('originalTheme').then(unSetTheme, onError);
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
  function logTabs(tabInfo) {
    function onContextGotTitle(context) {
      if (context.name == titlepref) {
        console.log('Active in I2P window');

        if (window.incognito) {
          browser.windows.update(window.id, {
            titlePreface: titleprefpriv + ': '
          });
        } else {
          browser.windows.update(window.id, {
            titlePreface: titlepref + ': '
          });
        }
      } else if (context.name == webpref) {
        console.log('Active in Web window');
        if (window.incognito) {
          browser.windows.update(window.id, {
            titlePreface: webprefpriv + ' - '
          });
        } else {
          browser.windows.update(window.id, {
            titlePreface: webpref + ' - '
          });
        }
      } else if (context.name == routerpref) {
        console.log('Active in Router Console window');
        if (window.incognito) {
          browser.windows.update(window.id, {
            titlePreface: titleprefpriv + ' - ' + routerprefpriv + ': '
          });
        } else {
          browser.windows.update(window.id, {
            titlePreface: titlepref + ' - ' + routerpref + ': '
          });
        }
      } else if (context.name == tunnelpref) {
        console.log('Active in Hidden Services Manager window');

        if (window.incognito) {
          browser.windows.update(window.id, {
            titlePreface: titleprefpriv + ' - ' + tunnelprefpriv + ': '
          });
        } else {
          browser.windows.update(window.id, {
            titlePreface: titlepref + ' - ' + tunnelpref + ': '
          });
        }
      } else if (context.name == mailpref) {
        console.log('Active in I2P Web Mail window');

        if (window.incognito) {
          browser.windows.update(window.id, {
            titlePreface: titleprefpriv + ' - ' + mailprefpriv + ': '
          });
        } else {
          browser.windows.update(window.id, {
            titlePreface: titlepref + ' - ' + mailpref + ': '
          });
        }
      } else if (context.name == torrentpref) {
        console.log('Active in I2P Torrent window');

        if (window.incognito) {
          browser.windows.update(window.id, {
            titlePreface: titleprefpriv + ' - ' + torrentprefpriv + ': '
          });
        } else {
          browser.windows.update(window.id, {
            titlePreface: titlepref + ' - ' + torrentpref + ': '
          });
        }
      } else if (context.name == ircpref) {
        console.log('Active in IRC window');

        if (window.incognito) {
          browser.windows.update(window.id, {
            titlePreface: ircprefpriv + ' - ' + ircprefpriv + ': '
          });
        } else {
          browser.windows.update(window.id, {
            titlePreface: ircpref + ' - ' + ircpref + ': '
          });
        }
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
gettingListenerInfo.then(got => {
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

function handleUpdated(updateInfo) {
  function maybeSet(them){
    console.log("original theme found:", them, Object.keys(them).length)
    try{
    if ((Object.keys(them).length == 0) || them.originalTheme.colors == null && them.originalTheme.images == null && them.originalTheme.properties == null) {
      if (updateInfo.theme.colors.frame != '#4456B7' && updateInfo.theme.colors.frame != '#363A68') {
        function onSet(){
          console.log("stored theme:", updateInfo.theme)
        }
        if (updateInfo.theme.colors != null || updateInfo.theme.images != null || updateInfo.theme.properties != null ) {
          console.log("storing theme:", updateInfo.theme)
          browser.storage.local.set({"originalTheme": updateInfo.theme}).then(onSet, onError)
        }
      }
    }else{
      console.log("keeping stored theme:", them)
    }
    }catch{
      console.log("theme storage error")
    }
  }
  browser.storage.local.get("originalTheme").then(maybeSet, onError);
}

browser.theme.onUpdated.addListener(handleUpdated);

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
          details.requestId,
          { certificateChain: true }
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
  certCheck,
  { urls: ["<all_urls>"] },
  ["blocking", "responseHeaders"]
);
