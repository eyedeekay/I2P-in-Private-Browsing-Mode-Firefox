default: zip

install: uninstall
	mkdir -p /usr/share/webext/i2psetproxy.js@eyedeekay.github.io \
		/usr/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/
	cp -rv options /usr/share/webext/i2psetproxy.js@eyedeekay.github.io/options
	cp -rv icons /usr/share/webext/i2psetproxy.js@eyedeekay.github.io/icons
	cp -rv _locales /usr/share/webext/i2psetproxy.js@eyedeekay.github.io/_locales
	cp background.js /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp proxy.js /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp info.js /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp content.js /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp info.css /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp window.html /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp manifest.json /usr/share/webext/i2psetproxy.js@eyedeekay.github.io/
	cp README.md /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	cp LICENSE /usr/share/webext/i2psetproxy.js@eyedeekay.github.io
	ln -sf /usr/share/webext/i2psetproxy.js@eyedeekay.github.io \
		/usr/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/i2psetproxy.js@eyedeekay.github.io

uninstall:
	rm -rf /usr/share/webext/i2psetproxy.js@eyedeekay.github.io \
		/usr/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/i2psetproxy.js@eyedeekay.github.io

clobber:
	rm -f ../i2psetproxy.js.zip ../i2p_proxy*.xpi

VERSION=1.28-sp

xpi:
	mv ~/Downloads/i2p_proxy-$(VERSION)-an+fx.xpi ../i2psetproxy.js@eyedeekay.github.io.xpi

cp:
	cp ../i2psetproxy.js@eyedeekay.github.io.xpi ./i2psetproxy.js@eyedeekay.github.io.xpi

version:
	sed -i 's|$(shell grep "\"version\": " manifest.json)|  \"version\": \"$(VERSION)\",|g' manifest.json

zip: version
	zip --exclude="./i2psetproxy.js@eyedeekay.github.io.xpi" \
		--exclude="i2psetproxy.js.png" -r -FS ../i2psetproxy.js.zip *

profile-install:
	cp ./i2psetproxy.js@eyedeekay.github.io.xpi $(HOME)/.mozilla/firefox/firefox.profile.i2p/firefox.profile.i2p/extensions
	cp ./i2psetproxy.js@eyedeekay.github.io.xpi $(HOME)/.mozilla/firefox/.firefox.profile.i2p.default/extensions

to-profile:
	 cp ./i2psetproxy.js@eyedeekay.github.io.xpi /usr/local/lib/firefox.profile.i2p/firefox.profile.i2p/extensions/

pi: profile-install

DESC="A simple plugin for configuring an i2p browser."

release:
	gothub release -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n $(VERSION) -d $(DESC)

upload:
	gothub upload -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js@eyedeekay.github.io.xpi" -f "../i2psetproxy.js@eyedeekay.github.io.xpi"

lib: libpolyfill

libpolyfill:
	wget -O chromium/browser-polyfill.min.js https://unpkg.com/webextension-polyfill/dist/browser-polyfill.min.js

fmt:
	find . -name '*.js' -exec jsfmt -w {} \;
