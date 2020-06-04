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

var event_tab = $('#event').DataTable();

var debug = new EWS();
debug.listen("error", function (data, type, context) {
    if (context.type == "compatible") {
        //GUI
        try {
            $('#gui_sensor').hide();
            $('#gui_sensor_event').hide();
            NotifMe("Sorry, Sensor Acceleration is not supported with your browser or smartphone :(");
        } catch (error) {

        }
    }
    console.log(type);
    console.log(data);
    console.log(context);
});
debug.listen("info", function (type, data, context) {
    //console.log(type);
    //console.log(data);
    console.log(context);

    if (context.type == "earthquake") {
        //GUI
        try {
            $('#intensity').html(context.data.intensity);
            $('#timep').html(context.data.time);
            $('#magnitude').html(context.data.magnitude);
            $('#gal').html(context.data.gal);
        } catch (error) {

        }
        if (context.data.type == 0) {
            console.log('gempa baru');
            try {
                event_tab.row.add([
                    moment.unix(context.data.input).utc().format('YYYY-MM-DD HH:mm:ss'),
                    "wait...",
                    context.data.magnitude,
                    context.data.gal,
                    context.data.intensity,
                    context.data.time
                ]).node().id = context.data.input;
                event_tab.draw(false);
            } catch (error) {
                console.log('error add tab', error);
            }
        } else {
            console.log('gempa berlanjutan');
            try {
                /*
                var id = t.row('[id=' + symbol + ']').index();
                t.cell({
                    row: id,
                    column: 2
                }).data(response.c).draw(false);
                */
                //TODO: update rata-rata disini
                event_tab.row('#' + context.data.input).data([
                    moment.unix(context.data.input).utc().format('YYYY-MM-DD HH:mm:ss'),
                    moment.unix(context.data.update).utc().format('YYYY-MM-DD HH:mm:ss'),
                    context.data.magnitude,
                    context.data.gal,
                    context.data.intensity,
                    context.data.time
                ]).draw();
                //console.log('tess', event_tab.row('#' + event[j].input));
            } catch (error) {

            }
        }
    }

});
debug.listen("raw", function (watch, type, context) {
    //GUI Seismograph

    var d = new Date();
    //jika ada div ztime
    var xc = document.getElementById("ztime");
    if (xc !== null) {
        var h = addZero(d.getUTCHours(), 2);
        var m = addZero(d.getUTCMinutes(), 2);
        var s = addZero(d.getUTCSeconds(), 2);
        var ms = addZero(d.getUTCMilliseconds(), 3);
        xc.innerHTML = h + ":" + m + ":" + s + ":" + ms;
    }

    var x = context.dm.x;
    var y = context.dm.y;
    $('#x').html(x);
    $('#y').html(y);
    $('#z').html(context.dm.z);

    if (document.getElementById("local") !== null) {
        addstream('local', [x, y, context.dm.z]);
    }

    if (watch.earthquake) {
        $('#nogempa').hide();
        $('#adagempa').show();

        /*
        Moment Tensor (https://gfzpublic.gfz-potsdam.de/rest/items/item_272892/component/file_541895/content)
        Mekanisme fokus gempa menggambarkan deformasi di wilayah sumber yang menghasilkan gelombang seismik.
        https://stackoverflow.com/a/48750814
        */
        var ball = document.querySelector('.ball');
        if (ball !== null) {
            var garden = document.querySelector('.garden');
            if (garden !== null) {
                var maxX = garden.clientWidth - ball.clientWidth;
                var maxY = garden.clientHeight - ball.clientHeight;
                if (x > 90) {
                    x = 90
                };
                if (x < -90) {
                    x = -90
                };
                x += 90;
                y += 90;
                ball.style.top = (maxY * y / 180 - 10) + "px";
                ball.style.left = (maxX * x / 180 - 10) + "px";
            }
        }

    } else {
        $('#nogempa').show();
        $('#adagempa').hide();
    }

});
debug.start();

function addZero(x, n) {
    while (x.toString().length < n) {
        x = "0" + x;
    }
    return x;
}

//API Socket
ewsio = io(URL_APP + 'ews', {
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
            var whereeq = '' + Number(datap.distance).toFixed(2) + ' miles of ' + datap.city + ' - ' + datap.country + '';
            var toutc = datap.data;
            var loctxt = '' + (datap.eq_lat).toFixed(4) + ',' + (datap.eq_lon).toFixed(4) + '';
            $('#timeutc').html('<time data-now="' + toutc + '">' + toutc + '</time>');
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
            //var sumber = datap.source;

            $('#vcjudul').html(datap.nama);
            $('#fullvc').html(datap.info);
            $('#timevc').html('<time data-now="' + datap.date_input + '">' + datap.date_input + '</time>');
            $('#lvvc').html(OnStatus(datap.status));
            $('#elevation').html(datap.elevation);
            $('#typesvc').html(datap.types);
            OnMap(loc, info, 'tmpvc', "vcmap");
        }
    }
}

//Set Map
function OnMap(latp, judul, idtmp = "ewsmap", idreal = "putmap", iscircle = true) {
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
    var showicon = URL_CDN + 'core/img/magnitude.png';
    if (idreal == "vcmap") {
        showicon = URL_CDN + 'core/img/volcano.png';
    }
    var eqicon = L.icon({
        iconUrl: showicon,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [18, 14], // point of the icon which will correspond to marker's location
    });
    L.marker(latp, {
        icon: eqicon
    }).addTo(map).bindPopup(judul).openPopup();
    if (iscircle) {
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

$.getJSON(URL_APP + 'warning', function (data) {
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

let dataArray = new Float32Array(1000).map(function(d, i) {
    return Math.sin(2*Math.PI*i/100) * 100;
  });
  let sampleRate = 20;
  let start = seisplotjs.moment.utc('2019-07-04T05:46:23Z');
  let seismogram = seisplotjs.seismogram.Seismogram.createFromContiguousData(dataArray, sampleRate, start);
  
  let div = seisplotjs.d3.select('div#sinewave');
  let seisConfig = new seisplotjs.seismographconfig.SeismographConfig();
  seisConfig.title = "A sine wave!";
  seisConfig.margin.top = 25;
  let seisData = seisplotjs.seismogram.SeismogramDisplayData.fromSeismogram(seismogram);
  let graph = new seisplotjs.seismograph.Seismograph(div, seisConfig, seisData);
  graph.draw();