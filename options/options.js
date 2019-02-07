/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {

  function getSince() {
    const proxy_scheme = document.querySelector("#proxy_scheme");
    return proxy_scheme.value;
  }

  function getHost() {
    let proxy_host = "";
    const textboxes = document.querySelectorAll(".proxy-options [type=text]");
    for (let item of textboxes) {
      if (item.getAttribute("data") == "host") {
        proxy_host = item.getAttribute("value");
      }
    }
    return proxy_host;
  }

  function getPort() {
    let proxy_port = "";
    const textboxes = document.querySelectorAll(".proxy-options [type=text]");
    for (let item of textboxes) {
      if (item.getAttribute("data") == "port") {
        proxy_port = item.getAttribute("value");
      }
    }
    return proxy_port;
  }

  const proxy_scheme = getSince();
  const proxy_host = getHost();
  const proxy_port = getPort();
  browser.storage.local.set({
    proxy_scheme,
    proxy_host,
    proxy_port,
  });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
  const selectList = document.querySelector("#proxy_scheme");
  selectList.value = restoredSettings.proxy_scheme;

  const textboxes = document.querySelectorAll(".proxy-options [type=text]");
  for (let item of textboxes) {
    if (restoredSettings.proxy_value.indexOf(item.getAttribute("data")) != -1) {
      item.value = restoredSettings.proxy_value.indexOf(item.getAttribute("value"));
    }
    if (restoredSettings.proxy_value.indexOf(item.getAttribute("data")) != -1 ) {
      item.value = restoredSettings.proxy_value.indexOf(item.getAttribute("value"));
    }
  }
}

function onError(e) {
  console.error(e);
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

/*
On clicking the save button, save the currently selected settings.
*/
const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);
