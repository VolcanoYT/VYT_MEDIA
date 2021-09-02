window.CESIUM_BASE_URL = 'https://cdn.volcanoyt.com/core/t/Cesium/';

var keymapbox = "pk.eyJ1IjoidGVtYmxvciIsImEiOiI5MjdjOTMxNTJiZmFlZmU1ZGI0ZjAwNTZlNjEyOWEwNyJ9.a1_DS6D2ipZAP1AS2OyAHQ";

var eqwatch = [];

var indo = Cesium.Rectangle.fromDegrees(90.7322, -13.0693, 147.8029, 14.3197);

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzlhNGNlYy0zMjM1LTRmNGMtYmNjNy0yMzA1ZjA1ZDc4Y2UiLCJpZCI6MTk2NDEsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzU5NTA2MDZ9.uhcwif9N5JHaQmLl22pzkf1bh8EhsngQTXLFnY4CKz4';
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = indo;
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

var loaded = false;
var autororate = false;

var toolbar = document.getElementById('toolbar');

var viewer = new Cesium.Viewer('map_3d', {
    animation: false,
    baseLayerPicker: false,
    navigationHelpButton: true,
    sceneModePicker: true,
    homeButton: true,
    geocoder: true,
    fullscreenButton: true,
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        //tileWidth: 512,
        //tileHeight: 512,
        credit: new Cesium.Credit('VolcanoYT with Google Map', true)
    }),
    timeline: false
});

/*
Sandcastle.addToggleButton("HDR", true, function (checked) {
    //viewer.scene.highDynamicRange = checked;
    console.log(checked);
});
*/

var timku = viewer.entities;
//Create Entity "folders" to allow us to turn on/off entities as a group.
var vcc = timku.add(new Cesium.Entity());
var eqq = timku.add(new Cesium.Entity());
var see = timku.add(new Cesium.Entity());

function Wecan(is = 'eq') {
    try {
        if (is == 'eq') {
            eqq.show = !eqq.show;
        } else if (is == 'vc') {
            vcc.show = !vcc.show;
        }
    } catch (error) {

    }
}

