import * as factory from '../../HTTPRequestFactory'
import * as firebase from "@firebase/testing"
import * as admin from 'firebase-admin'
import *  as request from 'supertest'
import {FirestoreDataFactory} from '../FirestoreDataFactory'


let user_func
let db

//Test Suite GetUser
describe('user/submitpoint', () =>{

    beforeAll(async () => {
        db = authedApp()
        
        jest.mock('firebase-admin', () => {

            

            const firestore = () => {
                return db
            }
            firestore.Timestamp = admin.firestore.Timestamp
        
            return {
            apps: {
                length: 1
            },
        
            auth: () => { 
                return { 
                    verifyIdToken: (token) => {
                        if(token === "rec"){
                            return {"user_id":"rec"}
                        }
                        else{
                            return {"user_id":"user_id"}
                        }
                        
                    } 
                }
            },
        
            //This mocks admin.initializeApp() so whenever the app calls initializeApp(),
            //it will run jest.fn() which is an empty function
            initializeApp: () => {
                jest.fn()
            },
        
            //Mocks admin.firestore() Which is often saved as db
            firestore: firestore,
        
        }})
        
        user_func = require('../../../src/endpoint_paths/index.ts').user

        await db.collection("Users").doc("user_id").set({"FirstName":"Brian", "FloorID":"4N","House":"Platinum","LastName":"TESTED","LastSemesterPoints":25,"Name":"Brian TESTED","Permission Level":0, "TotalPoints":31})
        await db.collection("Users").doc("rec").set({"FirstName":"Brian", "FloorID":"4N","House":"Platinum","LastName":"TESTED","LastSemesterPoints":25,"Name":"Brian TESTED","Permission Level":2, "TotalPoints":31})
        
        await FirestoreDataFactory.createPointType(db, 1)
        await FirestoreDataFactory.createPointType(db, 2, {residents_can_submit: false})
    })

    beforeEach(async () => {
        await FirestoreDataFactory.systemPreference(db)
    })

    //Test GetUserSuccess. Ensure a user is correctly returned
    it('Missing Body', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {})
        res.expect(422).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
        
    })

    it('Missing Date Occured', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {"point_type_id":1, "description":"test"})
        res.expect(422).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
    })

    it('Missing Description', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {"point_type_id":1, "date_occurred":"4/1/2020"})
        res.expect(422).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
    })

    it('Missing Point Type Id', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {"date_occurred":"4/1/2020", "description":"test"})
        res.expect(422).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
    })

    it('Invalid Point Type', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(0,"test",( new Date()).toString()))
        res.expect(417).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
    })

    it('Invalid User Permissions', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(1,"test",( new Date()).toString()), "Bearer rec")
        res.expect(403).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
    })

    it('Competition Disabled',  async(done) => {
        await FirestoreDataFactory.systemPreference(db, {is_house_enabled: false})
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(1,"test",( new Date()).toString()))
        res.expect(412).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
    })

    it('Residents Cant Submit',  async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(2,"test",( new Date()).toString()))
        res.expect(419).end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                done()
            }
        })
    })

    afterAll(()=>{
        Promise.all(firebase.apps().map(app => app.delete()))
    })

})

// Helper function to setup the test db instance
function authedApp() {
    return firebase
      .initializeTestApp({ projectId: 'test-project', auth: { uid: "Authorization"} })
      .firestore();
  }

  /**
   * Create the body for a user/submitPoint post
   * @param id id of point type
   * @param description descripton for point log
   * @param date date occurred
   */
function createPointLogBody(id: number, description: string, date:string){
    return {"point_type_id":id, "description":description, "date_occurred":date}
}