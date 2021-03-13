//logger('Browser: ', navigator.userAgent);
//logger('Cookies: ', Cookies.get());

// Player use io for proxy stream
var IoPlayer;
// Player Time Lapse use for playback
var PrPlayer;
// Player for recod
var RpPlayer;

var live = false;
var type = "live";
var noenter = true;
var reason = "";
var reason_icon = "fad fa-wifi-slash";
var div_ld = "#loading";
var div_live = "#player_new";
var div_tl_raw = "player_timelapse_raw";
var div_tl_vd = "#player_timelapse_video";
var name_cam = "Unknown?";
var source_cam = "Unknown?";
var datanext = ['', '', 'Cloud Stream by VolcanoYT'];
var last_load = true;

var count_down = 0;

// FPS Func
var lastCalledTime;
var fps;

// Inner Windows
var w;
var h;

var camid = parseInt(getAllUrlParams().cam);
var hide_info = getAllUrlParams().hide_info;
var useurl = getAllUrlParams().URL;
var token_user = getAllUrlParams().token_user;
var isobson = getAllUrlParams().obs;

var istes = getAllUrlParams().tes; // raw console
var watchlog = getAllUrlParams().watchlog; // gui console
var debug_info = getAllUrlParams().debug; // debug info like fps,size,zoom

var isegg = getAllUrlParams().egg;
var nopower = getAllUrlParams().nopower;

var isreconnect = getAllUrlParams().reconnect;

var tmpg = false;
var nologo = getAllUrlParams().nologo;
if (nologo == 'true') {
    //  tmpg = false;
}
if (hide_info == 'true') {
    $('.judul').hide();
    //  tmpg = false; judul
}

var get_drag_position = {
    x: 0,
    y: 0
};
var get_zoom_position = {
    x: 0,
    y: 0
};
var get_int_zoom = 0;

var canvas_player = document.getElementById("player_new");
var fullscreen_player = document.getElementById("full1");
var ctx_player = canvas_player.getContext("2d");

var last_frame = null;

var wt = 110;
var ht = 40;
var interval = 60;

var online = 1;
var zona = "Asia/Makassar";

//URL Proxy Player for localhost or multi node
if (!isEmpty(useurl)) {
    logger('Io Player Proxy ', useurl);
    URL_APP = useurl;
} else {
    /*
    if ([324, 307, 306, 304, 291, 261, 258, 239, 175, 148, 147, 125, 93, 6].includes(camid)) {
        logger('Singapura Server Tes Mode');
        URL_APP = "https://sevsg.volcanoyt.com/";
    }
    */
}

// API Fullscreen by https://stackoverflow.com/questions/7130397/how-do-i-make-a-div-full-screen
$('.full').on('click', function () {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        element = $('#' + $(this).attr("name")).get(0);
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
});

// Tombol Download
$('.download').on('click', function (ex) {
    $('.download').children().removeClass('fal fa-camera-retro').addClass('fal fa-sync fa-spin');
    $('.download').prop('disabled', true);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', canvas_player.toDataURL("image/webp"), true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
        //logger(xhr.getAllResponseHeaders())
        $('.download').children().removeClass('fal fa-sync fa-spin').addClass('fal fa-camera-retro');
        $('.download').prop('disabled', false);
        if (this.status == 200) {
            var myBlob = this.response;
            var filetime = Math.floor(Date.now() / 1000); //'tes';//xhr.getResponseHeader('Last-Modified');
            saveAs(myBlob, name_cam + '-volcanoyt-' + filetime + '.webp');
        }
    };
    xhr.send();

});

// API Save As
function saveAs(blob, fileName) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement("a");
    anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function () {
        window.URL.revokeObjectURL(url);
    }, 1000);
}

