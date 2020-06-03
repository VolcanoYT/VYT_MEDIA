var eqwatch = [];
var auto_mode = getAllUrlParams().auto;
var auto_twait = 0;
var auto_gwait = 60;

var GroupBlue = L.layerGroup();
var TsunamiStation = L.layerGroup();
var CameraList = L.layerGroup();
var GroupEWS = L.layerGroup();
var GroupVolcano = L.layerGroup();
var heatz = L.heatLayer([]);

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

    layers: [googleSat, GroupBlue, platetectonics, GroupEWS, GroupVolcano, places, CameraList]
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
   // "Kawasan Rawan Bencana": krb,
    "Antipodes": heatz,
    "Earthquake": GroupBlue,
    "Volcano": GroupVolcano,
    "EWS User": GroupEWS,
    "Places Name": places,
    "Plate Tectonics": platetectonics,
    "High Risk": highrisk,
    "Tsunami Station": TsunamiStation,
    "Camera Station": CameraList,
};

L.control.scale().addTo(map);
L.control.layers(baseLayers, overlays).addTo(map);

/*
L.easyButton('<span class="star">&starf;</span>', function () {
    $('#ews_tab').modal('toggle');
}).addTo(map);
*/
function getcolordeep(depthtwo) {
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

function getstatus(data) {
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

function upto(f) {
    var normalicon = "Not felt";
    if (f > 1) {
        normalicon = "Weak";
    }
    if (f > 3) {
        normalicon = "Light";
    }
    if (f > 8) {
        normalicon = "Moderate";
    }
    if (f > 16) {
        normalicon = "Strong";
    }
    return normalicon;
}

function antipode(coord) {
    //https://math.stackexchange.com/questions/1191689/how-to-calculate-the-antipodes-of-a-gps-coordinate
    return new L.LatLng(-1 * coord['lat'], coord['lng'], coord['alt']);
}

function add(spawn) {
    var ecid = spawn.id;
    var noproblem = true;
    var j;
    for (j in eqwatch) {
        if (eqwatch[j].id == ecid) {
            noproblem = false;
            break
        }
    }
    if (noproblem) {
        var latx = spawn.geometry.coordinates[1];
        var lotx = spawn.geometry.coordinates[0];
        var lokasi = '' + latx + ", " + lotx + '';
        var whereeq = spawn.properties.title;

        var timeutc = spawn.properties.time;
        var timelocal = moment.utc(timeutc, 'YYYY-MM-DD HH:mm:ss').local();
        var lefttime = timelocal.local().fromNow();

        var provider = spawn.properties.sources;
        var mt = spawn.properties.magType;

        var magnitude = spawn.properties.mag;
        var magnitudetwo = Number(magnitude).toFixed(1);

        var depth = spawn.geometry.coordinates[2];
        var depthtwo = Number(depth).toFixed(0);

        var tsunami = spawn.properties.tsunami;
        var mystatus = getstatus(spawn.properties.status);

        var cp = new L.LatLng(latx, lotx, magnitude);

        var normalnama = 'Unknown';
        if (!isEmpty(whereeq)) {
            normalnama = whereeq;
        }

        heatz.addLatLng(antipode(new L.LatLng(latx, lotx, (magnitude + depth / 100) * 1000)));

        if (tsunami == "1") {
            if (magnitude > 6.7) {
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
            if (magnitude > 7) {
                if (depthtwo < 20) {
                    tsunami = "1";
                }
            }
        }

        var normaltt = '';
        var normalicon = getcolordeep(depthtwo);

        if (tsunami == "1") {
            normalicon = "red";
            normaltt = "<br><br>Issue Tsunami";
        }

        var sharejudul = encodeURI('Earthquake ' + mt + '' + magnitudetwo + ' (' + mystatus + ') ' + normalnama + ' (' + lokasi + ') ' + depth + 'km deep. (' + provider + ') at ' + timelocal.format("YYYY-MM-DD HH:mm:ss") + ' LocalTime via https://volcanoyt.com/maps');

        var str = '';
        var gg = nearvolcano(latx, lotx, 5, 100);
        if (gg.length > 0) {
            str += '<br><br>Volcano Nearby:';
        }
        $.each(gg, function (key, entry) {
            str += '<br><a href="https://volcanoyt.com/volcano/' + entry['id'] + '/' + entry['url'] + '" target="_blank">' + entry['name'] + '</a> (' + entry['jarak'] + 'km)';
        });
        if (gg.length >= 0) {
            str += '<br><br>';
        }

        var title = '<strong>' + normalnama + '</strong><br><b>Location: </b><br>' + lokasi + ' <br><br>' + mt + '' + magnitudetwo + ' | depth ' + depth + 'km <br><br>' + timeutc + ' GMT<br>' + timelocal.format("YYYY-MM-DD HH:mm:ss") + ' LocalTime' + normaltt + '<br><br>Source ' + provider + ' (Status ' + mystatus + ')' + str + 'Share: <a href="https://www.facebook.com/sharer/sharer.php?u=https://volcanoyt.com/maps&quote=' + sharejudul + '" target="_blank">Facebook</a> | <a href="https://twitter.com/intent/tweet/?text=' + sharejudul + '" target="_blank">Twitter</a> | <a href="whatsapp://send?text=' + sharejudul + '" target="_blank">WhatsApp</a>';
        var newico = new L.marker(cp, {
            icon: L.ExtraMarkers.icon({
                icon: "fa-number",
                markerColor: normalicon,
                iconColor: "black",
                number: magnitudetwo,
            })
        }).bindPopup(title);
        GroupBlue.addLayer(newico);

        eqwatch.push({
            marker: newico,
            expire: timeutc,
            id: ecid
        });
    }
}

map.on('overlayadd', function (e) {
    console.log(e);
});

map.on('overlayremove', function (e) {
    console.log(e);
});

function GetApi() {
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
                    for (let b in data.features) {
                        add(data.features[b]);
                    }
                } else {
                    NotifMe("Earthquake: Data not available right now.");
                }
            } else {
                NotifMe(data.meta.status);
            }
        } else {
            NotifMe("Earthquake: Unknown problem");
        }
    }).fail(function (a) {
        NotifMe("Earthquake: Failed to update!");
    });
}

