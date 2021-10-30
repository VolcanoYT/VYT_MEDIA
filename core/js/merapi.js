var watchlog = getAllUrlParams().log; // GUI

var Audio_SRR = "http://s3.alhastream.com:8460/janurmerapi";

var zone = "Asia/Jakarta";
var format = "DD/MM/YYYY HH:mm:ss";
var time_old = moment('05/11/2020 00:00:00', format);
var time;

var show_bar = false;
var idvc = "";
var drawVisual;

var s_width = 500;
var s_height = 200;
var s_max = 190;
var s_min = 170;

var opts = {
    angle: -0.2, // The span of the gauge arc
    lineWidth: 0.2, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
        length: 0.29, // // Relative to gauge radius
        strokeWidth: 0.044, // The thickness
        color: '#000000' // Fill color
    },
    limitMax: false, // If false, max value increases automatically if value > maxValue
    limitMin: false, // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF', // Colors
    colorStop: '#8FC0DA', // just experiment with them
    strokeColor: '#E0E0E0', // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true, // High resolution support
    // renderTicks is Optional
    //percentColors: [[0.0, "#a9d70b" ], [0.50, "#f9c802"], [1.0, "#ff0000"]],    
    renderTicks: {
        divisions: 5,
        divWidth: 0.7,
        divLength: 1,
        divColor: '#000000',
        subDivisions: 5,
        subLength: 0.26,
        subWidth: 0.6,
        subColor: '#666666'
    }

};

var ews1 = document.getElementById('ews'); // your canvas element
var gauge = new Gauge(ews1).setOptions(opts); // create sexy gauge!
gauge.maxValue = 6.000; // set max gauge value
gauge.setMinValue(0); // Prefer setter over gauge.minValue = 0
gauge.animationSpeed = 50; // set animation speed (32 is default value)

var ews2 = document.getElementById('dew'); // your canvas element
var gauge2 = new Gauge(ews2).setOptions(opts); // create sexy gauge!
gauge2.maxValue = 256; // set max gauge value
gauge2.setMinValue(0); // Prefer setter over gauge.minValue = 0
gauge2.animationSpeed = 50; // set animation speed (32 is default value)

// set actual value

// GUI
moment.tz.setDefault(zone);
setInterval(async () => {
    time = moment();
    //document.getElementById("time").innerHTML = "Time: " + time.format(format) + " (" + time_old.fromNow() + " <i class='fas fa-volcano'></i>)";
    /*
    if (show_bar) {
        document.getElementById("seimo").style.visibility = "";
        document.getElementById("more").style.display = "";
        await Addimg("http://2.0.0.14:84/data?ch=IRIS-SL&apikey=tes123", "seimo");
    } else {
        document.getElementById("seimo").style.visibility = "hidden";
        document.getElementById("more").style.display = "none";
    }
    */
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
    */
        ];
        for (const b of url) {
            var info = await get(b);
        };
    }
    setTimeout(function () {
        updatecek();
    }, 1000);
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
                            Send_Info(error);
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
//updatecek();

//API Socket
var ewsio = io(URL_APP + 'ews');
ewsio.on('disconnect', function () {
    Send_Info('disconnect');
})
ewsio.on('connect', function () {
    Send_Info('connect');
})
ewsio.on('error', (error) => {
    Send_Info(error);
});
ewsio.on('info', function (x) {
    OnData(x);
});

//New Data Info
var close_seimo;

