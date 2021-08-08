function gotCurrent(tab) {
  function gotTitle(title) {
    let addr = title;
    document.getElementById('TypeInfo').innerHTML =
      '<div class="AddressInfo"><a href="' + addr + '">' + addr + '</a></div>';
  }
  console.log(tab);
  var gettingTitle = browser.pageAction.getTitle({
    tabId: tab[0].id,
  });
  gettingTitle.then(gotTitle);
}

function tabError(error) {
  console.log(`Error : ${error}`);
}

const gettingCurrent = browser.tabs.query({ active: true });
gettingCurrent.then(gotCurrent, tabError);
