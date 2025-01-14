/**
 * @fileoverview I2P Container Tab Manager
 * Handles container isolation, header scrubbing and tab management
 */

// Configuration constants
const CONTAINER_CONFIG = {
  MESSAGES: {
    TITLE: chrome.i18n.getMessage("titlePreface"),
    WEB: chrome.i18n.getMessage("webPreface"),
    ROUTER: chrome.i18n.getMessage("routerPreface"),
    MAIL: chrome.i18n.getMessage("mailPreface"),
    TORRENT: chrome.i18n.getMessage("torrentPreface"),
    TUNNEL: chrome.i18n.getMessage("i2ptunnelPreface"),
    IRC: chrome.i18n.getMessage("ircPreface"),
    EXTENSION: chrome.i18n.getMessage("extensionPreface"),
    MUWIRE: chrome.i18n.getMessage("muwirePreface"),
    BOTE: chrome.i18n.getMessage("botePreface"),
    BLOG: chrome.i18n.getMessage("blogPreface"),
    BLOG_PRIVATE: chrome.i18n.getMessage("blogPrefacePrivate"),
    TOR: chrome.i18n.getMessage("torPreface"),
    TOR_PRIVATE: chrome.i18n.getMessage("torPrefacePrivate"),
  },

  HEADER_CONFIG: {
    USER_AGENT: "MYOB/6.66 (AN/ON)",
    TITLE_PREFIX: "myob",
  },

  URLS: {
    BASE: "http://proxy.i2p",
    LOCAL: {
      IRC: "http://127.0.0.1:7669",
      TOR: "http://127.0.0.1:7695",
      BLOG: "http://127.0.0.1:8084",
    },
    POPUPS: {
      SECURITY: "security.html",
      LOCATION: "location.html",
      TORRENT: "torrent.html",
    },
    ICONS: {
      I2P: "icons/i2plogo.png",
      INFOTOOPIE: "icons/infotoopie.png",
      INFOTOOPIES: "icons/infotoopies.png",
      INFOTOOPIEBT: "icons/infotoopiesbt.png",
    },
  },
};

/**
 * Header Manager for privacy protection
 */
class HeaderManager {
  /**
   * Get container context for tab
   * @param {Object} tabInfo Tab information
   * @return {Promise<Object>} Container context or null for default contexts
   */

  static async getContext(tabInfo) {
    try {
      if (!tabInfo || !tabInfo.cookieStoreId) {
        return null; // Return null for missing context info
      }

      // Handle default and private contexts
      if (
        tabInfo.cookieStoreId === "firefox-default" ||
        tabInfo.cookieStoreId === "firefox-private"
      ) {
        return null; // Return null for default/private contexts
      }

      // Only lookup context for container tabs
      const context = await browser.contextualIdentities.get(
        tabInfo.cookieStoreId
      );
      return context;
    } catch (error) {
      console.debug("Tab is using default context"); // More descriptive message
      return null; // Return null on error
    }
  }

  /**
   * Process headers for request
   * @param {Object} requestDetails Request details
   * @return {Promise<Object>} Modified request
   */
  static async processHeaders(requestDetails) {
    try {
      if (
        !requestDetails ||
        !requestDetails.tabId ||
        requestDetails.tabId <= 0
      ) {
        return HeaderManager.scrubHeaders(requestDetails);
      }

      const tab = await UITabManager.getTab(requestDetails.tabId);
      if (!tab) {
        return HeaderManager.scrubHeaders(requestDetails);
      }

      // Always scrub headers regardless of container context
      return HeaderManager.scrubHeaders(requestDetails);
    } catch (error) {
      console.error("Header processing failed:", error);
      // Fail safe: still scrub headers even if context lookup fails
      return HeaderManager.scrubHeaders(requestDetails);
    }
  }

