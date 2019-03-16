chrome.windows.onCreated.addListener(themeWindow);

var titlepref = chrome.i18n.getMessage("titlePreface");
var titleprefpriv = chrome.i18n.getMessage("titlePrefacePrivate");

function themeWindow(window) {
    // Check if the window is in private browsing
    if (window.incognito) {
        chrome.theme.update(window.id, {
            images: {
                theme_frame: "icons/toopie.png",
            },
            colors: {
                frame: "#A0A0DE",
                textcolor: "white",
                toolbar: "#A0A0DE",
                toolbar_text: "white"
            }
        });
        chrome.windows.update(window.id, {
            titlePreface: titleprefpriv
        });
    }
    else {
        chrome.theme.update(window.id, {
            images: {
                theme_frame: "icons/toopie.png",
            },
            colors: {
                frame: "#BFA0DE",
                textcolor: "white",
                toolbar: "#BFA0DE",
                toolbar_text: "white"
            }
        });
        chrome.windows.update(window.id, {
            titlePreface: titlepref
        });
    }
}

function setTitle(window){
    if (window.incognito) {
        chrome.windows.update(window.id, {
            titlePreface: titleprefpriv
        });
    }
    else {
        chrome.windows.update(window.id, {
            titlePreface: titlepref
        });
    }
}

function setTitleError(window){
    alert("plugin error setting title on", window.id)
}

chrome.windows.onCreated.addListener(() => {
    const gettingStoredSettings = chrome.storage.local.get();
    gettingStoredSettings.then(setupProxy, onError);
});

chrome.tabs.onCreated.addListener(() => {
    const getting = chrome.windows.getCurrent({populate: true});
    getting.then(setTitle, setTitleError);
});
