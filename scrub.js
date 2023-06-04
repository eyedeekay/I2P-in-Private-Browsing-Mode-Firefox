/* eslint-disable max-len */
var titlepref = chrome.i18n.getMessage("titlePreface");
var webpref = chrome.i18n.getMessage("webPreface");
var routerpref = chrome.i18n.getMessage("routerPreface");
var mailpref = chrome.i18n.getMessage("mailPreface");
var torrentpref = chrome.i18n.getMessage("torrentPreface");
var tunnelpref = chrome.i18n.getMessage("i2ptunnelPreface");
var ircpref = chrome.i18n.getMessage("ircPreface");
var extensionpref = chrome.i18n.getMessage("extensionPreface");
var muwirepref = chrome.i18n.getMessage("muwirePreface");
var botepref = chrome.i18n.getMessage("botePreface");
var blogpref = chrome.i18n.getMessage("blogPreface");
var blogprefpriv = chrome.i18n.getMessage("blogPrefacePrivate");
var torpref = chrome.i18n.getMessage("torPreface");
var torprefpriv = chrome.i18n.getMessage("torPrefacePrivate");

function contextScrub(requestDetails) {
  function handleHeaderError() {
    // log error message
    console.log("Error: Header could not be scrubbed");
  }
  function headerScrub() {
    const titlePrefix = "myob";
    const userAgent = "MYOB/6.66 (AN/ON)";
    if (requestDetails && requestDetails.name === titlePrefix) {
      for (const header of requestDetails.requestHeaders) {
        if (header.name.toLowerCase() === "user-agent") {
          header.value = userAgent;
        }
      }
      return { requestHeaders: requestDetails.requestHeaders };
    }
  }
  async function getContext(tabInfo) {
    try {
      const context = await browser.contextualIdentities.get(
        tabInfo.cookieStoreId
      );
      return context;
    } catch (error) {
      return undefined;
    }
  }
  try {
    if (requestDetails.tabId > 0) {
      let tab = getTab(requestDetails.tabId);
      let context = tab.then(getContext, handleHeaderError);
      let req = context.then(headerScrub, handleHeaderError);
      return req;
    }
  } catch (error) {
    console.log("(scrub)Not scrubbing non-I2P request.", error);
  }
}

async function getTab(tabId) {
  try {
    let tabInfo = await browser.tabs.get(tabId);
    return tabInfo;
  } catch (error) {
    return undefined;
  }
}