/*
var scratchRectangle = new Cesium.Rectangle();
viewer.clock.onTick.addEventListener(function () {
    try {
        var rect = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid, scratchRectangle);
        toolbar.innerHTML = '<pre>' +
            'West: ' + Cesium.Math.toDegrees(rect.west).toFixed(4) + '<br/>' +
            'South: ' + Cesium.Math.toDegrees(rect.south).toFixed(4) + '<br/>' +
            'East: ' + Cesium.Math.toDegrees(rect.east).toFixed(4) + '<br/>' +
            'North: ' + Cesium.Math.toDegrees(rect.north).toFixed(4) + '</pre>';
    } catch (error) {
        toolbar.innerHTML = '';
    }
});
*/
var imageryLayers = viewer.imageryLayers;
var viewModel = {
    layers: [],
    baseLayers: [],
    upLayer: null,
    downLayer: null,
    selectedLayer: null,
    isSelectableLayer: function (layer) {
        return this.baseLayers.indexOf(layer) >= 0;
    },
    raise: function (layer, index) {
        imageryLayers.raise(layer);
        viewModel.upLayer = layer;
        viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
        updateLayerList();
        window.setTimeout(function () {
            viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
    },
    lower: function (layer, index) {
        imageryLayers.lower(layer);
        viewModel.upLayer = viewModel.layers[Math.min(viewModel.layers.length - 1, index + 1)];
        viewModel.downLayer = layer;
        updateLayerList();
        window.setTimeout(function () {
            viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
    },
    canRaise: function (layerIndex) {
        return layerIndex > 0;
    },
    canLower: function (layerIndex) {
        return layerIndex >= 0 && layerIndex < imageryLayers.length - 1;
    }
};
var baseLayers = viewModel.baseLayers;
Cesium.knockout.track(viewModel);

function setupLayers() {
    addBaseLayerOption(
        'Google',
        undefined);
    addBaseLayerOption(
        'OpenStreetMap',
        new Cesium.UrlTemplateImageryProvider({
            url: 'https://a.tile.openstreetmap.de/{z}/{x}/{y}.png',
            credit: new Cesium.Credit('VolcanoYT with OpenStreetMap', true)
        }));
    addBaseLayerOption(
        'WikiMedia',
        new Cesium.UrlTemplateImageryProvider({
            url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
            credit: new Cesium.Credit('VolcanoYT with WikiMedia', true)
        }));
    addBaseLayerOption(
        'ArcgisOnline',
        new Cesium.UrlTemplateImageryProvider({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            credit: new Cesium.Credit('VolcanoYT with ArcgisOnline', true)
        }));
    addBaseLayerOption(
        'Opentopomap',
        new Cesium.UrlTemplateImageryProvider({
            url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
            credit: new Cesium.Credit('VolcanoYT with Opentopomap', true)
        }));

    // Create the additional layers
    addAdditionalLayerOption(
        'Plate Tectonics',
        new Cesium.UrlTemplateImageryProvider({
            url: 'https://earthquake.usgs.gov/basemap/tiles/plates/{z}/{x}/{y}.png'
        }), 1);
    addAdditionalLayerOption(
        'City name',
        new Cesium.UrlTemplateImageryProvider({
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
        }), 1);
    addAdditionalLayerOption(
        'Kawasan Rawan Bencana', new Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services7.arcgis.com/g7FCBALNv7UNIenl/arcgis/rest/services/KRB_GA_ID2/FeatureServer/0'
        }), 1, false);
    addAdditionalLayerOption(
        'High Risk', new Cesium.UrlTemplateImageryProvider({
            url: "https://a.tiles.mapbox.com/v4/temblor.d2byhogx/{z}/{x}/{y}.jpg?access_token=" + keymapbox
        }), 1, false);
}

function addBaseLayerOption(name, imageryProvider) {
    var layer;
    if (typeof imageryProvider === 'undefined') {
        layer = imageryLayers.get(0);
        viewModel.selectedLayer = layer;
    } else {
        layer = new Cesium.ImageryLayer(imageryProvider);
    }

    layer.name = name;
    baseLayers.push(layer);
}

function addAdditionalLayerOption(name, imageryProvider, alpha, show) {
    var layer = imageryLayers.addImageryProvider(imageryProvider);
    layer.alpha = Cesium.defaultValue(alpha, 0.5);
    layer.show = Cesium.defaultValue(show, true);
    layer.name = name;
    Cesium.knockout.track(layer, ['alpha', 'show', 'name']);
}

function updateLayerList() {
    var numLayers = imageryLayers.length;
    viewModel.layers.splice(0, viewModel.layers.length);
    for (var i = numLayers - 1; i >= 0; --i) {
        viewModel.layers.push(imageryLayers.get(i));
    }
}
Cesium.knockout.applyBindings(viewModel, toolbar);
Cesium.knockout.getObservable(viewModel, 'selectedLayer').subscribe(function (baseLayer) {

    // Handle changes to the drop-down base layer selector.
    try {
        var activeLayerIndex = 0;
        var numLayers = viewModel.layers.length;
        for (var i = 0; i < numLayers; ++i) {
            if (viewModel.isSelectableLayer(viewModel.layers[i])) {
                activeLayerIndex = i;
                break;
            }
        }
        var activeLayer = viewModel.layers[activeLayerIndex];
        var show = activeLayer.show;
        var alpha = activeLayer.alpha;
        imageryLayers.remove(activeLayer, false);
        imageryLayers.add(baseLayer, numLayers - activeLayerIndex - 1);
        baseLayer.show = show;
        baseLayer.alpha = alpha;
        updateLayerList();
    } catch (error) {
        console.log(error);
    }
});

function checkLoad() {
    setupLayers();
    updateLayerList();

    document.getElementById("loadingOverlay").style.display = "none";
    document.getElementById("map_3d").style.display = "block";

    console.log('loading done...');
    loaded = true;
}

var lastNow = Date.now();
viewer.clock.onTick.addEventListener(function (clock) {
    try {
        if (loaded) {
            if (autororate) {
                var now = Date.now();
                var spinRate = 0.08;
                var delta = (now - lastNow) / 1000;
                lastNow = now;
                viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
            }
        }
    } catch (error) {

    }
});

function pineq(spawn) {
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
        var timelocal = moment.utc(timeutc, 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss');

        var provider = spawn.properties.sources;
        var mt = spawn.properties.magType;
        var magnitude = spawn.properties.mag;
        var magnitudetwo = Number(magnitude).toFixed(0);
        var depth = spawn.geometry.coordinates[2];
        var depthtwo = Number(depth).toFixed(0);
        var tsunami = spawn.properties.tsunami;
        var mystatus = getstatus(spawn.properties.status);

        var title = 'Location: </b><br>' + lokasi + ' <br><br>' + mt + '' + magnitude + ' | depth ' + depth + 'km <br><br>' + timeutc + ' GMT<br>' + timelocal + ' LocalTime<br><br>Source ' + provider + ' (Status ' + mystatus + ')';
        var coba = 1000 * depthtwo;
        var showme = timku.add({
            parent: eqq,
            id: 'eq-' + ecid,
            position: Cesium.Cartesian3.fromDegrees(lotx, latx, coba + (3000)),
            name: whereeq,
            description: title,
            billboard: {
                image: drawImage(magnitudetwo, getcolordeep(depthtwo))
            },
            ellipse: {
                semiMinorAxis: 100,
                semiMajorAxis: 100,
                extrudedHeight: coba,
                rotation: Cesium.Math.toRadians(45),
                material: Cesium.Color.BLUE.withAlpha(0.2),
                outline: true
            }
        });

        eqwatch.push({
            marker: showme,
            id: ecid
        });
    }
}

function drawImage(id = '6', key = 'red') {
    var c = document.createElement("canvas");
    c.width = 35;
    c.height = 35;
    var ctx = c.getContext('2d');
    ctx.font = "22px Arial";
    ctx.fillStyle = key;
    ctx.fillText(id, 12, 26);
    ctx.beginPath();
    ctx.arc(18, 18, 15, 0, 2 * Math.PI);
    ctx.stroke();
    return c;
}

function getstatus(data) {
    if (data == "0") {
        return "Automatic";
    } else if (data == "1") {
        return "Preliminary";
    } else if (data == "2") {
        return "Confirmed";
    } else if (data == "3") {
        return "Update";
    } else {
        return "Unknown";
    }
}

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
                        pineq(data.features[b]);
                    }

                    if (!loaded) {
                        checkLoad();
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

setInterval(function () {
    GetApi();
}, 60000);
GetApi();