  /**
   * Scrub privacy-sensitive headers
   * @param {Object} requestDetails Request details
   * @return {Object} Modified headers
   */
  static scrubHeaders(requestDetails) {
    if (!requestDetails || !requestDetails.requestHeaders) {
      return { requestHeaders: [] };
    }

    const headers = requestDetails.requestHeaders;
    headers.forEach((header) => {
      const headerName = header.name.toLowerCase();

      if (headerName === "user-agent") {
        header.value = CONTAINER_CONFIG.HEADER_CONFIG.USER_AGENT;
      }

      if (headerName === "referer") {
        header.value = "";
      }
    });

    return { requestHeaders: headers };
  }
}

/**
 * Tab Manager for handling browser tabs
 */
class UITabManager {
  /**
   * Get tab information
   * @param {number} tabId Tab ID
   * @returns {Promise<Object>} Tab info
   */
  static async getTab(tabId) {
    try {
      if (!tabId || tabId <= 0) {
        return undefined;
      }
      return await browser.tabs.get(tabId);
    } catch (error) {
      console.error("Tab lookup failed:", error);
      return undefined;
    }
  }

  /**
   * Update tab URL
   * @param {Object} tab Browser tab
   * @param {string} url New URL
   */
  static async updateTab(tab, url) {
    try {
      if (!tab || !tab.id || !url) {
        return;
      }
      await browser.tabs.update(tab.id, { url });
    } catch (error) {
      console.error("Tab update failed:", error);
    }
  }

  /**
   * Process tab for container
   * @param {Object} tab Browser tab
   * @param {string} containerName Container name
   * @param {boolean} pin Whether to pin tab
   */
  static async processContainerTab(tab, containerName, pin) {
    try {
      if (!tab || !containerName) {
        return;
      }
      return await ContainerManager.forceIntoContainer(tab, containerName, pin);
    } catch (error) {
      console.error("Container tab processing failed:", error);
    }
  }
}
/**
 * Container Manager for handling I2P container isolation
 */
/**
 * Container Manager for handling I2P container isolation
 */
class ContainerManager {
  /**
   * Force tab into container
   * @param {Object} tab Tab to isolate
   * @param {string} contextId Container context ID
   * @param {boolean} pin Whether to pin tab
   * @returns {Promise<Object>} Containerized tab
   */
  static async forceIntoContainer(tab, contextId, pin = true) {
    try {
      if (!tab || !contextId) {
        throw new Error("Invalid tab or context");
      }

      const context = await browser.contextualIdentities.query({
        name: contextId,
      });

      if (!context || !context[0]) {
        throw new Error(`Container not found: ${contextId}`);
      }

      // Important: Check if tab is already in ANY container
      if (
        tab.cookieStoreId !== "firefox-default" &&
        tab.cookieStoreId !== "firefox-private"
      ) {
        return tab; // Tab is already containerized
      }

      const newURL = URLManager.getContainerURL(contextId, tab.url);
      const newTab = await this.createContainerTab(context[0], newURL, pin);
      await this.cleanupTabs(tab, newTab, context[0], pin);

      return newTab;
    } catch (error) {
      console.error("Container isolation failed:", error);
      throw error;
    }
  }

  /**
   * Check if tab is in container
   * @param {Object} tab Browser tab
   * @returns {boolean} Whether tab is in container
   */
  static isInContainer(tab) {
    return (
      tab.cookieStoreId !== "firefox-default" &&
      tab.cookieStoreId !== "firefox-private"
    );
  }

  /**
   * Create new container tab
   * @private
   * @param {Object} context Container context
   * @param {string} url Tab URL
   * @param {boolean} pin Whether to pin tab
   * @returns {Promise<Object>} Created tab
   */
  static async createContainerTab(context, url, pin) {
    return await browser.tabs.create({
      active: true,
      cookieStoreId: context.cookieStoreId,
      url: url,
      pinned: pin,
    });
  }

