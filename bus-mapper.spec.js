describe("API Fetch and Manipulation Code Sanity Tests", function() {
    it("generateURLObjectTripsForRoute should return a well-formed URL object", function() {
        const routeVal = 100228;
        const result = generateURLObjectTripsForRoute(routeVal);

        expect(result).toBeInstanceOf(URL);
        const expectedHref = `https://api.pugetsound.onebusaway.org/api/where/trips-for-route/1_${routeVal}.json?key=772e8f7d-77d8-4c54-8e20-4630a03a1126`
        expect(result.href).toBe(expectedHref);
    });

    it("reformatAPIResponseToGeoJSON should return well-formed GeoJSON.", function() {
        const mockAPIResponse = {
            data: {
                list: [
                    {
                        status: {
                            position: { lon: 45, lat: 90 },
                            vehicleId: 1234
                        }
                    }
                ]
            }
        };

        const expectedGeoJSON = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [45, 90]
                    },
                    "properties": {
                        "position": { "lon": 45, "lat": 90 },
                        "vehicleId": 1234
                    }
                }
            ]
        };

        const result = reformatAPIResponseToGeoJSON(mockAPIResponse);
        expect(result).toEqual(expectedGeoJSON);
    })
});