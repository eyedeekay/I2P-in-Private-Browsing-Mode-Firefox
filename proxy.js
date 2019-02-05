
var proxySettings = {
    proxyType: "manual",
    http: "http://127.0.0.1:4444",
    passthrough: "",
    httpProxyAll: true
};

browser.proxy.settings.set({value:proxySettings});
