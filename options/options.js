
function getScheme() {
    const proxy_scheme = document.querySelector("#proxy_scheme");
    console.log("Got i2p proxy scheme:", proxy_scheme.value);
    return proxy_scheme.value;
}

function getHost() {
    proxy_host = document.getElementById("host").value
    console.log("Got i2p proxy host:", proxy_host);
    if (proxy_host == undefined){
        return "127.0.0.1"
    }
    return proxy_host;
}

function getPort() {
    proxy_port = document.getElementById("port").value
    console.log("Got i2p proxy port:", proxy_port);
    if (proxy_port == undefined){
        return 4444
    }
    return proxy_port;
}

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

function checkStoredSettings(storedSettings) {
    let defaultSettings = {};
    if (!storedSettings.proxy_scheme){
        defaultSettings["proxy_scheme"] = "http"
    }
    if (!storedSettings.proxy_host) {
        defaultSettings["proxy_host"] = "127.0.0.1"
    }
    if (!storedSettings.proxy_port) {
        defaultSettings["proxy_port"] = 4444
    }
    browser.storage.local.set(defaultSettings);
}

function onError(e) {
  console.error(e);
}

function setupProxy() {
    if (isFirefox()) {
        if (getScheme() == "http") {
            var proxySettings = {
                proxyType: "manual",
                http: getHost()+":"+getPort(),
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
                    scheme: getScheme(),
                    host: getHost(),
                    port: getPort()
                },
                proxyForFtp: {
                    scheme: getScheme(),
                    host: getHost(),
                    port: getPort()
                },
                proxyForHttps: {
                    scheme: getScheme(),
                    host: getHost(),
                    port: getPort()
                },
                fallbackProxy: {
                    scheme: getScheme(),
                    host: getHost(),
                    port: getPort()
                }
            }
        };
        chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {});
        console.log("i2p settings created for Chromium")
    }
}

function storeSettings() {
    let proxy_scheme = getScheme()
    let proxy_host = getHost()
    let proxy_port = getPort()
    browser.storage.local.set({
        proxy_scheme,
        proxy_host,
        proxy_port,
    });
    console.log("storing proxy host:", proxy_scheme)
    console.log("storing proxy host:", proxy_host)
    console.log("storing proxy port:", proxy_port)
    setupProxy()
}

function updateUI(restoredSettings) {

    const selectList = document.querySelector("#proxy_scheme")
    selectList.value = restoredSettings.proxy_scheme
    console.log("showing proxy scheme:", selectList.value)

    const hostitem = document.getElementById("host")
    hostitem.value = restoredSettings.proxy_host.getAttribute("value")
    console.log("showing proxy host:", hostitem.value)

    const portitem = document.getElementById("port")
    portitem.value = restoredSettings.proxy_port.getAttribute("value")
    console.log("showing proxy port:", portitem.value)


}

function onError(e) {
    console.error(e);
}

const assureStoredSettings = browser.storage.local.get();
assureStoredSettings.then(checkStoredSettings, onError);

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);