//API Start
function StopStart(id = '', manual = false) {
    try {
        logger('type ' + type + ' - ' + manual + ' - id ' + id + ' ');
        if (id == 'vid2') {
            logger('No suppot player video');
        } else if (id == 'manual') {
            if (type == "live") {
                if (live) {
                    IoPlayer.disconnect();
                    swbt(false);
                } else {
                    IoPlayer.connect();
                    swbt(true);

                }
            } else if (type == 'rec') {
                RpPlayer.stop();
                type = 'live';
            } else if (type == 'raw_ff') {
                PrPlayer.main();
                swbt(!PrPlayer.pause);
            } else {
                logger('belum support11 ', id);
            }
        } else if (id == 'meow') {
            swbt(manual);
        } else if (id == 'dcio') {
            IoPlayer.disconnect();
            swbt(false);
            type = "live";
        } else if (id == 'cnio') {
            IoPlayer.connect();
            swbt();
            type = "live";
        } else {
            logger('belum support ', id);
        }
    } catch (error) {
        logger(error);
    }
}

//API Exit Player FF
function exitff() {
    logger("exit ", type);
    if (type == 'raw_ff') {
        $('.goplayback').hide();
        PrPlayer.clear();
    }
    StopStart('cnio');
    $('#exitbt').hide();
}

function swbt(live = true) {
    if (live) {
        $("#iconplay").attr('class', 'fal fa-pause');
        //$(div_live).show();
    } else {
        $("#iconplay").attr('class', 'fal fa-play');
        //$(div_live).hide();
    }
}

//Api Control FF
document.addEventListener('keydown', (event) => {
    try {
        /*
                // Correct:
                if (map[17] && map[16] && map[13]) { // CTRL+SHIFT+ENTER
                    alert('Whoa, mr. power user');
                } else if (map[17] && map[13]) { // CTRL+ENTER
                    alert('You found me');
                } else if (map[13]) { // ENTER
                    alert('You pressed Enter. You win the prize!')
                }
        */
        switch (event.key) {
            case "ArrowLeft":
                if (type == 'raw_ff')
                    PrPlayer.back();
                break;
            case "ArrowRight":
                if (type == 'raw_ff')
                    PrPlayer.next();
                break;
            case " ":
                if (type == 'raw_ff')
                    PrPlayer.main();
                break;
        }
    } catch (error) {
        logger(error);
    }
});

