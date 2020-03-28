import * as admin from 'firebase-admin'
import { HouseCompetition } from "../models/HouseCompetition"
import { APIResponse } from "../models/APIResponse"
import { House } from '../models/House'

/**
 * Get a House from its Name
 * 
 * @param name The name of the house to retrieve
 */
export async function getHouseByName(name: string) : Promise<House> {
	try {
        const db = admin.firestore()
		const houseDocument = await db.collection(HouseCompetition.HOUSE_KEY).doc(name).get()
		if(!houseDocument.exists){
			return Promise.reject(APIResponse.UnknownHouse())
		}
		else{
			const house = House.fromDocument(houseDocument)
			return Promise.resolve(house)
		}
	}
	catch (err) {
		console.log("GET Point type Error: " + err)
		return Promise.reject(APIResponse.ServerError())
	}
}