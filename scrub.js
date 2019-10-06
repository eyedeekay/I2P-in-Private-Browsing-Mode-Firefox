
var contextScrub = async function(requestDetails) {
    console.log("(scrub)Scrubbing info from contextualized request");
    try {
        var headerScrub = function(context) {
            if (!context) {
                console.error("Context not found");
            } else {
                if (context.name = "i2pbrowser") {
                    var ua = "MYOB/6.66 (AN/ON)";
                    for (var header of requestDetails.requestHeaders) {
                        if (header.name.toLowerCase() === "user-agent") {
                            header.value = ua;
                            console.log("(scrub)User-Agent header modified", header.value)
                        }
                    }
                    return {
                        requestHeaders: requestDetails.requestHeaders
                    };
                }
            }
        }
        var contextGet = async function(tabInfo){
            try {
                console.log("(scrub)Tab info from Function", tabInfo)
                context = await browser.contextualIdentities.get(tabInfo.cookieStoreId)
                return context
            } catch(error) {
                console.log("(scrub)Conext Error", error)
            }
        }
        var tabGet = async function(tabId) {
            try {
                console.log("(scrub)Tab ID from Request", tabId)
                let tabInfo = await browser.tabs.get(tabId)
                return tabInfo
            }catch(error){
                console.log("(scrub)Tab error", error)
            }
        }
        if (requestDetails.tabId > 0) {
            var tab = tabGet(requestDetails.tabId)
            var context = tab.then(contextGet)
            var req = await context.then(headerScrub)
            console.log("(scrub)Returning I2P Proxy", req)
            return req
        }
    } catch (error) {
        console.log("(scrub)Not using I2P Proxy.", error);
    }
}

browser.webRequest.onBeforeSendHeaders.addListener(
    contextScrub,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
);
