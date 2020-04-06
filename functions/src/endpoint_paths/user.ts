import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as bodyParser from "body-parser"
import { HouseCompetition } from '../models/HouseCompetition'
import { APIResponse } from '../models/APIResponse'
import { UnsubmittedPointLog } from '../models/UnsubmittedPointLog'
import { submitPoint } from '../src/SubmitPoints'
import { getUser } from '../src/GetUser'
import { createUser } from '../src/CreateUser'
import { isInDateRange } from '../src/IsInDateRange'
import { getUserRank } from '../src/GetUserRank'

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
 * @returns UserRank
 * @throws 400 - NonExistantUser
 * @throws 401 - Unauthroized
 * @throws 500 - ServerError
 */
users_app.get('/auth-rank',  async (req, res) => {
	try{
		const rank = await getUserRank(req["user"]["user_id"])
		res.status(APIResponse.SUCCESS_CODE).send(rank.toJson())
	}
	catch (error){
        if( error instanceof APIResponse){
            res.status(error.code).send(error.toJson())
        }
        else {
            console.log("Unknown Error: "+error.toString())
            const apiResponse = APIResponse.ServerError()
            res.status(apiResponse.code).send(apiResponse.toJson())
        }
    }
})

/**
 * Creates a user
 * @returns User
 * @throws  401 - Unauthorized
 * @throws 	410 - HouseCodeDoesNotExist
 * @throws 	412 - UserAlreadyExists
 * @throws 	422 - MissingRequiredParameters
 * @throws 	500 - ServerError
 */
users_app.post('/create', async (req, res) => {
	//req["user"] is assigned in the FirebaseTools after user is authenticated
	if(req.query.first === null || req.query.last === null || req.query.code === null){
		const error = APIResponse.MissingRequiredParameters()
		res.status(error.code).send(error.toJson())
	}
	else{
		try{
			const success = await createUser(req["user"]["user_id"], req.query.code, req.query.first, req.query.last)
			res.status(success.code).send(success.toJson())
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
	
})

/**
 * Return the user model for the firebase account noted in Authorization header
 * @returns User
 * @throws 	400 - NonExistantUser
 * @throws  401 - Unauthorized
 * @throws 	500 - ServerError 
 */
users_app.get('/get', async (req, res) => {
	try{
		const user = await getUser(req["user"]["user_id"])
		res.status(APIResponse.SUCCESS_CODE).send(user.toJson())
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
 * 
 * @throws  401 - Unauthorized
 * @throws  408 - This User Can't Submit Points
 * @throws  412 - House Competition Is Disabled
 * @throws  418 - Point Type Is Disabled
 * @throws  419 - Users Can Not Self Submit This Point Type
 * @throws 	422 - MissingRequiredParameters
 * @throws  500 - Server Error
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
				const didAddPoints = await submitPoint(req["user"]["user_id"], log, false)
				const success = APIResponse.Success()
				if(didAddPoints){
					res.status(202).send(success.toJson())
				}
				else {
					res.status(201).send(success.toJson())
				}
				
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


/**
 * Returns a list of point logs submitted by a user
 * 
 * @param query.limit	Optional query parameter. If provided, only return the <limit> most recently submitted points. Else return all submitted points
 * @param query.handledOnly Optional query parameter. If provided, only return point logs that follow this parameter
 * @param query.id	Optional query parameter. If provided, only return the point log with the given id
 * @throws 401 - Unauthorized
 * Any other errors you find while making this code
 * @throws 500 - ServerError
 */
users_app.get('/points', (req, res) => {
	//Create a function in the src folder that takes the optional parameters and returns the appropriate list of point logs
	//look at user/get for an example of how to call these functions and look in the src folder for an example function
})