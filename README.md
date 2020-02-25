# PurdueHCR-CloudFunctions



How to setup CLI in bash shell

1. make sure npm is installed
	- Windows go to http://nodejs.org to install
	- Mac run "brew install node"
2. run "npm install -g firebase-tools"
3. run "npm install firebase-functions@latest firebase-admin@latest --save"
4. run "firebase login" and  log into your account
5. cd into the directory where the functions are saved
6. Download the Google Firebase Key and save the path to this file as the environmental variable $GOOGLE_APPLICATION_CREDENTIALS 
7. run "firebase emulators:start --only functions"
8. call HTTP requests at path http://localhost:5001/SERVER/us-central1/PATH
	-- SERVER is most likely purdue-hcr-test
	-- PATH is whatever the endpoint that you are trying to call has for a route
