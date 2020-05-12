import * as functions from 'firebase-functions'
import * as admin from "firebase-admin";

class Database {
  private static instance: Database
  private db: any;
  private auth: any;

  private constructor(){
    if (process.env.NODE_ENV !== "test") {
      console.error("Initialize prod env")
      if(admin.apps.length === 0){
        admin.initializeApp(functions.config().firebase)
      }
      this.db = admin.firestore();
      this.auth = admin.auth();
    }
  }

  public static getInstance(): Database {
    if(!Database.instance){
      Database.instance = new Database();
    }

    return Database.instance
  }

  getDb () {
    
    return this.db;
  }

  getAuth() {
    return this.auth
  }
  
  setDb (database){
    console.error("SET DB")
    this.db = database;
    this.auth = { verifyIdToken: () => {return "Hello"} }
  };
}


export default Database