import * as firebase from "@firebase/testing"

export declare type PointTypeOptions = {
    description?: string
    name?: string
    is_enabled?: boolean
    permission_level?: number
    residents_can_submit?: boolean
    value?: number
};

export declare type SystemPreferenceOptions = {
    android_version?: string
    one_time_code?: string
    competition_hidden_message?: string
    house_enabled_message?: string
    ios_version?: string
    is_competition_visible?: boolean
    is_house_enabled?: boolean
    suggested_point_ids?: string
};

export declare type HouseOptions = {
    color?: string
    num_residents?: number
    total_points?: number
}

export declare type UserOptions = {
    first?:string, 
    floor_id?:string,
    house_name?:string,
    last?:string,
    semester_points?:number,
    total_points?:number
}

export class FirestoreDataFactory{

    static systemPreference(db:firebase.firestore.Firestore, spOpts?:SystemPreferenceOptions): Promise<void>{
        return db.collection("SystemPreferences").doc("Preferences").set({
            "Android_Version": (spOpts && spOpts!.android_version)?spOpts!.android_version:"2.0.0",
            "OneTimeCode": (spOpts && spOpts!.one_time_code)?spOpts!.one_time_code:"abc",
            "competitionHiddenMessage": (spOpts && spOpts!.competition_hidden_message)?spOpts!.competition_hidden_message:"hidden",
            "houseEnabledMessage": (spOpts && spOpts!.house_enabled_message)?spOpts!.house_enabled_message:"Honors1",
            "iOS_Version":(spOpts && spOpts!.ios_version)?spOpts!.ios_version:"1.6.2",
            "isCompetitionVisible":(spOpts && spOpts!.is_competition_visible !== undefined)?spOpts!.is_competition_visible:true,
            "isHouseEnabled": (spOpts && spOpts!.is_house_enabled !== undefined)?spOpts!.is_house_enabled:true,
            "suggestedPointIDs": (spOpts && spOpts!.suggested_point_ids)?spOpts!.suggested_point_ids:"1,2,3,4"
        })
    }

    static createPointType(db: firebase.firestore.Firestore, id: number, ptopts?:PointTypeOptions): Promise<void>{
        return db.collection("PointTypes").doc(id.toString()).set({
            "Description":(ptopts && ptopts.description)? ptopts!.description: "Empty Point Type Description",
            "Name":(ptopts && ptopts.name)? ptopts!.name: "Empty Point Type Name",
            "Enabled":(ptopts && ptopts.is_enabled !== undefined)? ptopts!.is_enabled: true,
            "PermissionLevel":(ptopts && ptopts.permission_level)? ptopts!.permission_level : 2,
            "ResidentsCanSubmit": (ptopts && ptopts.residents_can_submit !== undefined)? ptopts!.residents_can_submit : true,
            "Value": (ptopts && ptopts.value)? ptopts!.value : 1
        })
    }

    static createHouse(db: firebase.firestore.Firestore, id: string, hOpts?:HouseOptions): Promise<void> {
        return db.collection("House").doc(id).set({
            "Color":(hOpts && hOpts.color)? hOpts!.color: "#5AC0C7",
            "NumberOfResidents":(hOpts && hOpts.num_residents)? hOpts.num_residents: 200,
            "TotalPoints":(hOpts && hOpts.total_points)? hOpts.total_points: 20
        })
    }

    static createUser(db: firebase.firestore.Firestore, id: string, permission_level: number, uOpts?:UserOptions): Promise<void> {
        return db.collection("Users").doc(id).set({
            "FirstName":(uOpts && uOpts.first)? uOpts.first: "TEST_FIRST", 
            "FloorID":(uOpts && uOpts.floor_id)? uOpts.floor_id:"4N",
            "House":(uOpts && uOpts.house_name)? uOpts.house_name:"Platinum",
            "LastName":(uOpts && uOpts.last)? uOpts.last:"TEST_LAST",
            "SemesterPoints":(uOpts && uOpts.semester_points)? uOpts.semester_points:0,
            "Permission Level":permission_level, 
            "TotalPoints":(uOpts && uOpts.total_points)? uOpts.total_points:0
        })
    }
}