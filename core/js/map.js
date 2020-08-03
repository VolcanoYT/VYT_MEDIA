var map_loading = false;

var TemporaryEarthquake = [];
var auto_mode = getAllUrlParams().auto;
var auto_twait = 0;
var auto_gwait = 60;

var G_Earthquake = L.layerGroup();
var G_Earthquake_C = L.layerGroup();

var G_Tsunami = L.layerGroup();
var G_Camera = L.layerGroup();
var G_Seismometer = L.layerGroup();
var G_Volcano = L.layerGroup();
var G_Antipodes = L.heatLayer([]);

var BaseCopyright = "MapScr @ ";
var cartodbdark = new L.TileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
    attribution: BaseCopyright + "CartoDB"
});
var cartodblight = new L.TileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    attribution: BaseCopyright + "CartoDB"
});
var wikimedia = new L.TileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png", {
    attribution: BaseCopyright + "WikiMedia"
});
var openstreetmap = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: BaseCopyright + "OpenStreetMap"
});
var arcgisonline = new L.TileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: BaseCopyright + "ArcgisOnline"
});
var opentopomap = new L.TileLayer("https://tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: BaseCopyright + "OpenTopoMap"
});
var googleTerrain = new L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: BaseCopyright + "Google"
});
var googleSat = new L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: BaseCopyright + "Google"
});
var googleHybrid = new L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: BaseCopyright + "Google"
});
var googleStreets = new L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: BaseCopyright + "Google"
});

var keymapbox = "pk.eyJ1IjoidGVtYmxvciIsImEiOiI5MjdjOTMxNTJiZmFlZmU1ZGI0ZjAwNTZlNjEyOWEwNyJ9.a1_DS6D2ipZAP1AS2OyAHQ";

var platev2 = new L.TileLayer("https://{s}.tiles.mapbox.com/v4/temblor.7eb9e366/{z}/{x}/{y}.png?access_token=" + keymapbox);
var platetectonics = new L.TileLayer("https://earthquake.usgs.gov/basemap/tiles/plates/{z}/{x}/{y}.png");
var places = new L.TileLayer("https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}");
var highrisk = new L.TileLayer("https://{s}.tiles.mapbox.com/v4/temblor.d2byhogx/{z}/{x}/{y}.jpg?access_token=" + keymapbox);
highrisk.setOpacity(0.4);

/*
var krb = L.esri.featureLayer({
    url: 'https://services7.arcgis.com/g7FCBALNv7UNIenl/arcgis/rest/services/KRB_GA_ID2/FeatureServer/0'
});
*/

var map = new L.Map('map_2d', {
    attributionControl: true,
    layers: [googleSat, G_Earthquake, G_Earthquake_C, platetectonics, places]
}).fitWorld();
map.setView([-1.62, 120.13], 5.4);
map.locate({
    setView: false,
    watch: true
});

var baseLayers = {
    "Carto DB (Dark)": cartodbdark,
    "Carto DB (Light)": cartodblight,
    "Wikimedia Map": wikimedia,
    "OpenStreetMap": openstreetmap,
    "ArcgisOnline": arcgisonline,
    "OpenTopoMap": opentopomap,
    "Google Terrain": googleTerrain,
    "Google Sat": googleSat,
    "Google Hybrid": googleHybrid,
    "Google Streets": googleStreets
};
var overlays = {
    "Earthquake": G_Earthquake,
    "Earthquake (Only Circle)": G_Earthquake_C,
    "Volcano": G_Volcano,

    "Places Name": places,
    "Plate Tectonics": platetectonics,
    "High Risk": highrisk,
    // "Kawasan Rawan Bencana": krb,

    "Seismometer Station": G_Seismometer,
   // "Tsunami Station": G_Tsunami,
    "Camera Station": G_Camera,
    "Antipodes (90km)": G_Antipodes,
};

L.control.scale().addTo(map);
L.control.layers(baseLayers, overlays).addTo(map);

L.easyButton('<span class="star">&starf;</span>', function () {
    $('#ews_tab').modal('toggle');
}).addTo(map);

var last_map = [];

