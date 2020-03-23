import * as admin from "firebase-admin"
import { PointLog } from "./PointLog"

export class UnsubmittedPointLog extends PointLog{
    
    constructor(dateOccurred: admin.firestore.Timestamp, description: string, pointTypeId: number){
        super("", null,null, dateOccurred, admin.firestore.Timestamp.now(), description, "", pointTypeId, 0,"","","",0)
    }
}