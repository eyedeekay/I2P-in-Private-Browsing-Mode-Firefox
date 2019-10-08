var contextScrub = async function(requestDetails) {
  console.log("(scrub)Scrubbing info from contextualized request");
  try {
    var headerScrub = function(context) {
      if (!context) {
        console.error("Context not found");
      } else {
        if ((context.name = "i2pbrowser")) {
          var ua = "MYOB/6.66 (AN/ON)";
          for (var header of requestDetails.requestHeaders) {
            if (header.name.toLowerCase() === "user-agent") {
              header.value = ua;
              console.log("(scrub)User-Agent header modified", header.value);
            }
          }
          return {
            requestHeaders: requestDetails.requestHeaders
          };
        }
      }
    };
    var contextGet = async function(tabInfo) {
      try {
        console.log("(scrub)Tab info from Function", tabInfo);
        context = await browser.contextualIdentities.get(tabInfo.cookieStoreId);
        return context;
      } catch (error) {
        console.log("(scrub)Conext Error", error);
      }
    };
    var tabFind = async function(tabId) {
      try {
        context = await browser.contextualIdentities.query({
          name: "i2pbrowser"
        });
        tabId.cookieStoreId = context[0].cookieStoreId;
        console.log("(scrub) forcing context", tabId.cookieStoreId);
        return tabId;
      } catch (error) {
        console.log("(scrub)Context Error", error);
      }
    };
    var tabGet = async function(tabId) {
      try {
        console.log("(scrub)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        console.log("(scrub)Tab error", error);
      }
    };
    if (requestDetails.tabId > 0) {
      if (i2pHost(requestDetails.url)) {
        console.log("(Proxy)I2P URL detected, ");
        var tab = tabGet(requestDetails.tabId);
        var mtab = tab.then(tabFind);
        requestDetails.tabId = mtab;
        var context = mtab.then(contextGet);
        var req = await context.then(headerScrub);
        console.log("(scrub)Scrubbing I2P Request", req);
        return req;
      } else {
        var tab = tabGet(requestDetails.tabId);
        var context = tab.then(contextGet);
        var req = await context.then(headerScrub);
        console.log("(scrub)Scrubbing I2P Request", req);
        return req;
      }
    }
  } catch (error) {
    console.log("(scrub)Not scrubbing non-I2P request.", error);
  }
};

var contextSetup = async function(requestDetails) {
  console.log("(isolate)Forcing I2P requests into context");
  try {
    var tabFind = async function(tabId) {
      try {
        context = await browser.contextualIdentities.query({
          name: "i2pbrowser"
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log(
            "(isolate) forcing",
            requestDetails.url,
            " context",
            tabId.cookieStoreId,
            context[0].cookieStoreId
          );
          function Create(window) {
            function onCreated(tab) {
              console.log("(isolate) Closing old, un-isolated tab");
              browser.tabs.remove(tabId.id);
              browser.tabs.remove(window.tabs[0].id);
            }
            function onError(error) {
              console.log(`Error: ${error}`);
            }
            created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
              windowId: window.id
            });
            created.then(onCreated, onError);
          }
          getting = browser.windows.create();
          getting.then(Create);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var routerTabFind = async function(tabId) {
      try {
        context = await browser.contextualIdentities.query({
          name: "routerconsole"
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log(
            "(isolate) forcing",
            requestDetails.url,
            " context",
            tabId.cookieStoreId,
            context[0].cookieStoreId
          );
          function Create(window) {
            function onCreated(tab) {
              console.log("(isolate) Closing old, un-isolated tab");
              browser.tabs.remove(tabId.id);
              browser.tabs.remove(window.tabs[0].id);
            }
            function onError(error) {
              console.log(`Error: ${error}`);
            }
            created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url,
              windowId: window.id
            });
            created.then(onCreated, onError);
          }
          getting = browser.windows.create();
          getting.then(Create);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var tabGet = async function(tabId) {
      try {
        console.log("(isolate)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        console.log("(isolate)Tab error", error);
      }
    };
    if (requestDetails.tabId > 0) {
      if (i2pHost(requestDetails.url)) {
        var tab = tabGet(requestDetails.tabId);
        var mtab = tab.then(tabFind);
        return requestDetails;
      }
      if (routerHost(requestDetails.url)) {
        var tab = tabGet(requestDetails.tabId);
        var mtab = tab.then(routerTabFind);
        return requestDetails;
      }
    }
  } catch (error) {
    console.log(
      "(isolate)Not an I2P request, no need to force into alternate cookiestore.",
      error
    );
  }
};

function i2pHost(url) {
  let hostname = "";
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  return hostname.endsWith(".i2p");
}

function routerHost(url) {
  let hostname = "";
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  if (hostname === "127.0.0.1:7657") {
    return true;
  } else if (hostname === "localhost:7657") {
    return true;
  }
  return false;
}

browser.webRequest.onBeforeRequest.addListener(
  contextSetup,
  { urls: ["<all_urls>"] },
  ["blocking"]
);

browser.webRequest.onBeforeSendHeaders.addListener(
  contextScrub,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);
