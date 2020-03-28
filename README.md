# PurdueHCR-CloudFunctions



How to setup CLI in bash shell

1. make sure npm is installed
	- Windows go to http://nodejs.org to install
	- Mac run "brew install node"
		- If brew is not installed, go to https://brew.sh/ and install it.
2. cd into the directory where you want the Cloud Functions to be saved, and git clone the repository
3. cd into the functions directory and run "npm install -g firebase-tools"
4. run "npm install firebase-functions@latest firebase-admin@latest --save"
5. run "firebase login" and  log into your account
7. Talk to an exec member to download the Google Firebase Key, DEV_key.json, and save the path to this file as the environmental variable $GOOGLE_APPLICATION_CREDENTIALS.
	- bash command: export GOOGLE_APPLICATION_CREDENTIALS=<PATH TO DEV_key.json>
8. run "firebase emulators:start --only functions"
9. call HTTP requests at path http://localhost:5001/SERVER/us-central1/PATH
	-- SERVER is most likely purdue-hcr-test
	-- PATH is whatever the endpoint that you are trying to call has for a route
