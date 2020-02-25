import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
//import { HouseCompetition } from './models/HouseCompetition';
import {Link} from './models/Link';
import { HouseCompetition } from './models/HouseCompetition';


if(admin.apps.length === 0){
	admin.initializeApp(functions.config().firebase);
}
const db = admin.firestore();
const links_app = express();
const cors = require('cors');
const links_main = express();

links_main.use(links_app);
links_main.use(bodyParser.json());
links_main.use(bodyParser.urlencoded({ extended: false }));

const firestoreTools = require('./firestoreTools');

export const link_main = functions.https.onRequest(links_main);

links_app.use(cors({origin:true}));
links_app.use(firestoreTools.validateFirebaseIdToken);

/**
 * Given a GET call to /link/getLink?id=XXXXXXX,
 *    use the id parameter to retrive and send that link
 */
links_main.get('/getLink', (req, res) => {
    //TODO
    /*
        1. Ensure that the query parameter exists
        2. Using the value in the query parameter, get the link model in the database
        3. Cast the document into the API Link Model
        4. Send the document in the response
        5. On unable to find, send 400
        6. On server error, send 500
    */


})

/**
 * 
 */
links_main.post('/create' ,(req, res) => {

    if(req.body["single_use"] === undefined || req.body["point_id"] === undefined || req.body["description"] === undefined){
		res.status(422).send("Missing required parameters")
    }
    else{
        const link = new Link("",false,req["user"]["user_id"], req.body["description"], false, parseInt(req.body["point_id"]), req.body["single_use"]);
        db.collection(HouseCompetition.LINKS_KEY).add(link.toFirebaseJson()).then(ref => {
            res.status(200).send("Success");
        })
        .catch( err => {
            res.status(500).send("Unknown Server Error");
        })
    }
})