  /**
   * Clean up tabs after container move
   * @private
   * @param {Object} oldTab Original tab
   * @param {Object} newTab New container tab
   * @param {Object} context Container context
   * @param {boolean} pin Whether to pin tab
   */
  static async cleanupTabs(oldTab, newTab, context, pin) {
    // Only remove the old tab if it's not in a container
    if (!this.isInContainer(oldTab)) {
      await browser.tabs.remove(oldTab.id);
    }

    if (pin) {
      await browser.tabs.move(newTab.id, { index: 0 });

      // Only clean up other tabs if explicitly requested
      const tabs = await browser.tabs.query({
        cookieStoreId: context.cookieStoreId,
      });

      for (const tab of tabs) {
        if (tab.id !== newTab.id && !tab.pinned) {
          await browser.tabs.remove(tab.id);
        }
      }
    }

    await PageActionManager.setupSecurityPopup(newTab.id);
  }
}

/**
 * URL Manager for handling container URLs
 */
class URLManager {
  /**
   * Get URL for container context
   * @param {string} contextId Container context ID
   * @param {string} url Original URL
   * @returns {string} Container URL
   */
  static getContainerURL(contextId, url) {
    if (!url.startsWith("moz-extension://")) {
      return url;
    }

    const routerUrl = this.getRouterBaseURL();

    const urlMap = {
      [CONTAINER_CONFIG.MESSAGES.TITLE]: CONTAINER_CONFIG.URLS.BASE,
      [CONTAINER_CONFIG.MESSAGES.ROUTER]: `${routerUrl}console`,
      [CONTAINER_CONFIG.MESSAGES.TUNNEL]: `${routerUrl}i2ptunnel`,
      [CONTAINER_CONFIG.MESSAGES.MUWIRE]: `${routerUrl}MuWire`,
      [CONTAINER_CONFIG.MESSAGES.BOTE]: `${routerUrl}i2pbote`,
      [CONTAINER_CONFIG.MESSAGES.MAIL]: `${routerUrl}webmail`,
      [CONTAINER_CONFIG.MESSAGES.IRC]: CONTAINER_CONFIG.URLS.LOCAL.IRC,
      [CONTAINER_CONFIG.MESSAGES.TOR]: CONTAINER_CONFIG.URLS.LOCAL.TOR,
      [CONTAINER_CONFIG.MESSAGES.BLOG]: CONTAINER_CONFIG.URLS.LOCAL.BLOG,
    };

    return urlMap[contextId] || CONTAINER_CONFIG.URLS.BASE;
  }

  /**
   * Get router base URL
   * @private
   * @returns {string} Router URL
   */
  static getRouterBaseURL() {
    const host = control_host();
    const port = control_port();
    return `http://${host}:${port}/`;
  }

  /**
   * Fix torrent URL
   * @param {string} url Original URL
   * @returns {string} Fixed URL
   */
  static fixTorrentURL(url) {
    if (!url.endsWith("xhr1.html")) {
      return url;
    }

    const urlParts = url.split("/");
    const hostname = urlParts[2];
    const protocol = url.substr(0, url.indexOf("://") + 3);

    return `${protocol}${hostname}/i2psnark/`;
  }

  /**
   * Check if URL is extension URL
   * @param {Object} details Request details
   * @returns {boolean} Whether URL is extension
   */
  static isExtensionURL(details) {
    return details && details.url && details.url.startsWith("moz-extension://");
  }

  // In scrub.js, URLManager class

  static getRouterHostType(url) {
    try {
      const urlObj = new URL(url);
      const isRouterConsole =
        urlObj.port === "7657" &&
        (urlObj.hostname === "127.0.0.1" || urlObj.hostname === "localhost");

      if (!isRouterConsole) {
        return null;
      }

      // Map router console paths to container types
      const routerPaths = {
        "/i2ptunnel/": "i2ptunnelmgr",
        "/i2ptunnelmgr": "i2ptunnelmgr",
        "/i2psnark/": "i2psnark",
        "/torrents": "i2psnark",
        "/susimail/": "webmail",
        "/webmail": "webmail",
        "/i2pbote/": "i2pbote",
        "/console": "routerconsole",
        "/home": "routerconsole",
      };

      for (const [path, type] of Object.entries(routerPaths)) {
        if (urlObj.pathname.startsWith(path)) {
          return type;
        }
      }

      // Default to router console for root path
      if (urlObj.pathname === "/" || urlObj.pathname === "") {
        return "routerconsole";
      }
    } catch (error) {
      console.error("Router host type check failed:", error);
    }

    return null;
  }
}

