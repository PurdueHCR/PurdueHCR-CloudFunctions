#!/bin/zsh


alias jest='./node_modules/.bin/jest'

if [ "$1" = "-u" ]; then			
	echo "Starting Unit Tests"                              		
        jest --config ./jest.config.js test/functions/*.test.ts
elif [ "$1" = "-i" ]; then
	echo "Exporting FIRESTORE_EMULATOR_HOST"
        export FIRESTORE_EMULATOR_HOST=localhost:8080
	echo "Starting Integration Tests"
	jest --config ./jest.config.js test/endpoints/**/*.test.ts
elif [ "$1" = "-h" ]; then
	echo "Run the tests using -u for unit tests or  -i for integration. No flag means run them all"
else	
	echo "Exporting FIRESTORE_EMULATOR_HOST"
	export FIRESTORE_EMULATOR_HOST=localhost:8080
	echo "Starting Tests"
	jest --config ./jest.config.js test/functions/*.test.ts test/endpoints/**/*.test.ts
fi
exit 0
