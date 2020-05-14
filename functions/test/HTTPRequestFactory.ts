import *  as request from 'supertest'
import * as functions from 'firebase-functions'

// a helper function to make a POST request.
export function post(func: functions.HttpsFunction, url: string, body:any, authorization: string = "Bearer 1"): request.Test{
  const httpRequest = request(func).post(url).send(body).type('form')
  httpRequest.set("Authorization", authorization)
  httpRequest.set('Content-Type', 'application/x-www-form-urlencoded')
  return httpRequest;
}

// a helper function to make a POST request.
export function get(func: functions.HttpsFunction, url: string, authorization: string = "Bearer 1"): request.Test{
    const httpRequest = request(func).get(url);
    httpRequest.set("Authorization", authorization)
    httpRequest.set('Accept', 'application/json')
    return httpRequest;
  }