function clean_map() {

    // Clean by Bounds Map
    var isloc = map.getBounds();
    if (JSON.stringify(last_map) !== JSON.stringify(isloc)) {
        last_map = isloc;

        //hapus layer dulu
        G_Earthquake.eachLayer(function (ini) {
            G_Earthquake.removeLayer(ini);
        });
        G_Earthquake_C.eachLayer(function (ini) {
            G_Earthquake_C.removeLayer(ini);
        });
        G_Seismometer.eachLayer(function (ini) {
            G_Seismometer.removeLayer(ini);
        });
        G_Camera.eachLayer(function (ini) {
            G_Camera.removeLayer(ini);
        });

        //add layer jika tersedia
        TemporaryEarthquake.forEach(async (item) => {
            if (isloc.contains(item.loc)) {
                G_Earthquake.addLayer(item.marker);
                G_Earthquake_C.addLayer(item.circle);
            }
        });
        SeismometerTemp.forEach(async (item) => {
            if (isloc.contains(item.loc)) {
                G_Seismometer.addLayer(item.marker);
            }
        });
        CameraTemp.forEach(async (item) => {
            if (isloc.contains(item.loc)) {
                G_Camera.addLayer(item.marker);
            }
        });
        //console.log('map berubah?');
    } else {
        //console.log('map belum berubah?');
    }

    // Clean by Time
    var toDelete = [];
    var set_color = getRandomColor();
    var currentdate = new Date(moment().utc().format('YYYY-MM-DD HH:mm:ss')); //GMT NOW
    TemporaryEarthquake.forEach(async (item, index) => {
        var olddate = new Date(item.expire);
        var hours = Math.floor(Math.abs(currentdate - olddate) / 36e5);
        if (hours > 24) {
            G_Earthquake.removeLayer(item.marker);
            G_Earthquake_C.removeLayer(item.circle);
            toDelete.push(index);
        } else {
            if (hours < 1) {
                TemporaryEarthquake[index].circle.setStyle({
                    color: set_color,
                    fillColor: set_color,
                });
            }
        }
    });
    while (toDelete.length) {
        TemporaryEarthquake.splice(toDelete.pop(), 1);
    }
}

async function GetEarthquake() {
    return await new Promise(resolve => {
        $.ajax({
            method: "GET",
            dataType: "json",
            data: {
                update: localDate,
                hour: 24
            },
            url: URL_API + "earthquake/geo.json",
        }).done(function (data) {
            if (data && data.meta) {
                if (data.meta.code == 200) {
                    if (data.features) {
                        data.features.forEach(async (item) => {
                            add(item);
                        });
                        resolve(200);
                    } else {
                        resolve("Earthquake: Data not available right now.");
                    }
                } else {
                    resolve(data.meta.status);
                }
            } else {
                resolve("Earthquake: Unknown problem");
            }
        }).fail(function (a) {
            resolve("Earthquake: Failed to update!");
        });
    });
}

function add(spawn) {
    var ecid = spawn.id;
    var noproblem = true;
    TemporaryEarthquake.forEach(async (item) => {
        if (item.id == ecid) {
            noproblem = false;
            return;
        }
    });

    if (noproblem) {
        var latx = spawn.geometry.coordinates[1];
        var lotx = spawn.geometry.coordinates[0];
        var lokasi = '' + latx + ", " + lotx + '';
        var whereeq = spawn.properties.title;
        var timeutc = spawn.properties.time;
        var timelocal = moment.utc(timeutc, 'YYYY-MM-DD HH:mm:ss').local();
        var provider = spawn.properties.sources;
        var mt = spawn.properties.magType;
        var magnitudetwo = Number(spawn.properties.mag).toFixed(1);
        var depthtwo = Number(spawn.geometry.coordinates[2]).toFixed(0);
        //var tsunami = spawn.properties.tsunami;
        var mystatus = EarthquakeStatus(spawn.properties.status);
        var cp = new L.LatLng(latx, lotx, (magnitudetwo + depthtwo / 100) * 1000);

        /*
        if (tsunami == "1") {
            if (magnitudetwo > 6.7) {
                if (depthtwo < 20) {
                    tsunami = "1";
                } else {
                    //jika gempa besar tapi dalam
                    tsunami = "0";
                }
            } else {
                //jika gempa kecil tapi ada tsunami
                tsunami = "0";
            }
        } else {
            if (magnitudetwo > 7) {
                if (depthtwo < 20) {
                    tsunami = "1";
                }
            }
        }
        */

        var link_gempa = 'https://volcanoyt.com/earthquake/track/' + ecid;
        var icon_eq = new L.marker(cp, {
            icon: L.divIcon({
                iconSize: null,
                html: '<div class="map-label eq"><div class="map-label-content" style="border-color: ' + ColorDepth(depthtwo) + ';background-color:' + getMagnitudeColor(magnitudetwo) + '">' + mt + '' + magnitudetwo + '</div><div class="map-label-arrow"></div></div>'
            })
        }).bindPopup('<strong>' + whereeq + '</strong><br><b>Location: </b><br>' + lokasi + ' <br><br>' + mt + '' + magnitudetwo + ' | depth ' + depthtwo + 'km <br><br>' + timeutc + ' GMT<br>' + timelocal.format("YYYY-MM-DD HH:mm:ss") + ' LocalTime<br><br>Source ' + provider + ' (Status ' + mystatus + ') <br>Share: <a href="https://www.facebook.com/sharer/sharer.php?u=' + link_gempa + '" target="_blank">Facebook</a> | <a href="https://twitter.com/intent/tweet/?text=' + link_gempa + '" target="_blank">Twitter</a> | <a href="whatsapp://send?text=' + link_gempa + '" target="_blank">WhatsApp</a>');

        var circle_eq = L.circle(cp, {
            fillColor: '#006400',
            color: 'green',
            radius: getIntensityCircleRadius(magnitudetwo, depthtwo) * 1000
        });
        console.log('tes'); 
        if (depthtwo >= 90) {
            G_Antipodes.addLatLng(antipode(cp));
        }
        TemporaryEarthquake.push({
            loc: cp,
            marker: icon_eq,
            circle: circle_eq,
            expire: timeutc,
            id: ecid
        });
    }
}

