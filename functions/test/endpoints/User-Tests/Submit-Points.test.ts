import * as factory from '../../HTTPRequestFactory'
import * as firebase from "@firebase/testing";
import Database from "../../../src/Database"
let user_func = require('../../../src/endpoint_paths/index.ts').user

//Test Suite GetUser
describe('user/submitpoint', () =>{

    beforeAll(() => {
        // Set the emulator database before each test
        
    })

    //Test GetUserSuccess. Ensure a user is correctly returned
    it('Unknown User', async() => {
        const db = authedApp({ uid: "alice"});
        Database.getInstance().setDb(db);
        await factory.get(user_func, "/get")
    })

})

// Helper function to setup the test db instance
function authedApp(auth) {
    return firebase
      .initializeTestApp({ projectId: 'test-project', auth: auth })
      .firestore();
  }

