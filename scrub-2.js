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
  async function getTab(tabId) {
    try {
      let tabInfo = await browser.tabs.get(tabId);
      return tabInfo;
    } catch (error) {
      return undefined;
    }
  }
  try {
    if (requestDetails.tabId > 0) {
      tab = getTab(requestDetails.tabId);
      context = tab.then(getContext, handleHeaderError);
      req = context.then(headerScrub, handleHeaderError);
      //console.log("(scrub)Scrubbing I2P Request", req);
      return req;
    }
  } catch (error) {
    console.log("(scrub)Not scrubbing non-I2P request.", error);
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
    prefs.map((pref) => browser.contextualIdentities.query({ name: pref }))
  );
  const otherContexts = contexts.filter(
    (context) =>
      !myContexts.some(
        (myContext) => myContext[0].cookieStoreId === context.cookieStoreId
      )
  );
  return otherContexts;
}

var contextSetup = function (requestDetails) {
  function onContextError() {
    console.error("Context launcher error");
  }
  async function forceIntoIsolation(tabId, contextidentifier, tab, pin = true) {
    console.info(
      "(isolate) forcing context for",
      tabId,
      contextidentifier,
      tab
    );
    try {
      var context = await browser.contextualIdentities.query({
        name: contextidentifier
      });
      if (tabId.cookieStoreId != context[0].cookieStoreId) {
        function Create() {
          function onCreated(tab) {
            function closeOldTab(tabs) {
              if (tabId.id != tab.id) {
                console.log(
                  "(isolate) Closing un-isolated tab",
                  tabId.id,
                  "in favor of",
                  tab.id,
                  "with context",
                  tab.cookieStoreId
                );
                browser.tabs.remove(tabId.id);
                if (pin) {
                  browser.tabs.move(tab.id, { index: 0 });
                  for (index = 0; index < tabs.length; index++) {
                    if (index != tabs.length - 1)
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
            pins.then(closeOldTab, onError);
            //            closeOldTab(tab);
          }
          var created = browser.tabs.create({
            active: true,
            cookieStoreId: context[0].cookieStoreId,
            url: requestDetails.url,
            pinned: pin
          });
          created.then(onCreated, onContextError);
        }
        var gettab = browser.tabs.get(tabId.id);
        gettab.then(Create, onContextError);
        return tabId;
      }
    } catch (error) {
      console.error("(isolate)Context Error", error);
    }
  }
  try {
    var i2pTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery browser");
      try {
        var context = await browser.contextualIdentities.query({
          name: titlepref
        });
        return forceIntoIsolation(tabId, titlepref, tab, false);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var routerTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery console");
      try {
        var context = await browser.contextualIdentities.query({
          name: routerpref
        });
        return forceIntoIsolation(tabId, routerpref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var i2ptunnelTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery browser");
      try {
        var context = await browser.contextualIdentities.query({
          name: tunnelpref
        });
        return forceIntoIsolation(tabId, tunnelpref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var snarkTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery torrents");
      try {
        var context = await browser.contextualIdentities.query({
          name: torrentpref
        });
        if (tabId.cookieStoreId != context[0].cookieStoreId) {
          var exemptContext = await browser.contextualIdentities.query({
            name: titlepref
          });
          let tmp = new URL(tabId.url);
          console.log("(isolate)tabid host", tmp.host);
          if (!requestDetails.url.includes("snark/" + tmp.host)) {
            //          if (tabId.cookieStoreId != exemptContext[0].cookieStoreId){
            function Create() {
              function onCreated(tab) {
                function closeOldTab(tabs) {
                  if (tabId.id != tab.id) {
                    console.log(
                      "(isolate) Closing un-isolated tab",
                      tabId.id,
                      "in favor of",
                      tab.id,
                      "with context",
                      tab.cookieStoreId
                    );
                    browser.tabs.remove(tabId.id);
                    browser.tabs.move(tab.id, { index: 0 });
                  }
                  for (index = 0; index < tabs.length; index++) {
                    if (index != tabs.length - 1)
                      browser.tabs.remove(tabs[index].id);
                  }
                }
                var pins = browser.tabs.query({
                  cookieStoreId: context[0].cookieStoreId
                });
                pins.then(closeOldTab, onError);
              }
              if (requestDetails.url.endsWith("xhr1.html")) {
                hostname = url.split("/")[2];
                let prefix = url.substr(0, url.indexOf("://") + 3);
                requestDetails.url = prefix + hostname + "/i2psnark/";
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
      } catch (error) {
        console.log("(isolate)Context Error", error);
      }
    };
    var muwireTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery muwire");
      try {
        var context = await browser.contextualIdentities.query({
          name: muwirepref
        });
        return forceIntoIsolation(tabId, muwirepref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var i2pboteTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery bote");
      try {
        var context = await browser.contextualIdentities.query({
          name: botepref
        });
        return forceIntoIsolation(tabId, botepref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var mailTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery mail");
      try {
        var context = await browser.contextualIdentities.query({
          name: mailpref
        });
        return forceIntoIsolation(tabId, mailpref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var ircTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery irc");
      try {
        var context = await browser.contextualIdentities.query({
          name: ircpref
        });
        return forceIntoIsolation(tabId, ircpref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var torTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery tor");
      try {
        var context = await browser.contextualIdentities.query({
          name: torpref
        });
        return forceIntoIsolation(tabId, torpref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var blogTabFind = async function (tabId) {
      console.info("(isolate)Context Discovery blog");
      try {
        var context = await browser.contextualIdentities.query({
          name: blogpref
        });
        return forceIntoIsolation(tabId, blogpref, tab);
      } catch (error) {
        console.error("(isolate)Context Error", error);
      }
    };
    var tabGet = async function (tabId) {
      try {
        //console.log("(isolate)Tab ID from Request", tabId);
        let tabInfo = await browser.tabs.get(tabId);
        return tabInfo;
      } catch (error) {
        console.log("(isolate)Tab error", error);
      }
    };
    if (requestDetails == undefined) {
      return requestDetails;
    }
    if (proxyHost(requestDetails)) {
      setcookie = browser.cookies.set({
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

      function isolate(oldtab) {
        let localhost = localHost(requestDetails.url);
        let routerhost = routerHost(requestDetails.url);
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
          } else if (routerhost === "muwire") {
            var routertab = tab.then(muwireTabFind, onContextError);
            return requestDetails;
          } else if (routerhost === "i2pbote") {
            var routertab = tab.then(i2pboteTabFind, onContextError);
            return requestDetails;
          } else if (routerhost === "routerconsole") {
            var routertab = tab.then(routerTabFind, onContextError);
            return requestDetails;
          }
        } else {
          if (localhost) {
            if (localhost === "blog") {
              var routertab = tab.then(blogTabFind, onContextError);
              return requestDetails;
            } else if (localhost === "irc") {
              var irctab = tab.then(ircTabFind, onContextError);
              return requestDetails;
            } else if (localhost === "tor") {
              var tortab = tab.then(torTabFind, onContextError);
              return requestDetails;
            }
          }
        }
        //        if (oldtab.cookieStoreId == 'firefox-default') {
        if (i2pHost(requestDetails)) {
          var thn = i2pHostName(requestDetails.url);
          if (requestDetails.url.includes("=" + thn)) {
            if (
              !requestDetails.url.includes("://github.com") ||
              !requestDetails.url.includes("://notabug.org") ||
              !requestDetails.url.includes("://i2pgit.org") ||
              !requestDetails.url.includes("://gitlab.com")
            ) {
              if (!localhost) {
                console.log("(scrub)checking search hostnames =" + thn);
                var tpt = requestDetails.url.split("=" + thn, 2);
                requestDetails.url =
                  "http://" + thn + "/" + tpt[1].replace("%2F", "");
              }
            }
          }
          console.log("(scrub) new hostname", requestDetails.url);
          var setcookie = browser.cookies.set({
            firstPartyDomain: i2pHostName(requestDetails.url),
            url: requestDetails.url,
            secure: true
          });
          setcookie.then(onContextGotLog, onContextError);
          if (!routerhost) {
            var i2ptab = tab.then(i2pTabFind, onContextError);
          }
          return requestDetails;
        }
        if (extensionHost(requestDetails)) {
          return requestDetails;
        }

        //}
      }
    }
  } catch (error) {
    console.log("(isolate)Not an I2P request, blackholing", error);
  }
};

function coolheadersSetup(incomingHeaders) {
  var asyncSetPageAction = new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (incomingHeaders.tabId != undefined) {
        popup = browser.pageAction.getPopup({ tabId: incomingHeaders.tabId });
        popup.then(gotPopup);
      }

      function gotPopup(p) {
        if (p.length !== 0)
          return;

        const isHttps = tab.url.startsWith("https");
        const isI2p = tab.url.includes(".i2p");

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
                .then((response) => {
                  if (response &&
                    response.content.toUpperCase() !== "NO-ALT-LOCATION") {
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
            } catch (e) {
              console.error("(scrub)(equiv check)", e);
            }
          } else {
            try {
              browser.tabs
                .sendMessage(tab.id, { req: "i2p-location" })
                .then((response) => {
                  if (response &&
                    response.content.toUpperCase() !== "NO-ALT-LOCATION") {
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
            } catch (e) {
              console.error("(scrub)(equiv check)", e);
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
              .then((response) => {
                if (response &&
                  response.content.toUpperCase() !== "NO-ALT-LOCATION") {
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
          } catch (e) {
            console.error("(pageaction)", e);
          }
        }
      }

      resolve({ responseHeaders: incomingHeaders.responseHeaders });
    }, 2000);
  });
  return asyncSetPageAction;
}

function getTabURL(tab) {
  console.log("(scrub)(equiv check) popup check", tab);

  if (tab.id != undefined) {
    popup = browser.pageAction.getPopup({ tabId: tab.id });
    console.log("(scrub)(equiv check) popup check");
    popup.then(gotPopup);
  }

  function gotPopup(p) {
    if (p.length !== 0) return;

    const isHttps = tab.url.startsWith("https");
    const isI2p = tab.url.includes(".i2p");

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
            .then((response) => {
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
        } catch (e) {
          console.error("(scrub)(equiv check)", e);
        }
      } else {
        try {
          browser.tabs
            .sendMessage(tab.id, { req: "i2p-location" })
            .then((response) => {
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
        } catch (e) {
          console.error("(scrub)(equiv check)", e);
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
          .then((response) => {
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
      } catch (e) {
        console.error("(pageaction)", e);
      }
    }
  }
}

function getClearTab(tab) {
  function setupTabs() {
    if (typeof tab === "number") {
      browser.tabs.get(tab).then(getTabURL, onError);
    } else if (typeof tab === "object" && typeof tab.tabId === "number") {
      browser.tabs.get(tab.tabId).then(getTabURL, onError);
    } else if (typeof tab === "object" && Array.isArray(tab.tabIds)) {
      for (let tabId of tab.tabIds) {
        browser.tabs.get(tabId).then(getTabURL, onError);
      }
    }
  }
  if (tab !== undefined) {
    setupTabs();
  } else {
    browser.tabs.query({}).then(setupTabs);
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
querying.then(reloadTabs, onError);

// Listen for onHeaderReceived for the target page.
// Set "blocking" and "responseHeaders".
browser.webRequest.onHeadersReceived.addListener(
  coolheadersSetup,
  { urls: ["*://*.i2p/*", "https://*/*"] },
  ["responseHeaders"]
);

browser.webNavigation.onDOMContentLoaded.addListener(getClearTab, filter);
browser.webNavigation.onDOMContentLoaded.addListener(
  logOnDOMContentLoaded,
  filter
);

browser.webRequest.onBeforeRequest.addListener(contextSetup, {
  urls: ["*://*.i2p/*", "*://localhost/*", "*://127.0.0.1/*", "*://*/*i2p*"]
});

browser.webRequest.onBeforeSendHeaders.addListener(
  contextScrub,
  { urls: ["*://*.i2p/*"] },
  ["requestHeaders"]
);
