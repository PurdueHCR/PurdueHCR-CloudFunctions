How to install Firebase emulator

1. curl -sL firebase.tools | bash or curl -sL firebase.tools | upgrade=true bash
2. firebase login
3. run firebase projects:list and select purdue-hcr-test
4. ensure node is up to date https://bytearcher.com/articles/ways-to-get-the-latest-node.js-version-on-a-mac/
5. run firebase init
    1. Select Firestore, Functions, Hosting, Storeage, Emulators
    2. What file should be used for Firestore Rules? (firestore.rules)
        - The default is firestore.rules, so if you hit ENTER, it will set it to this. (Future will just say ENTER)
    3. File firestore.rules already exists. Do you want to overwrite it with the Firestore Rules from the Firebase Console? (y/N)
        - Type N and hit ENTER (Future will just say N or Y for the correct option)
    4. What file should be used for Firestore indexes?
        - ENTER
    5. File firestore.indexes.json already exists. Do you want to overwrite it with the Firestore Indexes from the Firebase Console? (y/N)
        - N
    6. What language would you like to use to write Cloud Functions?
        - Use arrow keys to select TypeScript and hit ENTER
    7. Do you want to use TSLint to catch probable bugs and enforce style?
        - Y 
    8. File functions/package.json already exists. Overwrite?
        - N
    9. File functions/tslint.json already exists. Overwrite?
        - N
    10. File functions/tsconfig.json already exists. Overwrite?
        - N 
    11. File functions/src/index.ts already exists. Overwrite?
        - N 
    12. File functions/.gitignore already exists. Overwrite?
        - N 
    13. Do you want to install dependencies with npm now?
        - Y
    14. What do you want to use as your public directory? (public)
        - ENTER
    15. Configure as a single-page app (rewrite all urls to /index.html)? (y/N)
        - N 
    16. File public/404.html already exists. Overwrite? (y/N)
        - N 
    17. File public/index.html already exists. Overwrite? (y/N)
        - N 
    18. What file should be used for Storage Rules? (storage.rules)
        - ENTER 
    19. File storage.rules already exists. Do you want to overwrite it ... (y/N)
        - N
    20. Which Firebase emulators do you want to set up? Press Space to select emulators, then Enter to confirm your choices. (Press <space> to select, <a> to toggle all, <i> to invert selection)
        - Select Function, Firestore, Hosting 
    21. *Select default ports for functions, firestore, hosting*
    22. Would you like to download the emulators now? (y/N)
        - Y





Q&A - A section to record solutions to problems that were encountered while testing

- Question: When running an integration test, the HTTPRequestFactory is not sending a body.

When I found this problem when doing integration tests for user/submitPoint the reason was because in the HTTPSFunction (src/endpoint_paths/user.ts) I had users_main.use(body-parser.json()) and users_main.use(body-parser.urlencoded({ extended: false})). Instead of using the _main variable, use the _app and replace body-parser with express. The end results that fixed mine were users_app.use(express.json())
users_app.use(express.urlencoded({ extended: true })) 