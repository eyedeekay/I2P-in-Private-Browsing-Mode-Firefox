/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-ternary */
var titlepref = chrome.i18n.getMessage("titlePreface");
var titleprefpriv = chrome.i18n.getMessage("titlePrefacePrivate");
var webpref = chrome.i18n.getMessage("webPreface");
var webprefpriv = chrome.i18n.getMessage("webPrefacePrivate");
var routerpref = chrome.i18n.getMessage("routerPreface");
var routerprefpriv = chrome.i18n.getMessage("routerPrefacePrivate");
var mailpref = chrome.i18n.getMessage("mailPreface");
var mailprefpriv = chrome.i18n.getMessage("mailPrefacePrivate");
var torrentpref = chrome.i18n.getMessage("torrentPreface");
var torrentprefpriv = chrome.i18n.getMessage("torrentPrefacePrivate");
var tunnelpref = chrome.i18n.getMessage("i2ptunnelPreface");
var tunnelprefpriv = chrome.i18n.getMessage("i2ptunnelPrefacePrivate");
var ircpref = chrome.i18n.getMessage("ircPreface");
var ircprefpriv = chrome.i18n.getMessage("ircPrefacePrivate");
var extensionpref = chrome.i18n.getMessage("extensionPreface");
var muwirepref = chrome.i18n.getMessage("muwirePreface");
var muwireprefpriv = chrome.i18n.getMessage("muwirePrefacePrivate");
var botepref = chrome.i18n.getMessage("botePreface");
var blogpref = chrome.i18n.getMessage("blogPreface");
var blogprefpriv = chrome.i18n.getMessage("blogPrefacePrivate");
var torpref = chrome.i18n.getMessage("torPreface");
var torprefpriv = chrome.i18n.getMessage("torPrefacePrivate");

function onError(err) {
  console.log("(background)", err);
}

function logContexts(contexts) {
  if (contexts) {
    console.log(contexts);
  }
}

function onContextsGot(contexts) {
  const prefList = [
    { name: titlepref, color: "orange", icon: "fingerprint" },
    { name: blogpref, color: "pink", icon: "pet" },
    { name: webpref, color: "red", icon: "circle" },
    { name: routerpref, color: "blue", icon: "briefcase" },
    { name: tunnelpref, color: "green", icon: "tree" },
    { name: mailpref, color: "yellow", icon: "briefcase" },
    { name: torrentpref, color: "purple", icon: "chill" },
    { name: ircpref, color: "red", icon: "vacation" },
    { name: torpref, color: "purple", icon: "circle" },
    { name: muwirepref, color: "turquoise", icon: "gift" },
    { name: botepref, color: "blue", icon: "fence" },
  ];
  const ids = contexts.map((context) => context.name);
  console.log("Checking new contexts");
  prefList.forEach((pref) => {
    if (ids.indexOf(pref.name) === -1) {
      browser.contextualIdentities.create(pref).then(onCreated, onNotCreated);
    }
  });
}

// every time a window opens, call onContextsGot
browser.tabs.onCreated.addListener(onContextsGot);

function onContextsError() {
  console.log("Error finding contextual identities, is the API enabled?");
}

function onCreated(context) {
  console.log(" ID:", context.cookieStoreId, "created.");
}

function onNotCreated(context) {
  console.log("ID:", context.cookieStoreId, "not created.");
}

browser.contextualIdentities.query({}).then(onContextsGot, onContextsError);

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then((got) => {
  if (got.os != "android") {
    browser.windows.onCreated.addListener(themeWindow);
    browser.windows.onFocusChanged.addListener(themeWindow);
    browser.windows.onRemoved.addListener(themeWindow);
    browser.tabs.onUpdated.addListener(themeWindow);
    browser.tabs.onActivated.addListener(themeWindow);
  }
});

