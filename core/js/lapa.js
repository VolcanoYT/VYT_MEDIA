var zone = "Atlantic/Canary";
var format = "HH:mm:ss<br>DD/MM/YYYY";
var time_old = moment('19/09/2021 00:00:00', format);
var time;
var show_bar = false;
var idvc = "";
moment.tz.setDefault(zone);

// GUI
setInterval(async () => {
    time = moment();
    document.getElementById("time").innerHTML = time.format(format);
    if (show_bar) {
        document.getElementById("gempa").style.display = "";
        //await Addimg("http://2.0.0.14:84/data?ch=IRIS-SL&apikey=tes123", "seimo");
    } else {
        //document.getElementById("seimo").style.visibility = "hidden";
        document.getElementById("gempa").style.display = "none";
    }
}, 1000 * 1);

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
var close_seimo;

function OnData(x) {

    console.log(x);
    datap = x.data;

    if (x.type == "earthquake") {

        /*
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
        */

        var cont = datap.properties.count;

        var statsid = datap.properties.status;
        var source = datap.properties.sources;
        //var mystatus = EarthquakeStatus(statsid);//sources

        var mag = (datap.properties.mag).toFixed(2);
        var magty = datap.properties.magType;

        var deept = (datap.geometry.coordinates[2]).toFixed(0);

        var lat = datap.geometry.coordinates[1];
        var lot = datap.geometry.coordinates[0];

        var timeutc = datap.properties.time;
        var timelocal = moment.utc(timeutc, 'DD/MM/YYYY HH:mm:ss').local();
        var lefttime = timelocal.local().fromNow();

        var tod = distance(lat, lot, 28.616104107010703, -17.862471556621735).toFixed(0);

        var show_notif = false;
        var start_audio = false;

        // IF NEAR EQ
        if (tod <= 100) {
            start_audio = true;
            show_notif = true;
        }
        // IF EQ M5+
        if (mag >= 5) {
            start_audio = true;
            show_notif = true;
        }

        var icon_mag = '<i class="fal fa-house-damage"></i> ' + mag + ' ' + magty;
        var icon_dee = '<i class="fab fa-audible"></i> ' + deept + ' km';
        var icon_tcp = '<i class="fal fa-clock"></i> <time data-now="' + timeutc + '"></time> (' + source + ')';

        var whereeq = '' + Number(datap.properties.distance).toFixed(2) + ' km of ' + datap.properties.city + ' - ' + datap.properties.country + " (" + tod + " km <i class='fas fa-location-arrow'></i>)";

        if (show_notif) {
            document.getElementById("gempa").innerHTML = "Earthquake " + icon_mag + " " + icon_dee + "<br>" + whereeq + "<br>" + icon_tcp + "";
            show_bar = true;
        }

        if (start_audio) {

            //hack
            mag = mag.replace(".", ",");
            //deept = deept.replace(".", ",");            
            whereeq = datap.properties.country;

            if (statsid == 3) {
                Speak("update quake magnitude" + mag + " already  " + cont + " time updates so far " + whereeq + " with depth " + deept + " km occurs in " + lefttime + "");
            } else {
                if (tod <= 100) {
                    Speak("New quake magnitude" + mag + " has been detected from a distance " + tod + " km from Volcano La Palma with depth " + deept + " km occurs in " + lefttime + "");
                } else {
                    Speak("new quake magnitude " + mag + " causing shaking " + whereeq + " depth " + deept + " km occurs in " + lefttime + "");
                }
            }
        }

        if (!close_seimo) {
            setTimeout(function () {
                show_bar = false;
                close_seimo = null;
            }, 1000 * 60);
        }

    } else if (x.type == "volcano") {

        //var info = datap.info;
        //var sumber = datap.source;
        //var nama_volcano = datap.volcano;
        //var toutc = datap.date_input;

        // info_j = 'Volcano ' + nama_volcano + ' (' + sumber + ')';
        // info_center = info + ' - <time data-now="' + toutc + '"></time>';

        //   spam(' '+info_j+' '+info_center+' ');

    } else if (x.type == "notice") {
        // notif
    } else {
        // not found
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

//API EWS
/*
setInterval(function () {
    try {
        $.getJSON("http://2.0.0.14:84/json?apikey=tes123", function (data) {
        console.log(data);
        document.getElementById("more").innerHTML = "PGA: "+((data.features[0].pga) * 10000).toFixed(3)+" | MMI "+(data.features[0].mmi);
    });
    } catch (error) {
        console.log(error);
    }    
}, 1000 * 2);
*/


setInterval(function () {
    cuaca();
}, 1000 * 60);

function cuaca() {
    $.getJSON("https://api.weatherapi.com/v1/current.json?key=96d4dbaefce14f94a2711612213010&q=28.615374,-17.862592&aqi=yes", function (data) {
        console.log(data);
        var suhu = data.current.temp_c;
        var wind = data.current.wind_mph;
        var dir = data.current.wind_dir;
        var humidity = data.current.humidity;
        var cloud = data.current.cloud;
        var pressure = data.current.pressure_mb;

       // var pm2_5 = parseFloat(data.current.air_quality.pm2_5).toFixed(1);
       // var airQuality = parseFloat(data.current.air_quality.pm10).toFixed(2);

        var timep = data.current.last_updated;
        var timeutc = moment.utc(timep).format('HH:mm'); //moment.parseZone(timep).local(true).format();// moment.utc(timep, 'YYYY-MM-DD HH:mm:ss');

        let airQuality = data.current.air_quality.pm10.toFixed(2);
        let icon = "";
        if (airQuality <= 50) icon = "😁";
        else if (airQuality <= 100) icon = "😊";
        else if (airQuality <= 150) icon = "😐";
        else if (airQuality <= 200) icon = "😷";
        else if (airQuality <= 300) icon = "🤢";
        else icon = "💀";

        //  var lefttime = timelocal.local().fromNow();
        //https://github.com/abhigyantrips/Butternaan-Crisp/blob/5449f501554a362b4fa776c92bbdee532d701bb9/cmds-slash/slash-cmd-weather.py
        //https://github.com/KillahDillah/My-Dashboard/blob/d99cca152ecfc7dd6261e55f06a4664ec79feeb2/src/Temperature.js
        document.getElementById("bar").innerHTML = '[Weather] ' + timeutc + ' <i class="fas fa-temperature-high"></i>' + suhu + '°C <i class="fas fa-windsock"></i> ' + wind + ' MPH (' + dir + ') <i class="fas fa-humidity"></i>' + humidity + '% <i class="fas fa-cloud"></i>' + cloud + '% <i class="fab fa-cloudversify"></i>' + pressure + 'mb '+icon+' ' + airQuality + 'pm';
        try {

        } catch (error) {
            console.log(error);
        }
    });
}
cuaca();

function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

/*
var voices = window.speechSynthesis.getVoices();
speechSynthesis.getVoices().forEach(function (voice,index) {
    var name = voice.name;
    console.log(name);
    idvc = index;
    
    if(name.includes('Zira')){
        idvc = index;
    }
    
});
*/

function Speak(msga) {
    NotifMe("", msga, "", true, 'en');
    console.log(msga);
    /*
    try {
        responsiveVoice.enableEstimationTimeout = false;
        responsiveVoice.speak(msga);
    } catch (error) {
        console.log(error);
    } 
    */
    /*
    var msg = new SpeechSynthesisUtterance();
    msg.lang = "en";
    msg.text = msga;
    if(!isEmpty(idvc)){
        msg.voice = voices[idvc];
    }    
    window.speechSynthesis.speak(msg);
    */
}