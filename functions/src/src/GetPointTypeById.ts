import * as admin from 'firebase-admin'
import { PointType } from "../models/PointType"
import { HouseCompetition } from "../models/HouseCompetition"
import { APIResponse } from "../models/APIResponse"

/**
 * Get a Point Type from its Id
 * 
 * @param id The id of the PointType to retrieve
 */
export async function getPointTypeById(id: number) : Promise<PointType> {
	try {
        const db = admin.firestore()
		const pointTypeDocument = await db.collection(HouseCompetition.POINT_TYPES_KEY).doc(id.toString()).get()
		if(!pointTypeDocument.exists){
			return Promise.reject(APIResponse.UnknownPointType())
		}
		else{
			const pointType = PointType.fromDocument(pointTypeDocument)
			return Promise.resolve(pointType)
		}
	}
	catch (err) {
		console.log("GET Point type Error: " + err)
		return Promise.reject(APIResponse.ServerError())
	}
}