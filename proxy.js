
function getChrome() {
  if (browser.runtime.getBrowserInfo == undefined) {
    return true
  }
  return false
}

function isDroid() {
  if (!getChrome()) {
    var gettingInfo = browser.runtime.getPlatformInfo();
    gettingInfo.then((got) => {
      if (got.os == "android") {
        console.log("android detected")
        return true
      } else {
        console.log("desktop detected")
        return false
      }
    });
  }
  return false
}

if (!getChrome()) {
  browser.privacy.network.peerConnectionEnabled.set({
    value: false
  });
}

chrome.privacy.network.networkPredictionEnabled.set({
  value: false
});
chrome.privacy.network.webRTCIPHandlingPolicy.set({
  value: "disable_non_proxied_udp"
});

console.log("Preliminarily disabled WebRTC.")

function shouldProxyRequest(requestInfo) {
  return requestInfo.parentFrameId != -1;
}

function handleProxyRequest(requestInfo) {
  console.log(`Proxying: ${requestInfo.url}`);
  console.log("   ", getScheme(), getHost(), ":", getPort(),)
  return {
    type: getScheme(),
    host: getHost(),
    port: getPort()
  };
}

var proxy_scheme = "HTTP"

function getScheme() {
  if (proxy_scheme == undefined) {
    proxy_scheme = "http"
  }
  if (proxy_scheme == "HTTP") {
    proxy_scheme = "http"
  }
  if (proxy_scheme == "SOCKS") {
    proxy_scheme = "socks"
  }
  if (proxy_scheme != "http" && proxy_scheme != "socks") {
    proxy_scheme = "http"
  }
  console.log("Got i2p proxy scheme:", proxy_scheme);
  return proxy_scheme;
}

var proxy_host = "127.0.0.1"

function getHost() {
  if (proxy_host == undefined) {
    proxy_host = "127.0.0.1"
  }
  console.log("Got i2p proxy host:", proxy_host);
  return proxy_host;
}

var proxy_port = "4444"

function getPort() {
  if (proxy_port == undefined) {
    var scheme = getScheme()
    if (scheme == "socks") {
      proxy_port = "4446"
    } else {
      proxy_port = "4444"
    }
  }
  console.log("Got i2p proxy port:", proxy_port);
  return proxy_port;
}

var control_host = "127.0.0.1"

function getControlHost() {
  if (control_host == undefined) {
    return "127.0.0.1"
  }
  console.log("Got i2p control host:", control_host);
  return control_host;
}

var control_port = "4444"

function getControlPort() {
  if (control_port == undefined) {
    return "4444"
  }
  console.log("Got i2p control port:", control_port);
  return control_port;
}

function setupProxy() {
  var controlHost = getControlHost()
  var controlPort = getControlPort();
  var Host = getHost()
  var Port = getPort()
  var Scheme = getScheme()
  if (!getChrome()) {
    function handleProxyRequest(requestInfo) {
      //      console.log("proxying request via listener")
      //      console.log("   ", Scheme, Host, ":", Port,)
      return {
        type: Scheme,
        host: Host,
        port: Port,
        proxyDns: true
      }
    }
    console.log("Setting up Firefox WebExtension proxy")
    browser.proxy.onRequest.addListener(handleProxyRequest, {
      urls: ["<all_urls>"]
    });
    console.log("i2p settings created for WebExtension Proxy")
  } else {
    var config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: Scheme,
          host: Host,
          port: parseInt(Port),
        },
      }
    };
    chrome.proxy.settings.set(
      {
        value: config,
        scope: 'regular'
      }, function() {});
  }
}

function contextProxy(requestDetails) {
  try {

    function onGot(context) {
      if (!context) {
        console.error("Context not found");
      } else {
        var controlHost = getControlHost()
        var controlPort = getControlPort();
        var Host = getHost()
        var Port = getPort()
        var Scheme = getScheme()
        if (context.name = "i2pbrowser") {
          requestDetails.proxyInfo = {host:Host, port:Port, type:Scheme, proxyDns:true }
          console.log("PROXY INFO", requestDetails);
        }
      }
    }

    function onError(e) {
      console.error(e);
    }

    function tabGot(tab) {
      if (!tab) {
        console.error("Tab not found");
      } else {
        if (tab.cookieStoreId != "firefox-default")
          browser.contextualIdentities.get(tab.cookieStoreId).then(onGot, onError);
      }
    }

    function tabError(e) {
      console.error(e);
    }

    browser.tabs.get(requestDetails.tabId).then(tabGot, tabError);

  } catch (error) {
    console.error(error);
  }
  console.log(requestDetails);
}

browser.webRequest.onBeforeRequest.addListener(
  contextProxy,
  {urls: ["<all_urls>"]}
);

function checkStoredSettings(storedSettings) {
  let defaultSettings = {};
  if (!storedSettings.proxy_scheme) {
    defaultSettings["proxy_scheme"] = "http"
  }
  if (!storedSettings.proxy_host) {
    defaultSettings["proxy_host"] = "127.0.0.1"
  }
  if (!storedSettings.proxy_port) {
    defaultSettings["proxy_port"] = 4444
  }
  if (!storedSettings.control_host) {
    defaultSettings["control_host"] = "127.0.0.1"
  }
  if (!storedSettings.control_port) {
    defaultSettings["control_port"] = 4444
  }
  chrome.storage.local.set(defaultSettings);
}

function update(restoredSettings) {
  proxy_scheme = restoredSettings.proxy_scheme
  console.log("restoring proxy scheme:", proxy_scheme)
  proxy_host = restoredSettings.proxy_host
  console.log("restoring proxy host:", proxy_host)
  proxy_port = restoredSettings.proxy_port
  console.log("restoring proxy port:", proxy_port)
  control_host = restoredSettings.control_host
  console.log("restoring control host:", control_host)
  control_port = restoredSettings.control_port
  console.log("restoring control port:", control_port)
}

chrome.storage.local.get(function(got) {
  checkStoredSettings(got)
  update(got)
  setupProxy()
});

// Theme all currently open windows
if (!getChrome()) {
  if (!isDroid()) {
    browser.windows.getAll().then(wins => wins.forEach(themeWindow));
  }
}
