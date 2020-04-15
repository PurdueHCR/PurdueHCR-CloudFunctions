import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as bodyParser from "body-parser"
import { getUser } from '../src/GetUser'
import { APIResponse } from '../models/APIResponse'
import { getUserPointTypes } from '../src/getUserPointTypes'
import { APIResponse } from '../models/APIResponse'
import { HouseCompetition } from '../models/HouseCompetition'
import { PointType } from '../models/PointType'
import { User} from '../models/User'
import { UserPermissionLevel } from '../models/UserPermissionLevel'


//Make sure that the app is only initialized one time 
if(admin.apps.length === 0){
	admin.initializeApp(functions.config().firebase)
}

const pt_app = express()
const cors = require('cors')
const pt_main = express()
const firestoreTools = require('../firestoreTools')

pt_main.use(pt_app)
pt_main.use(bodyParser.json())
pt_main.use(bodyParser.urlencoded({ extended: false }))



// competition_main is the object to be exported. export this in index.ts
export const pts_main = functions.https.onRequest(pt_main)

//setup Cors for cross site requests
pt_app.use(cors({origin:true}))
//Setup firestoreTools to validate user has been 
pt_app.use(firestoreTools.validateFirebaseIdToken)





/**
 * competition/getPointTypes => retrieves the list of point types available to the user and sends them back
 *
 * @throws 400 - NonexistantUser
 * @throws 401 - Unauthorized
 * @throws 500 - ServerError
 */

pt_app.get('/get', async (req, res) => { 
	try{
		const user = await getUser(req["user"]["user_id"])
		const user_pts = await getUserPointTypes(user)
		res.status(APIResponse.SUCCESS_CODE).send(JSON.stringify(user_pts))
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
// Put code for /getPointTypes above


/**
 * point_type/update => updates fields in the point type with the passed in ID
 * 
 * @throws  400 - UserDoesNotExist
 * @throws  401 - Unauthorized
 * @throws  403 - 
 * @throws 	422 - MissingRequiredParameters
 * @throws  500 - Server Error
 */
pt_app.put('/update', async (req, res) => {
	
	// ALSO NEED TO check user permissions
	if (!req.body.point_type_id || req.body.point_type_id === "") {
		const error = APIResponse.MissingRequiredParameters()
		res.status(error.code).send(error.toJson())
	}
	else {

		try {
			const success = await createUser(req["user"]["user_id"], req.query.code, req.query.first, req.query.last)
			res.status(success.code).send(success.toJson())
		}
		catch(suberror) {
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