/**
 * Page Action Manager for browser toolbar icons
 */
class PageActionManager {
  /**
   * Set up page action for tab
   * @param {Object} tab Browser tab
   */
  static async setupPageAction(tab) {
    try {
      if (!tab || !tab.id || !tab.url) {
        return;
      }

      const isHttps = tab.url.startsWith("https://");
      const isI2p = tab.url.includes(".i2p");

      if (isHttps && isI2p) {
        await this.setI2PSecurePageAction(tab);
      } else if (isHttps) {
        await this.checkI2PLocation(tab);
      } else if (isI2p) {
        await this.setI2PPageAction(tab);
      }

      await this.checkTorrentLocation(tab);
    } catch (error) {
      console.error("Page action setup failed:", error);
    }
  }

  /**
   * Set up security popup
   * @param {number} tabId Tab ID
   */
  static async setupSecurityPopup(tabId) {
    try {
      await Promise.all([
        browser.pageAction.setPopup({
          tabId: tabId,
          popup: CONTAINER_CONFIG.URLS.POPUPS.SECURITY,
        }),
        browser.pageAction.show(tabId),
      ]);
    } catch (error) {
      console.error("Security popup setup failed:", error);
    }
  }

  /**
   * Set I2P secure page action
   * @private
   * @param {Object} tab Browser tab
   */
  static async setI2PSecurePageAction(tab) {
    await Promise.all([
      browser.pageAction.setPopup({
        tabId: tab.id,
        popup: CONTAINER_CONFIG.URLS.POPUPS.SECURITY,
      }),
      browser.pageAction.setIcon({
        path: CONTAINER_CONFIG.URLS.ICONS.INFOTOOPIES,
        tabId: tab.id,
      }),
    ]);
  }

  /**
   * Set I2P page action
   * @private
   * @param {Object} tab Browser tab
   */
  static async setI2PPageAction(tab) {
    await Promise.all([
      browser.pageAction.setPopup({
        tabId: tab.id,
        popup: CONTAINER_CONFIG.URLS.POPUPS.SECURITY,
      }),
      browser.pageAction.setIcon({
        path: CONTAINER_CONFIG.URLS.ICONS.INFOTOOPIE,
        tabId: tab.id,
      }),
    ]);
  }

  /**
   * Check for I2P location
   * @private
   * @param {Object} tab Browser tab
   */
  static async checkI2PLocation(tab) {
    try {
      const response = await browser.tabs.sendMessage(tab.id, {
        req: "i2p-location",
      });

      if (
        response &&
        response.content &&
        response.content.toUpperCase() !== "NO-ALT-LOCATION"
      ) {
        await this.setLocationPageAction(tab, response.content);
      }
    } catch (error) {
      console.debug("No I2P location found");
    }
  }

  /**
   * Check for torrent location
   * @private
   * @param {Object} tab Browser tab
   */
  static async checkTorrentLocation(tab) {
    try {
      const response = await browser.tabs.sendMessage(tab.id, {
        req: "i2p-torrentlocation",
      });

      if (
        response &&
        response.content &&
        response.content.toUpperCase() !== "NO-ALT-LOCATION"
      ) {
        await this.setTorrentPageAction(tab, response.content);
      }
    } catch (error) {
      console.debug("No torrent location found");
    }
  }

  /**
   * Set location page action
   * @private
   * @param {Object} tab Browser tab
   * @param {string} location I2P location
   */
  static async setLocationPageAction(tab, location) {
    await Promise.all([
      browser.pageAction.setPopup({
        tabId: tab.id,
        popup: CONTAINER_CONFIG.URLS.POPUPS.LOCATION,
      }),
      browser.pageAction.setIcon({
        path: CONTAINER_CONFIG.URLS.ICONS.I2P,
        tabId: tab.id,
      }),
      browser.pageAction.setTitle({
        tabId: tab.id,
        title: location,
      }),
      browser.pageAction.show(tab.id),
    ]);
  }

