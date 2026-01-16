export interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    district?: string;
    province?: string;
    country?: string;
}

/**
 * Fetches the current coordinates of the user.
 */
export const getCurrentCoordinates = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                let message = "Failed to get your location";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "Location permission denied. Please enable it in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        message = "The request to get user location timed out.";
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
};

/**
 * Performs reverse geocoding to get an address from coordinates using Nominatim API.
 */
export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
): Promise<LocationData> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
                headers: {
                    "Accept-Language": "en",
                    "User-Agent": "GrihaMate-Rental-Platform",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch address from geocoding service");
        }

        const data = await response.json();
        const address = data.address;

        // Build a readable address string
        const parts = [];
        if (address.road) parts.push(address.road);
        if (address.suburb) parts.push(address.suburb);
        if (address.neighbourhood) parts.push(address.neighbourhood);
        if (address.city || address.town || address.village) {
            parts.push(address.city || address.town || address.village);
        }
        if (address.state_district || address.county) {
            parts.push(address.state_district || address.county);
        }
        if (address.state) parts.push(address.state);
        if (address.country) parts.push(address.country);

        return {
            latitude,
            longitude,
            address: data.display_name || parts.join(", "),
            city: address.city || address.town || address.village,
            district: address.state_district || address.county,
            province: address.state,
            country: address.country,
        };
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw new Error("Could not retrieve detailed address data.");
    }
};

/**
 * Combines both getting coordinates and reverse geocoding.
 */
export const getCurrentLocationDetails = async (): Promise<LocationData> => {
    const coords = await getCurrentCoordinates();
    return await getAddressFromCoordinates(coords.latitude, coords.longitude);
};
