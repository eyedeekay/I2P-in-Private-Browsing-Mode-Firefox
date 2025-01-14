/**
 * @fileoverview I2P Bookmark Manager
 * Handles bookmark creation and management for I2P extension toolbar
 */

// Constants for bookmark configuration
const BOOKMARK_CONFIG = {
  TOOLBAR_NAME: "I2P Toolbar",
  DEFAULT_BOOKMARKS: [
    {
      title: "I2P Extension Home Page",
      getUrl: () => browser.runtime.getURL("home.html"),
    },
    {
      title: "Bittorrent",
      getUrl: (host, port) => `http://${host}:${port}/i2psnark`,
    },
    {
      title: "Hidden Services Manager",
      getUrl: (host, port) => `http://${host}:${port}/i2ptunnel`,
    },
    {
      title: "Web Mail",
      getUrl: (host, port) => `http://${host}:${port}/webmail`,
    },
    {
      title: "I2P Console",
      getUrl: (host, port) => `http://${host}:${port}/home`,
    },
  ],
};

/**
 * Bookmark Manager class for handling I2P bookmarks
 */
class I2PBookmarkManager {
  constructor() {
    this.controlHost = control_host();
    this.controlPort = control_port();
  }

  /**
   * Creates a bookmark with error handling
   * @param {Object} params Bookmark parameters
   * @return {Promise<browser.bookmarks.BookmarkTreeNode>}
   */
  async createBookmark({ url, title, parentId }) {
    try {
      const bookmark = await browser.bookmarks.create({ url, title, parentId });
      console.info("Created bookmark:", title);
      return bookmark;
    } catch (error) {
      console.error(`Failed to create bookmark ${title} :`, error);
      throw error;
    }
  }

  /**
   * Creates the I2P toolbar folder
   * @param {browser.bookmarks.BookmarkTreeNode} toolbar Parent toolbar node
   * @return {Promise<browser.bookmarks.BookmarkTreeNode>}
   */
  async createToolbarFolder(toolbar) {
    try {
      const existing = await browser.bookmarks.search(
        BOOKMARK_CONFIG.TOOLBAR_NAME
      );
      if (existing.length) {
        return existing[0];
      }

      const folder = await this.createBookmark({
        title: BOOKMARK_CONFIG.TOOLBAR_NAME,
        parentId: toolbar.id,
      });

      await this.populateToolbar(folder);
      return folder;
    } catch (error) {
      console.error("Failed to create toolbar folder:", error);
      throw error;
    }
  }

  /**
   * Creates a single default bookmark if it doesn't exist
   * @param {Object} bookmark Bookmark configuration
   * @param {string} parentId Parent folder ID
   */
  async createDefaultBookmark(bookmark, parentId) {
    try {
      const existing = await browser.bookmarks.search({
        title: bookmark.title,
      });
      if (!existing.length) {
        await this.createBookmark({
          url: bookmark.getUrl(this.controlHost, this.controlPort),
          title: bookmark.title,
          parentId,
        });
      }
    } catch (error) {
      console.error(
        `Failed to create default bookmark ${bookmark.title}:`,
        error
      );
    }
  }

  /**
   * Populates toolbar with default bookmarks
   * @param {browser.bookmarks.BookmarkTreeNode} toolbar Toolbar folder node
   */
  async populateToolbar(toolbar) {
    try {
      await Promise.all(
        BOOKMARK_CONFIG.DEFAULT_BOOKMARKS.map((bookmark) =>
          this.createDefaultBookmark(bookmark, toolbar.id)
        )
      );
      await this.updateBookmarkState(true);
    } catch (error) {
      console.error("Failed to populate toolbar:", error);
    }
  }

  /**
   * Updates bookmark state in storage
   * @param {boolean} state New bookmark state
   */
  async updateBookmarkState(state) {
    try {
      await browser.storage.local.set({ bookmarks_state: state });
      if (typeof defaultSettings !== "undefined") {
        defaultSettings.bookmarks_state = state;
      }
    } catch (error) {
      console.error("Failed to update bookmark state:", error);
    }
  }

  /**
   * Initializes bookmark setup
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      const platform = await browser.runtime.getPlatformInfo();
      if (platform.os === "android") {
        console.info("Skipping bookmark setup on Android");
        return;
      }

      const toolbars = await browser.bookmarks.search({ query: "Toolbar" });
      if (!toolbars.length) {
        throw new Error("Browser toolbar not found");
      }

      await this.createToolbarFolder(toolbars[0]);
    } catch (error) {
      console.error("Bookmark initialization failed:", error);
    }
  }

  /**
   * Checks if bookmarks need to be initialized
   * @param {Object} state Current bookmark state
   */
  async checkInitialization(state = {}) {
    if (!state.bookmarks_state) {
      await this.initialize();
    }
  }
}

// Singleton instance
const bookmarkManager = new I2PBookmarkManager();

/**
 * Initialize bookmarks system
 */
async function initializeBookmarks() {
  if (!browser?.windows) {
    console.warn("Browser windows API not available");
    return;
  }

  try {
    const state = await browser.storage.local.get("bookmarks_state");
    await bookmarkManager.checkInitialization(state);
  } catch (error) {
    console.error("Failed to initialize bookmarks:", error);
    await bookmarkManager.initialize();
  }
}

// Setup event listeners
document.addEventListener("DOMContentLoaded", () => {
  const bookmarksButton = document.getElementById("bookmarksButton");
  if (bookmarksButton) {
    bookmarksButton.addEventListener("click", () =>
      bookmarkManager.initialize()
    );
  }
});

// Initialize if browser API is available
if (browser) {
  initializeBookmarks();
}
