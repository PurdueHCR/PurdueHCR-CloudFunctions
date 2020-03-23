import * as admin from 'firebase-admin'
import { UnsubmittedPointLog } from "../models/UnsubmittedPointLog"
import { UserPermissionLevel } from "../models/UserPermissionLevel"
import { HouseCompetition } from "../models/HouseCompetition"
import { APIResponse } from "../models/APIResponse"
import { getSystemPreferences } from "./GetSystemPreferences"
import { getPointTypeById } from "./GetPointTypeById"
import { addPoints } from "./AddPoints"
import { getUser } from "./GetUser"
import { submitPointLogMessage } from './SubmitPointLogMessage'
import { PointLogMessage } from '../models/PointLogMessage'

/**
 * Checks permissions and submits points to database
 * 
 * @param userId	The id of the user for whom this point is being submit
 * @param log 		Contains information about the point log
 * @param isGuaranteedApproval Is this a log which does not need an RHP to approve it
 * @param documentId (optional) does this point log have an id already - ex. single use QR codes
 */
export async function submitPoint(userId: string, log: UnsubmittedPointLog, isGuaranteedApproval: boolean, documentId?: string | null): Promise<any>{

    const db = admin.firestore()

	const systemPreferences = await getSystemPreferences()
	if (systemPreferences.isHouseEnabled) {
		const pointType = await getPointTypeById(log.pointTypeId)
		if(pointType.enabled && pointType.residentCanSubmit){
			const user = await getUser(userId)
			if(user.canSubmitPoints()){
				log.updateFieldsWithUser(user)
				if(isGuaranteedApproval || user.permissionLevel === UserPermissionLevel.RHP){
					//If the log is approved
					log.approveLog()
				}
				else {
					//If the point log is not immediately approved, set the pointtypeID to negative
					log.pointTypeId *= -1
				}
				try{
					if(documentId && documentId !== ""){
						//If a document ID is provided, check if the id exists, and if not, set in database
						const doc = await db.collection(HouseCompetition.HOUSE_KEY).doc(user.house.toString())
													.collection(HouseCompetition.HOUSE_COLLECTION_POINTS_KEY).doc(documentId).get()
						if(doc.exists){
							return Promise.reject(APIResponse.LinkAlreadySubmitted())
						}
						else{
							await db.collection(HouseCompetition.HOUSE_KEY).doc(user.house.toString())
								.collection(HouseCompetition.HOUSE_COLLECTION_POINTS_KEY).doc(documentId).set(log.toFirebaseJSON())
						}
						log.id = documentId
					}
					else {
						//No document id, so create new document in database
						const document = await db.collection(HouseCompetition.HOUSE_KEY).doc(user.house.toString())
													.collection(HouseCompetition.HOUSE_COLLECTION_POINTS_KEY).add(log.toFirebaseJSON())
						log.id = document.id
					}

				}
				catch (err) {
					console.log("Error From Writing PointLog. " + err)
					return Promise.reject(new APIResponse(500, "Server Error"))
				}
				
				//If the log is automatically approved, add points to the user and the house
				if(isGuaranteedApproval || user.permissionLevel === UserPermissionLevel.RHP){
					await submitPointLogMessage(user.house, log, PointLogMessage.getPreaprovedMessage())
					return addPoints(pointType.value, user.house, user.id)
				}
				else {
					return Promise.resolve()
				}
			}
			else {
				return Promise.reject(APIResponse.UserCantSubmitPoints())
			}
		}
		else if(!pointType.residentCanSubmit){
			return Promise.reject(APIResponse.PointTypeSelfSubmissionDisabled())
		}
		else {
			return Promise.reject(APIResponse.PointTypeDisabled())
		}

	}
	else {
		return Promise.reject(APIResponse.CompetitionDisabled())
	}
}