  /**
   * Set torrent page action
   * @private
   * @param {Object} tab Browser tab
   * @param {string} location Torrent location
   */
  static async setTorrentPageAction(tab, location) {
    await Promise.all([
      browser.pageAction.setPopup({
        tabId: tab.id,
        popup: CONTAINER_CONFIG.URLS.POPUPS.TORRENT,
      }),
      browser.pageAction.setIcon({
        path: CONTAINER_CONFIG.URLS.ICONS.INFOTOOPIEBT,
        tabId: tab.id,
      }),
      browser.pageAction.setTitle({
        tabId: tab.id,
        title: location,
      }),
      browser.pageAction.show(tab.id),
    ]);
  }
}

/**
 * Event Manager for browser events
 */
class EventManager {
  /**
   * Initialize event listeners
   */

  static initializeListeners() {
    // Web request events with proper binding
    browser.webRequest.onBeforeRequest.addListener(
      (requestDetails) => RequestManager.handleRequest(requestDetails), // Use arrow function to preserve context
      {
        urls: [
          "*://*.i2p/*",
          "*://localhost/*",
          "*://127.0.0.1/*",
          "*://*/*i2p*",
        ],
      }
    );

    browser.webRequest.onBeforeSendHeaders.addListener(
      (requestDetails) => HeaderManager.processHeaders(requestDetails), // Use arrow function to preserve context
      { urls: ["*://*.i2p/*"] },
      ["requestHeaders", "blocking"]
    );

    // Tab events with proper binding
    const tabEvents = [
      "onActivated",
      "onAttached",
      "onCreated",
      "onDetached",
      "onHighlighted",
      "onMoved",
      "onReplaced",
    ];

    tabEvents.forEach((event) => {
      browser.tabs[event].addListener(
        async (info) => await EventManager.handleTabEvent(info) // Use arrow function to preserve context
      );
    });
  }

  /**
   * Handle tab event
   * @private
   * @param {Object} tab Browser tab
   */
  static async handleTabEvent(tab) {
    try {
      if (typeof tab === "number") {
        const tabInfo = await browser.tabs.get(tab);
        await PageActionManager.setupPageAction(tabInfo);
      } else if (tab && typeof tab.tabId === "number") {
        const tabInfo = await browser.tabs.get(tab.tabId);
        await PageActionManager.setupPageAction(tabInfo);
      } else if (tab && Array.isArray(tab.tabIds)) {
        for (const tabId of tab.tabIds) {
          const tabInfo = await browser.tabs.get(tabId);
          await PageActionManager.setupPageAction(tabInfo);
        }
      }
    } catch (error) {
      console.error("Tab event handling failed:", error);
    }
  }

  /**
   * Handle headers
   * @private
   * @param {Object} headers Header details
   * @returns {Promise<Object>} Modified headers
   */
  static handleHeaders(headers) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (headers.tabId !== undefined) {
          browser.pageAction
            .getPopup({ tabId: headers.tabId })
            .then(PageActionManager.setupPageAction);
        }

        resolve({ responseHeaders: headers.responseHeaders });
      }, 2000);
    });
  }
}

/**
 * Request Manager for handling browser requests
 */
class RequestManager {
  /**
   * Handle web request
   * @param {Object} requestDetails Request details
   * @returns {Promise<Object>} Modified request
   */
  static async handleRequest(requestDetails) {
    try {
      if (!requestDetails) {
        return requestDetails;
      }

      // Handle proxy requests
      if (RequestManager.isProxyRequest(requestDetails)) {
        await RequestManager.handleProxyRequest(requestDetails);
        return requestDetails;
      }

      // Handle tab requests
      if (requestDetails.tabId > 0) {
        return await RequestManager.handleTabRequest(requestDetails);
      }

      return requestDetails;
    } catch (error) {
      console.error("Request handling failed:", error);
      return requestDetails;
    }
  }

  /**
   * Handle proxy request
   * @private
   * @param {Object} requestDetails Request details
   */
  static async handleProxyRequest(requestDetails) {
    try {
      await browser.cookies.set({
        firstPartyDomain: this.getI2PHostname(requestDetails.url),
        url: requestDetails.url,
        secure: true,
      });
    } catch (error) {
      console.error("Proxy request handling failed:", error);
    }
  }

