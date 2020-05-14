import * as factory from '../../HTTPRequestFactory'
import * as firebase from "@firebase/testing";
let user_func = require('../../../src/endpoint_paths/index.ts').user


jest.mock('firebase-admin', () => ({
    apps: {
        length: 1
    },

    auth: () => { return {verifyIdToken: (token) => {
        console.log("TOKEN: "+token)
        if(token == "1"){
            return {"user_id":"hello"}
        }
        else{
            throw Error("Invalid Token")
        }
        
    } }},

    //This mocks admin.initializeApp() so whenever the app calls initializeApp(),
    //it will run jest.fn() which is an empty function
    initializeApp: () => {
        jest.fn()
    },

    //Mocks admin.firestore() Which is often saved as db
    firestore: () => {
        return authedApp()
    }
}))

//Test Suite GetUser
describe('user/get', () =>{

    beforeAll(() => {
        
    })

    //Test Unknown User
    it('Unknown User', async() => {
        const res = await factory.get(user_func, "/get")
        expect(res.status).toEqual(400)
    })

    //Test Unknown User
    it('Bad Token', async() => {
        const res = await factory.get(user_func, "/get", "Bearer 44")
        expect(res.status).toEqual(401)
    })

    afterAll(()=>{
        Promise.all(firebase.apps().map(app => app.delete()))
    })

})

// // Helper function to setup the test db instance
function authedApp() {
    return firebase
      .initializeTestApp({ projectId: 'test-project', auth: { uid: "Authorization"} })
      .firestore();
  }

