//var windowIds = []
var titlepref = chrome.i18n.getMessage("titlePreface");

function onError(error) {
  console.log(`Error: ${error}`);
}

function eventHandler(event) {
  function onCreated(windowInfo) {
    console.log(`Created window: ${windowInfo.id}`);
    browser.tabs.create({
      windowId: windowInfo.id,
      url: "about:blank",
      cookieStoreId: event.target.dataset.identity
    });
  }
  if (event.target.dataset.action == "create") {
    var creating = browser.tabs.create({
      cookieStoreId: event.target.dataset.identity
    });
    creating.then(onCreated, onError);
  }
  if (event.target.dataset.action == "close-all") {
    browser.tabs
      .query({
        cookieStoreId: event.target.dataset.identity
      })
      .then(tabs => {
        browser.tabs.remove(tabs.map(rem => rem.id));
      });
  }
  event.preventDefault();
}

function createOptions(node, identity) {
  for (let option of ["Create", "Close All"]) {
    let alink = document.createElement("a");
    alink.href = "#";
    alink.innerText = option;
    alink.dataset.action = option.toLowerCase().replace(" ", "-");
    alink.dataset.identity = identity.cookieStoreId;
    alink.addEventListener("click", eventHandler);
    node.appendChild(alink);
  }
}

var div = document.getElementById("identity-list");

if (browser.contextualIdentities === undefined) {
  div.innerText =
    "browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.";
} else {
  browser.contextualIdentities
    .query({
      name: titlepref
    })
    .then(identities => {
      if (!identities.length) {
        div.innerText = "No identities returned from the API.";
        return;
      }

      for (let identity of identities) {
        let row = document.createElement("div");
        let span = document.createElement("span");
        span.className = "identity";
        span.innerText = identity.name;
        span.style = `color: ${identity.color}`;
        console.log(identity);
        row.appendChild(span);
        createOptions(row, identity);
        div.appendChild(row);
      }
    });
}