  /**
   * Handle tab request
   * @private
   * @param {Object} requestDetails Request details
   * @returns {Promise<Object>} Modified request
   */
  static async handleTabRequest(requestDetails) {
    try {
      const tab = await UITabManager.getTab(requestDetails.tabId);
      if (!tab) {
        return requestDetails;
      }

      const url = requestDetails.url;
      const routerHost = URLManager.getRouterHostType(url);
      const localHost = this.getLocalHostType(url);

      // Handle router console requests (127.0.0.1:7657)
      if (routerHost) {
        return await this.handleRouterRequest(tab, routerHost, requestDetails);
      }

      // Handle other local services
      if (localHost) {
        return await this.handleLocalRequest(tab, localHost, requestDetails);
      }

      // Handle I2P host requests
      if (this.isI2PHost(requestDetails)) {
        return await this.handleI2PRequest(tab, requestDetails);
      }

      return requestDetails;
    } catch (error) {
      console.error("Tab request handling failed:", error);
      return requestDetails;
    }
  }

  /**
   * Handle router request
   * @private
   * @param {Object} tab Browser tab
   * @param {string} routerHost Router host type
   * @param {Object} requestDetails Request details
   * @returns {Promise<Object>} Modified request
   */
  static async handleRouterRequest(tab, routerHost, requestDetails) {
    const routerMap = {
      i2ptunnelmgr: {
        handler: this.handleTunnelRequest,
        container: CONTAINER_CONFIG.MESSAGES.TUNNEL,
      },
      i2psnark: {
        handler: this.handleTorrentRequest,
        container: CONTAINER_CONFIG.MESSAGES.TORRENT,
      },
      webmail: {
        handler: this.handleMailRequest,
        container: CONTAINER_CONFIG.MESSAGES.MAIL,
      },
      i2pbote: {
        handler: this.handleBoteRequest,
        container: CONTAINER_CONFIG.MESSAGES.BOTE,
      },
      routerconsole: {
        handler: this.handleConsoleRequest,
        container: CONTAINER_CONFIG.MESSAGES.ROUTER,
      },
    };

    const service = routerMap[routerHost];
    if (!service) {
      return requestDetails;
    }

    return await this.processServiceRequest(
      tab,
      requestDetails,
      service.container,
      true
    );
  }

  /**
   * Handle local request
   * @private
   * @param {Object} tab Browser tab
   * @param {string} localHost Local host type
   * @param {Object} requestDetails Request details
   * @returns {Promise<Object>} Modified request
   */
  static async handleLocalRequest(tab, localHost, requestDetails) {
    const localMap = {
      blog: this.handleBlogRequest,
      irc: this.handleIRCRequest,
      tor: this.handleTorRequest,
    };

    const handler = localMap[localHost];
    if (!handler) {
      return requestDetails;
    }

    return await handler.call(this, tab, requestDetails);
  }

  /**
   * Handle I2P request
   * @private
   * @param {Object} tab Browser tab
   * @param {Object} requestDetails Request details
   * @returns {Promise<Object>} Modified request
   */
  static async handleI2PRequest(tab, requestDetails) {
    try {
      await this.handleProxyRequest(requestDetails);

      // Only containerize if not already in a container
      if (!ContainerManager.isInContainer(tab)) {
        const containerTab = await UITabManager.processContainerTab(
          tab,
          CONTAINER_CONFIG.MESSAGES.TITLE,
          false
        );

        if (containerTab) {
          await UITabManager.updateTab(containerTab, requestDetails.url);
        }
      }

      return requestDetails;
    } catch (error) {
      console.error("I2P request handling failed:", error);
      return requestDetails;
    }
  }

  /**
   * Service-specific request handlers
   */
  static async handleTunnelRequest(tab, requestDetails) {
    return await this.processServiceRequest(
      tab,
      requestDetails,
      CONTAINER_CONFIG.MESSAGES.TUNNEL,
      true
    );
  }

