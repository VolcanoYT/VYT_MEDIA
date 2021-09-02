var close_map;
var close_msg;
var close_list;

var autohide = getAllUrlParams().autohide;
var audiois = getAllUrlParams().audio;
var get_last = getAllUrlParams().last;
var useurl = getAllUrlParams().URL;
var filiter = getAllUrlParams().source;
var lang = getAllUrlParams().lang;
if (!isEmpty(useurl)) {
    console.log('use url: ', useurl);
    URL_APP = useurl;
}

//API Socket
var ewsio = io(URL_APP + 'ews');
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

    if (x.type == "earthquake") {       

        // fiter source
        var sumber = datap.properties.sources;
        if (!isEmpty(filiter)) {
            var wa = (filiter.split(","));
            //console.log(wa);
            if (!wa.includes(sumber)) {
                //console.log('filiter');
                return;
            }
        }

        var countup = datap.properties.count;
        var toutc   = datap.properties.time;
        var intsts  = datap.properties.status;
        var mag     = (datap.properties.mag).toFixed(2);
        var magty   = datap.properties.magType;
        var deept   = (datap.geometry.coordinates[2]).toFixed(0);

        var whereeq = '' + Number(datap.properties.distance).toFixed(2) + ' km of ' + datap.properties.city + ' - ' + datap.properties.country;

        var icon_mag = '<i class="fal fa-house-damage"></i> ' + mag + ' ' + magty;
        var icon_dee = '<i class="fab fa-audible"></i> ' + deept + ' km';
        var icon_tcp = '<i class="fal fa-clock"></i> <time data-now="' + toutc + '"></time>';

        spam('Earthquake '+whereeq+' ('+icon_mag+' '+icon_dee+' '+icon_tcp+')');

    } else if (x.type == "volcano") {

        var info         = datap.info;
        var sumber       = datap.source;
        var nama_volcano = datap.volcano;
        var toutc        = datap.date_input;

        info_j = 'Volcano ' + nama_volcano + ' (' + sumber + ')';
        info_center = info + ' - <time data-now="' + toutc + '"></time>';

        spam(' '+info_j+' '+info_center+' ');

    } else if (x.type == "notice") {
        // notif
    } else {
        // not found
    }
}

//API Info
if (get_last == "true") {
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

function spam(vv="tes", limit = 7) {

    console.log(vv);

    var list = $('.ticker');
    $('.ticker-wrap').show();
    list.prepend('<div class="ticker__item">'+vv+'</div>');
    if (list.children().length >= limit + 1) {
        list.children().last().remove();
    }
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
/*
var last_welcome;
function Welcome() {
    var h = (new Date()).getHours();
    var news = "2";
    if (h >= 4 && h < 10) {
        news = "Selamat Pagi";
    } else if (h >= 10 && h < 15) {
        news = "Selamat Siang";
    } else if (h >= 15 && h < 18) {
        news = "Selamat Sore";
    } else if (h >= 18 || h < 4) {
        news = "Selamat Malam";
    };
    if (news !== last_welcome) {
        news = last_welcome;
        console.log(news);
    }
}
window.setInterval(Welcome, 5000);
*/