// API Playback
var PlayBack;
(PlayBack = function (config) {}).prototype = {

    fps: 24,
    speed: 2,
    totalfile: 1440,
    index: 0,
    frame: [],
    Interval: null,
    pause: false,

    listen: function (type, method, scope, context) {
        var listeners, handlers;
        if (!(listeners = this.listeners)) {
            listeners = this.listeners = {};
        }
        if (!(handlers = listeners[type])) {
            handlers = listeners[type] = [];
        }
        scope = (scope ? scope : window);
        handlers.push({
            method: method,
            scope: scope,
            context: (context ? context : scope)
        });
    },
    fireEvent: function (type, data, context) {
        var listeners, handlers, i, n, handler, scope;
        if (!(listeners = this.listeners)) {
            return;
        }
        if (!(handlers = listeners[type])) {
            return;
        }
        for (i = 0, n = handlers.length; i < n; i++) {
            handler = handlers[i];
            if (typeof (context) !== "undefined" && context !== handler.context) continue;
            if (handler.method.call(
                    handler.scope, this, type, data
                ) === false) {
                return false;
            }
        }
        return true;
    },
    main: function () {
        if (!this.Interval) {
            var sef = this;
            var tmp = 0;
            this.pause = false;
            this.Interval = setInterval(function () {
                try {
                    var t = (sef.totalfile / (sef.fps * sef.speed));
                    if (tmp >= t) {
                        tmp = 0;
                        sef.next();
                    } else {
                        tmp++;
                    }
                } catch (error) {}
            });
        } else {
            clearInterval(this.Interval);
            this.Interval = null;
            this.pause = true;
        }
    },
    clear: function () {
        this.index = 0;
        this.frame = [];
        if (this.Interval) {
            clearInterval(this.Interval);
            this.Interval = null;
            this.pause = false;
        }
    },
    total: function () {
        return (this.frame.length - 1)
    },
    next: function () {
        if (this.index < this.total()) {
            this.set(this.index + 1);
        } else {
            this.set(0);
        }
    },
    back: function () {
        if (this.index > 0) {
            this.set(this.index - 1);
        } else {
            this.set(this.total());
        }
    },
    set: function (index) {
        try {
            draw_image(this.frame[index].src);
            this.index = index;
        } catch (error) {
            logger('faild set?', error);
        }
    },
    add: async function (url) {
        return new Promise((resolve, reject) => {

            var timerStart = Date.now();
            var hasil = new Array();
            hasil.url = url;

            jQuery.ajax({
                url: url,
                cache: true,
                timeout: 1000 * 10,
                xhr: function () {
                    var xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob'
                    return xhr;
                },
                success: function (data, status, xhr) {
                    try {
                        var filetime = xhr.getResponseHeader('Last-Modified');
                        hasil.update = filetime;

                        hasil.code = 200;
                        hasil.time = Date.now() - timerStart;

                        var url = window.URL || window.webkitURL;
                        hasil.src = url.createObjectURL(data);
                        resolve(hasil);
                    } catch (error) {
                        hasil.code = 402;
                        hasil.error = error;
                        resolve(hasil);
                    }
                },
                error: function (jqXHR, textStatus) {
                    hasil.code = 401;
                    hasil.textStatus = textStatus;
                    hasil.jqXHR = jqXHR;
                    resolve(hasil);
                }
            });

        })
    },
    proses: async function (data_temp) {
        var sef = this;
        return new Promise((resolve, reject) => {
            var t = [];
            var c = 0;

            //sort it
            data_temp = data_temp.sort(function (a, b) {
                var x = a['index'];
                var y = b['index'];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            if (data_temp.length >= 1) {
                (async () => {
                    for (const item of data_temp) {
                        var getsc = await sef.add(item.url);
                        if (getsc.code == 200) {
                            t.push({
                                url: item.url,
                                index: item.index,
                                src: getsc.src
                            });
                        } else {
                            logger(getsc);
                        }
                        sef.fireEvent("proses", ((c / (data_temp.length - 1)) * 100).toFixed(2));
                        c++;
                    };
                    this.frame = t;
                    resolve(true);
                })();
            } else {
                resolve(false);
            }

        });
    },
};

PrPlayer = new PlayBack();
PrPlayer.listen("proses", function (obj, eventType, data) {
    $("#msg").html('<div class="alert alert-primary" role="alert"><h3>' + data + ' % process making timelapse!</h3></div>');
});

CanvasRenderingContext2D.prototype.clear =
    CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
        if (preserveTransform) {
            this.save();
            this.setTransform(1, 0, 0, 1, 0, 0);
        }

        this.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (preserveTransform) {
            this.restore();
        }
    };

//API Recorder
function createCanvasRecorder() {

    var link;
    var time;
    var stream;
    var recorder;
    var chunks = [];
    var last_time = moment();
    var mtp = 'video/x-matroska;codecs=avc1';

    return {
        start() {
            stream = canvas_player.captureStream();
            try {
                recorder = new MediaRecorder(stream, {
                    mimeType: mtp,
                });
            } catch (error) {
                logger(error);
                try {
                    mtp = 'video/webm;codecs=h264';
                    recorder = new MediaRecorder(stream, {
                        mimeType: mtp,
                    });
                } catch (error) {
                    logger(error);
                    try {
                        mtp = 'video/webm';
                        recorder = new MediaRecorder(stream, {
                            mimeType: mtp,
                        });
                    } catch (error) {
                        logger(error);
                        try {
                            mtp = 'video/webm,codecs=vp9';
                            recorder = new MediaRecorder(stream, {
                                mimeType: mtp,
                            });
                        } catch (error) {
                            logger(error);
                            try {
                                mtp = 'video/vp8';
                                recorder = new MediaRecorder(stream, {
                                    mimeType: mtp,
                                });
                            } catch (error) {
                                logger(error);
                                try {
                                    mtp = 'video/webm;codecs=vp8,opus';
                                    //for mozilla (https://github.com/w3c/mediacapture-record/issues/194#issue-561863354)
                                    recorder = new MediaRecorder(stream, {
                                        mimeType: mtp,
                                    });
                                } catch (error) {
                                    logger(error);
                                }
                            }
                        }
                    }
                }
            }

            if (recorder) {
                logger(recorder);
                recorder.ondataavailable = event => {
                    event.data.size && chunks.push(event.data);
                };
                recorder.onstop = () => {
                    if (chunks.length) {
                        const blob = new Blob(chunks, {
                            type: mtp
                        });
                        const url = URL.createObjectURL(blob);
                        link.href = url;
                        const event = new MouseEvent("click");
                        link.dispatchEvent(event);
                        setTimeout(() => {
                            URL.revokeObjectURL(url);
                        }, 1);
                    }
                };
            } else {
                logger('no suppot');
            }

            last_time = moment();

            if (time) {
                clearInterval(time);
            }

            $('.RecordShow').show();

            time = setInterval(function () {
                $('#RecordTime').html(moment(last_time).fromNow());
            }, 1000);

            chunks = [];

            if (recorder) {
                recorder.start();
            } else {
                logger('not yet');
            }

            var filename = `Recording ${new Date().toISOString().slice(0, 10)} at ${new Date().toTimeString().slice(0, 8).replace(/:/g, ".")}.mkv`;
            link = document.createElement("a");
            link.download = filename;

        },
        step() {
            stream.getVideoTracks()[0].requestFrame();
        },
        stop() {

            if (time) {
                clearInterval(time);
            }

            $('.RecordShow').hide();

            if (recorder) {
                recorder.stop();
                recorder = null;
            }
            stream = null;
        }
    };
}

RpPlayer = createCanvasRecorder();

//API IoPlayer
var scale = 1.0;
var scaleMultiplier = 0.8;
var mouseDown = false;

// add event listeners to handle screen drag
fullscreen_player.addEventListener("mousedown", function (evt) {
    mouseDown = true;
    get_drag_position.x = evt.clientX - get_zoom_position.x;
    get_drag_position.y = evt.clientY - get_zoom_position.y;
    //savedrag();
});
fullscreen_player.addEventListener("mouseup", function (evt) {
    mouseDown = false;
});
fullscreen_player.addEventListener("mouseover", function (evt) {
    mouseDown = false;
});
fullscreen_player.addEventListener("mouseout", function (evt) {
    mouseDown = false;
});
fullscreen_player.addEventListener("mousemove", function (evt) {
    if (mouseDown) {
        //logger(evt);
        get_zoom_position.x = evt.clientX - get_drag_position.x;
        get_zoom_position.y = evt.clientY - get_drag_position.y;
        resize();
        savedrag();
    }
});

function savedrag() {
    Cookies.set('drag_cam_' + camid, JSON.stringify({
        get_drag_position: get_drag_position,
        get_zoom_position: get_zoom_position
    }));
}

function zoomit() {
    scale *= scaleMultiplier;
    get_int_zoom++;
    resize();
    savezoom();
};

function zoomout() {
    scale /= scaleMultiplier;
    get_int_zoom--;
    resize();
    savezoom();
};

function savezoom() {
    Cookies.set('zoom_cam_' + camid, JSON.stringify({
        scale: scale,
        get_int_zoom: get_int_zoom
    }));
}

var load_zoom = tryParse(Cookies.get('zoom_cam_' + camid));
if (!isEmpty(load_zoom)) {
    logger(load_zoom);
    scale = load_zoom.scale;
    get_int_zoom = load_zoom.get_int_zoom;
    resize();
}

var load_drag = tryParse(Cookies.get('drag_cam_' + camid));
if (!isEmpty(load_drag)) {
    logger(load_drag);
    get_drag_position = load_drag.get_drag_position;
    get_zoom_position = load_drag.get_zoom_position;
    resize();
}

function reset() {
    scale = 1.0;
    get_zoom_position = {
        x: 0,
        y: 0
    }
    get_int_zoom = 0;
    resize();
    savedrag();
    savezoom();
};

var config_exposure = 1.0;
var config_brightness = 0.0;
var isfliter = false;
$('#config_setimg').on('change', function () {
    isfliter = this.checked;
});
$('#config_exposure').on('change', function (e) {
    config_exposure = parseFloat(e.target.value);
});
$('#config_brightness').on('change', function (e) {
    config_brightness = parseFloat(e.target.value);
});

function resize(f = null, watermark = false) {

    // get base windows size
    w = window.innerWidth;
    h = window.innerHeight;

    //clear it
    ctx_player.clear();
    //ctx_player.clearRect(0, 0, ctx_player.width, ctx_player.height);

    //set player
    ctx_player.canvas.width = w;
    ctx_player.canvas.height = h;

    ctx_player.globalCompositeOperation = 'lighter';
    //ctx_player.filter = "brightness(180%)";

    //add image
    if (f) {
        ctx_player.drawImage(f, get_zoom_position.x, get_zoom_position.y, w / scale, h / scale);
        last_frame = f;
    }

    //use last image
    if (last_frame) {
        if (!f)
            ctx_player.drawImage(last_frame, get_zoom_position.x, get_zoom_position.y, w / scale, h / scale);
    }

    if (isfliter) {

        // GET Base Data
        var dt = ctx_player.getImageData(0, 0, w, h);

        /*
                //pixel data                
                const data = dt.data;
                for (var i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i]; // red
                    data[i + 1] = 255 - data[i + 1]; // green
                    data[i + 2] = 255 - data[i + 2]; // blue
                }
        */

        if (config_exposure !== 1.0) {
            JSManipulate.exposure.filter(dt, {
                exposure: config_exposure,
            });
        }
        if (config_brightness !== 0.0) {
            JSManipulate.brightness.filter(dt, {
                amount: config_brightness,
            });
        }

        /*
                JSManipulate.contrast.filter(dt, {
                    amount: 2,
                });
                JSManipulate.gain.filter(dt, {
                    gain: 0.22,
                    bias: 0.77
                });
        */
        //Now finally put the data back into the context, which will render
        ctx_player.putImageData(dt, 0, 0);
    }

    // selalu paling bawah

    // Base Font
    ctx_player.fillStyle = '#444';

    //Show Debug
    if (debug_info == "true") {
        // GET FPS
        if (!lastCalledTime) {
            lastCalledTime = Date.now();
            fps = 0;
            return;
        }
        delta = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        fps = (1 / delta).toFixed(1);

        // Add All
        addtext("FPS " + fps + " | Zoom " + get_int_zoom + " | Size " + w + "x" + h + " ");
    }

}

// add text
var line = 10;

function addtext(c, font = 42) {
    ctx_player.font = font + 'px sans-serif';

    var ho = h - ht;

    ctx_player.fillText(c, 0, (ho - -font) - line);
}

window.addEventListener('resize', resize(), false);
resize();

function draw_image(imgdata, watermark = false) {
    var image = new Image();
    image.onload = function () {
        resize(image, watermark);
    };
    image.src = imgdata;
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function getRandom(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
}

IoPlayer = io(URL_APP + 'camera', {
    query: getdata(),
    transports: ['websocket']
});
IoPlayer.on('connect', function (e) {
    icon_player("fad fa-wifi-2");
    noenter = true;
});
IoPlayer.on('error', (error) => {
    logger('Error IoPlayer: ', error);
});
//var reconnect_tmp = null;
IoPlayer.on('disconnect', function () {
    count_down++;
    if (count_down >= 2) {
        count_down = 0;
        if (live) {
            if (isreconnect !== "true") {
                StopStart('dcio');
                $("#error").html('<div class="alert alert-primary" role="alert"><h3>Your internet or server seems slow respon, please reload manually</div>');
            } else {
                //keep loop
            }
        } else {
            $("#error").html('<div class="alert alert-primary" role="alert"><h3>Looks like its disconnected, please reload manually</div>');
        }
    } else {
        if (isEmpty(!reason)) {
            $("#error").html('<div class="alert alert-primary" role="alert"><h3>Camera Disconnected (' + count_down + 'x):<br>' + reason + '</h3></div>');
        } else {
            //keep loop
        }
    }

    /*
    if (isreconnect == "true") {
        //this bug fix later
        if (reason.includes("Stream stop")) {
            if (reconnect_tmp) {
                clearTimeout(reconnect_tmp);
            }
            reconnect_tmp = setTimeout(function () {
                StopStart('cnio');
            }, 5000);
        } else {
            logger(reason, 'debug_tes');
        }
    }
    */
    icon_player(reason_icon);
    StopStart('meow', false);
    live = false;
    noenter = true;
});
IoPlayer.on('stream', function (e) {
    stream_data(e);
});

function getdata() {
    return {
        cam: camid,
        token_p2p: "",
        token_user: token_user,
        version: IoPlayerVersion,
        referrer: document.referrer,
        iframe: inIframe(),
        url: URL_APP
    };
}

function stream_data(e) {
    if (e) {
        if (e.image) {
            draw_image('data:image/webp;base64,' + base64ArrayBuffer(e.buffer), tmpg);

            //TODO: get base time take?
            var dt = moment().tz(zona).format('DD/MM/YYYY HH:mm:ss');
            if (document.getElementById("settime")) {
                document.getElementById("settime").innerHTML = dt;
            }

            if (e.live) {
                icon_player("fal fa-satellite-dish");
            } else {
                icon_player("fal fa-camera");
            }

            logger(e, 'Image Data', 0);

            //re ping?
            if (noenter) {
                noenter = false;
                live = true;
                StopStart('meow', true);
                $("#error").html('');
            }

            //just last ping?
            if (last_load) {
                last_load = false;
                NextText(0);
            }
        } else {

            logger(e);

            noenter = true;
            StopStart('meow', false);

            if (e.data.code == 601) {
                //info camera
                try {
                    interval = e.data.info.interval;
                    zona = e.data.info.time.timezone;
                    name_cam = e.data.info.name;
                    var sourcex = "Host by " + e.data.info.source;

                    if (camid == 340) {
                        //  sourcex = "CCTV VolcanoYT | Internet Frekom & Lintas Media Net";
                    }

                    //egg for merapi stream
                    if (isegg == "true") {
                        datanext[3] = "Saat ini masih Level 3 (Siaga)";
                        datanext[4] = "Data Seismograf disediakan oleh BPPTKG";
                        datanext[5] = "Laporan Magma-Var (cek pin chat) dari PVMBG";
                        datanext[6] = "Sebelum chat, silakan baca deskripsi dulu.";
                        datanext[7] = "Jangan lupa like dan subscribe👍";
                        datanext[8] = "Join Telegram t.me/VolcanoYT";
                        datanext[9] = "Donasi volcanoyt.com/ds";
                    }

                    if (nopower == "true") {
                        datanext[2] = "";
                    }

                    datanext[0] = '<timex id="settime">' + moment().tz(zona).format('YYYY/MM/DD HH:mm:ss') + '</timex>';
                    datanext[1] = sourcex;

                } catch (error) {
                    logger(error);
                }
                icon_player("fal fa-file-invoice");
            } else if (e.data.code == 0) {
                //exit camera
                reason = e.data.message;
                StopStart('dcio');
            } else if (e.data.code == 309) {
                //sleep mode, wait snapshot
                icon_player("fas fa-robot fa-spin");
            } else if (e.data.code == 204) {
                //loading
                icon_player("fal fa-spinner fa-spin");
            } else if (e.data.code == 600) {
                //info online
                online = e.data.online;
            } else if (e.data.code == 555) {
                //System Chat
                // http://localhost:3000/camera/control.json?user=Yuki&id_user=YT123&cmd=!cam%20chat%20344%20hello
                // {message: "hello", nick: "Yuki", id: "YT123", code: 555}
                try {
                    Toastify({
                        text: e.data.nick + ' : ' + e.data.message,
                        duration: 9000
                    }).showToast();
                } catch (error) {

                }
            } else {
                $("#error").html('<div class="alert alert-primary" role="alert"><h3>' + e.data.message + '</h3></div>');
                icon_player("fal fa-exclamation-triangle");
            }

            //API Player
            try {
                window.parent.postMessage({
                    "api": "player_update",
                    "data": e.data
                }, "*");
            } catch (error) {
                logger('error send data');
            }
        }
    } else {
        logger('hmm no data?');
    }
}

function base64ArrayBuffer(arrayBuffer) {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63 // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}

//API Select Time
$.fn.datetimepicker.Constructor.Default = $.extend({}, $.fn.datetimepicker.Constructor.Default, {
    icons: {
        time: 'fal fa-clock',
        date: 'fal fa-calendar-check',
        up: 'fal fa-arrow-up',
        down: 'fal fa-arrow-down',
        previous: 'fal fa-chevron-left',
        next: 'fal fa-chevron-right',
        today: 'fal fa-calendar-check-o',
        clear: 'fal fa-trash',
        close: 'fal fa-times-circle'
    }
});
$('#set_start').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
    defaultDate: moment().add(-1, 'hours').format('YYYY-MM-DD HH:mm'),
});
$('#set_end').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
    defaultDate: moment().format('YYYY-MM-DD HH:mm'),
});