  static async handleTorrentRequest(tab, requestDetails) {
    const url = URLManager.fixTorrentURL(requestDetails.url);
    return await this.processServiceRequest(
      tab,
      { ...requestDetails, url },
      CONTAINER_CONFIG.MESSAGES.TORRENT,
      true
    );
  }

  static async handleMailRequest(tab, requestDetails) {
    return await this.processServiceRequest(
      tab,
      requestDetails,
      CONTAINER_CONFIG.MESSAGES.MAIL,
      true
    );
  }

  static async handleBoteRequest(tab, requestDetails) {
    return await this.processServiceRequest(
      tab,
      requestDetails,
      CONTAINER_CONFIG.MESSAGES.BOTE,
      true
    );
  }

  static async handleConsoleRequest(tab, requestDetails) {
    return await this.processServiceRequest(
      tab,
      requestDetails,
      CONTAINER_CONFIG.MESSAGES.ROUTER,
      true
    );
  }

  static async handleBlogRequest(tab, requestDetails) {
    return await this.processServiceRequest(
      tab,
      requestDetails,
      CONTAINER_CONFIG.MESSAGES.BLOG,
      true
    );
  }

  static async handleIRCRequest(tab, requestDetails) {
    return await this.processServiceRequest(
      tab,
      requestDetails,
      CONTAINER_CONFIG.MESSAGES.IRC,
      true
    );
  }

  static async handleTorRequest(tab, requestDetails) {
    return await this.processServiceRequest(
      tab,
      requestDetails,
      CONTAINER_CONFIG.MESSAGES.TOR,
      true
    );
  }

  /**
   * Process service request
   * @private
   * @param {Object} tab Browser tab
   * @param {Object} requestDetails Request details
   * @param {string} containerName Container name
   * @param {boolean} pin Whether to pin tab
   * @returns {Promise<Object>} Modified request
   */
  /**
   * Process service request
   * @private
   * @param {Object} tab Browser tab
   * @param {Object} requestDetails Request details
   * @param {string} containerName Container name
   * @param {boolean} pin Whether to pin tab
   * @returns {Promise<Object>} Modified request
   */
  static async processServiceRequest(tab, requestDetails, containerName, pin) {
    try {
      // Only containerize if not already in a container
      if (!ContainerManager.isInContainer(tab)) {
        const containerTab = await UITabManager.processContainerTab(
          tab,
          containerName,
          pin
        );

        if (containerTab) {
          await UITabManager.updateTab(containerTab, requestDetails.url);
        }
      }

      return requestDetails;
    } catch (error) {
      console.error("Service request processing failed:", error);
      return requestDetails;
    }
  }

  /**
   * Utility methods
   */
  static isProxyRequest(details) {
    if (details.url) {
      let url = new URL(details.url);
      return url.hostname === "proxy.i2p";
    }
    return false;
  }

  static isI2PHost(details) {
    if (details.url) {
      let url = new URL(details.url);
      return url.hostname.endsWith(".i2p");
    }
    return false;
  }

  static getI2PHostname(url) {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return "";
    }
  }

  /**
   * Get local host type
   * @private
   * @param {string} url URL to check
   * @returns {string|null} Local host type
   */
  static getLocalHostType(url) {
    try {
      const urlObj = new URL(url);
      const isLocalhost =
        urlObj.hostname === "127.0.0.1" || urlObj.hostname === "localhost";

      if (!isLocalhost) {
        return null;
      }

      // Map local service ports to container types
      const localServices = {
        7669: "irc", // I2P IRC
        7695: "tor", // Tor proxy
        8084: "blog", // Local blog
      };

      return localServices[urlObj.port] || null;
    } catch (error) {
      console.error("Local host type check failed:", error);
      return null;
    }
  }
}

// Initialize event listeners
EventManager.initializeListeners();

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    HeaderManager,
    UITabManager,
    ContainerManager,
    URLManager,
    PageActionManager,
    EventManager,
    RequestManager,
    CONTAINER_CONFIG,
  };
}
