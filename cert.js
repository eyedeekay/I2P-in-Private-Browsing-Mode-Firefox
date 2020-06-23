function blankContent(id) {
  let infoTitle = document.getElementById(id);
  if (infoTitle === null) {
    console.log('content error', id);
    return;
  }
  infoTitle.textContent = '';
}

function contentUpdateById(id, message) {
  let infoTitle = document.getElementById(id);
  let messageContent = chrome.i18n.getMessage(message);
  if (infoTitle === null) {
    console.log('content error', id, messageContent);
    return;
  }
  infoTitle.textContent = messageContent;
}

contentUpdateById('TypeLabel', 'siteLabel');

contentUpdateById('CertLabel', 'certLabel');

function tabCheck(tabInfo) {
  // Information Section
  console.log('(cert) checking tab');
  var host = tabInfo[0].url.split('.i2p')[0] + '.i2p';
  if (host.length < 51) {
    contentUpdateById('AddressInfo', 'isHostName');
  } else {
    if (host.endsWith('b32.i2p')) {
      contentUpdateById('AddressInfo', 'isBase32');
    }
  }
  if (host.startsWith('https')) {
    contentUpdateById('AddressCertInfo', 'certPresent');
    console.log('(cert) initiating request to check server cert');
    fetch(host).then(response => {
      console.log('Updating cert information', response);
    });
  } else {
    contentUpdateById("AddressCertInfo", "certAbsent");
    blankContent("SignedLabel");
  }
}

function tabError(error) {
  console.log(`Error: ${error}`);
}

const gettingCurrent = browser.tabs.query({ active: true });
gettingCurrent.then(tabCheck, tabError);
