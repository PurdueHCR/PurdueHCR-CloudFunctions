import * as admin from 'firebase-admin'
import { APIResponse } from "../models/APIResponse"
import { PointLog } from '../models/PointLog'
import { HouseCompetition } from "../models/HouseCompetition"

/**
 * Get PointLogs for a user from their id
 * 
 * @param userID The id of the user whose PointLogs we want to retrieve
 * 
 * @throws
 * 
 */

export async function getPointLogsForUser(userID: string, house: string, limit: number = -1) : Promise<PointLog[]> {
    try {
        const db = admin.firestore()
        console.log("USER: ",userID, "hosue: ", house, "Limit: ",limit)
        let reference = db.collection(HouseCompetition.HOUSE_KEY).doc(house).collection(HouseCompetition.HOUSE_COLLECTION_POINTS_KEY).where(PointLog.RESIDENT_ID, '==', userID)
        if(limit > 0){
            reference = reference.limit(limit)
        }
        console.log(reference.toString())
        const pointLogQuerySnapshot = await reference.get()
        return Promise.resolve(PointLog.fromQuerySnapshot(pointLogQuerySnapshot))
    }
    catch (err) {
        console.log("GET PointLogs error: " + err)
        return Promise.reject(APIResponse.ServerError())
    }
}