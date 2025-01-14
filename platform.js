/**
 * @fileoverview I2P Platform Detection Manager
 * Handles platform detection and feature support for Firefox WebExtensions
 */

// Platform configuration constants
const PLATFORM_CONFIG = {
  PLATFORMS: {
    ANDROID: "android",
    DESKTOP: "desktop",
  },
  FEATURES: {
    CLOSABLE: "closable",
    CONTAINER_TABS: "containerTabs",
    SIDEBAR: "sidebar",
  },
};

/**
 * Platform Manager for handling platform-specific functionality
 */
class PlatformManager {
  constructor() {
    // Platform state
    this.platformState = {
      isAndroid: false,
      isInitialized: false,
    };

    // Initialize platform detection
    this.initialize();
  }

  /**
   * Initialize platform detection
   * @private
   * @return {Promise<void>}
   */
  async initialize() {
    try {
      const platformInfo = await browser.runtime.getPlatformInfo();
      this.platformState.isAndroid =
        platformInfo.os === PLATFORM_CONFIG.PLATFORMS.ANDROID;
      this.platformState.isInitialized = true;

      console.info(
        `(platform) Running in ${
          this.platformState.isAndroid ? "Android" : "Desktop"
        } detected`
      );
    } catch (error) {
      console.error("Platform detection failed:", error);
      this.platformState.isAndroid = false;
      this.platformState.isInitialized = true;
    }
  }

  /**
   * Check if running on Android
   * @return {boolean}
   */
  isAndroid() {
    if (!this.platformState.isInitialized) {
      console.warn("Platform detection not yet initialized");
      return false;
    }
    return this.platformState.isAndroid;
  }

  /**
   * Check if running on Desktop
   * @return {boolean}
   */
  isDesktop() {
    return !this.isAndroid();
  }

  /**
   * Check if windows are closable
   * @return {boolean}
   */
  isClosable() {
    return this.isDesktop();
  }

  /**
   * Get current platform state
   * @return {Object}
   */
  getPlatformState() {
    return { ...this.platformState };
  }
}

// Create singleton instance
const platformManager = new PlatformManager();

/**
 * Legacy API compatibility layer
 */
const PlatformAPI = {
  /**
   * Check if running on Android (legacy support)
   * @return {boolean}
   */
  isDroid() {
    const isAndroid = platformManager.isAndroid();
    console.log("(platform) android?", isAndroid);
    return isAndroid;
  },

  /**
   * Check if windows are not closable (legacy support)
   * @return {boolean}
   */
  notClosable() {
    return !platformManager.isClosable();
  },
};

// Export legacy API functions to window
window.isDroid = PlatformAPI.isDroid;
window.notClosable = PlatformAPI.notClosable;

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    platformManager,
    PLATFORM_CONFIG,
    PlatformAPI,
  };
}
