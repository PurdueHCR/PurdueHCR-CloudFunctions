import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import { HouseCode } from './models/Housecode';
import {User} from './models/User';
import { HouseCompetition } from './models/HouseCompetition';
import { PointLog } from './models/PointLog';
import { SystemPreference } from './models/SystemPreference';
import { APIError } from './models/APIError';

if(admin.apps.length === 0){
	admin.initializeApp(functions.config().firebase);
}
const db = admin.firestore();
const users_app = express();
const cors = require('cors');
const users_main = express();

users_main.use(users_app);
users_main.use(bodyParser.json());
users_main.use(bodyParser.urlencoded({ extended: false }));

const firestoreTools = require('./firestoreTools');

export const user_main = functions.https.onRequest(users_main);


users_app.use(cors({origin:true}));
users_app.use(firestoreTools.validateFirebaseIdToken);


users_app.get('/rank',  (req,res) => {
	//Get user id. Check the house. Get the rank of the user
	const userId = req.header('User-Auth')
	if(userId === "" || userId === undefined){
		res.status(401).send("Missing Authorization");
	}
	db.collection(HouseCompetition.USERS_KEY).doc(userId!).get()
	.then(userDocument => {
		if(userDocument.exists ){
			const houseName = userDocument.data()!.House;
			db.collection(HouseCompetition.USERS_KEY)
			.where('House', '==', houseName)
				.get()
				.then(snapshot => {
					snapshot.docs.sort((u1,u2) => u2.data().TotalPoints - u1.data().TotalPoints)
					let i = 1;
					while(i <= snapshot.docs.length && snapshot.docs[i-1].data().TotalPoints !== userDocument.data()!.TotalPoints){
						i ++;
					}
					res.status(200).send(""+i);
				}
			).catch(err => {
				res.status(400).send(res);
			})
		}
		else{
			res.status(400).send("Could not find the user with Id: "+userId);
		}
	})
	.catch(err => res.send(500).send(res));
	
})

users_app.get('/auth-rank',  (req, res) => {
	//Get user id. Check the house. Get the rank of the user
	db.collection(HouseCompetition.USERS_KEY).doc(req["user"]["user_id"]).get()
	.then(userDocument => {
		if(userDocument.exists ){
			const houseName = userDocument.data()!.House;
			db.collection(HouseCompetition.USERS_KEY)
			.where('House', '==', houseName)
				.get()
				.then(snapshot => {
					snapshot.docs.sort((u1,u2) => u2.data().TotalPoints - u1.data().TotalPoints)
					let houseRank = 1;
					while(houseRank <= snapshot.docs.length && snapshot.docs[houseRank-1].data().TotalPoints !== userDocument.data()!.TotalPoints){
						houseRank ++;
					}

					snapshot.docs.sort((u1,u2) => (u2.data().TotalPoints -  u2.data().LastSemesterPoints) - (u1.data().TotalPoints - u1.data().LastSemesterPoints))
					let semesterRank = 1;
					while(semesterRank <= snapshot.docs.length && 
							(snapshot.docs[semesterRank-1].data().TotalPoints - snapshot.docs[semesterRank-1].data().LastSemesterPoints) 
							!== (userDocument.data()!.TotalPoints - userDocument.data()!.LastSemesterPoints)){
						semesterRank ++;
					}

					res.status(200).send(
						"{\n"+
							"\t\"houseRank\" : "+houseRank +",\n"+
							"\t\"semesterRank\" : "+semesterRank+"\n"+
						"}");
					console.log("SUCCESS WITH RANK")
					return;
				}
			).catch(err => {
				console.log("FAILED WITH DB FROM HOUSE ERROR: "+err)
				res.status(500).send("Failed to sort house users with error: "+ res);
			})
		}
		else{
			console.log("FAILED COULD NOT FIND USER")
			res.status(410).send("Undefined User Role");
		}
	})
	.catch(err => {
		console.log("FAILED WITH DB FROM user ERROR: "+err);
		res.status(500).send("Failed to retrieve user with error: "+ res);
	})
		
	
})


