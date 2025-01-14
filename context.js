/**
 * @fileoverview I2P Container Context Manager
 * Handles container tab creation and management for I2P browsing contexts
 */

// Constants
const UI_STRINGS = {
  TITLE_PREFACE: chrome.i18n.getMessage('titlePreface'),
  API_ERROR_MESSAGE: 'browser.contextualIdentities not available. Check that the privacy.userContext.enabled pref is set to true, and reload the add-on.',
  NO_IDENTITIES_MESSAGE: 'No identities returned from the API.'
};

const TAB_ACTIONS = {
  NEW_TAB: 'new-i2p browser tab',
  CLOSE_ALL: 'close-all i2p browser tabs'
};

const TAB_OPTIONS = [
  {
    text: 'New I2P Browser Tab',
    action: TAB_ACTIONS.NEW_TAB
  },
  {
    text: 'Close All I2P Browser Tabs',
    action: TAB_ACTIONS.CLOSE_ALL
  }
];

/**
 * Handles browser operation errors
 * @param {Error} error - Browser operation error
 */
function handleError(error) {
  console.error('Container operation failed:', error);
}

/**
 * Creates a new tab in specified container window
 * @param {Object} windowInfo - Window information
 * @param {string} cookieStoreId - Container identity
 */
async function createContainerTab(windowInfo, cookieStoreId) {
  try {
    await browser.tabs.create({
      windowId: windowInfo.id,
      url: 'about:blank',
      cookieStoreId: cookieStoreId
    });
    console.info(`Created container tab in window: ${windowInfo.id}`);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Handles container tab operations
 * @param {Event} event - UI event
 */
async function handleContainerAction(event) {
  event.preventDefault();
  const { action, identity } = event.target.dataset;

  try {
    switch (action) {
      case TAB_ACTIONS.NEW_TAB:
        const window = await browser.windows.create();
        await createContainerTab(window, identity);
        break;

      case TAB_ACTIONS.CLOSE_ALL:
        const tabs = await browser.tabs.query({ cookieStoreId: identity });
        await browser.tabs.remove(tabs.map(tab => tab.id));
        break;

      default:
        console.warn('Unknown container action:', action);
    }
  } catch (error) {
    handleError(error);
  }
}

/**
 * Creates UI elements for container options
 * @param {HTMLElement} parentNode - Container for options
 * @param {Object} identity - Container identity
 */
function createContainerOptions(parentNode, identity) {
  TAB_OPTIONS.forEach(option => {
    const link = document.createElement('a');
    Object.assign(link, {
      href: '#',
      innerText: option.text,
      dataset: {
        action: option.action,
        identity: identity.cookieStoreId
      }
    });
    
    link.addEventListener('click', handleContainerAction);
    parentNode.appendChild(link);
  });
}

/**
 * Creates UI element for container identity
 * @param {Object} identity - Container identity
 * @returns {HTMLElement}
 */
function createIdentityElement(identity) {
  const row = document.createElement('div');
  const span = document.createElement('div');
  
  span.className = 'identity';
  span.innerText = identity.name;
  
  row.appendChild(span);
  createContainerOptions(row, identity);
  
  return row;
}

/**
 * Initializes container UI
 * @param {HTMLElement} containerList - Container list element
 */
async function initializeContainerUI(containerList) {
  if (!browser.contextualIdentities) {
    containerList.innerText = UI_STRINGS.API_ERROR_MESSAGE;
    return;
  }

  try {
    const identities = await browser.contextualIdentities.query({
      name: UI_STRINGS.TITLE_PREFACE
    });

    if (!identities.length) {
      containerList.innerText = UI_STRINGS.NO_IDENTITIES_MESSAGE;
      return;
    }

    identities.forEach(identity => {
      const element = createIdentityElement(identity);
      containerList.appendChild(element);
      console.debug('Added container identity:', identity.name);
    });
  } catch (error) {
    handleError(error);
    containerList.innerText = error.message;
  }
}

// Initialize container management
const identityList = document.getElementById('identity-list');
if (identityList) {
  initializeContainerUI(identityList);
} else {
  console.error('Identity list container not found');
}