The I2P Browser has made strides at improving users anonymity when browsing
the anonymous web inside of I2P. However, it has in many ways simply re-hashed
the existing work of Tor on the Tor Browser. This is mostly a good thing, but it
is unfortunate because in a sense we have failed to add I2P specific features
that could improve the user experience and set us apart from the Tor Browser.

I think that moving forward, we should try to extend the functionality of I2P
Browser into more I2P-specific realms and make an effort to make those things
more accessible and highlight that they are in use. I don't really know how to
explain what I mean without describing what I want to do, so

Let's avoid *adding* features to i2pbutton
------------------------------------------

i2pbutton contains alot of code from Tor which even they don't really want to
maintain. It's dying the same long, slow death it's always been dying, since
back before there was a Tor Browser and torbutton was just an easy way to
configure Tor in your Firefox browser. I don't relish the thought of being one
the last two groups on the planet maintaining an XUL extension, so I think that
we should always be trying to do less with i2pbutton and more with a modern
extension. Other advantages of modern extensions are better debugging tools
and easier-to-use, more understandable API's for doing the following other
things.

Contexts for Security and Placing Router Applications under their own Origin
----------------------------------------------------------------------------

It is possible, however unlikely, for an attack on a local service or a router
plugin to leak information about what's going on on the router console because
they will share the same origin. We can resolve this issue, though, by placing
applications each into their own origin under a so-called "Container Tab,"
completely separating eepWeb traffic and Router Console administration. The
origin of the application will be the same as the part of the application URL
*after* localhost:7657, so for instance "http://localhost:7657/torrents"
would become just "torrents" in the URL bar and have that origin.

Dynamic Themes
--------------

Since I2P Browsing and Router Console Administration are going to be separated
to their own contextual identities, we can manipulate the appearance of the
Firefox browser to accomplish 2 things: We can indicate which context we are in
both by manipulating the UI text and color, and manipulate UI elements based on
what context we're in or even what URL(In the router console) we're on. We can
use this to make router console applications appear more tightly integrated with
the functionality of the browser. It's kind of obliquely like how many
applications are written with user-interfaces that are actually just
browsers(Including Mattermost), but with us using the whole browser,
acknowledging it's presence and utility but quite literally highlighting(in
color) our unique features. So for instance, when the user is using snark it
could change color to match snark and change text to say "Torrent Client."

Application Integration - Torrents
----------------------------------

I2P's strengths are in it's applications, but many users never even make it to
the applications, and even if they do, the I2P applications often lack the
familiar workflows that people are used to. For instance, when one downloads
a torrent on the non-anonymous internet, you simply click a link and the browser
"Handles" the link, automatically launching the torrent client, adding the
torrent, and sometimes prompting the user for more actions. This isn't possible
yet with i2psnark and an external browser, but in I2P browser we can write a
"Protocol Handler" which talks to snark-rpc, replicating the ease of just
clicking a torrent link to automatically add it to a torrent client. Of course
that does require us to bundle the snark-rpc plugin. Besides that, once we've
added the torrent, we can keep talking to snark-rpc to keep track of the
download progress and display information about that in the already-available
Firefox downloads menu that users are already familiar with, so that they can
keep track of the files they are downloading after navigating away from the
snark interface, or perhaps even without needing to interact with snark at all.