// API Auto Menu
var ct = null;
$('html').mouseover(function () {
    $(".menu_player").show();

    if (ct) {
        clearTimeout(ct);
        ct = null;
    }

    ct = setTimeout(function () {
        $(".menu_player").hide();
    }, 5000);
});
$('html').mouseout(function () {
    if (ct) {
        clearTimeout(ct);
        ct = null;
    }
    $(".menu_player").hide();
});

// Tombol Create Time lapse
$('#proses').on('click', function (e) {

    var set_start = moment($('#set_start').val()).utc().format("X");
    var set_end = moment($('#set_end').val()).utc().format("X");

    var title = $('#title').val();
    var tweet = $('#tweet').val();
    var whattype = $('#what_use').val();

    logger('' + set_start + ' - ' + set_end + ' - ' + title + ' - ' + whattype);

    if (whattype == '1') {
        $('#getinfo').hide();
        $('#cloban').hide();
        $('#loadff').show();
        $('#msg').html('');

        $.ajax({
            method: "POST",
            dataType: "json",
            data: {
                start: set_start,
                end: set_end,
                title: title,
                tweet: tweet,
                id: camid,
                fps: 15,
                hd: 0,
                interval: interval
            },
            url: URL_API + 'camera/timelapse/create.json',
        }).done(function (data) {
            $('#getinfo').show();
            $('#loadff').hide();
            $('#cloban').show();
            if (data.code == 200) {
                $('#msg').append('<div class="form-group"><div class="embed-responsive embed-responsive-16by9"><video controls autoplay mute loop><source src="' + URL_CDN + 'collection/' + data.md5 + '.mp4" type="video/mp4"></video></div><label>Download Link</label><div class="input-group"><input type="text" class="form-control" value="' + URL_CDN + 'collection/' + data.md5 + '.mp4"></div></div>');
            }
            $('#msg').append('<div class="alert alert-warning" role="alert">' + data.status + '</div>');
        }).fail(function (a) {
            $('#cloban').show();
            $('#getinfo').show();
            $('#loadff').hide();
            $('#msg').append('<div class="alert alert-warning" role="alert">Error Load</div>');
        });
    } else if (whattype == 2) {

        StopStart('dcio');

        PrPlayer.clear();
        $('#getinfo').hide();
        // $('#loadff').show();
        $('#cloban').hide();

        $.ajax({
            method: "POST",
            dataType: "json",
            data: {
                start: set_start,
                end: set_end,
                id: camid
            },
            url: URL_API + 'camera/data.json',
        }).done(function (data) {
            var options2 = [];
            $.each(data.file, function (key, entry) {
                var tp = entry.url.replace(/^.*[\\\/]/, '').replace(".jpg", '').replace(".webp", '');
                options2.push({
                    url: URL_CDN + entry.url,
                    index: tp
                });
            });

            PrPlayer.clear();
            PrPlayer.proses(options2).then((tes) => {

                type = 'raw_ff';

                logger(tes);
                $('#getinfo').show();
                // $('#loadff').hide();
                $('#cloban').show();
                $('.goplayback').show();
                $('#error').html('');
                $('#msg').html('');
                $('#makeff').modal('hide');
                $('#exitbt').show();

                PrPlayer.main();

            });

        }).fail(function (a) {
            logger(a);
            $('#getinfo').show();
            // $('#loadff').hide();
            $('#cloban').show();
        });
    } else if (whattype == 3) {
        type = 'rec';
        RpPlayer.start();
    } else {
        logger('come soon');
    }


})

