function clearContent(titleId) {
  const titleElement = document.getElementById(titleId);
  if (!titleElement) {
    return;
  }
  titleElement.textContent = "";
}

function updateContentById(id, message) {
  const element = document.getElementById(id);
  if (!element) return;
  const content = chrome.i18n.getMessage(message);
  if (!content) return;
  element.textContent = content;
}

updateContentById("TypeLabel", "siteLabel");

updateContentById("CertLabel", "CertLabel");

function checkTab(tabInfo) {
  const url = tabInfo[0].url;
  const host = url.split(".i2p")[0] + ".i2p";
  if (host.length < 51) {
    updateContentById("AddressInfo", "isHostName");
  } else if (host.endsWith("b32.i2p")) {
    updateContentById("AddressInfo", "isBase32");
  }
  if (url.startsWith("https")) {
    updateContentById("AddressCertInfo", "certPresent");
    fetch(host).then((response) => {
      console.log("Updating cert information", response);
    });
  } else {
    updateContentById("AddressCertInfo", "certAbsent");
    clearContent("SignedLabel");
  }
}

function tabError(error) {
  console.error(`Error: ${error}`);
}

const gettingCurrent = browser.tabs.query({ active: true });
gettingCurrent.then(checkTab, tabError);
