import { UserWithPoints } from "./User"

export class PointLog {
    static APPROVED_BY = "ApprovedBy"
    static APPROVED_ON = "ApprovedOn"
    static DATE_OCCURRED = "DateOccurred"
    static DATE_SUBMITTED = "DateSubmitted"
    static DESCRIPTION = "Description"
    static FLOOR_ID = "FloorID"
    static POINT_TYPE_ID = "PointTypeID"
    static RHP_NOTIFICATIONS = "RHPNotifications"
    static RESIDENT_FIRST_NAME = "ResidentFirstName"
    static RESIDENT_ID = "ResidentId"
    static RESIDENT_LAST_NAME = "ResidentLastName"
    static RESIDENT_NOTIFICATIONS = "ResidentNotifications"

    //Approved variables may not be filled if the point log has not been approved yet, so the type is unified with null
    approvedBy: string | null
    approvedOn: FirebaseFirestore.Timestamp | null

    dateOccurred: FirebaseFirestore.Timestamp
    dateSubmitted: FirebaseFirestore.Timestamp
    description: string
    floorId: string
    pointTypeId: number
    rhpNotifications: number
    residentFirstName: string
    residentId: string
    residentLastName: string
    residentNotifications: number

    constructor(approvedBy: string | null, approvedOn: FirebaseFirestore.Timestamp | null, dateOccurred: FirebaseFirestore.Timestamp,
        dateSubmitted: FirebaseFirestore.Timestamp, description: string, floorId: string, pointTypeId: number,
        rhpNotifications: number, residentFirstName: string, residentId: string, residentLastName: string,
        residentNotifications: number) {
        this.approvedBy = approvedBy
        this.approvedOn = approvedOn
        this.dateOccurred = dateOccurred
        this.dateSubmitted = dateSubmitted
        this.description = description
        this.floorId = floorId
        this.pointTypeId = pointTypeId
        this.rhpNotifications = rhpNotifications
        this.residentFirstName = residentFirstName
        this.residentId = residentId
        this.residentLastName = residentLastName
        this.residentNotifications = residentNotifications
    }

    static fromDocument( document: FirebaseFirestore.DocumentSnapshot): PointLog {
        return this.fromData(document.data()!);
    }

    static fromQueryDocument( queryDocument: FirebaseFirestore.QueryDocumentSnapshot): PointLog {
        return this.fromData(queryDocument.data());
    }

    private static fromData(document: FirebaseFirestore.DocumentData): PointLog {
        let approvedBy: string | null
        let approvedOn: FirebaseFirestore.Timestamp | null
        let dateOccurred: FirebaseFirestore.Timestamp
        let dateSubmitted: FirebaseFirestore.Timestamp
        let description: string
        let floorId: string
        let pointTypeId: number
        let rhpNotifications: number
        let residentFirstName: string
        let residentId: string
        let residentLastName: string
        let residentNotifications: number


        if(PointLog.APPROVED_BY in document){
            approvedBy = document[PointLog.APPROVED_BY]
        }
        else{
            approvedBy = null
        }

        if(PointLog.APPROVED_ON in document){
            approvedOn = document[PointLog.APPROVED_ON]
        }
        else{
            approvedOn = null
        }

        //These fields have to exist on a point log, so there is no check for null.
        dateOccurred = document[PointLog.DATE_OCCURRED]
        dateSubmitted = document[PointLog.DATE_SUBMITTED]
        description = document[PointLog.DESCRIPTION]
        floorId = document[PointLog.FLOOR_ID]
        pointTypeId = document[PointLog.POINT_TYPE_ID]
        rhpNotifications = document[PointLog.RHP_NOTIFICATIONS]
        residentFirstName = document[PointLog.RESIDENT_FIRST_NAME]
        residentId = document[PointLog.RESIDENT_ID]
        residentLastName = document[PointLog.RESIDENT_LAST_NAME]
        residentNotifications = document[PointLog.RESIDENT_NOTIFICATIONS]

        return new PointLog(approvedBy, approvedOn, dateOccurred, dateSubmitted, description, floorId, pointTypeId, 
            rhpNotifications, residentFirstName, residentId, residentLastName, residentNotifications)

    }


    createUser(){
        const usr = new UserWithPoints(this.residentFirstName, "","",this.residentLastName,0,0,0,this.residentId)
        usr.addPointLog(this)
        return usr;
    }
}
