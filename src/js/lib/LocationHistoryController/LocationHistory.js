export function service(fileUrl) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                const resp = request.responseText;
                if (resp.error) {
                    reject(resp);
                } else {
                    resolve(resp);
                }
            }
        };
        request.open('GET', fileUrl, true);
        request.send(null);
    });
}

export function timeLineTakeoutParser(coordinatesText, SCALAR_E7) {
    let coordsParsed = [];

    JSON.parse(coordinatesText).locations.forEach((point) => {
        let lat, lon;

        lat = point.latitudeE7 * SCALAR_E7;
        lon = point.longitudeE7 * SCALAR_E7;

        coordsParsed.push([lat, lon]);
    });

    return coordsParsed;
}