function themeWindow(window) {
  function dynamicTheme() {
    console.log("(theme)Active in I2P App window");
    let ctheme = browser.theme.getCurrent();
    ctheme.then(setDynamicTheme);
    function setDynamicTheme(oldtheme) {
      if (window.incognito) {
        browser.theme.update(window.id, dtheme);
      } else {
        browser.theme.update(window.id, dtheme);
      }
    }
  }

  function browserTheme() {
    console.log("(theme)Active in I2P window");
    let ctheme = browser.theme.getCurrent();
    ctheme.then(setBrowserTheme);
    function setBrowserTheme(oldtheme) {
      btheme.images = oldtheme.images;
      if (window.incognito) {
        browser.theme.update(window.id, btheme);
      } else {
        browser.theme.update(window.id, btheme);
      }
    }
  }

  function logTabs(tabInfo) {
    for (const tab of tabInfo) {
      console.debug("(theme) logging tab", tab);
    }
    function onContextGotTheme(context) {
      console.debug("(theme) deciding theme for context", context);
      if (context.name == titlepref) {
        browserTheme();
        browser.pageAction.show(tabInfo[0].id);
      } else if (context.name == routerpref) {
        console.log("(theme) Active in Router Console window");
        dynamicTheme();
      } else if (context.name == tunnelpref) {
        console.log("(theme) Active in Hidden Services Manager window");
        dynamicTheme();
      } else if (context.name == mailpref) {
        console.log("(theme) Active in Web Mail window");
        dynamicTheme();
      } else if (context.name == torrentpref) {
        console.log("(theme) Active in Bittorrent window");
        dynamicTheme();
      } else if (context.name == botepref) {
        console.log("(theme) Active in Bote window");
        dynamicTheme();
      } else if (context.name == ircpref) {
        console.log("(theme) Active in IRC window");
        dynamicTheme();
      } else if (context.name == torpref) {
        console.log("(theme) Active in Tor Manager window");
        dynamicTheme();
      } else if (context.name == blogpref) {
        console.log("(theme) (theme) Active in Blog window");
        dynamicTheme();
      } else if (context.name == muwirepref) {
        console.log("(theme) Active in MuWire window");
        dynamicTheme();
      } else {
        console.log("(theme) Not active in I2P Window");
        unsetTheme();
      }
    }
    if (
      tabInfo[0].cookieStoreId != "firefox-default" &&
      tabInfo[0].cookieStoreId != "firefox-private"
    ) {
      browser.contextualIdentities
        .get(tabInfo[0].cookieStoreId)
        .then(onContextGotTheme, onThemeError);
    } else {
      console.log("(theme) default context identified");
      unsetTheme();
    }
  }

  var querying = browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  querying.then(logTabs, onThemeError);
}

function queryTitle(window) {
  // Check if the window is in private browsing
  function onContextError() {
    console.log("(theme) Error finding context");
  }

  function setTitle(title, privTitle) {
    const titlePreface = window.incognito ? privTitle : title;
    browser.windows.update(window.id, { titlePreface });
  }

  function onContextGotTitle(context) {
    const titleMap = {
      titlepref: "Active in I2P window",
      muwirepref: "Active in MuWire window",
      routerpref: "Active in Router Console window",
      botepref: "Active in Bote window",
      tunnelpref: "Active in Hidden Services Manager window",
      mailpref: "Active in I2P Web Mail window",
      blogpref: "Active in I2P Blog window",
      torrentpref: "Active in I2P Torrent window",
      ircpref: "Active in IRC window",
      torpref: "Active in Tor Manager window",
    };
    const { name } = context;
    console.log(titleMap[name]);
    setTitle(name, `${name}priv`);
  }

  function logTabs(tabInfo) {
    const { cookieStoreId } = tabInfo[0];
    if (
      cookieStoreId === "firefox-default" ||
      cookieStoreId === "firefox-private"
    ) {
      setTitle("", "");
    } else {
      browser.contextualIdentities
        .get(cookieStoreId)
        .then(onContextGotTitle, onContextError);
    }
  }

  const querying = browser.tabs.query({ currentWindow: true, active: true });
  querying.then(logTabs, onContextError);
}

var gettingListenerInfo = browser.runtime.getPlatformInfo();
gettingListenerInfo.then((got) => {
  function onPlatformError() {
    console.log("Error finding platform info");
  }
  if (got.os != "android") {
    browser.tabs.onCreated.addListener(() => {
      var getting = browser.windows.getCurrent({
        populate: true,
      });
      getting.then(queryTitle, onPlatformError);
    });
    browser.tabs.onActivated.addListener(() => {
      var getting = browser.windows.getCurrent({
        populate: true,
      });
      getting.then(queryTitle, onPlatformError);
    });
  }
});

function handleClick() {
  console.log("Opening page action");
  browser.pageAction.openPopup();
}
browser.pageAction.onClicked.addListener(handleClick);

