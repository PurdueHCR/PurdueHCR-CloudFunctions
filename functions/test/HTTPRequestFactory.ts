import *  as request from 'supertest'
import * as functions from 'firebase-functions'

// a helper function to make a POST request.
export function post(func: functions.HttpsFunction, url: string, body:{}){
  const httpRequest = request(func).post(url);
  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json')
  return httpRequest;
}

// a helper function to make a POST request.
export function get(func: functions.HttpsFunction, url: string){
    const httpRequest = request(func).post(url);
    httpRequest.set("Authorization", "Bearer 1")
    httpRequest.set('Accept', 'application/json')
    return httpRequest;
  }