# PurdueHCR-CloudFunctions



How to setup CLI in bash shell

1. make sure npm is installed
	- Windows go to http://nodejs.org to install
	- Mac run "brew install node"
2. run "npm install -g firebase-tools"
3. run "npm install firebase-functions@latest firebase-admin@latest --save"
4. run "firebase login" and  log into your account
5. cd into the directory where the functions are saved
6. run "firebase emulators:start --only functions"
