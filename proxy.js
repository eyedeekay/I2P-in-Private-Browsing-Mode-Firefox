function isFirefox() {
    testPlain = navigator.userAgent.indexOf('Firefox') !== -1;
    if (testPlain) {
        console.log("firefox")
        return testPlain
    }
    return false
}

function isDroid() {
    var gettingInfo = browser.runtime.getPlatformInfo();
    gettingInfo.then((got) => {
        if (got.os == "android") {
            return true
        }
    });
}

if (isFirefox()) {
    browser.privacy.network.peerConnectionEnabled.set({value: false});
}
chrome.privacy.network.networkPredictionEnabled.set({value: false});
chrome.privacy.network.webRTCIPHandlingPolicy.set({value: "disable_non_proxied_udp"});

console.log("Preliminarily disabled WebRTC.")

function shouldProxyRequest(requestInfo) {
  return true; //requestInfo.parentFrameId != -1;
}

function setupProxy() {
    var controlHost = "127.0.0.1" //getControlHost()
    var controlPort = "7951" //getControlPort();
    var Host = "127.0.0.1" //getHost()
    var Port = "4444" //getPort()
    if (isDroid()) {
        console.log("Setting up Firefox Android proxy")
        function handleProxyRequest(requestInfo) {
            if (shouldProxyRequest(requestInfo)) {
            console.log(`Proxying: ${requestInfo.url}`);
                return {type: "http", host: Host, port: Port};
            }
            return {type: "http", host: Host, port: Port};
        }
        browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ["<all_urls>"]});
        console.log("i2p settings created for Firefox Android")
    }else{
        console.log("Setting up Firefox Desktop proxy")
        var proxySettings = {
            proxyType: "manual",
            http: Host+":"+Port,
            passthrough: "",
            httpProxyAll: true
        };
        browser.proxy.settings.set({value:proxySettings});
        console.log("i2p settings created for Firefox Desktop")
    }
}

if (isFirefox()){
    // Theme all currently open windows
    browser.windows.getAll().then(wins => wins.forEach(themeWindow));
}

if (isFirefox()) {
    setupProxy()
}
