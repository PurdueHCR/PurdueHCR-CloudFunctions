import * as admin from 'firebase-admin'
import { User } from '../models/User'
import { HouseCompetition } from '../models/HouseCompetition'
import { APIResponse } from '../models/APIResponse'

/**
 * Get a user with an id
 * 
 * @param id Database id of the user to retrieve
 */
export async function getUser(id: string) : Promise<User> {
	try {
        const db = admin.firestore()
		const userDocument = await db.collection(HouseCompetition.USERS_KEY).doc(id).get()
		if (!userDocument.exists) {
			return Promise.reject(APIResponse.NonExistantUser())
		}
		else {
			const user = User.fromDocumentSnapshot(userDocument)
			return Promise.resolve(user)
		}
	}
	catch (err) {
		console.log("GET USER ERROR: " + err)
		return Promise.reject(APIResponse.ServerError())
	}
}