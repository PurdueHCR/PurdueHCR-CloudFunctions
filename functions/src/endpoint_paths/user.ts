import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as bodyParser from "body-parser"
import {User} from '../models/User'
import { HouseCompetition } from '../models/HouseCompetition'
import { APIResponse } from '../models/APIResponse'
import { UnsubmittedPointLog } from '../models/UnsubmittedPointLog'
import { submitPoint } from '../src/SubmitPoints'
import { getUser } from '../src/GetUser'
import { getHouseCodes } from '../src/GetHouseCodes'
import { createUser } from '../src/CreateUser'
import { isInDateRange } from '../src/IsInDateRange'

if(admin.apps.length === 0){
	admin.initializeApp(functions.config().firebase)
}
const db = admin.firestore()
const users_app = express()
const cors = require('cors')
const users_main = express()

users_main.use(users_app)
users_main.use(bodyParser.json())
users_main.use(bodyParser.urlencoded({ extended: false }))

const firestoreTools = require('../firestoreTools')

export const user_main = functions.https.onRequest(users_main)


users_app.use(cors({origin:true}))
users_app.use(firestoreTools.validateFirebaseIdToken)


/**
 * @deprecated DONT USE THIS EVER... please
 */
users_app.get('/rank',  (req,res) => {
	//Get user id. Check the house. Get the rank of the user
	const userId = req.header('User-Auth')
	if(userId === "" || userId === undefined){
		res.status(401).send("Missing Authorization")
	}
	db.collection(HouseCompetition.USERS_KEY).doc(userId!).get()
	.then(userDocument => {
		if(userDocument.exists ){
			const houseName = userDocument.data()!.House
			db.collection(HouseCompetition.USERS_KEY)
			.where('House', '==', houseName)
				.get()
				.then(snapshot => {
					snapshot.docs.sort((u1,u2) => u2.data().TotalPoints - u1.data().TotalPoints)
					let i = 1
					while(i <= snapshot.docs.length && snapshot.docs[i-1].data().TotalPoints !== userDocument.data()!.TotalPoints){
						i ++
					}
					res.status(200).send(""+i)
				}
			).catch(err => {
				res.status(400).send(res)
			})
		}
		else{
			res.status(400).send("Could not find the user with Id: "+userId)
		}
	})
	.catch(err => res.send(500).send(res))
	
})

/**
 * Get the houseRank and semesterRank for the requesting user
 */
users_app.get('/auth-rank',  (req, res) => {
	//Get user id. Check the house. Get the rank of the user
	db.collection(HouseCompetition.USERS_KEY).doc(req["user"]["user_id"]).get()
	.then(userDocument => {
		if(userDocument.exists ){
			const houseName = userDocument.data()!.House
			db.collection(HouseCompetition.USERS_KEY)
			.where('House', '==', houseName)
				.get()
				.then(snapshot => {
					snapshot.docs.sort((u1,u2) => u2.data().TotalPoints - u1.data().TotalPoints)
					let houseRank = 1
					while(houseRank <= snapshot.docs.length && snapshot.docs[houseRank-1].data().TotalPoints !== userDocument.data()!.TotalPoints){
						houseRank ++
					}

					snapshot.docs.sort((u1,u2) => (u2.data().TotalPoints -  u2.data().LastSemesterPoints) - (u1.data().TotalPoints - u1.data().LastSemesterPoints))
					let semesterRank = 1
					while(semesterRank <= snapshot.docs.length && 
							(snapshot.docs[semesterRank-1].data().TotalPoints - snapshot.docs[semesterRank-1].data().LastSemesterPoints) 
							!== (userDocument.data()!.TotalPoints - userDocument.data()!.LastSemesterPoints)){
						semesterRank ++
					}

					res.status(200).send(
						"{\n"+
							"\t\"houseRank\" : "+houseRank +",\n"+
							"\t\"semesterRank\" : "+semesterRank+"\n"+
						"}")
					return
				}
			).catch(err => {
				console.log("FAILED WITH DB FROM HOUSE ERROR: "+err)
				const error = APIResponse.ServerError()
				res.status(error.code).send(error.toJson())
			})
		}
		else{
			console.log("FAILED COULD NOT FIND USER")
			const error = APIResponse.NonExistantUser()
			res.status(error.code).send(error.toJson())
		}
	})
	.catch(err => {
		console.log("FAILED WITH DB FROM user ERROR: "+err)
		const error = APIResponse.ServerError()
		res.status(error.code).send(error.toJson())
	})
		
	
})

