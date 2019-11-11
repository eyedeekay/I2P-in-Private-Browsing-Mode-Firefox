function isDroid() {
  var gettingInfo = browser.runtime.getPlatformInfo();
  gettingInfo.then(got => {
    if (got.os == "android") {
      return true;
    } else {
      return false;
    }
  });
}

function SetHostText() {
  var hostid = document.getElementById("hostText");
  hostid.textContent = chrome.i18n.getMessage("hostText");
}

function SetPortText() {
  var portid = document.getElementById("portText");
  portid.textContent = chrome.i18n.getMessage("portText");
}

function SetControlHostText() {
  var controlhostid = document.getElementById("controlHostText");
  controlhostid.textContent = chrome.i18n.getMessage("controlHostText");
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
        } else if (context.name == "fenced-default") {
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

function SetControlPortText() {
  var controlportid = document.getElementById("controlPortText");
  controlportid.textContent = chrome.i18n.getMessage("controlPortText");
}

function SetControlHelpText() {
  var portid = document.getElementById("controlHelpText");
  portid.textContent = chrome.i18n.getMessage("controlHelpText");
}

function getScheme() {
  const proxy_scheme = document.querySelector("#proxy_scheme");
  console.log("Got i2p proxy scheme:", proxy_scheme.value);
  if (proxy_scheme == "HTTP") {
    return "http";
  }
  if (proxy_scheme == "SOCKS") {
    return "socks";
  }
  return proxy_scheme.value;
}

function getHost() {
  proxy_host = document.getElementById("host").value;
  console.log("Got i2p proxy host:", proxy_host);
  if (proxy_host == undefined) {
    return "127.0.0.1";
  }
  return proxy_host;
}

function getPort() {
  proxy_port = document.getElementById("port").value;
  console.log("Got i2p proxy port:", proxy_port);
  if (proxy_port == undefined) {
    return "4444";
  }
  return proxy_port;
}

function getControlHost() {
  control_host = document.getElementById("controlhost").value;
  console.log("Got i2p control host:", control_host);
  if (control_host == undefined) {
    return "127.0.0.1";
  }
  return control_host;
}

function getControlPort() {
  control_port = document.getElementById("controlport").value;
  console.log("Got i2p control port:", control_port);
  if (control_port == undefined) {
    return "4444";
  }
  return control_port;
}

function checkStoredSettings(storedSettings) {
  function gotProxyInfo(info) {
    let defaultSettings = {};
    let host = info.value.http.split(":")[0];
    let port = info.value.http.split(":")[1];
    console.log("proxy", "'" + host + "'", ":", port);
    if (!storedSettings.proxy_scheme) {
      defaultSettings["proxy_scheme"] = "http";
    }
    if (!storedSettings.proxy_host) {
      if (host == "") {
        defaultSettings["proxy_host"] = "127.0.0.1";
      } else {
        defaultSettings["proxy_host"] = host;
      }
    } else {
      if (host != "") {
        defaultSettings["proxy_host"] = host;
      } else {
        defaultSettings["proxy_host"] = storedSettings.proxy_host;
      }
    }
    if (!storedSettings.proxy_port) {
      if (port == undefined) {
        defaultSettings["proxy_port"] = 4444;
      } else {
        defaultSettings["proxy_port"] = port;
      }
    } else {
      if (port != undefined) {
        defaultSettings["proxy_port"] = port;
      } else {
        defaultSettings["proxy_port"] = storedSettings.proxy_port;
      }
    }
    if (!storedSettings.control_host) {
      if (host == "") {
        defaultSettings["control_host"] = "127.0.0.1";
      } else {
        defaultSettings["control_host"] = host;
      }
    } else {
      if (host != "") {
        defaultSettings["control_host"] = host;
      } else {
        defaultSettings["control_host"] = storedSettings.control_host;
      }
    }
    if (!storedSettings.control_port) {
      if (port == undefined) {
        defaultSettings["control_port"] = 4444;
      } else {
        defaultSettings["control_port"] = port;
      }
    } else {
      if (port != undefined) {
        defaultSettings["control_port"] = port;
      } else {
        defaultSettings["control_port"] = storedSettings.control_port;
      }
    }
    console.log("(browserinfo) NATIVE PROXYSETTINGS", info.value);
    console.log(
      defaultSettings["proxy_host"],
      defaultSettings["proxy_port"],
      defaultSettings["control_host"],
      defaultSettings["control_port"]
    );
    chrome.storage.local.set(defaultSettings);
  }
  var gettingInfo = browser.proxy.settings.get({});
  gettingInfo.then(gotProxyInfo);
}

function onError(e) {
  console.error(e);
}

function storeSettings() {
  let proxy_scheme = getScheme();
  let proxy_host = getHost();
  let proxy_port = getPort();
  let control_host = getControlHost();
  let control_port = getControlPort();
  chrome.storage.local.set({
    proxy_scheme,
    proxy_host,
    proxy_port,
    control_host,
    control_port
  });
  console.log("storing proxy scheme:", proxy_scheme);
  console.log("storing proxy host:", proxy_host);
  console.log("storing proxy port:", proxy_port);
  console.log("storing control host:", control_host);
  console.log("storing control port:", control_port);
  setupProxy();
}

function updateUI(restoredSettings) {
  const selectList = document.querySelector("#proxy_scheme");
  selectList.value = restoredSettings.proxy_scheme;
  console.log("showing proxy scheme:", selectList.value);

  const hostitem = document.getElementById("host");
  hostitem.value = restoredSettings.proxy_host;
  console.log("showing proxy host:", hostitem.value);

  const portitem = document.getElementById("port");
  portitem.value = restoredSettings.proxy_port;
  console.log("showing proxy port:", portitem.value);

  const controlhostitem = document.getElementById("controlhost");
  controlhostitem.value = restoredSettings.control_host;
  console.log("showing control host:", controlhostitem.value);

  const controlportitem = document.getElementById("controlport");
  controlportitem.value = restoredSettings.control_port;
  console.log("showing control port:", controlportitem.value);

  SetHostText();
  SetPortText();
  SetControlHostText();
  SetControlPortText();
  SetControlHelpText();
  setupProxy();
}

function onError(e) {
  console.error(e);
}
chrome.storage.local.get(function(got) {
  checkStoredSettings(got);
  updateUI(got);
});

const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);

//EXPERIMENTAL: Open in I2P Tab
