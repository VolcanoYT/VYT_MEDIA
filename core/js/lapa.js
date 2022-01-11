var set_id = getAllUrlParams().id;

var set_radio = getAllUrlParams().radio;
var set_volume_radio = getAllUrlParams().radio_vol;
var watchlog = getAllUrlParams().log;

var p_time = getAllUrlParams().p_time;

//var format = ;
var key = "96d4dbaefce14f94a2711612213010";

var lat = "";
var lot = "";
var zone = "";
var name_volcano = "";

var time;
var nodev = true;
var time_reload_wt = 600;
var near_volcano = 100;

var audio;
var real_vol = (parseInt(set_volume_radio) / 100);
var last_vol = real_vol;

if (p_time == "left_top") {
    $('.atas_kanan').css('right', 'auto').css('left', '10px');
}

// API Info
if (!isEmpty(set_id)) {
    console.log("found id: ", set_id);
    get_volcano(set_id);
} else {
    int();
}

function get_volcano(set_id) {
    $.getJSON('https://beta.volcanoyt.com/volcano/view.json?id=' + set_id, function (r) {
        if (r.code == 200) {
            lat = r.data.location.latitude;
            lot = r.data.location.longitude;
            name_volcano = r.data.name;
            $.getJSON('https://api.weatherapi.com/v1/timezone.json?key=' + key + '&q=' + lat + ',' + lot + '', function (z) {
                if (z.location) {
                    zone = z.location.tz_id;
                    moment.tz.setDefault(zone);
                    int();
                } else {
                    Send_Info({
                        info: "Weather API: faild get loca",
                        data: z
                    });
                }
            });
        } else {
            Send_Info({
                info: "faild get info volcano (0)",
                data: r
            });
        }
    });
}

