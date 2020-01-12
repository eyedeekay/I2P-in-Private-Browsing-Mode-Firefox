var titlepref = chrome.i18n.getMessage("titlePreface");
var webpref = chrome.i18n.getMessage("webPreface");
var routerpref = chrome.i18n.getMessage("routerPreface");
var routerprefpriv = chrome.i18n.getMessage("routerPrefacePrivate");

browser.privacy.network.peerConnectionEnabled.set({
  value: false
});
console.log("Preliminarily disabled WebRTC.");

chrome.privacy.network.networkPredictionEnabled.set({
  value: false
});
chrome.privacy.network.webRTCIPHandlingPolicy.set({
  value: "disable_non_proxied_udp"
});

function shouldProxyRequest(requestInfo) {
  return requestInfo.parentFrameId != -1;
}

var handleContextProxyRequest = async function(requestDetails) {
  console.log("(proxy)Searching for proxy by context");
  try {
    var handleProxyRequest = function(context) {
      proxy = {
        failoverTimeout: 0,
        proxyDns: false
      };
      if (context == "firefox-default" || context == "firefox-private") {
        proxy = null;
        return proxy;
      }
      if (context != undefined) {
        if (context.name == titlepref) {
          proxy = {
            type: getScheme(),
            host: getHost(),
            port: getPort()
          };
          console.log("(proxy)", context.name);
          console.log("Using", proxy.type);
          console.log("proxy ", proxy.host + ":" + proxy.port);
          return proxy;
        } else if (context.name == routerpref) {
          if (routerHost(requestDetails.url)) {
            return proxy;
          } else if (!routerHost(requestDetails.url)) {
            proxy = {
              type: "http",
              host: "localhost",
              port: "65535"
            };
          }
          proxy = {
            type: getScheme(),
            host: getHost(),
            port: getPort()
          };
          console.log("(proxy)", context.name);
          console.log("Using", proxy.type);
          console.log("proxy ", proxy.host + ":" + proxy.port);
          return proxy;
        } else if (context.name == webpref) {
          if (localHost(requestDetails.url)) {
            if (!routerHost(requestDetails.url)) {
              proxy = {
                type: "http",
                host: "localhost",
                port: "65535"
              };
            }
          }
          console.log("(proxy)", context.name);
          console.log("Using", proxy.type);
          console.log("proxy ", proxy.host + ":" + proxy.port);
          return proxy;
        }
      }
      if (!routerHost(requestDetails.url)) {
        if (localHost(requestDetails.url)) {
          console.log(
            "(proxy) non-routerconsole localhost url, will not interfere",
            requestDetails.url
          );
          /*proxy = {
            type: "http",
            host: "localhost",
            port: "65535"
          };*/
        }
      } else if (i2pHost(requestDetails.url)) {
        proxy = {
          type: getScheme(),
          host: getHost(),
          port: getPort()
        };
      }
      return proxy;
    };
    var contextGet = async function(tabInfo) {
      try {
        console.log("(proxy)Tab info from Function", tabInfo);
        context = await browser.contextualIdentities.get(tabInfo.cookieStoreId);
        return context;
      } catch (error) {
        console.error(error);
        //return; //"firefox-default";
      }
    };
    var tabGet = async function(tabId) {
      try {
        console.log("(proxy)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        console.log("(proxy)Tab error", error);
      }
    };
    if (
      requestDetails.cookieStoreId == "firefox-default" ||
      requestDetails.cookieStoreId == "firefox-private"
    ) {
      return browser.proxy.settings.get({});
    }
    if (requestDetails.tabId > 0) {
      console.log("manifest", requestDetails);
      if (proxyHost(requestDetails.url)) {
        proxy = {
          type: getScheme(),
          host: getHost(),
          port: getPort()
        };
        return proxy;
      } else if (extensionHost(requestDetails.url)) {
        return;
      } else if (i2pHost(requestDetails.url)) {
        console.log("(Proxy)I2P URL detected, ");
        var tab = tabGet(requestDetails.tabId);
        requestDetails.tabId = tab;
        var context = tab.then(contextGet);
        var proxy = await context.then(handleProxyRequest);
        console.log("(proxy)Returning I2P Proxy", proxy);
        return proxy;
      } else {
        var tab = tabGet(requestDetails.tabId);
        var context = tab.then(contextGet);
        var proxy = await context.then(handleProxyRequest);
        console.log("(proxy)Returning I2P Proxy", proxy);
        return proxy;
      }
      /*proxy = {};
      console.log("(proxy)Returning unset Proxy", proxy);
      return proxy;*/
    }
  } catch (error) {
    console.log("(proxy)Not using I2P Proxy.", error);
  }
};

var proxy_scheme = "HTTP";
var proxy_host = "127.0.0.1";
var proxy_port = "4444";
var control_host = "127.0.0.1";
var control_port = "7657";
var disable_history = false;

function SetupSettings() {
  console.log("Initialising Settings");
  function onSetupError() {
    console.log("Settings initialization error");
  }
  //
  function checkSchemeStoredSettings(storedSettings) {
    if (storedSettings.proxy_scheme === undefined) {
      proxy_scheme = "http";
      storedSettings.proxy_scheme = proxy_scheme;
    } else {
      proxy_scheme = storedSettings.proxy_scheme;
    }
    console.log("Initialising Proxy Scheme", storedSettings.proxy_scheme);
    setupProxy();
  }
  var gettingSchemeStoredSettings = browser.storage.local.get("proxy_scheme");
  gettingSchemeStoredSettings.then(checkSchemeStoredSettings, onSetupError);

  //
  function checkHostStoredSettings(storedSettings) {
    if (storedSettings.proxy_host == undefined) {
      proxy_host = "127.0.0.1";
      storedSettings.proxy_host = proxy_host;
    } else {
      proxy_host = storedSettings.proxy_host;
    }
    console.log("Initialising Host", storedSettings.proxy_host);
    setupProxy();
  }
  var gettingHostStoredSettings = browser.storage.local.get("proxy_host");
  gettingHostStoredSettings.then(checkHostStoredSettings, onSetupError);

  //
  function checkPortStoredSettings(storedSettings) {
    if (storedSettings.proxy_port == undefined) {
      proxy_port = "4444";
      storedSettings.proxy_port = proxy_port;
    } else {
      proxy_port = storedSettings.proxy_port;
    }
    console.log("Initialising Port", storedSettings.proxy_port);
    setupProxy();
  }
  var gettingPortStoredSettings = browser.storage.local.get("proxy_port");
  gettingPortStoredSettings.then(checkPortStoredSettings, onSetupError);

  //
  function checkControlHostStoredSettings(storedSettings) {
    if (storedSettings.control_host == undefined) {
      control_host = "127.0.0.1";
      storedSettings.control_host = control_host;
    } else {
      control_host = storedSettings.control_host;
    }
    console.log("Initialising Control Host", storedSettings.control_host);
    setupProxy();
  }
  var gettingControlHostStoredSettings = browser.storage.local.get(
    "control_host"
  );
  gettingControlHostStoredSettings.then(
    checkControlHostStoredSettings,
    onSetupError
  );

  //
  function checkControlPortStoredSettings(storedSettings) {
    if (storedSettings.control_port == undefined) {
      let new_control_port = "7657";
      storedSettings.control_port = new_control_port;
    } else {
      let control_port = storedSettings.control_port;
    }
    console.log("Initialising Control Port", storedSettings.control_port);
    setupProxy();
  }
  var gettingControlPortStoredSettings = browser.storage.local.get(
    "control_port"
  );
  gettingControlPortStoredSettings.then(
    checkControlPortStoredSettings,
    onSetupError
  );

  //
  function checkHistoryStoredSettings(storedSettings) {
    if (storedSettings.disable_history == undefined) {
      disable_history = false;
      storedSettings.disable_history = disable_history;
    } else {
      disable_history = storedSettings.disable_history;
    }
    console.log(
      "Initialising Disabled History",
      storedSettings.disable_history
    );
    setupProxy();
  }
  var gettingHistoryStoredSettings = browser.storage.local.get(
    "disable_history"
  );
  gettingHistoryStoredSettings.then(checkHistoryStoredSettings, onSetupError);
}

function getScheme() {
  if (proxy_scheme == undefined) {
    proxy_scheme = "http";
  }
  if (proxy_scheme == "HTTP") {
    proxy_scheme = "http";
  }
  if (proxy_scheme == "SOCKS") {
    proxy_scheme = "socks";
  }
  if (proxy_scheme != "http" && proxy_scheme != "socks") {
    proxy_scheme = "http";
  }
  //console.log("Got i2p proxy scheme:", proxy_scheme);
  return proxy_scheme;
}

function getHost() {
  if (proxy_host == undefined) {
    proxy_host = "127.0.0.1";
  }
  return proxy_host;
}

function getPort() {
  if (proxy_port == undefined) {
    var scheme = getScheme();
    if (scheme == "socks") {
      proxy_port = "4446";
    } else {
      proxy_port = "4444";
    }
  }
  return proxy_port;
}

function getControlHost() {
  if (control_host == undefined) {
    return "127.0.0.1";
  }
  return control_host;
}

function getControlPort() {
  if (control_port == undefined) {
    return "7657";
  }
  return control_port;
}

function setupProxy() {
  /**/
  console.log("Setting up Firefox WebExtension proxy");
  browser.proxy.onRequest.addListener(handleContextProxyRequest, {
    urls: ["<all_urls>"]
  });
  console.log("i2p settings created for WebExtension Proxy");
  /**/
}

function update() {
  console.log("restoring proxy scheme:", proxy_scheme);
  console.log("restoring proxy host:", proxy_host);
  console.log("restoring proxy port:", proxy_port);
  console.log("restoring control host:", control_host);
  console.log("restoring control port:", control_port);
}

function updateFromStorage() {
  console.log("updating settings from storage");
  var gettingInfo = browser.runtime.getPlatformInfo();
  gettingInfo.then(got => {
    if (got.os == "android") {
      chrome.storage.local.get(function() {
        SetupSettings();
        update();
        setupProxy();
      });
    } else {
      browser.windows.getAll().then(wins => wins.forEach(themeWindow));
      chrome.storage.local.get(function() {
        SetupSettings();
        update();
        setupProxy();
      });
    }
  });
}

browser.storage.onChanged.addListener(updateFromStorage);
SetupSettings();
setupProxy();
