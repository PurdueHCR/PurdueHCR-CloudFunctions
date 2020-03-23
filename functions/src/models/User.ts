import { PointLog} from './PointLog'
import { HouseCode } from './Housecode'
import { UserPermissionLevel } from './UserPermissionLevel'
export class User {

    static FIRST_NAME = "FirstName"
    static FLOOR_ID ="FloorID"
    static HOUSE = "House"
    static LAST_NAME = "LastName"
    static PERMISSION_LEVEL = "Permission Level"
    static LAST_SEMESTER_POINTS = "LastSemesterPoints"
    static TOTAL_POINTS = "TotalPoints"

    firstName: string
    floorId: string
    house: string
    lastName: string
    lastSemesterPoints: number
    permissionLevel: UserPermissionLevel
    totalPoints: number
    id: string

    constructor(firstName:string, floorId:string, house: string, lastName: string, 
        lastSemesterPoints: number, permissionLevel: UserPermissionLevel, totalPoints: number, id:string){
            this.firstName = firstName
            this.floorId = floorId
            this.house = house
            this.lastName = lastName
            this.lastSemesterPoints = lastSemesterPoints
            this.permissionLevel = permissionLevel
            this.totalPoints = totalPoints
            this.id = id
        }

    static fromCode(firstName: string, lastName: string, id: string, code:HouseCode){
        return new User(firstName,code.floorId, code.house, lastName, 0, code.permissionLevel, 0, id)
    } 

    getFullName(): string {
        return this.firstName + " " + this.lastName
    }

    canSubmitPoints(): Boolean {
        return this.permissionLevel === UserPermissionLevel.RESIDENT || 
            this.permissionLevel === UserPermissionLevel.RHP || 
            this.permissionLevel === UserPermissionLevel.PRIVILEGED_RESIDENT
    }

    /**
     * This method takes a document that you get by retrieving a collection and turns it into a user model.
     * 
     * @param document Document from iterating through a collection
     */
    static fromQueryDocumentSnapshot(document: FirebaseFirestore.QueryDocumentSnapshot){
        return this.fromData(document.id, document.data())
    }

    /**
     * This method takes a document that you have after you call .get() on a document but not a collection
     * 
     * @param document Document retrived 
     */
    static fromDocumentSnapshot(document: FirebaseFirestore.DocumentSnapshot){
        return this.fromData(document.id, document.data()!)
    }

    static fromData( docId: string, documentData: FirebaseFirestore.DocumentData){
        let firstName: string
        let floorId: string
        let house: string
        let lastName: string
        let lastSemesterPoints: number
        let permissionLevel: UserPermissionLevel
        let totalPoints: number
        let id: string

        id = docId


        if( User.FIRST_NAME in documentData){
            firstName = documentData[User.FIRST_NAME]
        }
        else{
            firstName = ""
        }
        
        if( User.FLOOR_ID in documentData){
            floorId = documentData[User.FLOOR_ID]
        }
        else{
            floorId = ""
        }

        if( User.HOUSE in documentData){
            house = documentData[User.HOUSE]
        }
        else{
            house = ""
        }
        
        if( User.LAST_NAME in documentData){
            lastName = documentData[User.LAST_NAME]
        }
        else{
            lastName = ""
        }
        
        if( User.LAST_SEMESTER_POINTS in documentData){
            lastSemesterPoints = documentData[User.LAST_SEMESTER_POINTS]
        }
        else{
            lastSemesterPoints = -1
        }

        if( User.PERMISSION_LEVEL in documentData){
            permissionLevel = documentData[User.PERMISSION_LEVEL]
        }
        else{
            permissionLevel = 0
        }
        
        if( User.TOTAL_POINTS in documentData){
            totalPoints = documentData[User.TOTAL_POINTS]
        }
        else{
            totalPoints = -1
        }
        return new User(firstName,floorId,house,lastName
            ,lastSemesterPoints,permissionLevel,totalPoints,id)
    }

    toFirestoreJson(){
        const data = {}
        data[User.FIRST_NAME]= this.firstName
        data[User.FLOOR_ID] = this.floorId
        data[User.HOUSE] = this.house
        data[User.LAST_NAME] = this.lastName
        data[User.PERMISSION_LEVEL] = this.permissionLevel
        data[User.TOTAL_POINTS] = this.totalPoints
        data[User.LAST_SEMESTER_POINTS] = this.lastSemesterPoints
        
        return data
    }


    toJson(){
        const data = {}
        data[User.FIRST_NAME]= this.firstName
        data[User.FLOOR_ID] = this.floorId
        data[User.HOUSE] = this.house
        data[User.LAST_NAME] = this.lastName
        data[User.PERMISSION_LEVEL] = this.permissionLevel
        data[User.TOTAL_POINTS] = this.totalPoints
        data[User.LAST_SEMESTER_POINTS] = this.lastSemesterPoints
        
        return data
    }

    /// This method returns a map with the data used to update the users overall score
    toPointUpdateJson() {
        const data = {}
        data[User.TOTAL_POINTS] = this.totalPoints
        return data
    }

}

export class UserWithPoints extends User {
    points: PointLog[] = []

    addPointLog(pl:PointLog){
        this.points.push(pl)
    }
}