function int() {

    // int all here;
    cuaca();
    get_info_volcano();

    // GUI
    setInterval(async () => {
        time = moment();
        if (p_time == "small") {
            document.getElementById("time_small").innerHTML = time.format("HH:mm:ss DD/MM/YYYY") + " ";
        } else {
            document.getElementById("atas_kanan").innerHTML = time.format("HH:mm:ss<br>DD/MM/YYYY") + "<br>" + name_volcano;
        }
    }, 1000 * 1);

    //API Socket
    var ewsio = io(URL_APP + 'ews');
    ewsio.on('disconnect', function (e) {
        Send_Info({
            info: "EWS DC",
            data: e
        });
    })
    ewsio.on('connect', function (e) {
        Send_Info({
            info: "EWS CNT",
            data: e
        });
    })
    ewsio.on('error', (error) => {
        Send_Info({
            info: "EWS ERROR",
            data: error
        });
    });
    ewsio.on('info', function (x) {
        OnData(x);
    });

    //New Data Info
    var close_notif;

    function OnData(x) {
        datap = x.data;
        if (x.type == "earthquake") {

            console.log(datap);

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

            var lat1 = datap.geometry.coordinates[1];
            var lot1 = datap.geometry.coordinates[0];

            var timeutc = datap.properties.time;
            var timelocal = moment.utc(timeutc, 'YYYY/MM/DD HH:mm:ss').local();
            var lefttime = timelocal.local().fromNow();

            var tod = distance(lat1, lot1, lat, lot).toFixed(0);

            var show_notif = false;
            var start_audio = false;

            // IF NEAR EQ
            if (tod <= near_volcano) {
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

            document.getElementById("eq_small").innerHTML = "Earthquake " + icon_mag + " " + icon_dee + " " + whereeq + " " + icon_tcp + "";

            if (show_notif) {

                // if found close notif stop it aka reset
                if (close_notif) {
                    clearTimeout(close_notif);
                    close_notif = null;
                }

                // if no found close notif make it
                if (!close_notif) {
                    close_notif = setTimeout(function () {

                        close_notif = null;
                        document.getElementById("gempa").innerHTML = "";

                        if (audio) {
                            console.log('done eq now back normal?');
                            audio.volume = real_vol;
                        }

                    }, 1000 * 60);
                }

                // show notif
                document.getElementById("gempa").innerHTML = "Earthquake " + icon_mag + " " + icon_dee + "<br>" + whereeq + "<br>" + icon_tcp + "";
            }

            if (start_audio) {

                if (audio) {
                    console.log('found eq set volume music for little');
                    audio.volume = 0.05;
                }

                //hack
                mag = mag.replace(".", ",");
                //deept = deept.replace(".", ",");            
                whereeq = datap.properties.country;

                if (statsid == 3) {
                    if (tod <= near_volcano) {
                        Speak("update quake volcano " + name_volcano + " with magnitude " + mag + " and depth " + deept + " km already " + cont + " time so far " + lefttime + "");
                    } else {
                        Speak("update quake " + whereeq + " with magnitude " + mag + " and depth " + deept + " km already " + cont + " time so far " + lefttime + "");
                    }
                } else {
                    if (tod <= near_volcano) {
                        Speak("New quake magnitude " + mag + " has been detected from a distance " + tod + " km from volcano " + name_volcano + " with depth " + deept + " km " + lefttime + "");
                    } else {
                        Speak("new quake magnitude " + mag + " causing shaking " + whereeq + " with depth " + deept + " km " + lefttime + "");
                    }
                }
            }

        } else if (x.type == "volcano") {
            data_volcano(datap);
        } else {
            Send_Info({
                info: "INFO IDK",
                data: x
            });
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
        if (nodev) {
            cuaca();
        } else {
            console.log('dev_mode');
        }
    }, 1000 * time_reload_wt);

}

function get_info_volcano() {
    try {
        $.getJSON('https://beta.volcanoyt.com/report/list.json?limit=1&search=' + name_volcano, function (data) {
            for (let b in data['results']) {
                data_volcano(data['results'][b]);
            }
        });
    } catch (error) {
        Send_Info({
            info: "Error Get Info Volcano",
            data: error
        });
    }
}

function data_volcano(data) {

    var namap   = data['identity'];
    var getinfo = data['info'];
    var gettite = data['title'];

    if (!isEmpty(set_id)) {

        // JIKA ADA ID, HANYA ID VOLCANO YANG TAMPIL?        
        if (namap === name_volcano) {


            if (isEmpty(getinfo)) {
                getinfo = gettite;
            }
            document.getElementById("LOC").innerHTML = 'NEWS ' + namap + ': ' + getinfo;

        }

    } else {
        // JIKA TIDAK ADA ID TAMPIL SEMUA
        document.getElementById("LOC").innerHTML = 'NEWS ' + namap + ': ' + getinfo;
    }

}

function cuaca() {
    if (isEmpty(set_id)) {
        return;
    }
    try {
        $.getJSON('https://api.weatherapi.com/v1/current.json?key=' + key + '&q=' + lat + ',' + lot + '&aqi=yes', function (data) {

            /*
            Send_Info({
                info: "Weather API DATA",
                data: data
            });
            */

            var suhu = data.current.temp_c;
            var wind = data.current.wind_mph;
            var dir = data.current.wind_dir;
            var humidity = data.current.humidity;
            var cloud = data.current.cloud;
            var pressure = data.current.pressure_mb;
            var nowp = data.current.condition.text;
            var rain = data.current.precip_mm;

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
            document.getElementById("WTA").innerHTML = 'Weather ' + timeutc + '->' + nowp + '|<i class="fas fa-temperature-high"></i>' + suhu + '°C <i class="fas fa-windsock"></i> ' + wind + ' MPH (' + dir + ') <i class="fas fa-humidity"></i>' + humidity + '% <i class="fas fa-cloud"></i>' + cloud + '% <i class="fab fa-cloudversify"></i>' + pressure + 'mb ' + icon + ' ' + airQuality + 'pm <i class="fas fa-cloud-rain"></i>' + rain + 'mm';


        });
    } catch (error) {
        Send_Info({
            info: "Error get info weather",
            data: error
        });
    }
}

function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function news(name) {
    try {
        $('#news').children().hide();
        $('#' + name).show();
    } catch (error) {
        console.log(error);
    }
};

function loopme() {

    if (isEmpty(set_id)) {
        news("LOC");
    } else {
        news("WTA");
    }

    setTimeout(function () {

        news("LOC");

        setTimeout(function () {

            news("eq_small");

            setTimeout(function () {

                news("music");

                // BACK
                setTimeout(function () {
                    loopme();
                }, 1000 * 30);

            }, 1000 * 60);

        }, 1000 * 60);

    }, 1000 * 60);
};
loopme();

function Speak(msga) {
    NotifMe("", msga, "", true, 'en');
    /*
    Send_Info({
        info: "voice",
        data: msga
    });
    */
}

if (!isEmpty(set_radio)) {

    Send_Info({
        info: "Radio Online",
        data: set_radio
    });

    if (set_radio.includes("stream.laut.fm")) {
        var fmradio = new URL(set_radio).pathname;
        console.log("Found FM RADIO: " + fmradio);
        radio_start(set_radio, set_volume_radio);

        function get_info_next() {
            $.getJSON('https://api.laut.fm/station' + fmradio + '/current_song', function (fmdata) {
                console.log(fmdata);
                document.getElementById("music").innerHTML = 'Radio ' + fmradio + ' currently playing ' + fmdata.title + ' (' + fmdata.artist.name + ')';
            });
        }
        // https://laut.fm/fm-api/station
        setInterval(() => {
            get_info_next();
        }, 1000 * 60);
        get_info_next();
    } else if (set_radio.includes("youtube")) {
        console.log("Found Youtube");
    } else {
        radio_start(set_radio, set_volume_radio);
    }

}

function radio_start(set_radio, set_volume_radio) {
    audio = new Audio();
    audio.src = set_radio;
    audio.controls = true;
    audio.autoplay = true;
    audio.hidden = true;
    if (!isEmpty(set_volume_radio)) {
        Send_Info({
            info: "Audio Radio Set",
            data: set_volume_radio
        });
        audio.volume = real_vol;
    }
    document.body.appendChild(audio);
    audio.addEventListener("loadstart", function (evt) {
        Send_Info({
            info: "loadstart",
            data: evt
        });
        // Our <audio> element will be the audio source.
        //var source = context.createMediaElementSource(audio);
        audio.play();
    });
    audio.addEventListener("play", function (evt) {
        Send_Info({
            info: "play",
            data: evt
        });
    });
    audio.addEventListener("pause", function (evt) {
        Send_Info({
            info: "pause",
            data: evt
        });
    });
    audio.addEventListener("ended", function (evt) {
        Send_Info({
            info: "ended",
            data: evt
        });
        audio_reload();
    });
    audio.addEventListener("error", function (evt) {
        Send_Info({
            info: "error",
            data: evt
        });
        audio_reload();
    });
    audio.addEventListener("abort", function (evt) {
        Send_Info({
            info: "abort",
            data: evt
        });
        audio_reload();
    });
}

var loop_radio = null;

function audio_reload() {
    if (loop_radio == null) {
        loop_radio = setTimeout(function () {
            Send_Info('Audio reload at "ended" mode');
            audio.src = set_radio;
            // Maybe need audio.play; ?
            loop_radio = null;
        }, 3000);
    } else {
        Send_Info('Wait reload...');
    }
}

var last_msg;

function Send_Info(msg = "", gui = false, gui2 = false, type = 0, log = true) {

    // STOP SPAM!
    if (last_msg == msg) {
        return null;
    }
    last_msg = msg;

    // IF BLANK
    if (isEmpty(msg)) {
        // Hide ERROR
        $("#error").html('');
    } else {
        // RAW LOG
        if (log) {
            if (watchlog !== "true") {
                console.log(msg);
            }
        }
        // LOG GUI NOTIF
        if (gui) {
            try {
                $("#error").html(msg);
            } catch (error) {
                //skip
            }
        }
        // LOG CONSOLE GUI
        if (watchlog == "true") {
            try {
                var g = document.getElementById("console_gui_input");
                g.scrollTop = g.scrollHeight;
                //homeTown.scrollIntoView(false);
                //document.getElementById("console_gui_input").value += homeTown;
                if (typeof msg == 'object') {
                    msg += (JSON && JSON.stringify ? JSON.stringify(msg, undefined, 2) : msg) + '<br>';
                }
                $('#console_gui_input').append(msg + '\n');
            } catch (error) {
                //skip
            }
        }
        // TODO: TO SERVER
    }
}

$(document).ready(function () {

    var timeout = null;
    $('#btdebug').hide();
    $(document).on('mousemove', function () {
        $('#btdebug').show();
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(function () {
            $('#btdebug').hide();
        }, 3000);
    });

});