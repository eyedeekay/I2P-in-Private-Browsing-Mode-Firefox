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
function isDroid() {
    testPlain = navigator.userAgent.indexOf('Android') !== -1;
    if (testPlain) {
        return testPlain
    }
    return false
}

if (isFirefox()) {
    browser.privacy.network.peerConnectionEnabled.set({value: false});
}
chrome.privacy.network.networkPredictionEnabled.set({value: false});
chrome.privacy.network.webRTCIPHandlingPolicy.set({value: "disable_non_proxied_udp"});

console.log("Preliminarily disabled WebRTC.")

var controlHost = "127.0.0.1" //getControlHost()
var controlPort = "7951" //getControlPort();


function setupProxy() {
    var controlHost = getControlHost();
    var controlPort = getControlPort();
    if (isFirefox()) {
        if (isDroid()) {
            if (getPort() == "7950") {
                browser.proxy.register("android-ext.pac");
            }else{
                browser.proxy.register("android.pac");
            }
        }else{
            if (getScheme() == "http") {
                var proxySettings = {
                    proxyType: "manual",
                    http: getHost()+":"+getPort(),
                    passthrough: "",
                    httpProxyAll: true
                };
                chrome.proxy.settings.set({value:proxySettings});
                console.log("i2p settings created for Firefox")
            }
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


if (isFirefox()){
    // Theme all currently open windows
    browser.windows.getAll().then(wins => wins.forEach(themeWindow));
}