/**
 * Creates a user and returns it
 */
users_app.post('/create', async (req, res) => {
	//req["user"] is assigned in the FirebaseTools after user is authenticated
	if(req.query.first === null || req.query.last === null || req.query.code === null){
		const error = APIResponse.MissingRequiredParameters()
		res.status(error.code).send(error.toJson())
	}
	else{
		try {
			await getUser(req["user"]["user_id"])
			//User already exists, so we do not want to overwrite it
			const error = APIResponse.UserAlreadyExists()
			res.status(error.code).send(error.toJson())
		}
		catch(error){
			try{
				if(error instanceof APIResponse && error.code === 421){
					const houseCodes = await getHouseCodes()
					let found = false
					for( const code of houseCodes){
						if(code.code === req.query.code){
							found = true
							const user = User.fromCode(req.query.first,  req.query.last, req["user"]["user_id"], code)
							await createUser(req["user"]["user_id"], user)

							const success = APIResponse.Success()
							res.status(success.code).send(success.toJson())
						}
					}
					if(!found){
						const apiResponse = APIResponse.HouseCodeDoesNotExist()
						res.status(apiResponse.code).send(apiResponse.toJson())
					}
				}
				else if (error instanceof APIResponse){
					res.status(error.code).send(error.toJson())
				}
				else {
					console.log("FAILED WITH DB FROM user ERROR: "+ error)
					const apiResponse = APIResponse.ServerError()
					res.status(apiResponse.code).send(apiResponse.toJson())
				}
			}
			catch(suberror){
				if (suberror instanceof APIResponse){
					res.status(suberror.code).send(suberror.toJson())
				}
				else {
					console.log("FAILED WITH DB FROM user ERROR: "+ suberror)
					const apiResponse = APIResponse.ServerError()
					res.status(apiResponse.code).send(apiResponse.toJson())
				}
			}
			
		}
	}
	
})

/**
 * Return the user model for the firebase account noted in Authorization header
 */
users_app.get('/get', async (req, res) => {
	try{
		const user = await getUser(req["user"]["user_id"])
		res.status(200).send(user.toJson())
	}
	catch(error){
		if(error instanceof APIResponse){
			res.status(error.code).send(error.toJson())
		}
		else{
			console.log("FAILED WITH DB FROM user ERROR: "+ error)
			const apiResponse = APIResponse.ServerError()
			res.status(apiResponse.code).send(apiResponse.toJson())
		}
	}
})

/**
 * Submit a point for this user
 */
users_app.post('/submitPoint', async (req, res) => {

	if(!req.body.point_type_id ||  req.body.point_type_id === "" || !req.body.description ||
	 req.body.description === "" || !req.body.date_occurred || req.body.date_occurred === ""){
		const error = APIResponse.MissingRequiredParameters()
		res.status(error.code).send(error.toJson())
	}
	else{

		try{
			const date_occurred = new Date(req.body.date_occurred)
			if(isInDateRange(date_occurred)){
				const log = new UnsubmittedPointLog(admin.firestore.Timestamp.fromDate(date_occurred), req.body.description, parseInt(req.body.point_type_id))
				await submitPoint(req["user"]["user_id"], log, false)
				const success = APIResponse.Success()
				res.status(success.code).send(success.toJson())
			}
			else {
				const apiResponse = APIResponse.DateNotInRange()
				res.status(apiResponse.code).send(apiResponse.toJson())
			}
			
		}
		catch(error){
			console.log("FAILED WITH ERROR: "+ error.toString())
			if(error instanceof TypeError){
				const apiResponse = APIResponse.InvalidDateFormat()
				res.status(apiResponse.code).send(apiResponse.toJson())
			}
			else if(error instanceof APIResponse){
				res.status(error.code).send(error.toJson())
			}
			else{
				const apiResponse = APIResponse.ServerError()
				res.status(apiResponse.code).send(apiResponse.toJson())
			}
			
		}
	}

})