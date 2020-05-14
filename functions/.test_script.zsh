#!/bin/zsh


alias jest='./node_modules/.bin/jest'

if [ "$1" = "-u" ]; then			
	echo "Starting Unit Tests"                              		
        jest --config ./jest.config.js test/functions/*.test.ts --silent
elif [ "$1" = "-i" ]; then
	echo "Starting Firestore emulator"
        export FIRESTORE_EMULATOR_HOST=localhost:8080
	firebase emulators:start --only firestore &> /dev/null &
	sleep 2
	echo "Starting Integration Tests"
	jest --config ./jest.config.js test/endpoints/**/*.test.ts --runInBand --detectOpenHandles --forceExit --silent
	pkill java
elif [ "$1" = "-h" ]; then
	echo "Run the tests using -u for unit tests or  -i for integration. No flag means run them all"
else	
	echo "Starting Firestore Emulator"
	export FIRESTORE_EMULATOR_HOST=localhost:8080
	firebase emulators:start --only firestore &> /dev/null &
	sleep 2
	echo "Starting Tests"
	jest --config ./jest.config.js test/functions/*.test.ts test/endpoints/**/*.test.ts --runInBand --detectOpenHandles --forceExit --silent
	pkill java 
fi
exit 0
