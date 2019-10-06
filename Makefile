PREFIX:=/usr

default: zip

install: uninstall
	install -d $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/
	install -d options $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io/options
	install -d icons $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io/icons
	install -d _locales $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io/_locales
	install background.js $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	install proxy.js $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	install info.js $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	install content.js $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	install info.css $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	install window.html $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	install manifest.json $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io/
	install README.md $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	install LICENSE $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io
	ln -sf $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/i2psetproxy.js@eyedeekay.github.io

uninstall:
	rm -rf $(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}/i2psetproxy.js@eyedeekay.github.io

clobber:
	rm -f ../i2psetproxy.js.zip ../i2p_proxy*.xpi

VERSION=1.27

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
	 cp ./i2psetproxy.js@eyedeekay.github.io.xpi $(PREFIX)/local/lib/firefox.profile.i2p/firefox.profile.i2p/extensions/

pi: profile-install

DESC="A simple plugin for configuring an i2p browser."

release:
	gothub release -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n $(VERSION) -d $(DESC)

upload:
	gothub upload -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js@eyedeekay.github.io.xpi" -f "../i2psetproxy.js@eyedeekay.github.io.xpi"
	gothub upload -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.deb" -f "../i2psetproxy.js_$(VERSION)-1_amd64.deb"

lib: libpolyfill

libpolyfill:
	wget -O chromium/browser-polyfill.min.js https://unpkg.com/webextension-polyfill/dist/browser-polyfill.min.js

fmt:
	find . -path ./node_modules -prune -o -name '*.js' -exec prettier --write {} \;

deborig:
	rm -rfv ../i2psetproxy.js-$(VERSION)
	cp -rv . ../i2psetproxy.js-$(VERSION)
	tar --exclude='./.git' -cvzf ../i2psetproxy.js-$(VERSION).tar.gz .

deb: deborig
	cd ../i2psetproxy.js-$(VERSION) && debuild -us -uc -rfakeroot
