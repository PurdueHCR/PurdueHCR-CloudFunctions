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

    static systemPreference(db:firebase.firestore.Firestore, systemPreferenceOptions?:SystemPreferenceOptions): Promise<void>{
        if(systemPreferenceOptions){
            return db.collection("SystemPreferences").doc("Preferences").set({
                "Android_Version": (systemPreferenceOptions!.android_version)?systemPreferenceOptions!.android_version:"2.0.0",
                "OneTimeCode": (systemPreferenceOptions!.one_time_code)?systemPreferenceOptions!.one_time_code:"abc",
                "competitionHiddenMessage": (systemPreferenceOptions!.competition_hidden_message)?systemPreferenceOptions!.competition_hidden_message:"hidden",
                "houseEnabledMessage": (systemPreferenceOptions!.house_enabled_message)?systemPreferenceOptions!.house_enabled_message:"Honors1",
                "iOS_Version":(systemPreferenceOptions!.ios_version)?systemPreferenceOptions!.ios_version:"1.6.2",
                "isCompetitionVisible":(systemPreferenceOptions!.is_competition_visible)?systemPreferenceOptions!.is_competition_visible:true,
                "isHouseEnabled": (systemPreferenceOptions!.is_house_enabled)?systemPreferenceOptions!.is_house_enabled:true,
                "suggestedPointIDs": (systemPreferenceOptions!.suggested_point_ids)?systemPreferenceOptions!.suggested_point_ids:"1,2,3,4"
            })
        }
        else{
            return db.collection("SystemPreferences").doc("Preferences").set({
                "Android_Version": "2.0.0",
                "OneTimeCode": "abc",
                "competitionHiddenMessage": "hidden",
                "houseEnabledMessage": "Honors1",
                "iOS_Version":"1.6.2",
                "isCompetitionVisible":true,
                "isHouseEnabled": true,
                "suggestedPointIDs":"1,2,3,4"
            })
        }
        
    }

    static createPointType(db: firebase.firestore.Firestore, id: number, ptopts?:PointTypeOptions): Promise<void>{
        return db.collection("PointTypes").doc(id.toString()).set({
            "Description":(ptopts && ptopts.description)? ptopts.description: "Empty Point Type Description",
            "Name":(ptopts && ptopts.name)? ptopts.name: "Empty Point Type Name",
            "Enabled":(ptopts && ptopts.is_enabled)? ptopts.is_enabled: true,
            "PermissionLevel":(ptopts && ptopts.permission_level)? ptopts.permission_level : 2,
            "ResidentsCanSubmit": (ptopts && ptopts.residents_can_submit)? ptopts.residents_can_submit : true,
            "Value": (ptopts && ptopts.value)? ptopts.value : 1
        })
    }
}