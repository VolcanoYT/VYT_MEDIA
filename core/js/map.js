$("body").append('<div class="card text-white bg-primary infomap"><div class="card-header">Latest Earthquake</div><div id="data_gempa">Wait...</div></div>');

var map_loading = false;

var ews_loading = false;
var ews_link = null;

var tmp_open = false;
var autoclose = true;

var TemporaryEarthquake = [];

var isfullscreen = getAllUrlParams().fullscreen;
var isnoinfo = getAllUrlParams().noinfo;

if (isnoinfo == "true") {
    autoclose = false;
}

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
var seismicportal = L.tileLayer.wms('https://www.seismicportal.eu/wms?', {
    layers: 'event'
});

//https://www.seismicportal.eu/wms?&&SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=event&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=true&HEIGHT=256&WIDTH=256&TILED=true&SRS=EPSG%3A4326&BBOX={z},0,{x},{y}

//https://www.seismicportal.eu/wms?&service=WMS&request=GetMap&layers=event&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox=16280475.528516265,-2504688.542848655,17532819.79994059,-1252344.2714243263

var krb = L.esri.featureLayer({
    ////https://services6.arcgis.com/WVOVRvVBhANSlrYg/arcgis/rest/services/Kawasan_Rawan_Bencana_Gunung_Api/FeatureServer/0/query
    //https://services7.arcgis.com/g7FCBALNv7UNIenl/arcgis/rest/services/KRB_GA_ID2/FeatureServer/0
    url: 'https://services6.arcgis.com/WVOVRvVBhANSlrYg/arcgis/rest/services/Kawasan_Rawan_Bencana_Gunung_Api/FeatureServer/0',
}).bindPopup(function (layer) {
    switch (layer.feature.properties.INDGA) {
        case 1:
            var krb = 'Kawasan Rawan Bencana (KRB) I';
            break;
        case 2:
            var krb = 'Kawasan Rawan Bencana (KRB) II';
            break;
        default:
            var krb = 'Kawasan Rawan Bencana (KRB) III';
            break;
    }
    return L.Util.template('<h3>' + krb + '</h3><hr/><p>{REMARK}</p>', layer.feature.properties);
});

var localfault = new L.LayerGroup;
/*
d3.json("https://bmkg-content-inatews.storage.googleapis.com/indo_faults_lines.geojson", function (a) {
    localfault.addLayer(L.geoJSON(a, {
        color: "orange",
        weight: 1
    }));
});
*/
var get_zona = moment.tz(moment.tz.guess()).zoneAbbr();

