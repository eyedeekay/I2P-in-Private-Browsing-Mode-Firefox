


function tabCheck(tabInfo) {
  // Information Section
  console.log('(cert) checking tab');
  myRequest = Request(tabInfo[0].url);
  fetch(myRequest).then(function(response) {
    if response.headers.has('i2p-location') {
      for header in response.headers.get('i2p-location') {
        document.getElementById('TypeInfo').appendChild('<div class=\"AddressInfo\"><a href=\"' + header + '\">' + header + '</a></div>');
      }
    }
    if response.headers.has('x-i2p-location') {
      for header in response.headers.get('x-i2p-location') {
        document.getElementById('TypeInfo').appendChild('<div class=\"AddressInfo\"><a href=\"' + header + '\">' + header + '</a></div>');
      }
    }
  });
}

function tabError(error) {
  console.log(`Error : ${error}`);
}

const gettingCurrent = browser.tabs.query({ active: true });
gettingCurrent.then(tabCheck, tabError);
