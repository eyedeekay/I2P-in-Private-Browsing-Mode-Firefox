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

MIRRORS.md:
	make mirrors > MIRRORS.md