users_app.post('/create', (req, res) => {
	//req["user"] is assigned in the FirebaseTools after user is authenticated
	if(req.query.first === null || req.query.last === null || req.query.code === null){
		res.status(422).send("Missing required parameters")
	}
	else{
		db.collection(HouseCompetition.USERS_KEY).doc(req["user"]["user_id"]).get().then(userDocument => {
			if(userDocument.exists){
				res.status(421).send("User already exists")
			}
			else{
				db.collection(HouseCompetition.HOUSE_CODES_KEY).get().then(houseCodeDocs => {
					let found = false
					for( const codeDoc of houseCodeDocs.docs){
						if(codeDoc.data()["Code"] === req.query.code){
							found = true
							const code = new HouseCode(codeDoc)
							const user = User.fromCode(req.query.first,  req.query.last, req["user"]["user_id"], code)
								db.collection(HouseCompetition.USERS_KEY).doc(req["user"]["user_id"]).set(user.toJson()).then(ref =>{
									res.status(200).send(user.toJson())
								}	
							)
							.catch( err => {
								res.status(400).send("Firestore failed with error:  "+err)
							})
						}
					}
					if(!found)
						res.status(409).send("House Code Does Not Exist");
				})
				.catch(err => {
					res.send(500)
				})
			}
		})
		.catch(err =>{
			res.status(400).send("Firestore failed with error:  "+err)
		})
	}
	
})

/**
 * Return the user model for the firebase account noted in Authorization header
 */
users_app.get('/get', (req, res) => {

	db.collection(HouseCompetition.USERS_KEY).doc(req["user"]["user_id"]).get().then(userDocument => {
		if(!userDocument.exists){
			res.status(400).send("User does not exist")
		}
		else{
			const user = User.fromDocumentSnapshot(userDocument);
			res.status(200).send(user.toJson());
		}
	})
	.catch( err => {
		console.log("GET USER ERROR: "+err)
		res.status(500).send("Server Error");
	})

})


users_app.get('/submitPoint', (req, res) => {

	//Tomorrow
	// 1. Create API Doc and check params that they exist
	// 2. Build rest of submit points methods
	// 3. Determine best way to use promises and reusable methods across the code base

	const log = new PointLog(null, null, admin.firestore.Timestamp.now(), admin.firestore.Timestamp.now(), "", "2N", 4, 0, 
	"Bill", req["user"]["user_id"], "Bo Baggins", 0)
	submitPoint(log, "").then((resp:User) =>{
		res.status(200).send(resp.toJson())
	}).catch( (error:APIError) => {
		res.status(error.code).send(error.message)
	})
	/*
	Parameters:
	pointTypeId: number
    residentFirstName: String
    residentLastName: String
    residentId: String
	*/
	//TODO
	/*
	0. Ensure paremeters exist
	1. Get user
	2. get point type
	3. Get Competition Status
	5. ensure the resident can submit this point type
	6. set appropriate date fields
	7. Save Record and update points if necessairy
	*/
	
	//db.collection(HouseCompetition.)
})

function submitPoint(log: PointLog, documentId:String): Promise<any>{
	
	return getSystemPreferences().then((systemPreferences) => {
		return getUser(log.residentId.toString());
	})
}

function getSystemPreferences() : Promise<void | SystemPreference>{
	return db.collection(HouseCompetition.SYSTEM_PREFERENCES_KEY).doc(HouseCompetition.SYSTEM_PREFERENCES_DOCUMENT_KEY).get().then(preferencesDoc => {
		const systemPreferences = SystemPreference.fromDocument(preferencesDoc);
		return Promise.resolve(systemPreferences);
	}).catch(err =>{
		console.log("Error getting System Preferences. "+ err);
		return  Promise.reject(new APIError(500, "Server Error"));
	});
}

function getUser(id: string) : Promise<void | User> {
	return db.collection(HouseCompetition.USERS_KEY).doc(id).get().then(userDocument => {
		if(!userDocument.exists){
			return  Promise.reject(new APIError(400, "User does not exist"));
		}
		else{
			const user = User.fromDocumentSnapshot(userDocument);
			return Promise.resolve(user);
		}
	})
	.catch( err => {
		console.log("GET USER ERROR: "+err)
		return  Promise.reject(new APIError(500, "Server Error"));
	})
}
