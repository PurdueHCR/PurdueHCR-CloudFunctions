export class APIResponse{
    code:  number
    message:  string

    constructor(code: number, message: string){
        this.code = code;
        this.message = message;
    }

    toJson(){
        const data = {}
        data["message"] = this.message  
        return data;
    }

    toString(): string {
        return "Code: "+this.code+" - "+this.toJson()
    }

    static Success(): APIResponse {
        return new APIResponse(200, "Success")
    }
    /**
     * User model does not exist in the database
     */
    static NonExistantUser() : APIResponse {
        return new APIResponse(400, "User does not exist")
    }

    /**
     * User's permission level is not a level which is allowed to submit points
     */
    static UserCantSubmitPoints(): APIResponse {
        return new APIResponse(408, "This User Can't Submit Points")
    }

    /**
     * The Link/QR code which was scanned is a single use code and this user has already scanned it
     */
    static LinkAlreadySubmitted(): APIResponse {
        return new APIResponse(409, "This Link Has Already Been Submitted")
    }

    /**
     * House code does not exist in the database
     */
    static HouseCodeDoesNotExist(): APIResponse {
        return new APIResponse(410, "House Does Not Exist")
    }

    /**
     * House Competition is disabled so the request may not be completed at this time
     */
    static CompetitionDisabled(): APIResponse {
        return new APIResponse(412, "House Competition Is Disabled")
    }

    /**
     * Supplied Point Type Id does not exist in the database. This may occur if the point type is negative
     */
    static UnknownPointType(): APIResponse {
        return new APIResponse(417, "Unknown Point Type")
    }

    /**
     * Point Type is not enabled for submissions at this time
     */
    static PointTypeDisabled(): APIResponse {
        return new APIResponse(418, "Point Type Is Disabled")
    }

    /**
     * This point type does not allow users to self submit this point. IE it must be scanned through a link
     */
    static PointTypeSelfSubmissionDisabled(): APIResponse {
        return new APIResponse(419, "Users Can Not Self Submit This Point Type")
    }

    /**
     * User with that ID already exists in the database
     */
    static UserAlreadyExists(): APIResponse {
        return new APIResponse(421, "User Already Exists")
    }

    /**
     * Required parameters for this endpoint does not exist
     */
    static MissingRequiredParameters(): APIResponse {
        return new APIResponse(422, "Missing Required Parameters")
    }

    /**
     * Could not parse date format
     */
    static InvalidDateFormat(): APIResponse {
        return new APIResponse(423, "Could Not Parse Date Format")
    }

    /**
     * Could not parse date format
     */
    static DateNotInRange(): APIResponse {
        return new APIResponse(424, "Date Is Not Allowed")
    }

    /**
     * Unknown Firebase Firestore error
     */
    static ServerError(): APIResponse {
        return new APIResponse(500, "Server Error")
    }
}