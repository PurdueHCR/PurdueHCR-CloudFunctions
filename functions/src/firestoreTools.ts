import { APIResponse } from "./models/APIResponse"
import Database from "./Database"

const admin = Database.getInstance()
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res , next) => {

	if(req.path === '/getLink'){
		next()
		return
	}

	if(req.path === '/getPointTypes'){
		next()
		return
	}
	
	if(req.path === '/secret-semester-points-set'){
    	next()
  		return
	}

	if(req.path === '/secret-reset-house-competition'){
    	next()
  		return
	}
	  
	if(req.path === '/rank'){
    		next()
  		return
  	}
  	console.log('Check if request is authorized with Firebase ID token')

  	if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      	!(req.cookies && req.cookies.__session)) {
    	console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        	'Make sure you authorize your request by providing the following HTTP header:',
        	'Authorization: Bearer <Firebase ID Token>',
			'or by passing a "__session" cookie.')
		const apiError = APIResponse.Unauthorized()
    	res.status(apiError.code).send(apiError.toJson())
    	return
  	}

  	let idToken
  	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    	console.log('Found "Authorization" header')
    	// Read the ID Token from the Authorization header.
    	idToken = req.headers.authorization.split('Bearer ')[1]
  	} else if(req.cookies) {
    	console.log('Found "__session" cookie')
    	// Read the ID Token from cookie.
    	idToken = req.cookies.__session
  	} else {
    	// No cookie
    	const apiError = APIResponse.Unauthorized()
    	res.status(apiError.code).send(apiError.toJson())
    	return
  	}

  	try {
    	const decodedIdToken = await admin.getAuth().verifyIdToken(idToken)
    	console.log('ID Token correctly decoded', decodedIdToken)
    	req.user = decodedIdToken
    	next()
    	return
  	} catch (error) {
    	console.error('Error while verifying Firebase ID token:', error)
    	const apiError = APIResponse.Unauthorized()
    	res.status(apiError.code).send(apiError.toJson())
    	return
  	}
}

module.exports.validateFirebaseIdToken = validateFirebaseIdToken