var CameraTemp = [];
var CameraTemp_Check = false;
async function GetCamera() {
    CameraTemp_Check = true;
    return await new Promise(resolve => {
        $.ajax({
            method: "GET",
            dataType: "json",
            cache: true,
            url: URL_API + "camera/list.json",
        }).done(function (data) {
            var tmp_data = data['results'];
            if (tmp_data) {
                tmp_data.forEach(async (item) => {
                    var set_lat = item['location']['latitude'];
                    if (!isEmpty(set_lat)) {
                        var ecid = item['id'];
                        var noproblem = true;
                        CameraTemp.forEach(async (item) => {
                            if (item.id == ecid) {
                                noproblem = false;
                                return;
                            }
                        });
                        if (noproblem) {
                            var set_lot = item['location']['longitude'];
                            var seo_url = item['seo_url'];
                            var nameset = item['name'];
                            var cp = new L.LatLng(set_lat, set_lot, 0);
                            var newico = new L.marker(cp, {
                                icon: L.divIcon({
                                    iconSize: null,
                                    html: '<div class="map-label eq"><div class="map-label-content"><a href="/camera/' + ecid + '/' + seo_url + '" target="_blank">'+nameset+'</a></div></div>'
                                })
                            });
                            //<img class="map-camera" src="' + URL_CDN + 'timelapse/' + ecid + '/last.jpg"></div><div class="map-label-arrow">
                            //.bindPopup('<a href="/camera/' + ecid + '/' + seo_url + '" target="_blank"><img class="map-camera" src="' + URL_CDN + 'timelapse/' + ecid + '/last.jpg"></a>', {minWidth: 480,});
                            CameraTemp.push({
                                loc:cp,
                                marker: newico,
                                id: ecid
                            });
                        }

                    }
                });
                resolve(200);
            } else {
                resolve("Camera: Unknown problem");
            }
        }).fail(function (a) {
            resolve("Camera: Failed to update!");
        });
    })
}

var SeismometerTemp = [];
var SeismometerTemp_Check = false;
async function GetSeismometer() {
    SeismometerTemp_Check = true;
    return await new Promise(resolve => {
        $.ajax({
            method: "GET",
            dataType: "json",
            cache: true,
            url: URL_API + "seismometer/data.json",
        }).done(function (data) {
            var tmp_data = data['results'];
            if (tmp_data) {
                tmp_data.forEach(async (item) => {

                    var noproblem = true;
                    var ecid = item['id'];

                    SeismometerTemp.forEach(async (item) => {
                        if (item.id == ecid) {
                            noproblem = false;
                            return;
                        }
                    });

                    if (noproblem) {
                        var set_lat = item['latitude'];
                        var set_lot = item['longitude'];
                        var cp = new L.LatLng(set_lat, set_lot, 0);
                        var newico = new L.marker(cp, {
                            icon: L.divIcon({
                                iconSize: null,
                                html: '<div data-id="' + ecid + '" class="seimot map-label"><div class="map-label-content">' + item.code1 + '.' + item.code2 + '</div><div class="map-label-arrow"></div></div>'
                            })
                        });
                        SeismometerTemp.push({
                            loc: cp,
                            marker: newico,
                            id: ecid
                        });
                    }
                });
                resolve(200);
            } else {
                resolve("G_Seismometer: Unknown problem");
            }
        }).fail(function (a) {
            resolve("G_Seismometer: Failed to update!");
        });
    });
}

