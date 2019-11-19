PREFIX:=/usr

default: zip

install: uninstall
	mkdir -p $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io \
		$(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/i2pcontrol \
		$(PREFIX)/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}
	cp -r ./chromium/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./icons/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./_locales/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp -r ./options/ $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./*.js $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/
	cp ./i2pcontrol/i2pcontrol.js $(PREFIX)/share/webext/i2ppb@eyedeekay.github.io/i2pcontrol/i2pcontrol.js
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
	rm -fr ../i2psetproxy.js.zip ../i2p_proxy*.xpi ../i2p*.xpi #../i2psetproxy.js_*.*

## EVEN RELEASES are AMO RELEASES
## ODD RELEASES are SELFHOSTED RELEASES

MOZ_VERSION=0.42
VERSION=0.43
#VERSION=$(MOZ_VERSION)
#VERSION=1.27

YELLOW=F7E59A
ORANGE=FFC56D
GREY=D9D9D6
BLUE=A4C8E1
PURPLE=A48fE1

colors:
	@echo " yellow $(YELLOW) \n orange $(ORANGE) \n grey $(GREY) \n blue $(BLUE) \n purple $(PURPLE)"

amo-readme:
	markdown README.md | \
		sed 's|<p>||g' | \
		sed 's|</p>||g' | \
		sed 's|<h1>|<strong>|g' | \
		sed 's|</h1>|</strong>|g' | \
		sed 's|<h2>|<strong>|g' | \
		sed 's|</h2>|</strong>|g' | \
		sed 's|<h3>|<strong>|g' | \
		sed 's|</h3>|</strong>|g' | \
		grep -v '<img' > index.html

xpi:
	#wget -O ../i2ppb@eyedeekay.github.io.xpi \
		#https://addons.mozilla.org/firefox/downloads/file/3419789/i2psetproxyjs-$(MOZ_VERSION)-an+fx.xpi
	#cp ../i2ppb@eyedeekay.github.io.xpi ./i2ppb@eyedeekay.github.io.xpi
	cp ~/Downloads/i2p_in_private_browsing-$(VERSION)-an+fx.xpi ./i2ppb@eyedeekay.github.io.xpi

version:
	sed -i 's|$(shell grep "\"version\": " manifest.json)|  \"version\": \"$(VERSION)\",|g' manifest.json

zip: version
	zip --exclude="./i2ppb@eyedeekay.github.io.xpi" \
		--exclude="./i2psetproxy.js@eyedeekay.github.io.xpi" \
		--exclude="./i2psetproxy.js.png" \
		--exclude="./i2psetproxy.js.gif" \
		--exclude="./package.json" \
		--exclude="./package-lock.json" \
		--exclude="./.node_modules" \
		--exclude="./node_modules" \
		--exclude="./.git" -r -FS ../i2psetproxy.js.zip *

release:
	cat desc | gothub release -p -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n $(VERSION) -d -

delete-release:
	gothub delete -u eyedeekay -r i2psetproxy.js -t $(VERSION); true

recreate-release: delete-release release upload

upload: upload-xpi upload-deb


WEB_EXT_API_KEY=AMO_KEY
WEB_EXT_API_SECRET=AMO_SECRET
include ../api_keys_moz.mk

##ODD NUMBERED, SELF-DISTRIBUTED VERSIONS HERE!
sign:
	@echo "Using the 'sign' target to instantly sign an extension for self-distribution"
	@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	web-ext sign --channel unlisted --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET)

##EVEN NUMBERED, MOZILLA-DISTRIBUTED VERSIONS HERE!
submit:
	@echo "Using the 'submit' target to instantly sign an extension for self-distribution"
	@echo "requires a JWT API Key and Secret from addons.mozilla.org to be made available"
	@echo "to the Makefile under the variables WEB_EXT_API_KEY and WEB_EXT_API_SECRET."
	web-ext sign --channel listed --config-discovery false --api-key $(WEB_EXT_API_KEY) --api-secret $(WEB_EXT_API_SECRET)


upload-xpi:
	gothub upload -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2ppb@eyedeekay.github.io.xpi" -f "./i2ppb@eyedeekay.github.io.xpi"

upload-deb:
	gothub upload -u eyedeekay -r i2psetproxy.js -t $(VERSION) -n "i2psetproxy.js_$(VERSION)-1_amd64.deb" -f "../i2psetproxy.js_$(VERSION)-1_amd64.deb"

lib: libpolyfill

libpolyfill:
	wget -O chromium/browser-polyfill.js https://unpkg.com/webextension-polyfill/dist/browser-polyfill.js

fmt:
	find . -path ./node_modules -prune -o -name '*.js' -exec prettier --write {} \;

lint:
	eslint --fix *.js

deborig:
	rm -rf ../i2psetproxy.js-$(VERSION)
	cp -r . ../i2psetproxy.js-$(VERSION)
	tar \
		-cvz \
		--exclude=.git \
		--exclude=i2psetproxy.js.gif \
		--exclude=node_modules \
		-f ../i2psetproxy.js_$(VERSION).orig.tar.gz \
		.

deb: deborig
	cd ../i2psetproxy.js-$(VERSION) && debuild -us -uc -rfakeroot

i2pversion=`curl -s https://launchpad.net/i2p/trunk/+rdf | grep specifiedAt | head -n 3 | tail -n 1 | sed 's|                <lp:specifiedAt rdf:resource="||g' | sed 's|+rdf"/>||g' | sed 's|/i2p/trunk/||g' | tr -d '/'`
file=i2pinstall_$(i2pversion)
winhash=9b20c38a392d5153759d2044ecdac7a90e79675738ead97bbcc731d972c47792
machash=cbda1767ef4156fc44168e87cd2475e6ba49792c11f6dcdf6fe76d2984cd0e00
jarhash=e5eb3db08dcc594e2fb01ada63303ff48096a454db1c7659c928ddb07736c84a
drdhash=93e39b46001da498c9dad1ee94e5cb6301942a5dd2fe6b8405c7ccbed936d2bf

mirrors:
	@echo "I2P Mirrors"
	@echo "==========="
	@echo ""
	@echo "The software in this repository requires an I2P router to work. You can get it"
	@echo "the main i2p site, [https://geti2p.net](https://geti2p.net), but if that site"
	@echo "is blocked in your region, you can get it from one of these alternate"
	@echo "locations:"
	@echo ""
	@echo "Windows"
	@echo "-------"
	@echo ""
	@echo "SHA256=$(winhash)"
	@echo ""
	@echo " * [Launchpad Mirror](https://launchpad.net/i2p/trunk/$(i2pversion)/+download/$(file)_windows.exe)"
	@echo " * [In-I2P Mirror(sigterm.no)](http://whnxvjwjhzsske5yevyokhskllvtisv5ueokw6yvh6t7zqrpra2q.b32.i2p/releases/$(i2pversion)/$(file)_windows.exe)"
	@echo " * [download.i2p2.de(sigterm.no)](http://download.i2p2.de/releases/$(i2pversion)/$(file)_windows.exe)"
	@echo " * [download.i2p2.no(sigterm.no](http://download.i2p2.no/releases/$(i2pversion)/$(file)_windows.exe)"
	@echo " * [Dropbox](https://dl.dropboxusercontent.com/u/18621288/I2P/$(i2pversion)/$(file)_windows.exe)"
	@echo " * [Google Drive](https://googledrive.com/host/0B4jHEq5G7_EPWV9UeERwdGplZXc/$(i2pversion)/$(file)_windows.exe)"
	@echo ""
	@echo "OSX Jar"
	@echo "-------"
	@echo ""
	@echo "SHA256=$(machash)"
	@echo ""
	@echo " * [Launchpad Mirror](https://launchpad.net/i2p/trunk/$(i2pversion)/+download/$(file).jar)"
	@echo " * [In-I2P Mirror(sigterm.no)](http://whnxvjwjhzsske5yevyokhskllvtisv5ueokw6yvh6t7zqrpra2q.b32.i2p/releases/$(i2pversion)/$(file).jar)"
	@echo " * [download.i2p2.de(sigterm.no)](http://download.i2p2.de/releases/$(i2pversion)/$(file).jar)"
	@echo " * [download.i2p2.no(sigterm.no](http://download.i2p2.no/releases/$(i2pversion)/$(file).jar)"
	@echo " * [Dropbox](https://dl.dropboxusercontent.com/u/18621288/I2P/$(i2pversion)/$(file).jar)"
	@echo " * [Google Drive](https://googledrive.com/host/0B4jHEq5G7_EPWV9UeERwdGplZXc/$(i2pversion)/$(file).jar)"
	@echo ""
	@echo "Linux Jar"
	@echo "---------"
	@echo ""
	@echo "SHA256=$(jarhash)"
	@echo ""
	@echo " * [Launchpad Mirror](https://launchpad.net/i2p/trunk/$(i2pversion)/+download/$(file).jar)"
	@echo " * [In-I2P Mirror(sigterm.no)](http://whnxvjwjhzsske5yevyokhskllvtisv5ueokw6yvh6t7zqrpra2q.b32.i2p/releases/$(i2pversion)/$(file).jar)"
	@echo " * [download.i2p2.de(sigterm.no)](http://download.i2p2.de/releases/$(i2pversion)/$(file).jar)"
	@echo " * [download.i2p2.no(sigterm.no](http://download.i2p2.no/releases/$(i2pversion)/$(file).jar)"
	@echo " * [Dropbox](https://dl.dropboxusercontent.com/u/18621288/I2P/$(i2pversion)/$(file).jar)"
	@echo " * [Google Drive](https://googledrive.com/host/0B4jHEq5G7_EPWV9UeERwdGplZXc/$(i2pversion)/$(file).jar)"
