var zone = "Atlantic/Canary";
var format = "DD/MM/YYYY <br> HH:mm:ss";
var time_old = moment('19/09/2021 00:00:00', format);
var time;
var show_bar = false;
var idvc = "";
moment.tz.setDefault(zone);

// GUI
setInterval(async () => {
    time = moment();
    document.getElementById("time").innerHTML = "Live: " + time.format(format) + " (" + time_old.fromNow() + " <i class='fas fa-volcano'></i>)"; //idvc
    if (show_bar) {
        //document.getElementById("seimo").style.visibility = "";
        document.getElementById("more").style.display = "";
        //await Addimg("http://2.0.0.14:84/data?ch=IRIS-SL&apikey=tes123", "seimo");
    } else {
        //document.getElementById("seimo").style.visibility = "hidden";
        document.getElementById("more").style.display = "none";
    }
}, 1000 * 1);

// INFO LOOP
async function updatecek() {

    if (time) {

        var hour = time.format('HH');
        var hour1 = time.subtract(1, "hours").format('HH');
        var month = time.format('MM');
        var date = time.format('DD');

        var url = [
            /*
            {
        url: 'http://2.0.0.14:84/data?ch=IRIS-SL&apikey=tes123',
        name: 'STA TES',
    },
    
    {
        url: 'https://video.twimg.com/ext_tw_video/1445056680300064773/pu/vid/640x360/qZzhmy9VZPs5-VRZ.mp4?tag=12',
        name: 'Drone Video 1 (03/10/21)',
        format: 1
    }, 
    {
        url: 'https://video.twimg.com/ext_tw_video/1445367018258042883/pu/vid/1280x720/1czvQwuclhD3p3e3.mp4?tag=12',
        name: 'Drone Video 2 (03/10/21)',
        format: 1
    },  
    {
        url: 'https://video.twimg.com/amplify_video/1444807060013658112/vid/1280x720/uclHOYcF4r2k--7P.mp4?tag=14',
        name: 'Drone Video 3 (03/10/21)',
        format: 1
    }, 
    */
   /*
            {
                url: 'https://video.twimg.com/tweet_video/FBzlpdZWYAU5MaN.mp4',
                name: 'Map',
                format: 1
            },
            */
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/DIA/PA01_2021-' + month + '-' + date + '_F1.jpg',
                name: 'STA TBT (La Palma) (24 hour)',
            },
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/HORA/PA01_2021-' + month + '-' + date + '_' + hour1 + '-' + hour + '_F1.jpg',
                name: 'STA TBT (1 hour)',
            },
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/DIA_SP/PA01_2021-' + month + '-' + date + '_sp_F1.jpg',
                name: 'STA TBT (24 hour)'
            },
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/HORA_SP/PA01_2021-' + month + '-' + date + '_' + hour1 + '-' + hour + '_sp_F1.jpg',
                name: 'STA TBT (1 hour)'
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/SIS/jpg/PA_SIS_rsam_CENR_07_s.jpg',
                name: 'RSAM (La Palma)',
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/GPS/jpg/PA_GPS_LP04_90d.png',
                name: 'GPS LP4 90 day',
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/GPS/jpg/PA_GPS_LP03_90d.png',
                name: 'GPS LP3 90 day',
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/SIS/jpg/PA_SIS_eventos_03D.jpg',
                name: 'MAP EQ',
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/SIS/jpg/PA_SIS_histograma_15D.jpg',
                name: 'Total EQ (IGN)',
            },
            {
                url: 'https://volcanodiscovery.de/fileadmin/charts/quakes-v643.png',
                name: 'Total EQ (VD)',
            },
            /*
            {
                url: 'http://www.ign.es/resources/sismologia/www/estaciones_sismicas/ruido_sismico/ES.TBT..HHZ.png',
                name: 'Seismic Noise',
            },     
            {
                url: 'https://pbs.twimg.com/media/FAWw7kSXIAM_fEG?format=jpg&name=medium', // TODO AUTO
                name: 'Map by @CopernicusEMS (08:08 green)',
                cache: true,
            }, 
            {
                url: 'https://pbs.twimg.com/media/FAZPeZ2VQAUp-8p?format=jpg&name=medium', // TODO AUTO
                name: 'Map by @CabLaPalma (12:00 blue)',
                cache: true,
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/386/raw.jpg',
                name:'La Palma (C1)'
            },*/
            {
                url: 'https://cdn.volcanoyt.com/timelapse/390/raw.jpg',
                name: 'La Palma (C4)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/391/raw.jpg',
                name: 'La Palma (C5)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/395/raw.jpg',
                name: 'La Palma (C8)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/396/raw.jpg',
                name: 'La Palma (C9)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/403/raw.jpg',
                name: 'La Palma (C10)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/404/raw.jpg',
                name: 'La Palma (C11)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/405/raw.jpg',
                name: 'La Palma (C13)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/406/raw.jpg',
                name: 'La Palma (C14)'
            },
            /*
            {
                url: 'https://cdn.volcanoyt.com/timelapse/413/raw.jpg',
                name: 'Mount Teide'
            },
            */
            /*
            { 
                url: 'https://volcanoes.usgs.gov/vsc/captures/kilauea/RIMD-24h.png',
                name:'STA RIMD (Kilauea) (24 hour)'
            },
            { 
                url: 'https://volcanoes.usgs.gov/vsc/captures/kilauea/RIMD-6h.png',
                name:'STA RIMD (6 hour)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/221/raw.jpg',
                name:'Kilauea (KWcam)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/345/raw.jpg',
                name:'Kilauea (S1cam)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/16/raw.jpg',
                name:'Kilauea (F1cam)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/401/raw.jpg',
                name:'Kilauea (KPcam)'
            },
            */
            /*
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/287/raw.jpg',
                name:'Mount Kea (View Kilauea)'
            },
            */
        ];
        for (const b of url) {
            var info = await get(b);
        };
    }
    /*
    setTimeout(function () {
        updatecek();
    }, 1000);
    */
}

