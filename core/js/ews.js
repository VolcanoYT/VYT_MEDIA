var ewsio;
var gps = {
    isfake: true,
    lat: "",
    lot: ""
};

//Get GPS
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition, showError);
} else {
    NotifMe("Geolocation is not supported by your browser.");
}
function showPosition(position) {
    SetGPS(position.coords.latitude, position.coords.longitude);
}
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            NotifMe("Geolocation: your denied request!!!")
            break;
        case error.POSITION_UNAVAILABLE:
            NotifMe("Geolocation: Location information is unavailable.")
            break;
        case error.TIMEOUT:
            NotifMe("Geolocation: Request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            NotifMe("Geolocation: An unknown error occurred.")
            break;
    }
}

//API Sensor
var isno = true;
var args = {
    frequency: 100, // ( How often the object sends the values - milliseconds )
    gravityNormalized: true, // ( If the gravity related values to be normalized )
    orientationBase: GyroNorm.WORLD, // ( Can be GyroNorm.GAME or GyroNorm.WORLD. gn.GAME returns orientation values with respect to the head direction of the device. gn.WORLD returns the orientation values with respect to the actual north direction of the world. )
    decimalCount: 2, // ( How many digits after the decimal point will there be in the return values )
    logger: null, // ( Function to be called to log messages from gyronorm.js )
    screenAdjusted: true // ( If set to true it will return screen adjusted values. )
};
var gn = new GyroNorm();
gn.init(args).then(function () {
    gn.start(function (data) {
        var isAvailable = gn.isAvailable();
        try {

            //send to server
            if (isAvailable.accelerationAvailable) {
                var send = {
                    gps: gps,
                    acceleration: data,
                    isAvailable: isAvailable
                };
                ewsio.emit('user_ews', send);        
            }

            //local view data
            if (document.getElementById("local") !== null) {
                if (isAvailable.accelerationAvailable) {
                    addstream('local', [data.dm.x, data.dm.y, data.dm.z]);
                    isno = true;
                } else {
                    //addstream('local',[Math.floor(Math.random() * 30),Math.floor(Math.random() * 50),Math.floor(Math.random() * 200)]);
                    if (isno) {
                        var c = document.getElementById("local");
                        var ctx = c.getContext("2d");
                        ctx.font = "15px Arial";
                        ctx.fillText("Sensor on this system is not available", 10, 30);
                        isno = false;
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    });
}).catch(function (e) {
    console.log(e);
});

//API Socket
ewsio = io('https://tapp.volcanoyt.com/ews', {
    transports: ['websocket'],
    upgrade: false
}); 
ewsio.on('disconnect', function () {
    if (document.getElementById("putmap") !== null) {
        $('#isonline').html("Offline");
    }
    NotifMe("Disconnect to network!");
    socketrun = false;
})
ewsio.on('connect', function () {
    if (document.getElementById("putmap") !== null) {
        $('#isonline').html("Online");
    }
    NotifMe("Connect to network!");
    socketrun = true;
})
ewsio.on('error', (error) => {
    NotifMe(error);
});
ewsio.on('info', function (x) {
    OnData(x);
});

//New Data Info
function OnData(x) {
    console.log(x);
    datap = x.data;
    
    if (document.getElementById("map") !== null) {
        if (x.type == "earthquake") {
            var loc = L.latLng(datap.eq_lat, datap.eq_lon);
            map.setView(loc, 8);
            circle.setLatLng(loc);
        }
    } else if (document.getElementById("putmap") !== null) {
        if (x.type == "earthquake") {
            var loc = L.latLng(datap.eq_lat, datap.eq_lon);
            var whereeq = ''+Number(datap.distance).toFixed(2)+' miles of '+datap.city+' - '+datap.country+'';
            var toutc = datap.data;
            var loctxt = '' + (datap.eq_lat).toFixed(4) + ',' + (datap.eq_lon).toFixed(4) + '';
            $('#timeutc').html(toutc);
            $('#mag').html((datap.magnitude).toFixed(2));
            $('#tymag').html(datap.mt);
            $('#deep').html((datap.depth).toFixed(0));
            $('#loc').html(loctxt);
            var fulltext = 'Earthquake Info ' + datap.mt + ':' + datap.magnitude + ', ' + toutc + ', Lok: ' + loctxt + ' (' + whereeq + '), depth: ' + datap.depth + 'Km #' + datap.provider + '';
            $('#infolengkap').html(fulltext);
            OnMap(loc, whereeq);
        } else {
            var loc = L.latLng(datap.latitude, datap.longitude);
            var info = datap.info;
            var sumber = datap.source;
            if (sumber == "Mirova") {
                info = "Hotspot detected " + datap.title + "mw near volcano";
            }
            $('#vcjudul').html(datap.nama);
            $('#fullvc').html(datap.info);
            $('#timevc').html(datap.date_input);
            $('#lvvc').html(OnStatus(datap.status));
            $('#elevation').html(datap.elevation);
            $('#typesvc').html(datap.types);
            OnMap(loc, info, 'tmpvc', "vcmap");
        }
    }
}

//Set Map
function OnMap(latp, judul, idtmp = "ewsmap", idreal = "putmap") {
    $('#' + idreal + '').html('<div id="' + idtmp + '"></div>');
    var map = L.map(idtmp, {
        zoomControl: false,
        attributionControl: false,
        keyboard: false,
        dragging: false,
        boxZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        tap: false,
        touchZoom: false,
    }).setView(latp, 6);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 12,
        minZoom: 3
    }).addTo(map);
    var eqicon = L.icon({
        iconUrl: '/core/img/magnitude.png',
        iconSize:     [32, 32], // size of the icon
    iconAnchor:   [18, 14], // point of the icon which will correspond to marker's location
    });
    L.marker(latp, {icon: eqicon}).addTo(map).bindPopup(judul).openPopup();
    var counter = 0;
    var i = setInterval(function () {
        circle.setRadius(counter);
        counter = counter + 1000;
        if (counter > 70000) {
            counter = 0;
        }
    }, 30);
    var circle = L.circle(latp, 70000, {
        weight: 3,
        color: '#ff185a',
        opacity: 0.75,
        fillColor: '#ff185a',
        fillOpacity: 0.25
    }).addTo(map);
}

//Volcano Status
function OnStatus(level) {
    if (level == 1) {
        return "Normal";
    } else if (level == 2) {
        return "Unrest";
    } else if (level == 3) {
        return "Minor";
    } else if (level == 4) {
        return "Eruption";
    } else if (level == 5) {
        return "Danger";
    } else {
        return "Unknown";
    }
}

//Set GPS
function SetGPS(Latitude, Longitude, isfake = false) {
    try {
        gps.lat = Latitude;
        gps.lot = Longitude;
        gps.isfake = isfake;
    } catch (error) {
        console.log(error);
    }
}

$.getJSON('https://tapp.volcanoyt.com/warning', function (data) {
    try {
        for (let b in data) {
            OnData({
                "type": b,
                "data": data[b]
            });
        }
    } catch (error) {
        console.log(error);
    }
});
$.getJSON('https://json.geoiplookup.io', function (data) {
    try {
        SetGPS(data.latitude, data.longitude, true);
    } catch (error) {
        console.log(error);
    }
});