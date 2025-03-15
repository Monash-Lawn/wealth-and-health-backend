import { ObjectId } from '@datastax/astra-db-ts';
import { InvalidDataError, EntityNotFoundError } from '../lib/error-utils.ts';
import { getDb } from '../lib/db.ts';
import { COLLECTION_NAME as LOCATION_COLLECTION_NAME } from '../models/location.model.ts';
import dotenv from 'dotenv';
import { fetchLocation, fetchLocationByAddress } from '../lib/geocoding-utils.ts';

dotenv.config();

const db = getDb();
const Location = db.collection(LOCATION_COLLECTION_NAME);

export const createLocation = async (req: any, res: any, next: any) => {
  const { lat, long } = req.body;

  if (lat === undefined || long === undefined) {
    return next(new InvalidDataError('Latitude and longitude are required.'));
  }

  try {
    const geocodingResponse = await fetchLocation(lat, long);

    const locationData = {
      name: 'Unnamed Location',
      lat: Number(lat),
      long: Number(long)
    }

    if (geocodingResponse.results && geocodingResponse.results.length > 0 && geocodingResponse.status === "OK") {
      const locality = geocodingResponse.results.filter(result => result.types.includes('locality'))[0];
      if (locality.formatted_address) {
        const loc_res = await fetchLocationByAddress(locality.formatted_address);
        if (loc_res.results && loc_res.results.length > 0 && loc_res.status === "OK") {
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

    res.status(201).json({
      success: true,
      error: false,
      id: result.insertedId,
      location: {
        _id: result.insertedId,
        name: locationData.name,
        lat: locationData.lat,
        long: locationData.long
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getLocation = async (req: any, res: any, next: any) => {
  const { id } = req.params;

  if (!id) {
    return next(new InvalidDataError('Location ID is required.'));
  }

  try {
    const location = await Location.findOne({ _id: new ObjectId(id) });

    if (!location) {
      return next(new EntityNotFoundError('Location not found.'));
    }

    res.status(200).json({
      success: true,
      error: false,
      location
    });
  } catch (error) {
    next(error);
  }
};


export const getLocations = async (req: any, res: any, next: any) => {
  const locations = await Location.find({}).toArray();

  res.status(200).json({
    success: true,
    error: false,
    locations
  });
}