$('#what_use').change(function (e) {
    wtf = $(this).val();
    logger(wtf);
    if (wtf == "1") {
        // Create Timelapse (from server)
        $('#proses').html('Create');
        $('#title').parent().show();
        $('#tweet').parent().show();
        $('#set_start').parent().parent().show();
        $('#set_end').parent().parent().show();
    } else if (wtf == "2") {
        //Watch Raw Timelapse (from browser)
        $('#proses').html('Watch');
        $('#title').parent().hide();
        $('#tweet').parent().hide();
        $('#set_start').parent().parent().show();
        $('#set_end').parent().parent().show();
    } else if (wtf == "3") {
        //Record this event (from browser)
        $('#proses').html('Record');
        $('#title').parent().hide();
        $('#tweet').parent().hide();
        $('#set_start').parent().parent().hide();
        $('#set_end').parent().parent().hide();
    } else {
        logger(wtf);
    }
});

//for obs stream
var no_first_time = false;
if (isobson == "true") {
    try {
        logger('OBS Debug: ', window.obsstudio.pluginVersion);
        window.addEventListener('obsSceneChanged', function (event) {
            logger('obsSceneChanged: ', event);
        });
        window.obsstudio.getStatus(function (status) {
            logger('Status OBS: ', status);
        });
        window.obsstudio.getCurrentScene(function (scene) {
            logger('OBS Secene: ', scene);
        })
        window.obsstudio.onVisibilityChange = function (visibility) {
            logger('OBS Visibility? ', visibility);
        };
        window.obsstudio.onActiveChange = function (active) {
            logger('OBS Active? ', active);
            if (active) {
                StopStart('cnio');
            } else {
                StopStart('dcio');
            }
        };
    } catch (error) {
        logger(error);
    }
}

function NextText(i) {
    if (datanext.length > i) {
        if (!isEmpty(datanext[i])) {
            document.getElementById("text_me").innerHTML = name_cam + ' - ' + datanext[i];
        }
        setTimeout(function () {
            NextText(++i);
        }, 1000 * 10);
    } else if (datanext.length == i) {
        NextText(0);
    }
}

function logger(data, title = "DEBUG: ", warning = 1) {
    if (warning == 0) return;

    // Send to raw console
    if (istes == 'true')
        console.log(title, data);

    //Send to GUI
    if (watchlog == "true") {
        try {
            //var homeTown = document.getElementById("console_gui_input").value;
            //document.getElementById("console_gui_input").value += homeTown;
            if (typeof data == 'object') {
                data += (JSON && JSON.stringify ? JSON.stringify(data, undefined, 2) : data) + '<br>';
            }
            $('#console_gui_input').append(title + ": " + data + '<br>');
        } catch (error) {

        }
    }

    //TODO: Send Logger to Server?
}

var last_icon = "";

function icon_player(t = 'fal fa-spinner fa-spin') {
    if (last_icon !== t) {
        if (document.getElementById("icon_player")) {
            last_icon = t;
            $("#icon_player").attr('class', t);
        }
    }
}