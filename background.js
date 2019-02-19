browser.windows.onCreated.addListener(themeWindow);

// Theme all currently open windows
browser.windows.getAll().then(wins => wins.forEach(themeWindow));

var titlepref = browser.i18n.getMessage("titlePreface");
var titleprefpriv = browser.i18n.getMessage("titlePrefacePrivate");

function themeWindow(window) {
    // Check if the window is in private browsing
    if (window.incognito) {
        browser.theme.update(window.id, {
            images: {
                headerURL: "icons/toopie.png",
            },
            colors: {
                accentcolor: "#A0A0DE",
                textcolor: "white",
                toolbar: "#A0A0DE",
                toolbar_text: "white"
            }
        });
        browser.windows.update(window.id, {
            titlePreface: titleprefpriv
        });
    }
    else {
        browser.theme.update(window.id, {
            images: {
                headerURL: "icons/toopie.png",
            },
            colors: {
                accentcolor: "#BFA0DE",
                textcolor: "white",
                toolbar: "#BFA0DE",
                toolbar_text: "white"
            }
        });
        browser.windows.update(window.id, {
            titlePreface: titlepref
        });
    }
}

function setTitle(window){
    if (window.incognito) {
        browser.windows.update(window.id, {
            titlePreface: titleprefpriv
        });
    }
    else {
        browser.windows.update(window.id, {
            titlePreface: titlepref
        });
    }
}

function setTitleError(window){
    alert("plugin error setting title on", window.id)
}

browser.windows.onCreated.addListener(() => {
    const gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(setupProxy, onError);
});

browser.tabs.onCreated.addListener(() => {
    const getting = browser.windows.getCurrent({populate: true});
    getting.then(setTitle, setTitleError);
});
