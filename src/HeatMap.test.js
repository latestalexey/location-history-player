import HeatMap from './HeatMap.js';

const READY_STATE = 4;
const SCALAR_E7 = 0.0000001;
let heatMap, oldXMLHttpRequest;

function createMockXhr(responseText, READY_STATE) {
    const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        overrideMimeType: jest.fn(),
        readyState: READY_STATE,
        responseText: responseText
    };

    window.XMLHttpRequest = jest.fn(() => mockXHR);

    return mockXHR;
}

function xmlhttprequestBackup() {
    oldXMLHttpRequest = window.XMLHttpRequest;
}

function xmlhttprequestRestore() {
    window.XMLHttpRequest = oldXMLHttpRequest
}

function whenReadFile(fileUrl, xhr) {
    const promise = heatMap.readFile(fileUrl);
    xhr.onreadystatechange();

    return promise;
}

describe('heatMap', () => {

    beforeEach(function () {
        heatMap = HeatMap();
    });

    describe('reading a file', () => {
        const fileUrl = 'any url';

        beforeEach(function () {
            xmlhttprequestBackup();
        });

        afterEach(() => {
            xmlhttprequestRestore();
        });

        it('should return an object with the content of a valid json file', (done) => {
            const fileContent = {key: 'any content'};
            let promise, xhr;

            xhr = createMockXhr(fileContent, READY_STATE);
            promise = whenReadFile(fileUrl, xhr);

            promise.then((response) => {
                expect(response).toEqual(fileContent);
                done();
            });
        });

        it('should return an error if the file is invalid', (done) => {
            const xhrError = {error: 'any error'};
            let promise, xhr;

            xhr = createMockXhr(xhrError, READY_STATE);
            promise = whenReadFile(fileUrl, xhr);

            promise.catch((response) => {
                expect(response).toEqual(xhrError);
                done();
            });
        });
    });

    describe('parsing the file\'s content', () => {
        it('should return an array of coordinates parsed properly', () => {
            const latOne = 377788014;
            const lonOne = -1224155326;
            const latTwo = 377733334;
            const lonTwo = 377788884;
            const fileContent = {
                "locations": [{
                    "latitudeE7": latOne,
                    "longitudeE7": lonOne
                }, {
                    "latitudeE7": latTwo,
                    "longitudeE7": lonTwo
                }]
            };
            const expectedObject = [
                [latOne * SCALAR_E7, lonOne * SCALAR_E7],
                [latTwo * SCALAR_E7, lonTwo * SCALAR_E7]
            ];
            let coordsParsed;

            coordsParsed = heatMap.parseCoordenates(fileContent);
            expect(coordsParsed).toEqual(expectedObject);
        });
    });

    describe('drawing a map', function () {
        it('should create a map', function () {
            const containerId = 'anyId';
            const centerCoords = 'any coords';
            const zoomLevel = 'any zoom';

            document.body.innerHTML = '<div id="' + containerId + '"></div>';
            window.L = {
                map: jest.fn(),
                tileLayer: jest.fn(),
                heatLayer: jest.fn()
            };

            const MockSetView = {setView: jest.fn()};
            window.L.map.mockReturnValue(MockSetView);

            heatMap.createMap(containerId, centerCoords, zoomLevel);

            expect(window.L.map).toHaveBeenCalledWith(containerId);
            expect(window.L.map.mock.instances.length).toBe(1);
            expect(MockSetView.setView).toHaveBeenCalledWith(centerCoords, zoomLevel);
            expect(MockSetView.setView.mock.instances.length).toBe(1);
        });
    });
});












