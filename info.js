/**
 * @fileoverview I2P Browser Information Manager
 * Handles browser settings, privacy features, and navigation for I2P extension
 */

// Constants
const CONFIG = {
  TITLE_PREFACE: chrome.i18n.getMessage("titlePreface"),
  ROUTER: {
    DEFAULT_HOST: "127.0.0.1",
    DEFAULT_PORT: "7657",
  },
  SNOWFLAKE_ID: "{b11bea1f-a888-4332-8d8a-cec2be7d24b9}",
  UPDATE_INTERVAL: 0.2 * 60 * 1000,
  IRC_URL: "http://127.0.0.1:7669",
};

const UI_ELEMENTS = {
  PANELS: {
    BROWSER: "browserpanel",
    TORRENT: "torrentpanel",
  },
  LISTS: {
    PEERS: "label-peers-list",
    BANDWIDTH: "label-bandwidth-list",
  },
};

/**
 * Privacy Manager for handling browser privacy settings
 */
class PrivacyManagerInfo {
  /**
   * Check WebRTC peer connection status
   */
  static async checkPeerConnection() {
    try {
      const { value: webrtc } =
        await browser.privacy.network.peerConnectionEnabled.get({});
      const webrtcToggle = document.getElementById("enable-web-rtc");
      if (webrtcToggle) {
        webrtcToggle.checked = webrtc;
      }
      console.info("(info) WebRTC status:", webrtc);
    } catch (error) {
      console.error("WebRTC check failed:", error);
    }
  }

  /**
   * Check Snowflake plugin status
   */
  static async checkSnowflake() {
    try {
      const snowflake = await browser.management.get(CONFIG.SNOWFLAKE_ID);
      console.info("(info) Snowflake plugin found:", snowflake);
      await this.assurePeerConnection();
    } catch (error) {
      console.info("(info) Snowflake not found:", error);
    }
  }

  /**
   * Check history settings
   */
  static async checkHistory() {
    try {
      const { disable_history = false } = await browser.storage.local.get(
        "disable_history"
      );
      const historyToggle = document.getElementById("disable-history");
      if (historyToggle) {
        historyToggle.checked = disable_history;
      }
      console.info("(info) History disabled:", disable_history);
    } catch (error) {
      console.error("History check failed:", error);
    }
  }

  /**
   * Check referer settings
   */
  static async checkReferer() {
    try {
      const { disable_referer = false } = await browser.storage.local.get(
        "disable_referer"
      );
      const refererToggle = document.getElementById("disable-referer");
      if (refererToggle) {
        refererToggle.checked = disable_referer;
      }
      console.info("(info) Referer disabled:", disable_referer);
    } catch (error) {
      console.error("Referer check failed:", error);
    }
  }
}

/**
 * Tab Manager for handling browser navigation
 */
class TabManager {
  /**
   * Create a new browser tab
   * @param {Object} options Tab creation options
   * @return {Promise<browser.tabs.Tab>}
   */
  static async createTab(options) {
    try {
      const tab = await browser.tabs.create(options);
      console.info("(info) Tab created:", options.url);
      return tab;
    } catch (error) {
      console.error("Tab creation failed:", error);
      throw error;
    }
  }

  /**
   * Create a tab in I2P container
   * @param {string} url Destination URL
   */
  static async createContainerTab(url) {
    try {
      const contexts = await browser.contextualIdentities.query({
        name: CONFIG.TITLE_PREFACE,
      });

      if (!contexts.length) {
        throw new Error("No I2P container found");
      }

      return this.createTab({
        url,
        cookieStoreId: contexts[0].cookieStoreId,
      });
    } catch (error) {
      console.error("Container tab creation failed:", error);
      throw error;
    }
  }

  /**
   * Navigate to local I2P service
   * @param {string} path Service path
   */
  static async goToService(path) {
    try {
      const routerAddress = await RouterManager.getRouterAddress();
      await this.createTab({
        url: `http://${routerAddress}${path}`,
      });
    } catch (error) {
      console.error(`Service navigation failed : ${path}`, error);
    }
  }
}

