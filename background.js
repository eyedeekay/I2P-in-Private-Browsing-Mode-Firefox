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

function onGot(contexts) {
  var ids = [];
  for (let context of contexts) {
    console.log(`Name: ${context.name}`);
    ids.push(context.name);
  }
  console.log("Checking new contexts");
  if (ids.indexOf(titlepref) == -1) {
    browser.contextualIdentities
      .create({
        name: titlepref,
        color: "orange",
        icon: "fingerprint"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf(webpref) == -1) {
    browser.contextualIdentities
      .create({
        name: webpref,
        color: "red",
        icon: "circle"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf(routerpref) == -1) {
    browser.contextualIdentities
      .create({
        name: routerpref,
        color: "blue",
        icon: "briefcase"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf(tunnelpref) == -1) {
    browser.contextualIdentities
      .create({
        name: tunnelpref,
        color: "green",
        icon: "tree"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf(mailpref) == -1) {
    browser.contextualIdentities
      .create({
        name: mailpref,
        color: "yellow",
        icon: "briefcase"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf(torrentpref) == -1) {
    browser.contextualIdentities
      .create({
        name: torrentpref,
        color: "purple",
        icon: "chill"
      })
      .then(onCreated, onError);
  }
}

function onCreated(context) {
  console.log(`New identity's ID: ${context.cookieStoreId}.`);
}

function onError(e) {
  console.error(e);
}

browser.contextualIdentities.query({}).then(onGot, onError);

if (!isDroid()) {
  chrome.windows.onCreated.addListener(themeWindow);
  chrome.windows.onFocusChanged.addListener(themeWindow);
  chrome.windows.onRemoved.addListener(themeWindow);
  chrome.tabs.onUpdated.addListener(themeWindowByTab);
  chrome.tabs.onActivated.addListener(themeWindowByTab);
}

function themeWindowByTab(tabId) {
  function tabWindow(tab) {
    getwindow = browser.windows.get(tab.windowId);
    getwindow.then(themeWindow);
  }
  if (typeof tabId === "number") {
    tab = browser.tabs.get(tabId);
    tab.then(tabWindow);
  } else {
    tabWindow(tabId);
  }
}

function themeWindow(window) {
  // Check if the window is in private browsing
  function logTabs(tabInfo) {
    function onGot(context) {
      if (context.name == titlepref) {
        console.log("Active in I2P window");
        if (window.incognito) {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#FFC56D",
              toolbar: "#FFC56D"
            }
          });
        } else {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#FFC56D",
              toolbar: "#FFC56D"
            }
          });
        }
      } else if (context.name == routerpref) {
        console.log("Active in Router Console window");
        if (window.incognito) {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#A4C8E1",
              toolbar: "#A4C8E1"
            }
          });
        } else {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#A4C8E1",
              toolbar: "#A4C8E1"
            }
          });
        }
      } else if (context.name == tunnelpref) {
        console.log("Active in Hidden Services Manager window");
        if (window.incognito) {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#D9D9D6",
              toolbar: "#D9D9D6"
            }
          });
        } else {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#D9D9D6",
              toolbar: "#D9D9D6"
            }
          });
        }
      } else if (context.name == mailpref) {
        console.log("Active in Web Mail window");
        if (window.incognito) {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#F7E59A",
              toolbar: "#F7E59A"
            }
          });
        } else {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#F7E59A",
              toolbar: "#F7E59A"
            }
          });
        }
      } else if (context.name == torrentpref) {
        console.log("Active in Bittorrent window");
        if (window.incognito) {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#A48FE1",
              toolbar: "#A48FE1"
            }
          });
        } else {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#A48FE1",
              toolbar: "#A48FE1"
            }
          });
        }
      } else {
        console.log("Not active in I2P window");
        chrome.theme.reset(window.id);
      }
    }
    if (
      tabInfo[0].cookieStoreId != "firefox-default" &&
      tabInfo[0].cookieStoreId != "firefox-private"
    ) {
      browser.contextualIdentities
        .get(tabInfo[0].cookieStoreId)
        .then(onGot, onError);
    } else {
      chrome.theme.reset(window.id);
    }
  }

  var querying = browser.tabs.query({
    currentWindow: true,
    active: true
  });
  querying.then(logTabs, onError);
}

function setTitle(window) {
  function logTabs(tabInfo) {
    console.log(tabInfo);

    function onGot(context) {
      if (context.name == titlepref) {
        console.log("Active in I2P window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: titleprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: titlepref
          });
        }
      } else if (context.name == webpref) {
        console.log("Active in Web window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: ""
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: ""
          });
        }
      } else if (context.name == routerpref) {
        console.log("Active in Router Console window");
        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: routerprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: routerpref
          });
        }
      } else if (context.name == tunnelpref) {
        console.log("Active in Hidden Services Manager window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: tunnelprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: tunnelpref
          });
        }
      } else if (context.name == mailpref) {
        console.log("Active in Web Mail window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: mailprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: mailpref
          });
        }
      } else if (context.name == torrentpref) {
        console.log("Active in I2P window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: torrentprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: torrentpref
          });
        }
      }
    }

    if (
      tabInfo[0].cookieStoreId != "firefox-default" &&
      tabInfo[0].cookieStoreId != "firefox-private"
    ) {
      browser.contextualIdentities
        .get(tabInfo[0].cookieStoreId)
        .then(onGot, onError);
    } else {
      if (window.incognito) {
        chrome.windows.update(window.id, {
          titlePreface: ""
        });
      } else {
        chrome.windows.update(window.id, {
          titlePreface: ""
        });
      }
    }
  }

  var querying = browser.tabs.query({
    currentWindow: true,
    active: true
  });
  querying.then(logTabs, onError);
}

chrome.windows.onCreated.addListener(() => {
  /* var gettingStoredSettings = chrome.storage.local.get();
     gettingStoredSettings.then(setupProxy, onError); */
  chrome.storage.local.get(function(got) {
    setupProxy();
  });
});

chrome.tabs.onCreated.addListener(() => {
  var getting = browser.windows.getCurrent({
    populate: true
  });
  getting.then(setTitle, onError);
});


function handleUpdated(updateInfo) {
  if (updateInfo.theme.colors) {
    console.log(`Theme was applied: ${updateInfo.theme}`);
  } else {
    console.log(`Theme was removed`);
  }
}

browser.theme.onUpdated.addListener(handleUpdated);