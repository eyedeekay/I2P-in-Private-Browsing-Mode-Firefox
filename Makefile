PREFIX:=/usr

default: zip

install: uninstall
	mkdir -p $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}
	cp -r ./chromium/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./icons/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./_locales/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./options/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.js $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.html $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.css $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.md $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.xpi $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./manifest.json $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./LICENSE $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	ln -s $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}

uninstall:
	rm -rf $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io \
		$(PREFIX)/share/webext/i2psetproxy.js@eyedeekay.github.io \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}

ls:
	ls -lah $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io; \
	ls -lah $(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}

clean:
	rm -f ../i2psetproxy.js.zip ../i2p_proxy*.xpi

## EVEN RELEASES are AMO RELEASES
## ODD RELEASES are SELFHOSTED RELEASES

MOZ_VERSION=0.36
VERSION=0.36
#VERSION=1.27

xpi:
	wget -O ../i2ppb@eyedeekay.github.io.xpi \
		https://addons.mozilla.org/firefox/downloads/file/3419789/i2psetproxyjs-$(MOZ_VERSION)-an+fx.xpi
	cp ../i2ppb@eyedeekay.github.io.xpi ./i2ppb@eyedeekay.github.io.xpi

version:
	sed -i 's|$(shell grep "\"version\": " manifest.json)|  \"version\": \"$(VERSION)\",|g' manifest.json

zip: version
	zip --exclude="./i2ppb@eyedeekay.github.io.xpi" \
		--exclude="./i2psetproxy.js@eyedeekay.github.io.xpi" \
		--exclude="./i2psetproxy.js.png" \
		--exclude="./i2psetproxy.js.gif" \
		--exclude="./.git" -r -FS ../i2psetproxy.js.zip *

release:
	cat desc | gothub release -p -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n $(VERSION) -d -

delete-release:
	gothub delete -u eyedeekay -r i2psetproxy.js -t $(VERSION); true

recreate-release: delete-release release upload

upload: upload-xpi upload-deb

upload-xpi:
	gothub upload -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2ppb@eyedeekay.github.io.xpi" -f "./i2ppb@eyedeekay.github.io.xpi"

upload-deb:
	gothub upload -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.deb" -f "../i2psetproxy.js_$(VERSION)-1_amd64.deb"

lib: libpolyfill

libpolyfill:
	wget -O chromium/browser-polyfill.js https://unpkg.com/webextension-polyfill/dist/browser-polyfill.js

fmt:
	find . -path ./node_modules -prune -o -name '*.js' -exec prettier --write {} \;

deborig:
	rm -rfv ../i2psetproxy.js-$(VERSION)
	cp -rv . ../i2psetproxy.js-$(VERSION)
	tar --exclude='./.git' --exclude="./node_modules" -cvzf ../i2psetproxy.js_$(VERSION).orig.tar.gz .

deb: deborig
	cd ../i2psetproxy.js-$(VERSION) && debuild -us -uc -rfakeroot
