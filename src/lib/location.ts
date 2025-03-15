import { Location as LocationSchema } from "../models/location.model.ts";
import { fetchLocation, fetchLocationByAddress, GeocodingResponse } from '../lib/geocoding-utils.ts';
import { COLLECTION_NAME as LOCATION_COLLECTION_NAME } from '../models/location.model.ts';
import { getDb } from "./db.ts";

const db = getDb();
const Location = db.collection(LOCATION_COLLECTION_NAME);


const hasValidResults = (geocodingResponse: GeocodingResponse): boolean => {
    return geocodingResponse.results && geocodingResponse.results.length > 0 && geocodingResponse.status === "OK";
}

export async function createLocation(lat: number, long: number): Promise<LocationSchema> {
    const geocodingResponse = await fetchLocation(lat, long);

    const locationData = {
        name: 'Unnamed Location',
        lat: Number(lat),
        long: Number(long)
    }

    if (hasValidResults(geocodingResponse)) {
        const locality = geocodingResponse.results.filter(result => result.types.includes('locality'))[0];
        if (locality.formatted_address) {
            const loc_res = await fetchLocationByAddress(locality.formatted_address);
            if (hasValidResults(loc_res)) {
                locationData.name = locality.formatted_address;
                locationData.lat = Number(loc_res.results[0].geometry.location.lat);
                locationData.long = Number(loc_res.results[0].geometry.location.lng);
            }
        }
    }

    const result = await Location.insertOne({
        name: locationData.name,
        lat: locationData.lat,
        long: locationData.long
    });

    return {
        _id: result.insertedId,
        name: locationData.name,
        lat: locationData.lat,
        long: locationData.long
    }
}

export async function safeGetLocation(lat: number, long: number): Promise<LocationSchema> {
    const geocodingResponse = await fetchLocation(lat, long);

    if (hasValidResults(geocodingResponse)) {
        const locality = geocodingResponse.results.filter(result => result.types.includes('locality'))[0];
        if (locality.formatted_address) {
            const location = await Location.findOne({ name: locality.formatted_address });
            if (location) {
                return {
                    _id: location._id,
                    name: locality.formatted_address,
                    lat: location.lat,
                    long: location.long
                }
            }
        }
    }

    return await createLocation(lat, long);
}
