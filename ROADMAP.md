Roadmap:
========

2.5.8:
------

Refactor the codebase to make more use of reusable code. De-spaghettify and DRY things out.

2.6.0:
------

Refactor the codebase to make more use of reusable code. De-spaghettify and DRY things out.

2.7.0:
------

# Finished Feature Breakout:

Create 2 new extensions which include functionality which has remained entirely the same for as long as it has existed, and which is suitable for use in it's own extensions. This is to decrease the maintenance burden of this extension, which has grown significant functionality outside it's original scope, and improve UI by providing clearer and less complex user-interfaces which are limited by the constraints of the WebExtensions system.

- Remove i2psnark-rpc functionality and place it into it's own, separate extension.
 1. Remove options for configuring i2psnark-rpc from options menu and place them into a separate browser extension. This step initializes a new browser extension.
 2. Remove Download control menu from Browser Action panel, and place it into the new browser extension.
 3. Move torrent Navbar Buttons from old extension to new extension.
 4. Remove torrent-on-page discovery functionality from background scripts, and place it into the new browser extension.
 5. Set up reliable, straightforward release process.

- Remove i2pcontrol-rpc functionality and place it into it's own, separate extension.
 1. Remove options for configuring i2pcontrol-rpc from options menu and place them into a separate browser extension. This step initializes a new browser extension.
 2. Set up `toopie.html` as a browser extension, drawing upon the options which are now controlled by the browser extension options page.
 3. Set up reliable, straightforward release process.

- Create an "Extension Template" for plugins which require outgoing traffic to be proxied over I2P.
 - Create options for configuring the proxy
 - Create reference extension-bound proxification function and set it up for the onRequest event.
 - Create example WebExtension I2P application
