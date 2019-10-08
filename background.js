function onGot(contexts) {
  var ids = [];
  for (let context of contexts) {
    console.log(`Name: ${context.name}`);
    ids.push(context.name);
  }
  console.log("Checking new contexts");
  if (ids.indexOf("i2pbrowser") == -1) {
    function onCreated(context) {
      console.log(`New identity's ID: ${context.cookieStoreId}.`);
    }

    function onError(e) {
      console.error(e);
    }
    browser.contextualIdentities
      .create({
        name: "i2pbrowser",
        color: "purple",
        icon: "fingerprint"
      })
      .then(onCreated, onError);
  }
  if (ids.indexOf("routerconsole") == -1) {
    function onCreated(context) {
      console.log(`New identity's ID: ${context.cookieStoreId}.`);
    }

    function onError(e) {
      console.error(e);
    }
    browser.contextualIdentities
      .create({
        name: "routerconsole",
        color: "turquoise",
        icon: "briefcase"
      })
      .then(onCreated, onError);
  }
}

function onError(e) {
  console.error(e);
}

browser.contextualIdentities.query({}).then(onGot, onError);

if (!isDroid()) {
  chrome.windows.onCreated.addListener(themeWindow);
  chrome.tabs.onUpdated.addListener(themeWindowByTab);
  chrome.tabs.onActivated.addListener(themeWindowByTab);
}

var titlepref = chrome.i18n.getMessage("titlePreface");
var titleprefpriv = chrome.i18n.getMessage("titlePrefacePrivate");

function themeWindowByTab(tab) {
    getwindow = browser.windows.get(tab.windowId)
    getwindow.then(themeWindow)
}

function themeWindow(window) {
  // Check if the window is in private browsing
  function logTabs(tabInfo) {
    console.log(tabInfo);

    function onGot(context) {
      if (context.name == "i2pbrowser") {
        console.log("Active in I2P window");
        if (window.incognito) {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#2D4470",
              toolbar: "#2D4470"
            }
          });
        } else {
          chrome.theme.update(window.id, {
            colors: {
              frame: "#9DABD5",
              toolbar: "#9DABD5"
            }
          });
        }
      } else {
        console.log("Not active in I2P window");
      }
    }

    function onError(e) {
      console.error(e);
    }
    if (tabInfo[0].cookieStoreId != "firefox-default") {
      browser.contextualIdentities
      .get(tabInfo[0].cookieStoreId)
      .then(onGot, onError);
    }else{
        chrome.theme.reset(window.id);
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
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
      if (context.name == "i2pbrowser") {
        console.log("Active in I2P window");

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

    function onError(e) {
      console.error(e);
    }
    if (tabInfo[0].cookieStoreId != "firefox-default")
      browser.contextualIdentities
        .get(tabInfo[0].cookieStoreId)
        .then(onGot, onError);
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }
  var querying = browser.tabs.query({
    currentWindow: true,
    active: true
  });
  querying.then(logTabs, onError);
}

chrome.windows.onCreated.addListener(() => {
  //var gettingStoredSettings = chrome.storage.local.get();
  //gettingStoredSettings.then(setupProxy, onError);
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
