
function isFirefox() {
    testPlain = navigator.userAgent.indexOf('Firefox') !== -1;
    if (testPlain) {
        return testPlain
    }
    testTorBrowser = navigator.userAgent.indexOf('Tor') !== -1;
    if (testTorBrowser) {
        return testTorBrowser
    }
    return false
}

function setupProxy() {

    let proxy_scheme = "http"
    let proxy_host = "127.0.0.1"
    let proxy_port = 4444

    var defaultSettings = {
        proxy_scheme: proxy_scheme,
        proxy_value: [proxy_host, proxy_port]
    };

    function checkStoredSettings(storedSettings) {
        if (!storedSettings.proxy_scheme || !storedSettings.proxy_value) {
            browser.storage.local.set(defaultSettings);
        }
    }

    function onError(e) {
      console.error(e);
    }

    const gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(checkStoredSettings, onError);

    if (isFirefox()) {
        if (proxy_scheme == "http") {
            var proxySettings = {
                proxyType: "manual",
                http: proxy_host+":"+proxy_port,
                passthrough: "",
                httpProxyAll: true
            };
            browser.proxy.settings.set({value:proxySettings});
            console.log("i2p settings created for Firefox")
        }
    }else{
        var config = {
            mode: "fixed_servers",
            rules: {
                proxyForHttp: {
                    scheme: proxy_scheme,
                    host: proxy_host,
                    port: proxy_port
                },
                proxyForFtp: {
                    scheme: proxy_scheme,
                    host: proxy_host,
                    port: proxy_port
                },
                proxyForHttps: {
                    scheme: proxy_scheme,
                    host: proxy_host,
                    port: proxy_port
                },
                fallbackProxy: {
                    scheme: proxy_scheme,
                    host: proxy_host,
                    port: proxy_port
                }
            }
        };
        chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {});
        console.log("i2p settings created for Chromium")
    }

}


/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {

  function getSince() {
    const proxy_scheme = document.querySelector("#proxy_scheme");
    return proxy_scheme.value;
  }

  function getHost() {
    let proxy_host = "";
    const textboxes = document.querySelectorAll(".proxy-options [type=text]");
    for (let item of textboxes) {
      if (item.getAttribute("data") == "host") {
        proxy_host = item.getAttribute("value");
      }
    }
    return proxy_host;
  }

  function getPort() {
    let proxy_port = "";
    const textboxes = document.querySelectorAll(".proxy-options [type=text]");
    for (let item of textboxes) {
      if (item.getAttribute("data") == "port") {
        proxy_port = item.getAttribute("value");
      }
    }
    return proxy_port;
  }

  const proxy_scheme = getSince();
  const proxy_host = getHost();
  const proxy_port = getPort();
  browser.storage.local.set({
    proxy_scheme,
    proxy_host,
    proxy_port,
  });
  setupProxy()
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
  const selectList = document.querySelector("#proxy_scheme");
  selectList.value = restoredSettings.proxy_scheme;

  const textboxes = document.querySelectorAll(".proxy-options [type=text]");
  for (let item of textboxes) {
    if (restoredSettings.proxy_value.indexOf(item.getAttribute("data")) != -1) {
      item.value = restoredSettings.proxy_value.indexOf(item.getAttribute("value"));
    }
    if (restoredSettings.proxy_value.indexOf(item.getAttribute("data")) != -1 ) {
      item.value = restoredSettings.proxy_value.indexOf(item.getAttribute("value"));
    }
  }
}

function onError(e) {
  console.error(e);
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

/*
On clicking the save button, save the currently selected settings.
*/
const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);