async function checkCertificate(details) {
  if (!details.url.startsWith("https") || !details.url.includes(".i2p")) {
    return;
  }

  const activeTabs = await browser.tabs.query({ active: true });

  if (!activeTabs) {
    return;
  }

  for (const tab of activeTabs) {
    if (details.url !== tab.url) {
      continue;
    }

    try {
      const securityInfo = await browser.webRequest.getSecurityInfo(
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

/* Listen for onHeaderReceived for the target page.
   Set "blocking" and "responseHeaders". */
browser.webRequest.onHeadersReceived.addListener(
  checkCertificate,
  { urls: ["<all_urls>"] },
  ["blocking", "responseHeaders"]
);

function onClosedWindowCheck() {
  const contextQuery = browser.contextualIdentities.query({
    name: "titlepref",
  });

  function checkTabs(context) {
    for (let ctx of context) {
      function deleteIfEmpty(tabs) {
        if (tabs.length === 0) {
          browser.contextualIdentities.remove(ctx.cookieStoreId);
        }
      }
      const tabs = browser.tabs.query({ cookieStoreId: ctx.cookieStoreId });
      tabs.then(deleteIfEmpty, onError);
    }
  }

  contextQuery.then(checkTabs, onError);
}

async function onOpenedWindowCheck() {
  const contexts = await browser.contextualIdentities.query({
    name: titlepref,
  });

  function deleteContextIfNoTabs(tabs, context) {
    if (tabs.length == 0 && context != 0) {
      browser.contextualIdentities.remove(context.cookieStoreId);
    }
  }

  async function checkTabs(context) {
    const tabs = await browser.tabs.query({
      cookieStoreId: context.cookieStoreId,
    });
    await deleteContextIfNoTabs(tabs, context);
  }

  for (const context of contexts) {
    await checkTabs(context);
  }
}

onOpenedWindowCheck();
onContextsGot();

browser.tabs.onRemoved.addListener(onClosedWindowCheck);

if (browser.windows === undefined) {
  console.log("windows unavailable on android", browser.runtime.PlatformOs);
  browser.windows.onRemoved.addListener(onClosedWindowCheck);
  browser.windows.onCreated.addListener(onOpenedWindowCheck);
}

function putCurrentThemeInLocalStorage() {
  let mine = isMyTheme();
  mine.then(processTheme, themeStoreError);
  function processTheme(mineval) {
    console.debug("(theme) validating the current theme:", !mineval);
    if (mineval) {
      return;
    }
    // get the current theme:
    const currentTheme = browser.theme.getCurrent();
    currentTheme.then(storeTheme, themeStoreError);
    function storeTheme(theme) {
      console.debug("(theme) stored the current theme:", theme);
      browser.storage.local.set({ name: "theme", theme });
    }
  }
  function themeStoreError(err) {
    console.warn("(theme) theme storage error", err);
  }
}

function putLatestThemeIDInLocalStorage(extensionInfo) {
  let mine = isMyTheme();
  mine.then(processTheme, themeStoreError);
  function processTheme(mineval) {
    console.debug("(theme) validating the current constant theme:", !mineval);
    if (mineval) {
      return;
    }
    console.debug("(theme) storing theme by ID", extensionInfo.id);
    if (extensionInfo.type === "theme") {
      let themeID = extensionInfo.id;
      browser.storage.local.set({ themeID });
    }
  }
  function themeStoreError(err) {
    console.warn("(theme) theme ID storage error", err);
  }
}

function restoreLatestThemeIDInLocalStorage() {
  const storedTheme = browser.storage.local.get("themeID");
  storedTheme.then(restoreTheme, restoreThemeError);
  function restoreTheme(theme) {
    if (theme.themeID) {
      let dis = browser.management.setEnabled(theme.themeID, false);
      dis.then(function () {
        console.debug("(theme) theme restored by ID", theme.themeID);
        browser.management.setEnabled(theme.themeID, true);
      });
    }
  }
  function restoreThemeError(err) {
    console.warn("(theme) theme restore error", err);
  }
}

browser.management.onEnabled.addListener(putLatestThemeIDInLocalStorage);

function onThemeError(err) {
  console.warn("(theme) theme error", err);
}

browser.theme.onUpdated.addListener(putCurrentThemeInLocalStorage);
browser.windows.onCreated.addListener(putCurrentThemeInLocalStorage);
browser.tabs.onCreated.addListener(putCurrentThemeInLocalStorage);

function unsetTheme() {
  const storedTheme = browser.storage.local.get("theme");
  storedTheme.then(restoreTheme, restoreThemeError);
  async function restoreTheme(theme) {
    let mt = await isMyTheme();
    if (mt) {
      if (theme.theme) {
        console.debug("(theme) analyzing theme", theme.theme);
        if (theme.theme.colors) {
          theme.theme.images = {};
          console.warn(
            "(theme) There's not a way to restore theme images yet."
          );
          browser.theme.update(theme.theme);
          console.log("(theme) restored the stored theme", theme);
        } else {
          browser.theme.reset();
        }
      }
      restoreLatestThemeIDInLocalStorage();
    }
  }
  function restoreThemeError(err) {
    console.debug("(theme) theme restore error", err);
  }
}

let btheme = {
  colors: {
    frame: "#363A68",
    toolbar: "#363A68",
    tab_text: "#ECF3FF",
  },
};

let dtheme = {
  colors: {
    frame: "#4456B7",
    toolbar: "#4456B7",
    tab_text: "#ECF3FF",
  },
};

async function isMyTheme() {
  function hasMatchingColors(theme, targetColors) {
    console.debug("(theme) comparison", theme.colors, targetColors.colors);
    if (theme.colors === null || targetColors.colors === null) {
      return false;
    }
    return (
      theme.colors.frame == targetColors.colors.frame &&
      theme.colors.toolbar == targetColors.colors.toolbar &&
      theme.colors.tab_text == targetColors.colors.tab_text
    );
  }

  const currentTheme = await browser.theme.getCurrent();
  const isLightTheme = hasMatchingColors(currentTheme, dtheme);
  const isDarkTheme = hasMatchingColors(currentTheme, btheme);

  console.debug(`Is current theme a dynamic theme? ${isLightTheme}`);
  console.debug(`Is current theme a browser theme? ${isDarkTheme}`);

  return isLightTheme || isDarkTheme;
}
