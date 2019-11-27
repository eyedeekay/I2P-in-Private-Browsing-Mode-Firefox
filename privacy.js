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

function onSet(result) {
  if (result) {
    console.log("->: Value was updated");
  } else {
    console.log("-X: Value was not updated");
  }
}

/* This disables queries to centralized databases of bad URLs to screen for
   risky sites in your browser */
function disableHyperlinkAuditing() {
  var setting = browser.privacy.websites.hyperlinkAuditingEnabled.set({
    value: false
  });
  console.log("Disabling hyperlink auditing/val=", {
    value: false
  });
  setting.then(onSet);
}

// This enables first-party isolation
function enableFirstPartyIsolation() {
  var setting = browser.privacy.websites.firstPartyIsolate.set({
    value: true
  });
  console.log("Enabling first party isolation/val=", {
    value: true
  });
  setting.then(onSet);
}

/* This rejects tracking cookies and third-party cookies but it
   LEAVES "Persistent" Cookies unmodified in favor of an option in the content
   interface for now */
function disableEvilCookies() {
  var getting = browser.privacy.websites.cookieConfig.get({});
  getting.then(got => {
    var setting = browser.privacy.websites.cookieConfig.set({
      value: {
        behavior: "reject_third_party",
        nonPersistentCookies: got.value.nonPersistentCookies
      }
    });
    console.log("Setting cookie behavior/val=", {
      value: {
        behavior: "reject_third_party",
        nonPersistentCookies: got.value.nonPersistentCookies
      }
    });
    setting.then(onSet);
  });
}

// Make sure that they're gone
/*function disableBadCookies(){
    var setting = browser.privacy.websites.thirdPartyCookiesAllowed.set({
      value: false
    });
    console.log("Disabling third party cookies/val=", {
      value: false
    })
    setting.then(onSet);
}*/

// this disables the use of referrer headers
function disableReferrers() {
  var setting = browser.privacy.websites.referrersEnabled.set({
    value: false
  });
  console.log("Disabling referrer headers/val=", {
    value: false
  });
  setting.then(onSet);
}

// enable fingerprinting resistent features(letterboxing and stuff)
function enableResistFingerprinting() {
  var setting = browser.privacy.websites.resistFingerprinting.set({
    value: true
  });
  console.log("Enabling resist fingerprinting/val=", {
    value: true
  });
  setting.then(onSet);
}

// This is essentially a blocklist of clearnet web-sites known to do bad tracking
function enableTrackingProtection() {
  var setting = browser.privacy.websites.trackingProtectionMode.set({
    value: "always"
  });
  console.log("Enabling tracking protection/val=", {
    value: "always"
  });
  setting.then(onSet);
}

/* This disables protected content, which is a form of digital restrictions
   management dependent on identifying information */
function disableDigitalRestrictionsManagement() {
  var gettingInfo = browser.runtime.getPlatformInfo();
  gettingInfo.then(got => {
    if (got.os == "win") {
      var setting = browser.privacy.websites.protectedContentEnabled.set({
        value: false
      });
      console.log(
        "Setting Protected Content(Digital Restrictions Management) false/val=",
        {
          value: false
        }
      );
      setting.then(onSet);
    }
  });
}

function setAllPrivacy() {
  disableHyperlinkAuditing();
  enableFirstPartyIsolation();
  disableEvilCookies();
  disableReferrers();
  enableTrackingProtection();
  enableResistFingerprinting();
  disableDigitalRestrictionsManagement();
}

setAllPrivacy();

function ResetPeerConnection() {
  var webrtc = false;
  var rtc = browser.privacy.network.peerConnectionEnabled.set({
    value: webrtc
  });
  rtc.then(AssurePeerConnection);
}

function EnablePeerConnection() {
  var webrtc = false;
  var rtc = browser.privacy.network.peerConnectionEnabled.set({
    value: webrtc
  });
  rtc.then(SetupPeerConnection);
  console.log("Enabled WebRTC");
}

function SetupPeerConnection() {
  var webrtc = true;
  console.log("Pre-disabled WebRTC");
  rtc = browser.privacy.network.peerConnectionEnabled.set({
    value: webrtc
  });
  rtc.then(AssurePeerConnection);
}

function AssurePeerConnection() {
  function assure(webrtc) {
    browser.privacy.network.peerConnectionEnabled.set({
      value: webrtc.value
    });
    browser.privacy.network.networkPredictionEnabled.set({
      value: false
    });
    chrome.privacy.network.webRTCIPHandlingPolicy.set({
      value: "proxy_only"
    });
  }
  rtc = browser.privacy.network.peerConnectionEnabled.get({});
  rtc.then(assure);
}

var gettingInfo = browser.runtime.getPlatformInfo();
gettingInfo.then(got => {
  if (got.os == "android") {
    browser.tabs.onCreated.addListener(ResetPeerConnection);
  } else {
    browser.windows.onCreated.addListener(ResetPeerConnection);
  }
});
//AssurePeerConnection();

function ResetDisableSavePasswords() {
  browser.privacy.services.passwordSavingEnabled.set({
    value: false
  });
  console.log("Re-disabled saved passwords");
}

