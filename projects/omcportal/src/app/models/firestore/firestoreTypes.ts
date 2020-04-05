import {firestore} from "firebase";

/***
 * This file is there because standardising frontend with cloud functions has proved very problematic
 * Imports are different and installing firebase types hasnt solved the problem
 * This is an effective temporary solution as there are currently few types
 * Imports not within models can be imported via the packages themselves
 */

export class MyGeoPoint extends firestore.GeoPoint {
}

export class MyTimestamp extends firestore.Timestamp {
}
