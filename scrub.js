var titlepref = chrome.i18n.getMessage("titlePreface");
var webpref = chrome.i18n.getMessage("webPreface");
var routerpref = chrome.i18n.getMessage("routerPreface");
var mailpref = chrome.i18n.getMessage("mailPreface");
var torrentpref = chrome.i18n.getMessage("torrentPreface");
var tunnelpref = chrome.i18n.getMessage("i2ptunnelPreface");
var localpref = chrome.i18n.getMessage("localPreface");
var extensionpref = chrome.i18n.getMessage("extensionPreface");

var contextScrub = async function(requestDetails) {
  function onHeaderError() {
    console.log("Header scrub error");
  }
  console.log("(scrub)Scrubbing info from contextualized request");
  try {
    var headerScrub = function(context) {
      var ua = "MYOB/6.66 (AN/ON)";
      if (!context) {
        console.log("Context not found", context);
      } else if (context.name == titlepref) {
        if (i2pHost(requestDetails.url)) {
          for (var header of requestDetails.requestHeaders) {
            if (header.name.toLowerCase() === "user-agent") {
              header.value = ua;
              console.log("(scrub)User-Agent header modified", header.value);
            }
          }
        }
        return {
          requestHeaders: requestDetails.requestHeaders
        };
      } else if (context.name == routerpref) {
        if (i2pHost(requestDetails.url)) {
          for (var header of requestDetails.requestHeaders) {
            if (header.name.toLowerCase() === "user-agent") {
              header.value = ua;
              console.log("(scrub)User-Agent header modified", header.value);
            }
          }
        }
        return {
          requestHeaders: requestDetails.requestHeaders
        };
      }
    };
    var contextGet = async function(tabInfo) {
      try {
        console.log("(scrub)Tab info from Function", tabInfo);
        let context = await browser.contextualIdentities.get(
          tabInfo.cookieStoreId
        );
        return context;
      } catch (error) {
        return undefined;
      }
    };
    var tabGet = async function(tabId) {
      try {
        console.log("(scrub)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        return undefined;
      }
    };
    if (requestDetails.tabId > 0) {
      var tab = {};
      var context = {};
      var req = {};
      if (i2pHost(requestDetails.url)) {
        console.log("(scrub)I2P URL detected, ");
        tab = tabGet(requestDetails.tabId);
        context = tab.then(contextGet, onHeaderError);
        req = await context.then(headerScrub, onHeaderError);
        console.log("(scrub)Scrubbing I2P Request", req);
        return req;
      } else if (routerHost(requestDetails.url)) {
        tab = tabGet(requestDetails.tabId);
        context = tab.then(contextGet, onHeaderError);
        req = await context.then(headerScrub, onHeaderError);
        console.log("(scrub)Scrubbing non-I2P Request", req);
        return req;
      }
      return req;
    }
  } catch (error) {
    console.log("(scrub)Not scrubbing non-I2P request.", error);
  }
};

var contextSetup = function(requestDetails) {
  function onContextError() {
    console.log("Context launcher error");
  }
  console.log("(isolate)Forcing I2P requests into context");
  try {
    var i2pTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: titlepref
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log("(isolate) I2P context", context[0].cookieStoreId);
          console.log("tab context", tabId.cookieStoreId);
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (tabId.id != tab.id) {
                  console.log("(isolate) Closing un-isolated tab", tabId.id);
                  console.log("in favor of", tab.id);
                  console.log("with context", tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                }
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var routerTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: routerpref
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log("(isolate) I2P context", context[0].cookieStoreId);
          console.log("tab context", tabId.cookieStoreId);
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (tabId.id != tab.id) {
                  console.log("(isolate) Closing un-isolated tab", tabId.id);
                  console.log("in favor of", tab.id);
                  console.log("with context", tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                }
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var i2ptunnelTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: tunnelpref
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log("(isolate) I2P context", context[0].cookieStoreId);
          console.log("tab context", tabId.cookieStoreId);
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (tabId.id != tab.id) {
                  console.log("(isolate) Closing un-isolated tab", tabId.id);
                  console.log("in favor of", tab.id);
                  console.log("with context", tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                }
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var snarkTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: torrentpref
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log("(isolate) I2P context", context[0].cookieStoreId);
          console.log("tab context", tabId.cookieStoreId);
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (tabId.id != tab.id) {
                  console.log("(isolate) Closing un-isolated tab", tabId.id);
                  console.log("in favor of", tab.id);
                  console.log("with context", tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                }
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var mailTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: mailpref
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log("(isolate) I2P context", context[0].cookieStoreId);
          console.log("tab context", tabId.cookieStoreId);
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (tabId.id != tab.id) {
                  console.log("(isolate) Closing un-isolated tab", tabId.id);
                  console.log("in favor of", tab.id);
                  console.log("with context", tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                }
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var localTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: localpref
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          console.log("(isolate) I2P context", context[0].cookieStoreId);
          console.log("tab context", tabId.cookieStoreId);
          function Create() {
            function onCreated(tab) {
              function closeOldTab() {
                if (tabId.id != tab.id) {
                  console.log("(isolate) Closing un-isolated tab", tabId.id);
                  console.log("in favor of", tab.id);
                  console.log("with context", tab.cookieStoreId);
                  browser.tabs.remove(tabId.id);
                }
              }
              closeOldTab(tab);
            }
            var created = browser.tabs.create({
              active: true,
              cookieStoreId: context[0].cookieStoreId,
              url: requestDetails.url
            });
            created.then(onCreated, onContextError);
          }
          var gettab = browser.tabs.get(tabId.id);
          gettab.then(Create, onContextError);
          return tabId;
        }
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var anyTabFind = async function(tabId) {
      try {
        var context = await browser.contextualIdentities.query({
          name: webpref
        });
        console.log("(ISOLATE)", tabId.cookieStoreId);
        if (
          tabId.cookieStoreId == "firefox-default" ||
          tabId.cookieStoreId == "firefox-private"
        ) {
          if (tabId.cookieStoreId != context[0].cookieStoreId) {
            console.log("(isolate) I2P context", context[0].cookieStoreId);
            console.log("tab context", tabId.cookieStoreId);
            function Create() {
              function onCreated(tab) {
                function closeOldTab() {
                  if (tabId.id != tab.id) {
                    console.log("(isolate) Closing un-isolated tab", tabId.id);
                    console.log("in favor of", tab.id);
                    console.log("with context", tab.cookieStoreId);
                    browser.tabs.remove(tabId.id);
                  }
                }
                closeOldTab(tab);
              }
              var created = browser.tabs.create({
                active: true,
                cookieStoreId: context[0].cookieStoreId,
                url: requestDetails.url
              });
              created.then(onCreated, onContextError);
            }
            var gettab = browser.tabs.get(tabId.id);
            gettab.then(Create, onContextError);
            return tabId;
          }
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
    if (requestDetails == undefined) {
      return requestDetails;
    }
    if (proxyHost(requestDetails.url)) {
      setcookie = browser.cookies.set({
        firstPartyDomain: i2pHostName(requestDetails.url),
        url: requestDetails.url,
        secure: true
      });
      setcookie.then(onContextGotLog, onContextError);
      return requestDetails;
    }
    if (extensionHost(requestDetails)) {
      return requestDetails;
    }
    if (requestDetails.tabId > 0) {
      var tab = tabGet(requestDetails.tabId);
      if (i2pHost(requestDetails.url)) {
        var setcookie = browser.cookies.set({
          firstPartyDomain: i2pHostName(requestDetails.url),
          url: requestDetails.url,
          secure: true
        });
        setcookie.then(onContextGotLog, onContextError);
        var i2ptab = tab.then(i2pTabFind, onContextError);
        return requestDetails;
      }
      let localhost = localHost(requestDetails.url);
      let routerhost = routerHost(requestDetails.url);
      if (!routerhost) {
        if (localhost) {
          var localtab = tab.then(localTabFind, onContextError);
          return requestDetails;
        }
      }
      if (routerhost) {
        if (routerhost === "i2ptunnelmgr") {
          var tunneltab = tab.then(i2ptunnelTabFind, onContextError);
          return requestDetails;
        } else if (routerhost === "i2psnark") {
          var snarktab = tab.then(snarkTabFind, onContextError);
          return requestDetails;
        } else if (routerhost === "webmail") {
          var mailtab = tab.then(mailTabFind, onContextError);
          return requestDetails;
        } else if (routerhost === "routerconsole") {
          var routertab = tab.then(routerTabFind, onContextError);
          return requestDetails;
        }
      } else {
        return requestDetails;
      }
    }
  } catch (error) {
    console.log("(isolate)Not an I2P request, blackholing", error);
  }
};

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
