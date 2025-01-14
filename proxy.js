/**
 * @fileoverview I2P Proxy Manager
 * Handles proxy configuration and routing for I2P container tabs
 */

// Configuration constants
const PROXY_CONFIG = {
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
  },
  PORTS: {
    IRC: "7669",
    TOR: "7695",
    BLOG: "8084",
    TORRENT: "7662",
  },
};

/**
 * Network Manager for handling WebRTC and network prediction
 */
class NetworkManager {
  /**
   * Initialize network settings
   */
  static async initialize() {
    try {
      await Promise.all([
        browser.privacy.network.peerConnectionEnabled.set({ value: true }),
        chrome.privacy.network.networkPredictionEnabled.set({ value: false }),
        chrome.privacy.network.webRTCIPHandlingPolicy.set({
          value: "disable_non_proxied_udp",
        }),
      ]);
      console.info("Network settings initialized");
    } catch (error) {
      console.error("Network initialization failed:", error);
    }
  }
}

/**
 * Proxy Manager for handling proxy configuration
 */
class ProxyManager {
  constructor() {
    this.proxyConfig = {
      type: proxy_scheme(),
      host: proxy_host(),
      port: proxy_port(),
    };

    this.initialize();
  }

  /**
   * Initialize proxy settings
   */
  async initialize() {
    try {
      await this.setupProxyListener();
      await this.setupStorageListener();
      await this.setupWindowListener();
      console.info("Proxy manager initialized");
    } catch (error) {
      console.error("Proxy initialization failed:", error);
    }
  }

  /**
   * Setup proxy request listener
   */
  async setupProxyListener() {
    browser.proxy.onRequest.addListener(this.handleProxyRequest.bind(this), {
      urls: ["<all_urls>"],
    });
    browser.proxy.onError.addListener(this.handleProxyError.bind(this));
  }

  /**
   * Setup storage change listener
   */
  async setupStorageListener() {
    browser.storage.onChanged.addListener(this.handleStorageChange.bind(this));
  }

  /**
   * Setup window creation listener
   */
  async setupWindowListener() {
    const platformInfo = await browser.runtime.getPlatformInfo();
    if (browser.windows) {
      browser.windows.onCreated.addListener(
        this.handleWindowCreation.bind(this)
      );
    }
  }

  /**
   * Handle proxy requests
   * @param {Object} requestDetails Request details
   * @return {Object} Proxy configuration
   */
  async handleProxyRequest(requestDetails) {
    try {
      // Handle proxy host requests
      if (isProxyHost(requestDetails)) {
        return this.proxyConfig;
      }

      // Handle extension requests
      if (this.isExtensionRequest(requestDetails)) {
        return this.proxyConfig;
      }

      // Handle container requests
      if (requestDetails.tabId > 0) {
        return await this.handleContainerRequest(requestDetails);
      }

      // Handle direct requests
      return await this.handleDirectRequest(requestDetails);
    } catch (error) {
      console.error("Proxy request handling failed:", error);
      return { type: "direct" };
    }
  }

  /**
   * Handle container-specific proxy requests
   * @param {Object} requestDetails Request details
   * @return {Object} Proxy configuration
   */
  async handleContainerRequest(requestDetails) {
    try {
      const tab = await browser.tabs.get(requestDetails.tabId);
      const context = await this.getContextIdentity(tab);

      if (!context) {
        return this.getDefaultProxy();
      }

      return await this.getContainerProxy(context, requestDetails);
    } catch (error) {
      console.error("Container request handling failed:", error);
      return this.getDefaultProxy();
    }
  }

  /**
   * Handle direct (non-container) proxy requests
   * @param {Object} requestDetails Request details
   * @return {Object} Proxy configuration
   */
  async handleDirectRequest(requestDetails) {
    try {
      // Check for local service ports first
      if (isLocalHost(requestDetails.url)) {
        const localProxyConfig = this.handleLocalServiceRequest(requestDetails);
        if (localProxyConfig !== undefined) {
          return localProxyConfig;
        }
      }

      // Handle I2P and proxy hosts
      if (i2pHost(requestDetails)) {
        console.debug("(proxy) Direct I2P host request:", requestDetails.url);
        return this.proxyConfig;
      }

      if (isProxyHost(requestDetails)) {
        console.debug("(proxy) Direct proxy host request:", requestDetails.url);
        return this.proxyConfig;
      }

      // Handle router console requests
      if (isRouterHost(requestDetails.url)) {
        console.debug(
          "(proxy) Direct router console request:",
          requestDetails.url
        );
        return null;
      }

      // RPC request handling
      if (requestDetails.url.includes("rpc")) {
        console.debug("(proxy) Direct RPC request:", requestDetails.url);
        return this.proxyConfig;
      }

      // Default to direct connection for non-I2P traffic
      console.debug("(proxy) Direct clearnet request:", requestDetails.url);
      return { type: "direct" };
    } catch (error) {
      console.error("Direct request handling failed:", error);
      return { type: "direct" };
    }
  }