/**
 * Router Manager for I2P router operations
 */
class RouterManager {
  /**
   * Get router address
   * @return {string}
   */
  static getRouterAddress() {
    try {
      return `${control_host()}:${control_port()}`;
    } catch {
      return `${CONFIG.ROUTER.DEFAULT_HOST}:${CONFIG.ROUTER.DEFAULT_PORT}`;
    }
  }

  /**
   * Generate new identity
   */
  static async generateNewIdentity() {
    try {
      const routerAddress = this.getRouterAddress();
      const response = await fetch(`http ://${routerAddress}`);
      console.info("(info) New identity generated");
      return response;
    } catch (error) {
      console.error("Identity generation failed:", error);
      throw error;
    }
  }
}

/**
 * UI Manager for handling interface elements
 */
class UIManager {
  /**
   * Toggle panel visibility
   * @param {string} showPanel Panel to show
   * @param {string} hidePanel Panel to hide
   */
  static togglePanels(showPanel, hidePanel) {
    try {
      const show = document.getElementById(showPanel);
      const hide = document.getElementById(hidePanel);

      if (show && hide) {
        show.style.display = "block";
        hide.style.display = "none";
      }
    } catch (error) {
      console.error("Panel toggle failed:", error);
    }
  }

  /**
   * Initialize UI elements
   */
  static initializeUI() {
    Object.values(UI_ELEMENTS.LISTS).forEach((listId) => {
      const list = document.getElementById(listId);
      if (list) {
        list.style.display = "none";
      }
    });
  }
}

/**
 * Click Handler for UI interactions
 */
class ClickHandler {
  /**
   * Handle click events
   * @param {MouseEvent} event Click event
   */
  static async handleClick(event) {
    event.preventDefault();
    const { id: targetId } = event.target;

    try {
      // Panel creation
      if (targetId.startsWith("window-create-")) {
        await TabManager.createTab({
          type: "panel",
          incognito: true,
        });
      }

      // Service navigation
      else if (targetId.startsWith("window-visit-")) {
        const service = targetId.split("-")[2];
        await this.handleServiceNavigation(service);
      }

      // Settings toggles
      else if (targetId === "enable-web-rtc") {
        await this.handleWebRTCToggle(event.target.checked);
      }

      // Other actions
      else if (targetId === "generate-fresh-tunnel") {
        await RouterManager.generateNewIdentity();
      }
    } catch (error) {
      console.error("Click handling failed:", error);
    }
  }

  /**
   * Handle service navigation
   * @param {string} service Service identifier
   */
  static async handleServiceNavigation(service) {
    const serviceMap = {
      console: "/home",
      i2ptunnel: "/i2ptunnel",
      susimail: "/susimail",
      snark: "/i2psnark",
    };

    if (serviceMap[service]) {
      await TabManager.goToService(serviceMap[service]);
    }
  }
}

/**
 * Initialize the information manager
 */
async function initialize() {
  try {
    // Initialize privacy settings
    await Promise.all([
      PrivacyManagerInfo.checkPeerConnection(),
      PrivacyManagerInfo.checkSnowflake(),
      PrivacyManagerInfo.checkHistory(),
      PrivacyManagerInfo.checkReferer(),
    ]);

    // Initialize UI
    UIManager.initializeUI();
    document.addEventListener(
      "click",
      ClickHandler.handleClick.bind(ClickHandler)
    );

    // Set up content updates
    if (typeof UpdateContents !== "undefined") {
      setInterval(UpdateContents, CONFIG.UPDATE_INTERVAL);
    }

    console.info("(info) Information manager initialized");
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

// Initialize if browser API is available
if (browser?.windows) {
  initialize();
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PrivacyManager: PrivacyManagerInfo,
    TabManager,
    RouterManager,
    UIManager,
    ClickHandler,
    CONFIG,
  };
}
