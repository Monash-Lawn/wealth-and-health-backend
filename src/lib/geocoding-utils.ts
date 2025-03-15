import dotenv from "dotenv";
dotenv.config();


const API_KEY = process.env.GOOGLE_MAP_API_KEY;


export interface GeocodingResponse {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
    place_id: string;
    plus_code?: {
      compound_code: string;
      global_code: string;
    };
    types: string[];
  }>;
  status: string;
}


export const fetchLocation = async (lat: number | string, long: number | string): Promise<GeocodingResponse> => {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${API_KEY}`);
  const data = await response.json() as GeocodingResponse;

  return data;
};


  export const fetchLocationByAddress = async (address: string) => {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`);
  const data = await response.json() as GeocodingResponse;

  return data;
}

