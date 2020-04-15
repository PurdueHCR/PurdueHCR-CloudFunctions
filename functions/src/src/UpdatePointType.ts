import * as admin from 'firebase-admin'
import { HouseCompetition } from '../models/HouseCompetition'
import { APIResponse } from '../models/APIResponse'

/**
 * 
 * @param user_id    Id of the user create
 * @param documentData      document fields to udpate
 * 
 * @throws 	410 - HouseCodeDoesNotExist
 * @throws  417 - UnknownPointType
 * @throws 	500 - ServerError
 */
export async function updatePointType(point_id: string, documentData: FirebaseFirestore.DocumentData): Promise<APIResponse> {

    const db = admin.firestore()
    try {
        const doc = await db.collection(HouseCompetition.POINT_TYPES_KEY).doc(point_id).get()
        if (doc.exists) {
            await db.collection(HouseCompetition.POINT_TYPES_KEY).doc(point_id).update(documentData)
            return Promise.resolve(APIResponse.Success())
        } else {
            return Promise.resolve(APIResponse.UnknownPointType())
        }
        return Promise.resolve(APIResponse.Success())
    }
    catch (error) {
        console.log("SERVER ERROR on update point_type: " + error)
        const apiResponse = APIResponse.ServerError()
        return Promise.reject(apiResponse)
    }

}