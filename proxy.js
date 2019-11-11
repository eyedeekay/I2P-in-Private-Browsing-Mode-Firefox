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
      if (context != undefined) {
        if (context.name == "i2pbrowser") {
          proxy = {
            type: getScheme(),
            host: getHost(),
            port: getPort()
          };
          console.log(
            "(proxy)",
            context.name,
            "Using",
            proxy.type,
            "proxy ",
            proxy.host + ":" + proxy.port
          );
          return proxy;
        } else if (context.name == "routerconsole") {
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
          console.log(
            "(proxy)",
            context.name,
            "Using",
            proxy.type,
            "proxy ",
            proxy.host + ":" + proxy.port
          );
          return proxy;
        } else if (context.name == "Personal") {
          if (localHost(requestDetails.url)) {
            if (!routerHost(requestDetails.url)) {
              proxy = {
                type: "http",
                host: "localhost",
                port: "65535"
              };
            }
          }
          console.log(
            "(proxy)",
            context.name,
            "Using",
            proxy.type,
            "proxy ",
            proxy.host + ":" + proxy.port
          );
          return proxy;
        }
      }
      if (!routerHost(requestDetails.url)) {
        proxy = {
          type: "http",
          host: "localhost",
          port: "65535"
        };
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
        console.log("(proxy)Context Error", error);
      }
    };
    var tabFind = async function(tabId) {
      try {
        context = await browser.contextualIdentities.query({
          name: "i2pbrowser"
        });
        tabId.cookieStoreId = context[0].cookieStoreId;
        console.log("(proxy) forcing context", tabId.cookieStoreId);
        return tabId;
      } catch (error) {
        console.log("(proxy)Context Error", error);
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

    if (requestDetails.tabId > 0) {
      if (proxyHost(requestDetails.url)) {
        console.log("(Proxy)I2P Proxy test URL detected, ", requestDetails.url);
        return {
          type: getScheme(),
          host: getHost(),
          port: getPort()
        };
      } else if (i2pHost(requestDetails.url)) {
        console.log("(Proxy)I2P URL detected, ");
        var tab = tabGet(requestDetails.tabId);
        var mtab = tab.then(tabFind);
        requestDetails.tabId = mtab;
        var context = mtab.then(contextGet);
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
      proxy = {
        type: getScheme(),
        host: getHost(),
        port: getPort()
      };
      console.log("(proxy)Returning I2P Proxy", proxy);
      return proxy;
    }
  } catch (error) {
    console.log("(proxy)Not using I2P Proxy.", error);
  }
};

var proxy_scheme = "HTTP";

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

/*
var proxy_host = "127.0.0.1";
var proxy_port = "4444";
var control_host = "127.0.0.1";
var control_port = "4444";
*/

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
    return "4444";
  }
  return control_port;
}

function setupProxy() {
  var controlHost = getControlHost();
  var controlPort = getControlPort();
  var Host = getHost();
  var Port = getPort();
  var Scheme = getScheme();

  /**/
  console.log("Setting up Firefox WebExtension proxy");
  browser.proxy.onRequest.addListener(handleContextProxyRequest, {
    urls: ["<all_urls>"]
  });
  console.log("i2p settings created for WebExtension Proxy");
  /**/
}

function checkStoredSettings(storedSettings) {
  let defaultSettings = {};
  if (!storedSettings.proxy_scheme) {
    defaultSettings["proxy_scheme"] = "http";
  }
  if (!storedSettings.proxy_host) {
    defaultSettings["proxy_host"] = "127.0.0.1";
  }
  if (!storedSettings.proxy_port) {
    defaultSettings["proxy_port"] = 4444;
  }
  if (!storedSettings.control_host) {
    defaultSettings["control_host"] = "127.0.0.1";
  }
  if (!storedSettings.control_port) {
    defaultSettings["control_port"] = 4444;
  }
  chrome.storage.local.set(defaultSettings);
}

function update(restoredSettings) {
  proxy_scheme = restoredSettings.proxy_scheme;
  console.log("restoring proxy scheme:", proxy_scheme);
  proxy_host = restoredSettings.proxy_host;
  console.log("restoring proxy host:", proxy_host);
  proxy_port = restoredSettings.proxy_port;
  console.log("restoring proxy port:", proxy_port);
  control_host = restoredSettings.control_host;
  console.log("restoring control host:", control_host);
  control_port = restoredSettings.control_port;
  console.log("restoring control port:", control_port);
}

chrome.storage.local.get(function(got) {
  checkStoredSettings(got);
  update(got);
  setupProxy();
});

// Theme all currently open windows
if (!isDroid()) {
  browser.windows.getAll().then(wins => wins.forEach(themeWindow));
}
