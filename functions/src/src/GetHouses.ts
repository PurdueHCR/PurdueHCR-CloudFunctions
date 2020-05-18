import * as admin from 'firebase-admin'
import { HouseCompetition } from "../models/HouseCompetition"
import { APIResponse } from "../models/APIResponse"
import { House } from '../models/House'

/**
 * Get a House from its Name
 * 
 * @param name The name of the house to retrieve
 */
export async function getAllHouses() : Promise<House[]> {
	try {
        const db = admin.firestore()
		const houseQuerySnapshot = await db.collection(HouseCompetition.HOUSE_KEY).get()
		const house = House.fromQuerySnapshot(houseQuerySnapshot);
			return Promise.resolve(house)
	}
	catch (err) {
		console.log("GET All Houses Error: " + err)
		return Promise.reject(APIResponse.ServerError())
	}
}

/**
 * Get a House from its Name
 * 
 * @param name The name of the house to retrieve
 */
export async function getHouseByName(name: string) : Promise<House> {
	try {
        const db = admin.firestore()
		const houseDocumentSnapshot = await db.collection(HouseCompetition.HOUSE_KEY).doc(name).get()
		if(!houseDocumentSnapshot.exists){
			return Promise.reject(APIResponse.UnknownHouse())
		}
		else{
			const house = House.fromDocumentSnapshot(houseDocumentSnapshot)
			return Promise.resolve(house)
		}
	}
	catch (err) {
		console.log("GET House by name Error: " + err)
		return Promise.reject(APIResponse.ServerError())
	}
}