function get(addme) {
    return new Promise(resolve => {
        try {
            var iscc = false;
            var format = 0;
            var wait = 30;
            if (addme.cache) {
                iscc = addme.cache;
            }
            if (addme.format) {
                format = addme.format;
            }
            if (addme.next) {
                wait = addme.next;
            }
            if (format == 0) {
                $("#gg").html("<img id='zz'>");
                jQuery.ajax({
                    url: addme.url,
                    cache: iscc,
                    timeout: 1000 * 10,
                    xhr: function () {
                        var xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob'
                        return xhr;
                    },
                    success: async function (data) {
                        var img = document.getElementById("zz");
                        var url = window.URL || window.webkitURL;
                        try {
                            img.src = url.createObjectURL(data);

                            $('#namax').text(addme.name);

                            setTimeout(function () {
                                resolve(200);
                            }, 1000 * wait);
                        } catch (error) {
                            console.log(error);
                            resolve(404);
                        }
                    },
                    error: function () {
                        resolve(404);
                    }
                });
            } else if (format == 1) {
                $('#namax').text(addme.name);
                $("#gg").html("<video id='video' autoplay muted><source src='" + addme.url + "' type='video/mp4'></video>");
                var myVideo = document.getElementsByTagName("video")[0];
                myVideo.addEventListener("ended", function () {
                    resolve(200);
                }, true);
            }

        } catch (error) {
            resolve(405);
        }
    });
}
updatecek();

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
        //var mystatus = EarthquakeStatus(statsid);

        var mag = (datap.properties.mag).toFixed(2);
        var magty = datap.properties.magType;

        var deept = (datap.geometry.coordinates[2]).toFixed(0);

        var lat = datap.geometry.coordinates[1];
        var lot = datap.geometry.coordinates[0];

        var timeutc = datap.properties.time;
        var timelocal = moment.utc(timeutc, 'YYYY-MM-DD HH:mm:ss').local();
        var lefttime = timelocal.local().fromNow();

        var tod = distance(lat, lot, 28.616104107010703, -17.862471556621735).toFixed(0);
        var start_audio = false;

        // IF NEAR EQ
        if (tod <= 100) {
            start_audio = true;
        }
        // IF EQ M5+
        if (mag >= 5) {
            start_audio = true;
        }

        var icon_mag = '<i class="fal fa-house-damage"></i> ' + mag + ' ' + magty;
        var icon_dee = '<i class="fab fa-audible"></i> ' + deept + ' km';
        var icon_tcp = '<i class="fal fa-clock"></i> <time data-now="' + timeutc + '"></time>';

        var whereeq = '' + Number(datap.properties.distance).toFixed(2) + ' km of ' + datap.properties.city + ' - ' + datap.properties.country + " (" + tod + " km <i class='fas fa-location-arrow'></i>)";

        document.getElementById("more").innerHTML = "Earthquake: " + icon_mag + " " + icon_dee + " " + icon_tcp + " <br>" + whereeq + "";

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

        show_bar = true;
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