function i2pTabFind(tabId) {
  console.info("(isolate)Context Discovery browser", tabId);
  try {
    return forceIntoIsolation(tabId, titlepref, false);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}
function routerTabFind(tabId) {
  console.info("(isolate)Context Discovery console");
  try {
    return forceIntoIsolation(tabId, routerpref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}
function i2ptunnelTabFind(tabId) {
  console.info("(isolate)Context Discovery browser");
  try {
    return forceIntoIsolation(tabId, tunnelpref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}

function muwireTabFind(tabId) {
  console.info("(isolate)Context Discovery muwire");
  try {
    return forceIntoIsolation(tabId, muwirepref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}
function i2pboteTabFind(tabId) {
  console.info("(isolate)Context Discovery bote");
  try {
    return forceIntoIsolation(tabId, botepref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}
function mailTabFind(tabId) {
  console.info("(isolate)Context Discovery mail");
  try {
    return forceIntoIsolation(tabId, mailpref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}
function ircTabFind(tabId) {
  console.info("(isolate)Context Discovery irc");
  try {
    return forceIntoIsolation(tabId, ircpref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}
function torTabFind(tabId) {
  console.info("(isolate)Context Discovery tor");
  try {
    return forceIntoIsolation(tabId, torpref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}
function blogTabFind(tabId) {
  console.info("(isolate)Context Discovery blog");
  try {
    return forceIntoIsolation(tabId, blogpref, true);
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}

async function forceIntoIsolation(tabId, contextidentifier, pin = true) {
  console.info("(isolate) forcing context for", tabId, contextidentifier, pin);
  try {
    var context = await browser.contextualIdentities.query({
      name: contextidentifier
    });
    if (tabId.cookieStoreId != context[0].cookieStoreId) {
      function Create(beforeTab) {
        console.info("(isolate) isolating before tab:", beforeTab);
        function onCreated(afterTab) {
          console.info("(isolate) created isolated tab:", afterTab);
          function closeOldTab(tabs) {
            console.info("(isolate) cleaning up tab:", beforeTab);
            console.info(
              "(isolate) Closing un-isolated tab",
              tabId.id,
              "in favor of",
              beforeTab.id,
              "with context",
              beforeTab.cookieStoreId
            );
            browser.tabs.remove(tabId.id);
            if (pin) {
              browser.tabs.move(beforeTab.id, { index: 0 });
              for (let index = 0; index < tabs.length; index++) {
                if (index != tabs.length - 1) {
                  browser.tabs.remove(tabs[index].id);
                }
              }
            }
            browser.pageAction.setPopup({
              tabId: tabId.id,
              popup: "security.html"
            });
            browser.pageAction.show(tabId.id);
          }
          var pins = browser.tabs.query({
            cookieStoreId: context[0].cookieStoreId
          });
          pins.then(closeOldTab, onScrubError);
          return afterTab;
        }
        var created = browser.tabs.create({
          active: true,
          cookieStoreId: context[0].cookieStoreId,
          url: beforeTab.url,
          pinned: pin
        });
        return created.then(onCreated, onContextError);
      }
      var gettab = browser.tabs.get(tabId.id);
      var tab = gettab.then(Create, onContextError);
      return tab;
    }
  } catch (error) {
    console.error("(isolate)Context Error", error);
  }
}

async function findOtherContexts() {
  const prefs = [
    "titlepref",
    "routerpref",
    "mailpref",
    "torrentpref",
    "tunnelpref",
    "ircpref",
    "muwirepref",
    "botepref",
    "blogpref",
    "torpref"
  ];
  const contexts = await browser.contextualIdentities.query({});
  const myContexts = await Promise.all(
    prefs.map(pref => browser.contextualIdentities.query({ name: pref }))
  );
  const otherContexts = contexts.filter(
    context => !myContexts.some(
        myContext => myContext[0].cookieStoreId === context.cookieStoreId
      )
  );
  return otherContexts;
}

function contextSetup(requestDetails) {
  async function findSnarkTab(tabId) {
    console.info("(isolate)Context Discovery torrents", tabId);
    try {
      var context = await browser.contextualIdentities.query({
        name: torrentpref
      });
      if (tabId) {
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          var exemptContext = await browser.contextualIdentities.query({
            name: titlepref
          });
          let tmp = new URL(tabId.url);
          console.log("(isolate)tabid host", tmp.host, exemptContext);
          if (
            !requestDetails.url.includes("snark/" + tmp.host) &&
            tabId.cookieStoreId != exemptContext[0].cookieStoreId
          ) {
            function Create() {
              function onCreated(currentTab) {
                function closeOldTabs(tabs) {
                  for (let ti = 0; ti < tabs.length - 1; ti++) {
                    browser.tabs.remove(tabs[ti].id);
                  }
                  browser.tabs.query({}).then(allTabs => {
                    for (const innerTab of allTabs) {
                      if (innerTab.id !== currentTab.id && innerTab.cookieStoreId === context[0].cookieStoreId) {
                        browser.tabs.remove(innerTab.id);
                      }
                    }
                    browser.tabs.move(currentTab.id, { index: 0 });
                  });
                }
                const pins = browser.tabs.query({
                  cookieStoreId: context[0].cookieStoreId
                });
                pins.then(closeOldTabs, onScrubError);
              }
              if (requestDetails.url.endsWith("xhr1.html")) {
                let hostname = requestDetails.url.split("/")[2];
                let prefix = requestDetails.url.substr(0, requestDetails.url.indexOf("://") + 3);
                requestDetails.url = prefix + hostname + "/i2psnark/";
                return;
              }
              var created = browser.tabs.create({
                active: true,
                pinned: true,
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
      }
    } catch (error) {
      console.log("(isolate)Context Error", error);
    }
  }
  try {
    async function tabGet(tabId) {
      try {
        //console.log("(isolate)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        console.log("(isolate)Tab error", error);
      }
    }
    if (requestDetails == undefined) {
      return requestDetails;
    }
    if (isProxyHost(requestDetails)) {
      let setcookie = browser.cookies.set({
        firstPartyDomain: i2pHostName(requestDetails.url),
        url: requestDetails.url,
        secure: true
      });
      setcookie.then(onContextGotLog, onContextError);
      return requestDetails;
    }

    if (requestDetails.tabId > 0) {
      var tab = tabGet(requestDetails.tabId);
      tab.then(isolate);

      function isolate() {
        const url = requestDetails.url;
        const localhost = isLocalHost(url);
        const routerhost = isRouterHost(url);
        console.info("routerhost:", routerhost);
        console.info("localhost:", localhost);
        function tabUpdate(outboundTab) {
          if (outboundTab) {
            console.info("updating", outboundTab);
            browser.tabs.update(outboundTab.id, { url });
          }
        }
        if (routerhost) {
          let routertab = {};
          switch (routerhost) {
            case "i2ptunnelmgr":
              routertab = tab.then(i2ptunnelTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            case "i2psnark":
              routertab = tab.then(findSnarkTab, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            case "webmail":
              routertab = tab.then(mailTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            case "muwire":
              routertab = tab.then(muwireTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            case "i2pbote":
              routertab = tab.then(i2pboteTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            case "routerconsole":
              routertab = tab.then(routerTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            default:
              return requestDetails;
          }
        } else if (localhost) {
          let routertab = {};
          switch (localhost) {
            case "blog":
              routertab = tab.then(blogTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            case "irc":
              routertab = tab.then(ircTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            case "tor":
              routertab = tab.then(torTabFind, onContextError);
              routertab.then(tabUpdate);
              return requestDetails;
            default:
              return requestDetails;
          }
        } else if (i2pHost(requestDetails)) {
          const thn = i2pHostName(url);
          if (url.includes("=" + thn)) {
            if (
              !url.includes("://github.com") ||
              !url.includes("://notabug.org") ||
              !url.includes("://i2pgit.org") ||
              !url.includes("://gitlab.com")
            ) {
              console.log("(scrub)checking search hostnames =" + thn);
              const tpt = url.split("=" + thn, 2);
              requestDetails.url =
                "http://" + thn + "/" + tpt[1].replace("%2F", "");
            }
          }
          console.log("(scrub) new hostname", url);
          const setcookie = browser.cookies.set({
            firstPartyDomain: i2pHostName(url),
            url,
            secure: true
          });
          setcookie.then(onContextGotLog, onContextError);
          const i2ptab = tab.then(i2pTabFind, onContextError);
          i2ptab.then(tabUpdate);
          return requestDetails;
        } else if (isExtensionHost(requestDetails)) {
          return requestDetails;
        }
      }
    }
  } catch (error) {
    console.log("(isolate)Not an I2P request, blackholing", error);
  }
}

function coolheadersSetup(incomingHeaders) {
  var asyncSetPageAction = new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (incomingHeaders.tabId != undefined) {
        let popup = browser.pageAction.getPopup({
          tabId: incomingHeaders.tabId
        });
        popup.then(gotPopup);
      }

      resolve({ responseHeaders: incomingHeaders.responseHeaders });
    }, 2000);
  });
  return asyncSetPageAction;
}

function getTabURL(tab) {
  console.log("(scrub)(equiv check) popup check", tab);

  if (tab.id != undefined) {
    let popup = browser.pageAction.getPopup({ tabId: tab.id });
    console.log("(scrub)(equiv check) popup check");
    popup.then(gotPopup);
  }
}

function gotPopup(pageTest, tab) {
  if (pageTest === undefined) {
    return;
  }
  console.info("pageTest:", pageTest);
  let isHttps = false;
  let isI2p = false;
  if (tab === undefined) {
    return;
  }
  isHttps = tab.url.startsWith("https://");
  isI2p = tab.url.includes(".i2p");
  if (isHttps) {
    if (isI2p) {
      browser.pageAction.setPopup({
        tabId: tab.id,
        popup: "security.html"
      });
      browser.pageAction.setIcon({
        path: "icons/infotoopies.png",
        tabId: tab.id
      });

      try {
        browser.tabs
          .sendMessage(tab.id, { req: "i2p-torrentlocation" })
          .then(response => {
            if (
              response &&
              response.content.toUpperCase() !== "NO-ALT-LOCATION"
            ) {
              browser.pageAction.setPopup({
                tabId: tab.id,
                popup: "torrent.html"
              });
              browser.pageAction.setIcon({
                path: "icons/infotoopiesbt.png",
                tabId: tab.id
              });
              browser.pageAction.setTitle({
                tabId: tab.id,
                title: response.content
              });
              browser.pageAction.show(tab.id);
            }
          });
      } catch (err) {
        console.error("(scrub)(equiv check)", err);
      }
    } else {
      try {
        browser.tabs
          .sendMessage(tab.id, { req: "i2p-location" })
          .then(response => {
            if (
              response &&
              response.content.toUpperCase() !== "NO-ALT-LOCATION"
            ) {
              browser.pageAction.setPopup({
                tabId: tab.id,
                popup: "location.html"
              });
              browser.pageAction.setIcon({
                path: "icons/i2plogo.png",
                tabId: tab.id
              });
              browser.pageAction.setTitle({
                tabId: tab.id,
                title: response.content
              });
              browser.pageAction.show(tab.id);
            }
          });
      } catch (err) {
        console.error("(scrub)(equiv check)", err);
      }
    }
  } else {
    if (isI2p) {
      browser.pageAction.setPopup({
        tabId: tab.id,
        popup: "security.html"
      });
      browser.pageAction.setIcon({
        path: "icons/infotoopie.png",
        tabId: tab.id
      });
    }

    try {
      browser.tabs
        .sendMessage(tab.id, { req: "i2p-torrentlocation" })
        .then(response => {
          if (
            response &&
            response.content.toUpperCase() !== "NO-ALT-LOCATION"
          ) {
            browser.pageAction.setPopup({
              tabId: tab.id,
              popup: "torrent.html"
            });
            browser.pageAction.setIcon({
              path: "icons/infotoopiebt.png",
              tabId: tab.id
            });
            browser.pageAction.setTitle({
              tabId: tab.id,
              title: response.content
            });
            browser.pageAction.show(tab.id);
          }
        });
    } catch (err) {
      console.error("(pageaction)", err);
    }
  }
}

function getClearTab(tab) {
  function setupTabs() {
    if (typeof tab === "number") {
      browser.tabs.get(tab).then(getTabURL, onScrubError);
    } else if (typeof tab === "object" && typeof tab.tabId === "number") {
      browser.tabs.get(tab.tabId).then(getTabURL, onScrubError);
    } else if (typeof tab === "object" && Array.isArray(tab.tabIds)) {
      for (let tabId of tab.tabIds) {
        browser.tabs.get(tabId).then(getTabURL, onScrubError);
      }
    }
  }
  if (tab === undefined) {
    browser.tabs.query({}).then(setupTabs);
  } else {
    setupTabs();
  }
}

const filter = {
  url: [{ hostContains: ".i2p" }]
};

function logOnDOMContentLoaded(details) {
  console.log(`onDOMContentLoaded: ${details.url}`);
}

browser.tabs.onActivated.addListener(getClearTab);
browser.tabs.onAttached.addListener(getClearTab);
browser.tabs.onCreated.addListener(getClearTab);
browser.tabs.onDetached.addListener(getClearTab);
browser.tabs.onHighlighted.addListener(getClearTab);
browser.tabs.onMoved.addListener(getClearTab);
browser.tabs.onReplaced.addListener(getClearTab);

browser.pageAction.onClicked.addListener(getClearTab);

function reloadTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.reload(tab.id);
  }
}

function reloadError(error) {
  console.log(`Error: ${error}`);
}

let querying = browser.tabs.query({});
querying.then(reloadTabs, onScrubError);

/* Listen for onHeaderReceived for the target page.
   Set "blocking" and "responseHeaders". */
browser.webRequest.onHeadersReceived.addListener(
  coolheadersSetup,
  { urls: [
"*://*.i2p/*",
"https://*/*"
] },
  ["responseHeaders"]
);

browser.webNavigation.onDOMContentLoaded.addListener(getClearTab, filter);
browser.webNavigation.onDOMContentLoaded.addListener(
  logOnDOMContentLoaded,
  filter
);

browser.webRequest.onBeforeRequest.addListener(contextSetup, {
  urls: [
"*://*.i2p/*",
"*://localhost/*",
"*://127.0.0.1/*",
"*://*/*i2p*"
]
});

browser.webRequest.onBeforeSendHeaders.addListener(
  contextScrub,
  { urls: ["*://*.i2p/*"] },
  ["requestHeaders"]
);

function onScrubError(err) {
  console.error(err);
}

function onContextGotLog(log) {
  console.log(log);
}

function onContextError(err) {
  console.error("Context launcher error:", err);
}
