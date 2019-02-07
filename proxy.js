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

browser.privacy.network.peerConnectionEnabled.set({value: false});
browser.privacy.network.networkPredictionEnabled.set({value: false});
browser.privacy.network.webRTCIPHandlingPolicy.set({value: "disable_non_proxied_udp"});

console.log("Preliminarily disabled WebRTC.")

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