function OnData(x) {

    return Send_Info(x);
    datap = x.data;

    if (x.type == "earthquake") {

        /*
        // fiter source
        var sumber = datap.properties.sources;
        if (!isEmpty(filiter)) {
            var wa = (filiter.split(","));
            //Send_Info(wa);
            if (!wa.includes(sumber)) {
                //Send_Info('filiter');
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

        var tod = distance(lat, lot, -7.54, 110.446).toFixed(0);
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

        //  document.getElementById("more").innerHTML = "Earthquake: " + icon_mag + " " + icon_dee + " " + icon_tcp + " <br>" + whereeq + "";

        if (start_audio) {

            //hack
            mag = mag.replace(".", ",");
            //deept = deept.replace(".", ",");            
            whereeq = datap.properties.country;

            if (statsid == 3) {
                Speak("update quake magnitude" + mag + " already  " + cont + " time updates so far " + whereeq + " with depth " + deept + " km occurs in " + lefttime + "");
            } else {
                if (tod <= 100) {
                    Speak("New quake magnitude" + mag + " has been detected from a distance " + tod + " km from Volcano Merapi with depth " + deept + " km occurs in " + lefttime + "");
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
        Send_Info(error);
    }
});

// API EWS
setInterval(function () {
    try {
        $.getJSON("http://localhost:84/json?apikey=tes123", function (data) {
            var geb = ((data.features[8].pga) * 10000).toFixed(3);
            //Send_Info(data);
            //Send_Info(geb);
            gauge.set(geb);
            document.getElementById("PGA").innerHTML = "PGA: " + geb;
        });
        var tesx = getFrequencyValue(1500); //(getFrequencyValue(1600) / getFrequencyValue(2000)).toFixed(3);
        gauge2.set(tesx);
    } catch (error) {
        Send_Info(error);
    }
}, 1000 * 1);

function Speak(msga) {
    NotifMe("", msga, "", true, 'en');
    Send_Info(msga);
}

var last_array;

// get the context from the canvas to draw on
var ctx = $("#SM").get()[0].getContext("2d");

// create a temp canvas we use for copying
var tempCanvas = document.createElement("canvas"),
    tempCtx = tempCanvas.getContext("2d");
tempCanvas.width = s_width;
tempCanvas.height = s_height;

// API AUDIO
var context = new(window.AudioContext || window.webkitAudioContext)();

// Edit Audio
var analyser = context.createAnalyser();
//var distortion   = context.createWaveShaper();
//var gainNode     = context.createGain();
//var biquadFilter = context.createBiquadFilter();
//var convolver    = context.createConvolver();

// Buat Audio
var audio = new Audio();
audio.src = Audio_SRR;
audio.controls = true;
audio.autoplay = true;
audio.hidden = true;
document.body.appendChild(audio);

audio.addEventListener("loadstart", function (evt) {

    Send_Info({
        info: "loadstart",
        data: evt
    });

    // Our <audio> element will be the audio source.
    var source = context.createMediaElementSource(audio);

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0;
    analyser.fftSize = 1024;

    source.connect(analyser);
    analyser.connect(context.destination);

    // LOOP
    function draw() {
        drawVisual = requestAnimationFrame(draw);

        // get average for first channel
        last_array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(last_array);

        // draw the spectrogram
        drawSpectrogram(last_array);
    };
    draw();

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

    setTimeout(function () {
        Send_Info('audio check... 1')
        audio.src = Audio_SRR;
    }, 3000);

});
audio.addEventListener("error", function (evt) {

    Send_Info({
        info: "error",
        data: evt
    });

    setTimeout(function () {
        Send_Info('audio check... 2');
        audio.src = Audio_SRR;
    }, 3000);

});
audio.addEventListener("abort", function (evt) {

    Send_Info({
        info: "abort",
        data: evt
    });
/*
    setTimeout(function () {
        Send_Info('audio check... 3');
        audio.src = Audio_SRR;
    }, 3000);
    */
});

// used for color distribution
var hot = new chroma.ColorScale({
    colors: ['#000000', '#ff0000', '#ffff00', '#ffffff'],
    positions: [0, .25, .75, 1],
    mode: 'rgb',
    limits: [0, 300]
});

function getFrequencyValue(frequency) {
    var nyquist = context.sampleRate / 2;
    var index = Math.round(frequency / nyquist * last_array.length);
    return last_array[index];
}

function drawSpectrogram(array) {

    // copy the current canvas onto the temp canvas
    var canvas = document.getElementById("SM");
    tempCtx.drawImage(canvas, 0, 0, s_width, s_height);

    // iterate over the elements from the array
    for (var i = 0; i < array.length; i++) {


        if (i <= s_max && i >= s_min) {
            // draw each pixel with the specific color
            var nilai = array[i];

            try {
                //  gauge2.set(nilai); 
            } catch (error) {

            }


            ctx.fillStyle = hot.getColor(nilai).hex();

            // draw the line at the right side of the canvas
            ctx.fillRect(s_width - 1, s_height - i, 1, 1);
        }

    }

    // set translate on the canvas
    ctx.translate(-1, 0);

    // draw the copied image
    ctx.drawImage(tempCanvas, 0, 0, s_width, s_height, 0, 0, s_width, s_height);

    // reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
                $("#error").html('<div class="alert alert-primary" role="alert"><h3>' + msg + '</h3></div>');
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