var wait = 60;
var tmp_wait = wait;
setInterval(async () => {

    //sync data
    if (tmp_wait >= wait) {
        tmp_wait = 0;

        console.log('Start check earthquake...');
        var sync = await GetEarthquake();
        console.log(sync);
    } else {
        tmp_wait++
    }

    //sync new layar
    if (map) {

        //jika ada layar seimo
        if (map.hasLayer(G_Seismometer)) {
            if (!SeismometerTemp_Check) {
                console.log('Start check seismometer...');
                var sync = await GetSeismometer();
                console.log(sync);
                last_map = [];
            }
        } else {
            if (SeismometerTemp_Check) {
                SeismometerTemp_Check = false;
                SeismometerTemp.forEach(async (item) => {
                    G_Seismometer.removeLayer(item.marker);
                });
                SeismometerTemp = [];
            }
        }

        //jika ada layar camera
        if (map.hasLayer(G_Camera)) {
            if (!CameraTemp_Check) {
                console.log('Start check camera...');
                var sync = await GetCamera();
                console.log(sync);
                last_map = [];
            }
        } else {
            if (CameraTemp_Check) {
                CameraTemp_Check = false;
                CameraTemp.forEach(async (item) => {
                    G_Camera.removeLayer(item.marker);
                });
                CameraTemp = [];
            }
        }

        clean_map();

    }

    //testing auto mode
    if (auto_mode) {
        //console.log('cek...');
    } else {
        //console.log('no cek pw');
    }

    //for testing color
    /*
    $(".seimot").each(function (i) {
        var id_seimo = $(this).attr("data-id");
        $(this).children( ".map-label-content" ).attr('style','background-color: '+getRandomColor()+'');
        //console.log(id_seimo);
    });
    */

    //console.log((new Date()).getTime());
}, 1000 * 1);

/**
 * 
 * @param {*} data
 * What is the status of an earthquake?
 */
function EarthquakeStatus(data) {
    if (data == "0") {
        return "Preliminary";
    } else if (data == "1") {
        return "Confirmed";
    } else if (data == "2") {
        return "Update";
    } else {
        return "Unknown";
    }
}

/**
 * 
 * @param {*} coord 
 * https://math.stackexchange.com/questions/1191689/how-to-calculate-the-antipodes-of-a-gps-coordinate
 * Antipodes are mostly used to predict earthquakes but that does not mean it will certainly happen
 */
function antipode(coord) {
    return new L.LatLng(-1 * coord['lat'], coord['lng'], coord['alt']);
}

/**
 * Return the radius of the circle in which the mmi is greater than 3.
 * The unit is km.
 * https://github.com/SPREP/mhews/blob/master/imports/api/geoutils.js
 */
function getIntensityCircleRadius(mw, depth) {
    let radiusResolution = 100;
    let maximumRadius = 1000;
    let radius = 0;
    for (let sx = radiusResolution; sx <= maximumRadius; sx += radiusResolution) {
        let mmi = getMMI(calculatePGV(mw, depth, sx));
        if (mmi < 4) {
            return radius;
        }
        radius = sx;
    }
    return radius;
}

/**
 * According to the table in http://earthquake.usgs.gov/earthquakes/shakemap/background.php#wald99b.
 * MMI=2 is skipped.
 */
function getMMI(pgv) {
    if (pgv < 0.1) return 1;
    else if (pgv < 1.1) return 3;
    else if (pgv < 3.4) return 4;
    else if (pgv < 8.1) return 5;
    else if (pgv < 16) return 6;
    else if (pgv < 31) return 7;
    else if (pgv < 60) return 8;
    else if (pgv < 116) return 9;
    else return 10;
}

/**
 * Calculate PGV at the surface distance sx from the epicenter.
 * According to http://www.data.jma.go.jp/svd/eew/data/nc/katsuyou/reference.pdf
 */
function calculatePGV(mw, depth, sx) {
    let l = Math.pow(10, 0.5 * mw - 1.85);
    let x = Math.max(sx / Math.cos(Math.atan2(depth, sx)) - l * 0.5, 3);
    let pgv600 = Math.pow(10, 0.58 * mw + 0.0038 * depth - 1.29 - log10(x + 0.0028 * Math.pow(10, 0.5 * mw) - 0.002 * x));
    let pgv700 = pgv600 * 0.9;
    let avs = 600;
    let arv = Math.pow(10, 1.83 - 0.66 * log10(avs));
    let pgv = arv * pgv700;

    return pgv;
}

/**
 * Math.log10 seems not yet supported by all devices, so we define it here.
 */
function log10(value) {
    return Math.log(value) / Math.log(10);
}

/**
 * Vivid red color for a strong magnitude, mild yellow color for a weak magnitude.
 */
function getMagnitudeColor(mw) {
    if (mw < 3) {
        return '#FFFF00';
    } else if (mw < 4) {
        return '#FFCC00';
    } else if (mw < 5) {
        return '#FF9900';
    } else if (mw < 6) {
        return '#FF6600';
    } else if (mw < 7) {
        return '#FF3300';
    }
    return '#FF0000';
}

/**
 * Color based on depth base
 */
function ColorDepth(depthtwo) {
    var normalicon = "blue";
    if (depthtwo > 70) {
        normalicon = "green";
    }
    if (depthtwo > 150) {
        normalicon = "yellow";
    }
    if (depthtwo > 300) {
        normalicon = "orange";
    }
    if (depthtwo > 700) {
        normalicon = "pink";
    }
    return normalicon;
}

/**
 * Just random color :)
 */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}