browser.windows.onCreated.addListener(themeWindow);

// Theme all currently open windows
browser.windows.getAll().then(wins => wins.forEach(themeWindow));

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
            titlePreface: "I2P Browser (Private Browsing) - "
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
            titlePreface: "I2P Browser - "
        });
    }
}

function setTitle(window){
    if (window.incognito) {
        browser.windows.update(window.id, {
            titlePreface: "I2P Browser (Private Browsing) - "
        });
    }
    else {
        browser.windows.update(window.id, {
            titlePreface: "I2P Browser - "
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
