import * as admin from 'firebase-admin'
import { Reward } from "../models/Reward"
import { HouseCompetition } from "../models/HouseCompetition"
import { APIResponse } from "../models/APIResponse"

/**
 * Get a Reward from its Id
 * 
 * @param id The id of the Reward to retrieve
 */
export async function getRewardById(id: string) : Promise<Reward> {
	try {
        const db = admin.firestore()
		const rewardDocument = await db.collection(HouseCompetition.REWARDS_KEY).doc(id).get()
		if(!rewardDocument.exists){
			return Promise.reject(APIResponse.UnknownPointType())
		}
		else{
			const reward = Reward.fromDocumentSnapshot(rewardDocument)
			return Promise.resolve(reward)
		}
	}
	catch (err) {
		console.log("GET Reward Error: " + err)
		return Promise.reject(APIResponse.ServerError())
	}
}