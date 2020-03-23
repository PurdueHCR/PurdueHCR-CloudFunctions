import * as admin from 'firebase-admin'
import { User } from '../models/User'
import { HouseCompetition } from '../models/HouseCompetition'
import { APIResponse } from '../models/APIResponse'

/**
 * Create a user in the database
 * 
 * @param user_id   id of the user to created
 * @param user      User data to be set in the database
 */
export async function createUser(user_id: string, user:User): Promise<void> {
    const db = admin.firestore()

    db.collection(HouseCompetition.USERS_KEY).doc(user_id).set(user.toJson()).then(_ =>{
        return Promise.resolve()
    })
    .catch( err => {
        console.log("SERVER ERROR on create user: "+err)
        const error = APIResponse.ServerError()
        return Promise.reject(error)
    })
}