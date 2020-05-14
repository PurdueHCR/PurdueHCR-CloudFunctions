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
}