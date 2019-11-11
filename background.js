function onGot(contexts) {
  var ids = [];
  for (let context of contexts) {
    console.log(`Name: ${context.name}`);
    ids.push(context.name);
  }
  console.log("Checking new contexts");
  if (ids.indexOf("I2P Browsing") == -1) {
    browser.contextualIdentities
      .create({
        name: "I2P Browsing",
        color: "orange",
        icon: "fingerprint"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf("Web Browsing") == -1) {
    browser.contextualIdentities
      .create({
        name: "Web Browsing",
        color: "red",
        icon: "circle"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf("Router Console") == -1) {
    browser.contextualIdentities
      .create({
        name: "Router Console",
        color: "blue",
        icon: "briefcase"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf("Hidden Services Manager") == -1) {
    browser.contextualIdentities
      .create({
        name: "Hidden Services Manager",
        color: "green",
        icon: "tree"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf("Web Mail") == -1) {
    browser.contextualIdentities
      .create({
        name: "Web Mail",
        color: "yellow",
        icon: "briefcase"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf("Bittorrent") == -1) {
    browser.contextualIdentities
      .create({
        name: "Bittorrent",
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

var titlepref = chrome.i18n.getMessage("titlePreface");
var titleprefpriv = chrome.i18n.getMessage("titlePrefacePrivate");

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
      if (context.name == "I2P Browsing") {
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
      } else if (context.name == "Router Console") {
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
      } else if (context.name == "Hidden Services Manager") {
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
      } else if (context.name == "Web Mail") {
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
      } else if (context.name == "Bittorrent") {
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
      if (context.name == "I2P Browsing") {
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
      } else if (context.name == "Web Browsing") {
        console.log("Active in Web window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: titleprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: titlepref
          });
        }
      } else if (context.name == "Router Console") {
        console.log("Active in Router Console window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: titleprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: titlepref
          });
        }
      } else if (context.name == "Hidden Services Manager") {
        console.log("Active in Hidden Services Manager window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: titleprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: titlepref
          });
        }
      } else if (context.name == "Web Mail") {
        console.log("Active in Web Mail window");

        if (window.incognito) {
          chrome.windows.update(window.id, {
            titlePreface: titleprefpriv
          });
        } else {
          chrome.windows.update(window.id, {
            titlePreface: titlepref
          });
        }
      } else if (context.name == "Bittorrent") {
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
