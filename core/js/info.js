var close_map;
var close_msg;
var close_list;

var autohide = getAllUrlParams().autohide;
var audiois  = getAllUrlParams().audio;
var get_last = getAllUrlParams().last;
var useurl   = getAllUrlParams().URL;

if (!isEmpty(useurl)) {
    console.log('use url: ', useurl);
    URL_APP = useurl;
}

//API Socket
var ewsio = io(URL_APP + 'ews',{
    transports: ['websocket']
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
    var wait_close = 3;

    var ismap = false;
    var ismsg = false;
    var litemap = false;

    if (x.type == "earthquake") {        
        ismap = true;

        //info map
        loc = L.latLng(datap.eq_lat, datap.eq_lon);

        //info lain
        var whereeq = '' + Number(datap.distance).toFixed(2) + ' km of ' + datap.city + ' - ' + datap.country;
        var lastinfo = datap.provider + ' / ' + OnGempa(datap.status);
        var toutc = datap.data;
        var mag = (datap.magnitude).toFixed(2);
        var magty = datap.mt;
        var deept = (datap.depth).toFixed(0);
        var loctxt = '' + (datap.eq_lat).toFixed(4) + ',' + (datap.eq_lon).toFixed(4) + '';
        var timelocal = moment.utc(toutc, 'YYYY-MM-DD HH:mm:ss').local();
        var lefttime = timelocal.local().fromNow();

        var allowaudio = true;

        //level warning
        if (mag >= 3.2 && mag <= 5) {
            icon = "warning";
            wait_close = 7;
        } else if (mag >= 5 && mag <= 9) {
            icon = "danger";
            wait_close = 20;
        }else{
            allowaudio = false;
        }

        //audio
        if(allowaudio){
            if (audiois == "true") {
                NotifMe("", "" + magty + "" + mag + " quake causing shaking near " + whereeq + " with depth " + deept + " km occurs in " + lefttime + "", "", true, 'en', 0.8);
            }
        }
        
        //info
        info_center = whereeq + '<br>' + lastinfo + ' (' + loctxt + ')';
        info_satu = '<i class="fal fa-house-damage"></i> ' + mag + ' ' + magty;
        info_dua = '<i class="fab fa-audible"></i> ' + deept + ' km';
        info_tiga = '<i class="fal fa-clock"></i> <time data-now="' + toutc + '"></time>';
        //cek($('#log'), '<li class="list-group-item list-group-item-' + icon + '">' + info_satu + ' ' + info_dua + ' ' + info_tiga + ' - ' + whereeq + ' (' + lastinfo + ')</li>');
        info_j = 'Earthquake (' + info_satu + ' ' + info_dua + ' ' + info_tiga+')';
    } else if (x.type == "volcano") {
return
        litemap = true;
        wait_close = 5;

        var info = datap.info;
        var sumber = datap.source;
        var nama_volcano = datap.volcano;
        var toutc = datap.date_input;

        info_j = 'Volcano ' + nama_volcano + ' (' + sumber + ')';
        info_center = info + ' - <time data-now="' + toutc + '"></time>';

        if (audiois == "true") {
            var timelocal = moment.utc(toutc, 'YYYY-MM-DD HH:mm:ss').local();
            var lefttime = timelocal.local().fromNow();
            NotifMe("", "Info Volcano "+nama_volcano+" by "+sumber+" "+info+" "+lefttime, "", true, 'en', 0.8);
        }

    } else if (x.type == "notice") {
        ismsg = true;
        info_satu = 'Message from ' + datap.user;
        info_dua = datap.message;
        if (datap.mic) {
            info_satu = 'Message (Audio) from ' + datap.user;
            NotifMe("", datap.message, "", true, 'en', 0.8);
        }        
    } else {
        console.log('belum ada: ' + x.type);
    }
    if (litemap) {
        $('#map').html('<div class="boxf text-white bg-dark animate__animated animate__fadeInRight"> <h2 class="text-center">' + info_j + '</h2> <h3 class="text-center">' + info_center + '</h3>');
    }
    if (ismap) {
        $('#map').html('<div class="boxf bg-primary animate__animated animate__fadeInRight"> <h2 class="text-center">' + info_j + '</h2> <h3 class="text-center">' + info_center + '</h3> <div id="ewsmap"></div>');
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
            iconSize: [32, 32],
            iconAnchor: [18, 14],
        });

        L.marker(loc, {
            icon: seticon
        }).addTo(map);

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

        close_map = setTimeout(
            function () {
                if (autohide == "true") {
                    $('#map').html('');
                }
            }, 1000 * wait_close);
    }

    if (ismsg) {
        $('#msg').html('<div class="alert alert-success ping" role="alert"><h4 class="alert-heading">' + info_satu + '</h4><p>' + info_dua + '</p></div>');
        close_msg = setTimeout(
            function () {
                if (autohide == "true") {
                    $('#msg').html('');
                }
            }, 1000 * 10);
    }
}

//API Info
if(get_last == "true"){
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
}

function cek(list, vv, limit = 10) {

    if (autohide == "true") {
        document.getElementById("log").style.visibility = "";
        clearTimeout(close_list);
    }

    list.prepend(vv);
    if (list.children().length >= limit + 1) {
        list.children().last().remove();
    }

    close_list = setTimeout(
        function () {
            if (autohide == "true") {
                document.getElementById("log").style.visibility = "hidden";
            }
        }, 1000 * 15);
}