# PurdueHCR-CloudFunctions



How to setup CLI in bash shell

1. make sure npm is installed
	- Windows go to http://nodejs.org to install
	- Mac run "brew install node"
		- If brew is not installed, go to https://brew.sh/ and install it.
2. cd into the directory where you want the Cloud Functions to be saved, and git clone the repository
	- bash command: git clone https://github.com/PurdueHCR/PurdueHCR-CloudFunctions.git
3. cd into the functions directory and run "npm install -g firebase-tools"
4. run "npm install firebase-functions@latest firebase-admin@latest --save"
5. run "firebase login" and  log into your account
7. Talk to an exec member to download the Google Firebase Key, DEV_key.json, and save the path to this file as the environmental variable $GOOGLE_APPLICATION_CREDENTIALS.
	- bash command: export GOOGLE_APPLICATION_CREDENTIALS='PATH TO DEV_key.json'
	- Note you have to give it an absolute path. using shortcuts like '..' may not work
8. run the bash command 'npm install; npm run build'
9. run "firebase emulators:start --only functions"
10. Open Google and search for 'Advanced REST Client'(ARC) and install it.
11. Now open a new window in Chrome and go to https://purdue-hcr-test.firebaseapp.com/#/token. Log in, and copy the token. 
	- If you are not taken to a page with a token, make sure you are logged in and the url is correct.
11. Open ARC and type into the following fields:
	- Request URL: http://localhost:5001/purdue-hcr-test/us-central1/user/get
		- or optionally 
			- Host: http://localhost:5001
			- Path: /purdue-hcr-test/us-central1/user/get
	- Parameters
		- Headers
			- Header Name: Authorization
			- Header Value: (Paste the token)
12. Hit send, and if you scroll to the bottom, you should see the response from the server. 200 Success and a json object with your user's infromation.
13. Congratulations! You are now able to host an emulator with the development API!
	- Go to https://purdue-hcr-test.firebaseapp.com/swagger-ui/ to see the list of endpoints available
