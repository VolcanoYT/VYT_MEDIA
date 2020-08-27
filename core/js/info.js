var autohide = getAllUrlParams().autohide;
var audiois = getAllUrlParams().audio;
var close_info;

var useurl = getAllUrlParams().URL;

if(!isEmpty(useurl)){
    console.log('use url: ',useurl);
    URL_APP = useurl;
}

//API Socket
var ewsio = io(URL_APP + 'ews', {
    transports: ['websocket'],
    upgrade: false
});
ewsio.on('disconnect', function () {
    console.log('disconnect');
})
ewsio.on('connect', function () {
    console.log('connect');
})
ewsio.on('error', (error) => {
    console.log(error);
});
ewsio.on('info', function (x) {
    OnData(x);
});

//New Data Info
function OnData(x) {
    console.log(x);

    if (autohide == "true") {
        //console.log('open it');
        document.getElementById("auto").style.visibility = "";
        document.getElementById("log").style.visibility = "";
        clearTimeout(close_info);
    }

    datap = x.data;

    var info_j = (x.type).toUpperCase();
    var info_center = "";

    var info_satu = "";
    var info_dua = "";
    var info_tiga = "";

    var icon = "primary";

    var loc;
    var circle = true;

    var showicon = URL_CDN + 'core/img/magnitude.png';
    var wait_close = 10;

    var list = $('#log');

    if (x.type == "earthquake") {
        loc = L.latLng(datap.eq_lat, datap.eq_lon);
        var whereeq = '' + Number(datap.distance).toFixed(2) + ' miles of ' + datap.city + ' - ' + datap.country;
        var lastinfo = datap.provider + ' / ' + OnGempa(datap.status);
        var toutc = datap.data;
        var mag = (datap.magnitude).toFixed(2);
        var magty = datap.mt;
        var deept = (datap.depth).toFixed(0);
        var loctxt = '' + (datap.eq_lat).toFixed(4) + ',' + (datap.eq_lon).toFixed(4) + '';

        var timelocal = moment.utc(toutc, 'YYYY-MM-DD HH:mm:ss').local();
        var lefttime = timelocal.local().fromNow();

        if (mag >= 3.2 && mag <= 4.8) {
            icon = "warning";
            wait_close = 15;
        } else if (mag >= 4.8 && mag <= 8) {
            icon = "danger";
            wait_close = 60;
        }

        if (audiois == "true") {
            console.log('audio');
            if (mag >= 2.3) {
                NotifMe("", "" + magty + "" + mag + " quake causing shaking near " + whereeq + " with depth " + deept + " km occurs in "+lefttime+"", "", true, 'en', 0.8);
            }
        }

        info_center = whereeq + '<br>' + lastinfo + ' (' + loctxt + ')';
        info_satu = '<i class="fas fa-house-damage"></i> ' + mag + ' ' + magty;
        info_dua = '<i class="fab fa-audible"></i> ' + deept + ' km';
        info_tiga = '<i class="fas fa-clock"></i> <time data-now="' + toutc + '"></time>';

        cek(list, '<li class="list-group-item list-group-item-' + icon + '">' + info_satu + ' ' + info_dua + ' ' + info_tiga + ' - ' + whereeq + ' (' + lastinfo + ')</li>');

    } else {
        wait_close = 10;
        circle = false;

        loc = L.latLng(datap.latitude, datap.longitude);
        showicon = URL_CDN + 'core/img/volcano.png';

        var info = datap.info;
        var sumber = datap.source;
        var nama_volcano = datap.nama;
        var toutc = datap.date_input;
        var evlt = datap.elevation;
        var tyvc = datap.types;

        info_center = nama_volcano + '<br>' + info + ' (' + sumber + ')';
        info_satu = '<i class="fas fa-volcano"></i> ' + OnStatus(datap.status);
        info_dua = '<i class="fab fa-audible"></i> ' + evlt;
        info_tiga = '<i class="fas fa-clock"></i> <time data-now="' + toutc + '"></time>';
    }

    $('#auto').html('<div class="text-white bg-dark"> <h2 class="text-center">' + info_j + '</h2> <h3 class="text-center">' + info_center + '</h3> <div id="ewsmap"></div> <div class="container-fluid"><div class="row text-center" style="font-size: x-large"> <div class="col-sm">' + info_satu + '</div> <div class="col-sm">' + info_dua + '</div> <div class="col-sm">' + info_tiga + '</div> </div> </div> </div>');

    var map = L.map('ewsmap', {
        zoomControl: false,
        attributionControl: false,
        keyboard: false,
        dragging: false,
        boxZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        tap: false,
        touchZoom: false,
    }).setView(loc, 6);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 12,
        minZoom: 3
    }).addTo(map);

    var seticon = L.icon({
        iconUrl: showicon,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [18, 14], // point of the icon which will correspond to marker's location
    });

    L.marker(loc, {
        icon: seticon
    }).addTo(map);
    //.bindPopup(info_center).openPopup();    

    close_info = setTimeout(
        function () {
            if (autohide == "true") {
                //console.log('close it');
                document.getElementById("auto").style.visibility = "hidden";
                document.getElementById("log").style.visibility = "hidden";
            }
        }, 1000 * wait_close);

    //console.log('close in... ' + wait_close);

    if (circle) {
        var counter = 0;
        var i = setInterval(function () {
            circle.setRadius(counter);
            counter = counter + 1000;
            if (counter > 70000) {
                counter = 0;
            }
        }, 30);
        var circle = L.circle(loc, 70000, {
            weight: 3,
            color: '#ff185a',
            opacity: 0.75,
            fillColor: '#ff185a',
            fillOpacity: 0.25
        }).addTo(map);
    }
}

//API Info
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

function cek(list, vv, limit = 5) {
    list.prepend(vv);
    if (list.children().length > limit + 1) {
        list.children().last().remove();
    }
}