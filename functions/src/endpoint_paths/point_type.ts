import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as bodyParser from "body-parser"
import { HouseCompetition } from '../models/HouseCompetition'
import { PointType } from '../models/PointType'
import { User} from '../models/User'
import { UserPermissionLevel } from '../models/UserPermissionLevel'


//Make sure that the app is only initialized one time 
if(admin.apps.length === 0){
	admin.initializeApp(functions.config().firebase)
}

const db = admin.firestore()
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
 */

pt_app.get('/get', (req, res) => { 
    //get point types which are allowed by a user
    db.collection(HouseCompetition.USERS_KEY).doc(req["user"]["user_id"]).get()
			.then(userDocument => {
			if(userDocument.exists ){
				const user = User.fromDocumentSnapshot(userDocument)
				db.collection(HouseCompetition.POINT_TYPES_KEY).get().then(pointTypeDocs =>{
					const pts: PointType[] = []
					for( const pt of pointTypeDocs.docs){
						pts.push(PointType.fromCollectionDocument(pt))
					}
					const user_pts: PointType[] = []
					pts.forEach((point_type) =>{
						if(point_type.permissionLevel == UserPermissionLevel.PROFESSIONAL_STAFF){
							user_pts.push(point_type)
						}
						else if (point_type.enabled){
							if(point_type.userCanGenerateQRCodes(user.permissionLevel)){
								user_pts.push(point_type)
							}
							else if(point_type.residentCanSubmit){
								user_pts.push(point_type)
							}
						}
						
					})
					res.status(200).send(JSON.stringify(user_pts))
				})
				.catch(err => res.status(500).send("Firebase error getting point types: "+err))
			}
			else{
				res.status(400).send("Could not find the user with Id: "+req["user"]["user_id"])
			}
	})
	.catch(err => res.status(500).send("Firebase error getting user: "+res))
})
// Put code for /getPointTypes above