function GetLaut() {
    $.ajax({
        method: "GET",
        dataType: "json",
        cache: true,
        url: URL_API + "spanel/laut.json",
    }).done(function (data) {
        if (data) {
            for (b in data) {
                var newico = new L.marker(new L.LatLng(data[b]['lat'], data[b]['lng'], 0), {
                    icon: L.ExtraMarkers.icon({
                        icon: "fa-water",
                        markerColor: 'blue-dark',
                        shape: 'square',
                        prefix: 'fa'
                    }),
                    datap: data[b]
                }).on('click', function (e) {
                    window.open('http://tides.big.go.id:8888/kacrut/' + this.options.datap['code'] + '/' + this.options.datap['code'] + '.html', '_blank').focus();
                });
                TsunamiStation.addLayer(newico);
            }
        } else {
            NotifMe("TsunamiStation: Unknown problem");
        }
        GetVolcano();
    }).fail(function (a) {
        NotifMe("TsunamiStation: Failed to update!");
    });
}

function GetCamera() {
    $.ajax({
        method: "GET",
        dataType: "json",
        cache: true,
        url: URL_API + "camera/list.json",
    }).done(function (data) {
        console.log(data);
        data = data['results'];
        console.log(data);
        if (data) {
            for (b in data) {
                //console.log(data[b]);
                if (!isEmpty(data[b]['location']['latitude'])) {
                    var newico = new L.marker(new L.LatLng(data[b]['location']['latitude'], data[b]['location']['longitude'], 0), {
                        icon: L.ExtraMarkers.icon({
                            icon: "fa-camera",
                            markerColor: 'blue-dark',
                            shape: 'square',
                            prefix: 'fa'
                        }),
                        datap: data[b]
                    }).on('click', function (e) {
                        window.open('https://volcanoyt.com/camera/' + this.options.datap['id'], '_blank').focus();
                    });
                    CameraList.addLayer(newico);
                }
            }
        } else {
            NotifMe("Camera: Unknown problem");
        }
        GetLaut();
    }).fail(function (a) {
        NotifMe("Camera: Failed to update!");
    });
}

var volcanodata = new Array();

function GetVolcano() {
    $.ajax({
        method: "GET",
        dataType: "json",
        cache: true,
        url: URL_API + "volcano/list.json",
    }).done(function (data) {
        if (data) {
            volcanodata = data.results;
            for (let v of data.results) {
                var iconp = 'blue-dark';
                if (v['eruption'] >= 2018) {
                    iconp = 'red';
                } else {
                    continue;
                }
                var newico = new L.marker(new L.LatLng(v['location']['latitude'], v['location']['longitude'], 0), {
                    icon: L.ExtraMarkers.icon({
                        icon: "far fa-volcano",
                        markerColor: iconp,
                        shape: 'square',
                        prefix: 'fa'
                    }),
                    datap: v
                }).on('click', function (e) {
                    window.open('https://volcanoyt.com/volcano/' + this.options.datap['id'] + '/' + this.options.datap['seo_url'] + '', '_blank').focus()
                });
                GroupVolcano.addLayer(newico);
            }
        } else {
            NotifMe("Volcano: Unknown problem");
        }
        GetApi();
    }).fail(function (a) {
        NotifMe("Volcano: Failed to update!");
    });
}

function nearvolcano(lat, lot, limit = 1, upto = 0) {
    var datasan = [];
    $.each(volcanodata, function (key, entry) {
        datasan.push({
            id: entry['id'],
            url: entry['seo_url'],
            name: entry['name'],
            jarak: calcCrow(lat, lot, entry['location']['latitude'], entry['location']['longitude']).toFixed(0)
        });
    });
    datasan.sort(function (a, b) {
        function getV(o) {
            //console.log(o);
            return o['jarak'];
        }
        return getV(a) - getV(b);
    });
    if (upto > 0) {
        datasan = datasan.filter(function (item) {
            return item.jarak < upto
        });
    }
    return datasan.slice(0, limit);
}

function updateTime() {
    var j;
    var toDelete = [];
    var currentdate = new Date(moment().utc().format('YYYY-MM-DD HH:mm:ss')); //GMT NOW
    for (j in eqwatch) {
        var olddate = new Date(eqwatch[j].expire);
        var hours = Math.floor(Math.abs(currentdate - olddate) / 36e5);
        if (hours > 24) {
            GroupBlue.removeLayer(eqwatch[j].marker);
            toDelete.push(j);
        }
    }
    while (toDelete.length) {
        eqwatch.splice(toDelete.pop(), 1);
    }
}

setInterval(function () {
    if (auto_mode) {
        console.log('cek...');
    } else {
        console.log('no cek pw');
    }
}, 1000);

setInterval(function () {
    GetApi();
    updateTime();
}, 60000);
GetCamera();