var map = new L.Map('map_2d', {
    attributionControl: true,
    //G_Seismometer,G_Camera
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
    "Kawasan Rawan Bencana": krb.setWhere("MAG_CODE='MER'"),

    "Seismometer Station": G_Seismometer,
    // "Tsunami Station": G_Tsunami,
    "Camera Station": G_Camera,
    "Antipodes (90km)": G_Antipodes,
    "Fault Indonesia": localfault,
   // "TES": seismicportal
};

L.control.scale().addTo(map);
L.control.layers(baseLayers, overlays).addTo(map);

/*
L.easyButton('<span class="star">&starf;</span>', function () {
    $('#ews_tab').modal('toggle');
}).addTo(map);
*/

var last_map = [];

var counter = 0;

function clean_map(cleanid = "") {

    // Clean by Bounds Map
    var isloc = map.getBounds();
    if (!isEmpty(cleanid)) {
        last_map = "";
    }
    if (JSON.stringify(last_map) !== JSON.stringify(isloc)) {
        last_map = isloc;

        //add layer jika tersedia
        TemporaryEarthquake.forEach(async (item, index_cam) => {
            if (isEmpty(cleanid)) {
                if (isloc.contains(item.loc)) {
                    G_Earthquake.addLayer(item.marker);
                    G_Earthquake_C.addLayer(item.circle);
                } else {
                    G_Earthquake.removeLayer(item.marker);
                    G_Earthquake_C.removeLayer(item.circle);
                }
            } else {
                if (cleanid.spawn.id == item.spawn.id) {
                    console.log('found id to remove');

                    if (isloc.contains(item.loc)) {
                        G_Earthquake.removeLayer(item.marker);
                        G_Earthquake_C.removeLayer(item.circle);
                    }

                    TemporaryEarthquake[index_cam].spawn = cleanid.spawn;
                    TemporaryEarthquake[index_cam].circle = cleanid.circle
                    TemporaryEarthquake[index_cam].marker = cleanid.marker;

                    if (isloc.contains(item.loc)) {
                        G_Earthquake.addLayer(cleanid.marker);
                        G_Earthquake_C.addLayer(cleanid.circle);
                    }
                }
            }
        });
        SeismometerTemp.forEach(async (item) => {
            if (isloc.contains(item.loc)) {
                G_Seismometer.addLayer(item.marker);
                if (ews_loading) {
                    /*
                    ewsio.emit('ewsbeta', {
                        subscribe: "" + item.item.network + "." + item.item.station + "",
                    });
                     */
                }
            } else {
                G_Seismometer.removeLayer(item.marker);
                if (ews_loading) {
                    /*
                    ewsio.emit('ewsbeta', {
                        unsubscribe: "" + item.item.network + "." + item.item.station + "",
                    });
                    */
                }
            }
        });
        CameraTemp.forEach(async (item) => {
            if (isloc.contains(item.loc)) {
                G_Camera.addLayer(item.marker);
            } else {
                G_Camera.removeLayer(item.marker);
            }
        });
        console.log('map berubah?');
    }

    // Clean by Time
    var toDelete = [];
    var set_color = getRandomColor();
    var currentdate = new Date(moment().utc().format('YYYY-MM-DD HH:mm:ss')); //GMT NOW

    counter++;

    if (counter > 7) {
        counter = 0;
    }

    TemporaryEarthquake.forEach(async (item, index) => {
        var olddate = new Date(item.spawn.properties.time);
        var eq_low = item.spawn.properties.mag;
        var hours = Math.floor(Math.abs(currentdate - olddate) / 36e5);
        if (hours > 24) {
            G_Earthquake.removeLayer(item.marker);
            G_Earthquake_C.removeLayer(item.circle);
            toDelete.push(index);
        } else {
            if (hours < 1) {
                //set circle if new earthquake
                if (eq_low >= 2) {
                    TemporaryEarthquake[index].circle.setRadius(counter * eq_low * 100);
                } else {
                    TemporaryEarthquake[index].circle.setStyle({
                        color: set_color,
                        fillColor: set_color,
                    });
                }
            } else {
                TemporaryEarthquake[index].circle.setRadius(TemporaryEarthquake[index].rdnum);
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
                        data.features.forEach(async (item, index) => {
                            if (index == 0) {
                                add(item, true);
                            } else {
                                add(item);
                            }
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

function add(spawn, notif = false) {

    var ecid = spawn.id;
    var timeupd = spawn.properties.update;

    var thisupdate = null;
    var noproblem = true;

    TemporaryEarthquake.forEach(async (item, index_item) => {
        if (item.spawn.id == ecid) {

            var item_time_update = item.spawn.properties.update;

            try {
                if (timeupd !== item_time_update) {
                    console.log(' ' + timeupd + ' - ' + item_time_update + ' ');
                    thisupdate = index_item;
                } else {
                    noproblem = false;
                }
            } catch (error) {
                console.log(error);
            }
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
        var tsunami = spawn.properties.tsunami;
        var statsid = spawn.properties.status;
        var cont = spawn.properties.count;
        var mystatus = EarthquakeStatus(statsid);
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

        var wait_close = 10;
        if (magnitudetwo >= 5) {
            wait_close = 40;
            console.log('update yooooooosan');
        } else if (magnitudetwo >= 3 && magnitudetwo <= 5) {
            wait_close = 20;
        }

        var deep_color = ColorDepth(depthtwo);
        var eq_color = getMagnitudeColor(magnitudetwo);
        if (statsid == "0") {
            deep_color = "#ffffff";
            eq_color = "#ffffff";
        }

        var link_gempa = 'https://volcanoyt.com/earthquake/track/' + ecid;
        var msgpop = '<strong>' + whereeq + '</strong><br><b>Location: </b><br>' + lokasi + ' <br>' + mt + '' + magnitudetwo + ' | depth ' + depthtwo + 'km <br><br>' + timeutc + ' GMT<br>' + timelocal.format("YYYY-MM-DD HH:mm:ss") + ' ' + get_zona + '<br><br>Source ' + provider + '<br>Status: ' + mystatus + '<br>Update: ' + timeupd + ' UTC (' + cont + 'x)<br><br>Share: <a href="https://www.facebook.com/sharer/sharer.php?u=' + link_gempa + '" target="_blank">Facebook</a> | <a href="https://twitter.com/intent/tweet/?text=' + link_gempa + '" target="_blank">Twitter</a> | <a href="whatsapp://send?text=' + link_gempa + '" target="_blank">WhatsApp</a>';

        var iconpz = L.divIcon({
            iconSize: null,
            html: '<div class="map-label eq"><div class="map-label-content" style="border-color: ' + deep_color + ';background-color:' + eq_color + '">' + mt + '' + magnitudetwo + '</div><div class="map-label-arrow"></div></div>'
        });

        var rdnum = getIntensityCircleRadius(magnitudetwo, depthtwo);

        var circle_eq = L.circle(cp, {
            fillColor: '#006400',
            color: 'green',
            radius: rdnum
        });

        var icon_eq = new L.marker(cp, {
            icon: iconpz
        }).bindPopup(msgpop);

        if (isEmpty(thisupdate)) {
            if (depthtwo >= 90) {
                G_Antipodes.addLatLng(antipode(cp));
            }
            TemporaryEarthquake.push({
                loc: cp,
                marker: icon_eq,
                circle: circle_eq,
                spawn: spawn,
                rdnum: rdnum
            });
        } else {
            //clean map with new update
            clean_map({
                spawn: spawn,
                circle: circle_eq,
                marker: icon_eq
            })
        }

        if (notif) {
            try {
                if (autoclose) {
                    map.flyTo([latx, lotx], 8);
                    $('.infomap').show(3000);
                    $('#data_gempa').html('\
                        <div class="card-body">\
                            ' + whereeq + '\
                        </div>\
                        <ul class="list-group list-group-flush">\
                            <li class="list-group-item list-group-item-dark"><i class="fal fa-house-damage"></i> Magnitude ' + magnitudetwo + ' in ' + mt + '</li>\
                            <li class="list-group-item list-group-item-dark"><i class="fab fa-audible"></i> Depth ' + depthtwo + 'km</li>\
                            <li class="list-group-item list-group-item-dark"><i class="fal fa-clock"></i> <time data-now="' + timeutc + '"></time> / ' + mystatus + ' (' + cont + 'x)</li>\
                            <li class="list-group-item list-group-item-dark"><i class="fas fa-server"></i> Source ' + provider + '</li>\
                        </ul>\
                    ');
                    tmp_open = setTimeout(
                        function () {
                            $('.infomap').hide(5000);
                        }, 1000 * wait_close);
                }
            } catch (error) {
                console.log(error);
            }
        }

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
                                    html: '<div class="map-label eq"><div class="map-label-content"><a href="/camera/' + ecid + '/' + seo_url + '" target="_blank">' + nameset + '</a></div></div>'
                                })
                            });
                            //<img class="map-camera" src="' + URL_CDN + 'timelapse/' + ecid + '/last.jpg"></div><div class="map-label-arrow">
                            //.bindPopup('<a href="/camera/' + ecid + '/' + seo_url + '" target="_blank"><img class="map-camera" src="' + URL_CDN + 'timelapse/' + ecid + '/last.jpg"></a>', {minWidth: 480,});
                            CameraTemp.push({
                                loc: cp,
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
            data: {
                // search: "GE"
            }
        }).done(function (data) {
            var tmp_data = data['results'];
            if (tmp_data) {
                tmp_data.forEach(async (item) => {

                    var noproblem = true;
                    var id_station = item['id'];

                    SeismometerTemp.forEach(async (item) => {
                        if (item.id == id_station) {
                            noproblem = false;
                            return;
                        }
                    });

                    if (noproblem) {
                        var set_lat = item['latitude'];
                        var set_lot = item['longitude'];

                        var network = item['network'];
                        var station = item['station'];

                        var cp = new L.LatLng(set_lat, set_lot, 0);
                        var newico = new L.marker(cp, {
                            icon: L.divIcon({
                                iconSize: null,
                                html: '<div data-id="' + network + '.' + station + '" class="seimot map-label"><div class="map-label-content">' + item.network + '.' + item.station + '</div><div class="map-label-arrow"></div></div>'
                            })
                        });
                        SeismometerTemp.push({
                            loc: cp,
                            marker: newico,
                            id: id_station,
                            item: item
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
        last_map = [];

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

}, 1000 * 1);

/*
ews_link = new ReconnectingWebSocket("wss://seedlink.volcanoyt.com");
ews_link.onopen = function (e) {
    console.log("EWS Online", e);
    ews_loading = true;
};
ews_link.onmessage = function (e) {
    var json = JSON.parse(e.data);
    if (json.error) {
        console.log("Error: ",json.error);
    } else if (json.success) {
        console.log("Success: ",json.success);
    } else {
        EWS_Proses(json);
    }
};
ews_link.onclose = function (e) {
    console.log("EWS Offline", e);
    ews_loading = false
};
*/

/*
function EWS_Proses(data) {
    var network = data.network;
    var station = data.station;
    var full_nama = "" + network + "." + station + "";
    //var channel = data.channel;
    //var location = "";

    console.log(data);

    var sub = $("div[data-id='" + full_nama + "']").children(".map-label-content");
    sub.attr('style', 'background-color: ' + getColor(data.pga) + '');
    sub.html('' + full_nama + ' | PGA ' + data.pga + '');
}
*/

//API Socket
var useurl = getAllUrlParams().URL;

//URL Proxy Player for localhost or multi node
if (!isEmpty(useurl)) {
    URL_APP = useurl;
}

var ewsio = io(URL_APP + 'ews', {
    transports: ['websocket']
});
ewsio.on('disconnect', function () {
    console.log('disconnect');
    ews_loading = false;
})
ewsio.on('connect', function () {
    console.log('connect');
    ews_loading = true;

    if (!isEmpty(useurl)) {
        ewsio.emit('ewsbeta', {
            subscribe: "GE.JAGI",
        });
    }

})
ewsio.on('error', (error) => {
    console.log(error);
});
ewsio.on('info', function (x) {
    console.log('newinfo: ', x);
    if (x.type == "earthquake") {
        add(x.data, true);
    }
});

map.on('zoomend', function () {
    console.log('zoomend');
});

if (isfullscreen == "true") {
    $(".navbar").hide();
    $("#map_2d").css("margin-top", "0");
}