function EnableSavePasswords() {
  browser.privacy.services.passwordSavingEnabled.set({
    value: true
  });
  console.log("Enabled saved passwords");
}

//ResetDisableSavePasswords()

var defaultSettings = {
  since: "forever",
  dataTypes: ["downloads", "passwords", "formData", "localStorage", "history"]
};

var appSettings = {
  since: "forever",
  dataTypes: [""]
};

function onError(e) {
  console.error(e);
}

function clearCookiesContext(cookieStoreId) {}

function forgetBrowsingData(storedSettings) {
  function getSince(selectedSince) {
    if (selectedSince === "forever") {
      return 0;
    }

    const times = {
      hour: () => 1000 * 60 * 60,
      day: () => 1000 * 60 * 60 * 24,
      week: () => 1000 * 60 * 60 * 24 * 7
    };

    const sinceMilliseconds = times[selectedSince].call();
    return Date.now() - sinceMilliseconds;
  }

  function getTypes(selectedTypes) {
    let dataTypes = {};
    for (let item of selectedTypes) {
      dataTypes[item] = true;
    }
    return dataTypes;
  }

  const since = getSince(defaultSettings.since);
  const dataTypes = getTypes(defaultSettings.dataTypes);

  function notify() {
    let dataTypesString = Object.keys(dataTypes).join(", ");
    let sinceString = new Date(since).toLocaleString();
    browser.notifications.create({
      type: "basic",
      title: "Removed browsing data",
      message: `Removed ${dataTypesString}\n for I2P Browsing`
    });
  }

  function deepCleanHistory(historyItems) {
    console.log("Deep cleaning history");
    for (item of historyItems) {
      if (i2pHost(item.url)) {
        browser.history.deleteUrl({
          url: item.url
        });
        browser.browsingData.removeCache({});
        console.log("cleared Cache");
        browser.browsingData
          .removePasswords({
            hostnames: [i2pHostName(item.url)],
            since
          })
          .then(onContextGotLog);
        console.log("cleared Passwords");
        browser.browsingData
          .removeDownloads({
            hostnames: [i2pHostName(item.url)],
            since
          })
          .then(onContextGotLog);
        console.log("cleared Downloads");
        browser.browsingData
          .removeFormData({
            hostnames: [i2pHostName(item.url)],
            since
          })
          .then(onContextGotLog);
        console.log("cleared Form Data");
        browser.browsingData
          .removeLocalStorage({
            hostnames: [i2pHostName(item.url)],
            since
          })
          .then(onContextGotLog);
        console.log("cleared Local Storage");

        contexts = browser.contextualIdentities.query({
          name: titlepref
        });

        function deepCleanCookies(cookies) {
          for (cookie of cookies) {
            var removing = browser.cookies.remove({
              firstPartyDomain: cookie.firstPartyDomain,
              name: cookie.name,
              url: item.url
            });
            removing.then(onContextGotLog, onError);
          }
          console.log("Cleared cookies");
        }

        function deepCleanContext(cookieStoreIds) {
          for (cookieStoreId of cookieStoreIds) {
            var removing = browser.cookies.getAll({
              firstPartyDomain: null,
              storeId: cookieStoreId.cookieStoreId
            });
            removing.then(deepCleanCookies, onError);
          }
        }

        contexts.then(deepCleanContext, onError);
      }
    }
    notify();
  }

  var searching = browser.history.search({
    text: "i2p",
    startTime: 0
  });

  searching.then(deepCleanHistory);

  setAllPrivacy();
  ResetPeerConnection();
}

function i2pHostName(url) {
  let hostname = "";
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  return hostname;
}

function i2pHost(url) {
  let hostname = i2pHostName(url);
  return hostname.endsWith(".i2p");
}

function onContextGotLog(contexts) {
  if (contexts != null) {
    for (let context of contexts) {
      console.log(context);
    }
  }
}

browser.runtime.onMessage.addListener(message);

function enableHistory() {
  function checkStoredSettings(storedSettings) {
    storedSettings["disable_history"] = false;
    console.log(storedSettings);
    function enablehistory(settings) {
      console.log("Store History:", storedSettings);
    }
    var setting = browser.storage.local.set(storedSettings);
    setting.then(enablehistory);
  }
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(checkStoredSettings, onError);
}

function disableHistory() {
  function checkStoredSettings(storedSettings) {
    storedSettings["disable_history"] = true;
    console.log(storedSettings);
    function enablehistory(settings) {
      console.log("Store History:", storedSettings);
    }
    var setting = browser.storage.local.set(storedSettings);
    setting.then(enablehistory);
  }
  const gettingStoredSettings = browser.storage.local.get();
  gettingStoredSettings.then(checkStoredSettings, onError);
}

function message(message) {
  console.log(message);
  if (message.rtc === "enableWebRTC") {
    console.log("enableWebRTC");
    EnablePeerConnection();
  } else if (message.rtc === "disableWebRTC") {
    console.log("disableWebRTC");
    ResetPeerConnection();
  }
  if (message.history === "enableHistory") {
    console.log("enableHistory");
    enableHistory();
  } else if (message.history === "disableHistory") {
    console.log("disableHistory");
    disableHistory();
  }
}