  /**
   * Handle local service port requests
   * @private
   * @param {Object} requestDetails Request details
   * @return {Object|undefined} Proxy configuration or undefined
   */
  handleLocalServiceRequest(requestDetails) {
    // Local service port mapping
    const LOCAL_SERVICES = {
      [PROXY_CONFIG.PORTS.IRC]: true, // IRC Console
      [PROXY_CONFIG.PORTS.TOR]: true, // Tor Console
      [PROXY_CONFIG.PORTS.BLOG]: true, // Blog Console
      [PROXY_CONFIG.PORTS.TORRENT]: true, // Torrent Console
    };

    // Extract port from URL
    const url = new URL(requestDetails.url);
    const port = url.port;

    // Return null proxy for local service ports
    if (LOCAL_SERVICES[port]) {
      console.debug(
        `(proxy) Local service request on port ${port} :`,
        requestDetails.url
      );
      return null;
    }

    // Let the main proxy logic handle other local requests
    return undefined;
  }

  /**
   * Get container identity
   * @param {Object} tab Browser tab
   * @return {Object} Container context
   */
  async getContextIdentity(tab) {
    try {
      if (
        tab.cookieStoreId === "firefox-default" ||
        tab.cookieStoreId === "firefox-private"
      ) {
        return null;
      }
      return await browser.contextualIdentities.get(tab.cookieStoreId);
    } catch (error) {
      console.error("Context identity lookup failed:", error);
      return null;
    }
  }

  /**
   * Get container-specific proxy configuration
   * @param {Object} context Container context
   * @param {Object} requestDetails Request details
   * @return {Object} Proxy configuration
   */
  async getContainerProxy(context, requestDetails) {
    const proxyMap = {
      [PROXY_CONFIG.MESSAGES.IRC]: () => this.getIRCProxy(requestDetails),
      [PROXY_CONFIG.MESSAGES.TOR]: () => this.getTorProxy(requestDetails),
      [PROXY_CONFIG.MESSAGES.BLOG]: () => this.getBlogProxy(requestDetails),
      [PROXY_CONFIG.MESSAGES.TITLE]: () => this.getMainProxy(requestDetails),
      [PROXY_CONFIG.MESSAGES.ROUTER]: () => this.getRouterProxy(requestDetails),
      [PROXY_CONFIG.MESSAGES.TORRENT]: () =>
        this.getTorrentProxy(requestDetails),
    };

    const handler = proxyMap[context.name];
    return handler ? await handler() : this.getDefaultProxy();
  }

  /**
   * Get service-specific proxy configurations
   */
  getIRCProxy(requestDetails) {
    return !requestDetails.url.includes(PROXY_CONFIG.PORTS.IRC)
      ? this.proxyConfig
      : null;
  }

  getTorProxy(requestDetails) {
    return !requestDetails.url.includes(PROXY_CONFIG.PORTS.TOR)
      ? this.proxyConfig
      : null;
  }

  getBlogProxy(requestDetails) {
    return !requestDetails.url.includes(PROXY_CONFIG.PORTS.BLOG)
      ? this.proxyConfig
      : null;
  }

  getMainProxy(requestDetails) {
    if (
      requestDetails.url.startsWith(
        `http ://${proxy_host()}:${control_port()}/i2psnark/`
      )
    ) {
      return null;
    }
    return this.proxyConfig;
  }

  getRouterProxy(requestDetails) {
    return isRouterHost(requestDetails.url) ? null : this.proxyConfig;
  }

  getTorrentProxy(requestDetails) {
    return requestDetails.url.includes(PROXY_CONFIG.PORTS.TORRENT)
      ? null
      : this.getRouterProxy(requestDetails);
  }

  /**
   * Get default proxy configuration
   * @return {Object} Default proxy
   */
  getDefaultProxy() {
    return { type: "direct" };
  }

  /**
   * Handle proxy errors
   * @param {Error} error Proxy error
   */
  handleProxyError(error) {
    if (error.includes("Invalid proxy server type")) {
      console.warn("Invalid proxy configuration:", error);
    } else {
      console.error("Proxy error:", error);
    }
  }

  /**
   * Handle storage changes
   */
  async handleStorageChange() {
    try {
      await this.updateConfig();
      await this.setupProxyListener();
    } catch (error) {
      console.error("Storage update failed:", error);
    }
  }

  /**
   * Handle window creation
   */
  async handleWindowCreation() {
    try {
      await this.updateConfig();
      await this.setupProxyListener();
    } catch (error) {
      console.error("Window creation handling failed:", error);
    }
  }

  /**
   * Update proxy configuration
   */
  async updateConfig() {
    console.info(
      "Updating proxy configuration:",
      `Scheme : ${proxy_scheme()},`,
      `Host : ${proxy_host()},`,
      `Port : ${proxy_port()},`,
      `Control : ${control_host()} :${control_port()}`
    );
  }

  /**
   * Check if request is from extension
   * @param {Object} requestDetails Request details
   * @return {boolean}
   */
  isExtensionRequest(requestDetails) {
    return requestDetails.originUrl === browser.runtime.getURL("security.html");
  }
}

// Initialize managers
NetworkManager.initialize();
const proxyManager = new ProxyManager();

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NetworkManager,
    ProxyManager,
    PROXY_CONFIG,
  };
}
