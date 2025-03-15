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
  

  export const getLocationFromCoordinates = async (lat: number | string, long: number | string, api: string) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${api}`);
    const data = await response.json() as GeocodingResponse;
    
    let name = "Unnamed Location";
    
    if (data.results && data.results.length > 0 && data.status === "OK") {
      name = data.results[0].formatted_address;
    }
  
    return name;
  };
  
  