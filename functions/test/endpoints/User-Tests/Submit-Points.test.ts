import * as factory from '../../HTTPRequestFactory'
import * as firebase from "@firebase/testing"
import * as admin from 'firebase-admin'
import *  as request from 'supertest'
import {FirestoreDataFactory} from '../FirestoreDataFactory'


let user_func
let db: firebase.firestore.Firestore

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
                    verifyIdToken: (token:string) => {
                        if(token === "INVALID_ID"){
                            return null
                        }
                        else{
                            return {"user_id":token}
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

        await FirestoreDataFactory.createUser(db, "RESIDENT", 0)
        await FirestoreDataFactory.createUser(db, "REC", 2)
        await FirestoreDataFactory.createUser(db, "RHP", 1)
        await FirestoreDataFactory.createPointType(db, 1)
        await FirestoreDataFactory.createPointType(db, 2, {residents_can_submit: false})
        await FirestoreDataFactory.createHouse(db, "Platinum")
    })

    beforeEach(async () => {
        await FirestoreDataFactory.systemPreference(db)
    })

    //Test GetUserSuccess. Ensure a user is correctly returned
    it('Missing Body', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {})
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(422)
                done()
            }
        })
        
    })

    it('Missing Date Occured', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {"point_type_id":1, "description":"test"})
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(422)
                done()
            }
        })
    })

    it('Missing Description', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {"point_type_id":1, "date_occurred":"4/1/2020"})
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(422)
                done()
            }
        })
    })

    it('Missing Point Type Id', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", {"date_occurred":"4/1/2020", "description":"test"})
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(422)
                done()
            }
        })
    })

    it('Invalid Point Type', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(0,"test",( new Date()).toString()))
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(417)
                done()
            }
        })
    })

    it('Invalid User Permissions', async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(1,"test",( new Date()).toString()), "Bearer REC")
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(403)
                done()
            }
        })
    })

    it('Competition Disabled',  async(done) => {
        await FirestoreDataFactory.systemPreference(db, {is_house_enabled: false})
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(1,"test",( new Date()).toString()))
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(412)
                done()
            }
        })
    })

    it('Residents Cant Submit',  async(done) => {
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(2,"test",( new Date()).toString()))
        res.end(function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(419)
                done()
            }
        })
    })

    it('Resident Submission Success', async(done) =>{
        const date = new Date()
        const descr = "Resident Submission Success test"
        console.log(date.toString())
        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(1,descr,date.toString()), "Bearer RESIDENT")
        res.end(async function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(201)

                let documents = await db.collection("House").doc("Platinum").collection("Points").where("Description","==","Resident Submission Success test").limit(1).get()
                expect(documents.docs[0].data().ApprovedOn).toBeUndefined()
                expect(new Date(documents.docs[0].data().DateOccurred.seconds)).toBeTruthy()
                expect(documents.docs[0].data().DateSubmitted).toBeTruthy()
                expect(documents.docs[0].data().Description).toEqual(descr)
                expect(documents.docs[0].data().FloorID).toEqual("4N")
                expect(documents.docs[0].data().PointTypeID).toEqual(-1)
                expect(documents.docs[0].data().RHPNotifications).toEqual(0)
                expect(documents.docs[0].data().ResidentFirstName).toEqual("TEST_FIRST")
                expect(documents.docs[0].data().ResidentId).toEqual("RESIDENT")
                expect(documents.docs[0].data().ResidentLastName).toEqual("TEST_LAST")
                expect(documents.docs[0].data().ResidentNotifications).toEqual(0)
                done();
            }
        })
    })

    it('RHP Submission Success', async(done) =>{
        const date = new Date()
        const descr = "RHP Submission Success test"
        const prevScore = 11
        const prevUserPoints = 14
        const semPoints = 4;
        await FirestoreDataFactory.createHouse(db, "Platinum", {total_points: prevScore})
        await FirestoreDataFactory.createUser(db, "RHP", 1, {total_points: prevUserPoints, semester_points: semPoints})

        const res: request.Test = factory.post(user_func, "/submitPoint", createPointLogBody(1,descr,date.toString()), "Bearer RHP")
        res.end(async function (err, res) {
            if(err){
                done(err)
            }
            else{
                expect(res.status).toBe(202)

                let documents = await db.collection("House").doc("Platinum").collection("Points").where("Description","==","RHP Submission Success test").limit(1).get()
                expect(documents.docs[0].data().ApprovedOn).toBeTruthy()
                expect(documents.docs[0].data().ApprovedBy).toEqual("Preapproved")
                expect(new Date(documents.docs[0].data().DateOccurred.seconds)).toBeTruthy()
                expect(documents.docs[0].data().DateSubmitted).toBeTruthy()
                expect(documents.docs[0].data().Description).toEqual(descr)
                expect(documents.docs[0].data().FloorID).toEqual("4N")
                expect(documents.docs[0].data().PointTypeID).toEqual(1)
                expect(documents.docs[0].data().RHPNotifications).toEqual(0)
                expect(documents.docs[0].data().ResidentFirstName).toEqual("TEST_FIRST")
                expect(documents.docs[0].data().ResidentId).toEqual("RHP")
                expect(documents.docs[0].data().ResidentLastName).toEqual("TEST_LAST")
                expect(documents.docs[0].data().ResidentNotifications).toEqual(0)

                let houseDoc = await db.collection("House").doc("Platinum").get()
                expect(houseDoc.data()!.TotalPoints).toBe(prevScore + 1)

                let userDoc = await db.collection("Users").doc("RHP").get()
                expect(userDoc.data()!.TotalPoints).toBe(prevUserPoints + 1)
                expect(userDoc.data()!.SemesterPoints).toBe(semPoints + 1)

                let messageDocs = await db.collection("House").doc("Platinum").collection("Points").doc(documents.docs[0].id).collection("Messages").get()
                expect(messageDocs.docs[0].data().Message).toBe("Preapproved")
                expect(messageDocs.docs[0].data().MessageType).toBe("approve")
                expect(messageDocs.docs[0].data().SenderFirstName).toBe("PurdueHCR")
                expect(messageDocs.docs[0].data().SenderLastName).toBe("")
                expect(messageDocs.docs[0].data().SenderPermissionLevel).toBe(1)

                done();
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