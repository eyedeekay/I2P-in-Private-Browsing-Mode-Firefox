document.addEventListener("click", (e) => {
  function getCurrentWindow() {
    return browser.windows.getCurrent();
  }

  if (e.target.id === "window-create-panel") {
    let createData = {
      type: "panel",
      incognito: true,
    };
    let creating = browser.windows.create(createData);
    creating.then(() => {
      console.log("The panel has been created");
    });
  } else if (e.target.id === "generate-fresh-tunnel") {
    function RefreshIdentity(){
        console.log("Generating new identity")
        const Http = new XMLHttpRequest();
        const url='http://' + controlHost + ":" + controlPort
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange=(e)=>{
            console.log(Http.responseText)
        }
    }
    RefreshIdentity();
  } else if (e.target.id === "window-preface-title") {
    getCurrentWindow().then((currentWindow) => {
      let updateInfo = {
        titlePreface: "I2P Help | "
      }
      browser.windows.update(currentWindow.id, updateInfo);
    });
  }

  e.preventDefault();

});

//var newsMessage = document.getElementById('window-create-help-panel');
//newsMessage.textContent = browser.i18n.getMessage("newsMessage");

//var resetLinkID = document.getElementById('controlHostText');
//resetLinkId.textContent = controlhosttext;
