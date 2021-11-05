// Player for Proxy IO aka JPG
var IoPlayer;
// Player for timelapse raw version
var PrPlayer;
// Player for Record
var RpPlayer;
// Player for HLS (soon for public)
var PlayerHLS;

// CONFIG
var w = window.innerWidth;
var h = window.innerHeight;
var allow_drag = false;
var get_drag_position = {
    x: 0,
    y: 0
};
var get_zoom_position = {
    x: 0,
    y: 0
};
var get_int_zoom = 0;

// OBS Mode
var OBSMode = false;
var OBS_ON = true;

// CAMERA
var camid = parseInt(getAllUrlParams().cam); // ID CAMERA
var cambk = parseInt(getAllUrlParams().cam_bk); // ID CAMERA
var ismute = getAllUrlParams().mute || "true";

// API
var URL_HLS = URL_APP + 'live/' + camid + '/hls.m3u8';
var URL_IMG = URL_CDN + "timelapse/" + camid + "/raw.jpg";

// API
var IO_API = getAllUrlParams().URL;
if (!isEmpty(IO_API)) {
    Send_Info('Io Player API: ' + IO_API);
    URL_APP = IO_API;
}

// PLAYER STUFF
var offline = false;
var pause = false;
var isaudio = false;
var isplayer = getAllUrlParams().format || "jpg"; // FORMAT (JPG,HLS,?)
var isdirect = getAllUrlParams().direct || "false"; // Direct link with TOKEN USER
var player_format = 0; // 0 = Proxy (JPG), 1 Proxy (HLS), 2 Direct Link (HLS)

if (isdirect == "true") {
    player_format = 2;
}

// HLS
var hls_playing = "Wait";
var hls_stop = false;
var hls_pause = false;
var hls_need_reload = false;
var hls_bad_wait = 5;
var hls_temp_bad_wait = 0;
// SNAPSHOT (OFFLINE)
var snp_tmp_wait = 0;
var snp_reload = 0;
// SNAPSHOT (ONLINE)
var last_frame = null;
var proxy_offline = 0;

// ETC

var playerx;
var last_format = "";
var total_bit = 0;
var last_bit = 0;
var totalframe = 0;

var type = "live";

var reason = "";
var reason_icon = "fad fa-wifi-slash";
var div_ld = "#loading";
var div_live = "#html5_player";
var div_tl_raw = "player_timelapse_raw";
var div_tl_vd = "#player_timelapse_video";
var name_cam = "Unknown?";
var source_cam = "Unknown?";

var isfliter = false;
var lastCalledTime;
var fps;
var hide_info = getAllUrlParams().hide_info; // HIDE INFO
var isaddtime = getAllUrlParams().time || "false";
var ctname = getAllUrlParams().name;
var token_user = getAllUrlParams().token_user; // TOKEN USER
var isobson = getAllUrlParams().obs; // USE OBS?
var isreconnect = getAllUrlParams().reconnect; // RECONNECT AUTO
var isres = getAllUrlParams().res || "720";
var istes = getAllUrlParams().tes; // RAW
var watchlog = getAllUrlParams().log; // GUI
var debug_info = getAllUrlParams().debug; // DEBUG INFO (FPS,BIT)
var debug2 = getAllUrlParams().debug2;
//var nopower = getAllUrlParams().nopower; // NO INFO CLOUD
var fake_url = getAllUrlParams().fake;
var isbackup = getAllUrlParams().backup;
var canvas_player = document.getElementById("html5_player");
var fullscreen_player = document.getElementById("full1");
var ctx_player;
var wt = 110;
var ht = 40;
var interval = 60;
var online = 1;
var zona = "Asia/Makassar";
var try_link = 3;
var tmp_try_link = 0;
var idcam_last = camid;
var last_info = "";
if (hide_info == 'true') {
    $('.judul').hide();
}
var add_time = "";
if (isaddtime == "true") {
    add_time = '<timex id="settime">' + moment().tz(zona).format('YYYY/MM/DD HH:mm:ss') + '</timex>';
}
var next_title = [add_time, '', ''];

var dt;

$('#hls_player').hide();

// Send cmd
function getdata() {
    return {
        cam: camid,
        token_p2p: "",
        token_user: token_user,
        format: player_format,
        version: IoPlayerVersion,
        referrer: document.referrer,
        iframe: inIframe(),
        url: URL_APP
    };
}

IoPlayer = io(URL_APP + 'camera', {
    query: getdata()
});
IoPlayer.on('connect', function (e) {
    Send_Info({
        status: "IO: CONNECT",
        data: e
    });
});
IoPlayer.on('error', (error) => {
    Send_Info({
        status: "IO: ERROR",
        data: error
    });
});
IoPlayer.on('disconnect', function (e) {

    icon_player(reason_icon);

    Send_Info({
        status: "IO: DC",
        data: e
    });

    proxy_offline++;
    if (proxy_offline >= 2) {
        proxy_offline = 0;
        Send_Info('Your internet or server seems slow respon, please reload manually', true);
    } else {
        if (isEmpty(!reason)) {
            Send_Info('Camera Disconnected (' + proxy_offline + 'x):<br>' + reason + '', true);
        }
    }

});
IoPlayer.on('info', function (e) {

    Send_Info({
        "type": "info",
        "data": e
    });

    if (e.code == 601) {

        // INFO PLAYER AND TODO CHECK IF USE LINK RED               
        try {

            interval = e.info.interval;
            zona = e.info.time.timezone;

            // Name Camera
            if (!isEmpty(ctname)) {
                name_cam = decodeURIComponent(ctname);
            } else {
                name_cam = e.info.name;
            }

            // Source
            next_title[1] = e.info.source;

        } catch (error) {
            Send_Info(error);
        }

        icon_player("fal fa-file-invoice");

    } else if (e.code == 0) {

        // KILL CAMERA
        reason = e.message;
        Play(true, 2);

    } else if (e.code == 309) {

        // Sleep Mode, wait Snapshot new
        icon_player("fas fa-robot fa-spin");

    } else if (e.code == 204) {

        // Loading Normal
        icon_player("fal fa-spinner fa-spin");

    } else if (e.code == 600) {

        // NEW USER ONLINE
        online = e.online;

    } else if (e.code == 666) {

        // HLS PLAYER?

    } else if (e.code == 555) {

        // System Chat
        // http://localhost:3000/camera/control.json?user=Yuki&id_user=YT123&cmd=!cam%20chat%20344%20hello
        // {message: "hello", nick: "Yuki", id: "YT123", code: 555}
        /*
        try {
            Toastify({
                text: e.nick + ' : ' + e.message,
                duration: 9000
            }).showToast();
        } catch (error) {

        }
        */

    } else {

        // IF ALL

        Send_Info('' + e.message + '', true);
        icon_player("fal fa-exclamation-triangle");
    }

    //API Player
    try {
        window.parent.postMessage({
            "api": "player_update",
            "data": e.data
        }, "*");
    } catch (error) {
        Send_Info('error send data');
    }


});
IoPlayer.on('proxy', function (e) {

    /*
    Send_Info({
        "type": "proxy",
        "data": e
    });
    */

    if (e) {

        // Check Format
        if (last_format !== e.format) {
            last_format = e.format;
            Send_Info('Format: ' + last_format);
            ctx_player = null;
            var newCvs = canvas_player.cloneNode(false);
            canvas_player.parentNode.replaceChild(newCvs, canvas_player);
            canvas_player = newCvs;
            ctx_player = canvas_player.getContext("2d");
        }

        if (e.format == "image2pipe" || e.format == "image2") {
            draw_image('data:image/webp;base64,' + base64ArrayBuffer(e.buffer));
            isaudio = false;
        } else {
            Send_Info('Format No Support: '+e.format);
        }

        // IS LIVE
        if (e.live) {
            icon_player("fal fa-satellite-dish");
        } else {
            icon_player("fal fa-camera");
        }

    } else {
        Send_Info('NO DATA PROXY');
    }

});

/*
API Start
 * 0 = no pause
 * 1 = pause
 * 2 = stop
 * 3 = start
*/
function Play(manual = false, metode = 0) {
    try {
        if (!manual) {
            if (player_format == 2) {
                if (PlayerHLS.paused()) {
                    hls_pause = false;
                    Send_Info('PLAY HLS: PLAY MANUAL');
                    PlayerHLS.play();
                } else {
                    hls_pause = true;
                    Send_Info('PLAY HLS: PAUSE MANUAL');
                    PlayerHLS.pause();
                }
            } else {
                Send_Info('PLAY: MANUAL NO SUPPORT > ' + player_format);
            }
        } else {
            if (player_format == 2) {

                if (hls_pause)
                    return Send_Info("AUTO PLAY NOT WORK IF MANUAL ON");

                if (metode == 1) {
                    if (!PlayerHLS.paused()) {
                        Send_Info('PLAY HLS: AUTO PAUSE');
                        PlayerHLS.pause();
                    }
                } else if (metode == 0) {
                    if (PlayerHLS.paused()) {
                        Send_Info('PLAY HLS: AUTO PLAY');
                        PlayerHLS.play();
                    }
                } else {
                    Send_Info('PLAY HLS: METODE NO SUPPORT > ' + metode);
                }

            } else if (player_format == 0) {


                if (metode == 3) {
                    if (!IoPlayer.connected) {
                        IoPlayer.connect();
                    }
                    Send_Info('PLAY PROXY: PLAY IT');
                } else if (metode == 2) {
                    if (IoPlayer.connected) {
                        IoPlayer.disconnect();
                    }
                    Send_Info('PLAY PROXY: STOP PLAY');
                } else {
                    Send_Info('PLAY PROXY: METODE NO SUPPORT > ' + metode);
                }


            } else {
                Send_Info('PLAY: AUTO NO SUPPORT > ' + player_format);
            }
        }
    } catch (error) {
        Send_Info(error);
    }
}

// API Exit Player FF
function exitff() {
    Send_Info("exit ", type);
    if (type == 'raw_ff') {
        $('.goplayback').hide();
        PrPlayer.clear();
    }
    //StopStart('cnio');
    $('#exitbt').hide();
}

// Api Control
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
        Send_Info(error);
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
            Send_Info('faild set?', error);
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
                            Send_Info(getsc);
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
                Send_Info(error);
                try {
                    mtp = 'video/webm;codecs=h264';
                    recorder = new MediaRecorder(stream, {
                        mimeType: mtp,
                    });
                } catch (error) {
                    Send_Info(error);
                    try {
                        mtp = 'video/webm';
                        recorder = new MediaRecorder(stream, {
                            mimeType: mtp,
                        });
                    } catch (error) {
                        Send_Info(error);
                        try {
                            mtp = 'video/webm,codecs=vp9';
                            recorder = new MediaRecorder(stream, {
                                mimeType: mtp,
                            });
                        } catch (error) {
                            Send_Info(error);
                            try {
                                mtp = 'video/vp8';
                                recorder = new MediaRecorder(stream, {
                                    mimeType: mtp,
                                });
                            } catch (error) {
                                Send_Info(error);
                                try {
                                    mtp = 'video/webm;codecs=vp8,opus';
                                    //for mozilla (https://github.com/w3c/mediacapture-record/issues/194#issue-561863354)
                                    recorder = new MediaRecorder(stream, {
                                        mimeType: mtp,
                                    });
                                } catch (error) {
                                    Send_Info(error);
                                }
                            }
                        }
                    }
                }
            }

            if (recorder) {
                Send_Info(recorder);
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
                Send_Info('no suppot');
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
                Send_Info('not yet');
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
var scale = 1;
var scaleMultiplier = 0.8;
var mouseDown = false;

// add event listeners to handle screen drag
fullscreen_player.addEventListener("mousedown", function (evt) {
    //console.log("mousedown");
    mouseDown = true;

    if (allow_drag) {
        get_drag_position.x = evt.clientX - get_zoom_position.x;
        get_drag_position.y = evt.clientY - get_zoom_position.y;
    }

});
fullscreen_player.addEventListener("mouseup", function (evt) {
    mouseDown = false;
    // console.log("mouseup");
});
fullscreen_player.addEventListener("mouseover", function (evt) {
    mouseDown = false;
    // console.log("mouseover");
});
fullscreen_player.addEventListener("mouseout", function (evt) {
    mouseDown = false;
    // console.log("mouseout");
});
fullscreen_player.addEventListener("mousemove", function (evt) {

    // console.log("mousemove");

    if (mouseDown) {
        if (allow_drag) {
            get_zoom_position.x = evt.clientX - get_drag_position.x;
            get_zoom_position.y = evt.clientY - get_drag_position.y;
        }
    }

});

function savedrag() {
    Cookies.set('drag_cam_' + camid, JSON.stringify({
        get_drag_position: get_drag_position,
        get_zoom_position: get_zoom_position
    }));
}

function zoomit() {
    scale /= scaleMultiplier;
    get_int_zoom++;
    ConfigPlayer();
};

function zoomout() {
    scale *= scaleMultiplier;
    get_int_zoom--;
    ConfigPlayer();
};

function ConfigPlayer() {
    //OnImg();
    //savedrag();
    //OnImg();
    var gtes = 1.000 + scale;
    $('.video-js .vjs-tech').css('transform', 'scale(' + gtes + ', ' + gtes + ')');


    /*
    Cookies.set('zoom_cam_' + camid, JSON.stringify({
        scale: scale,
        get_int_zoom: get_int_zoom
    }));
    */
}

var load_zoom = tryParse(Cookies.get('zoom_cam_' + camid));
if (!isEmpty(load_zoom)) {
    Send_Info(load_zoom);
    scale = load_zoom.scale;
    get_int_zoom = load_zoom.get_int_zoom;
    OnImg();
}

var load_drag = tryParse(Cookies.get('drag_cam_' + camid));
if (!isEmpty(load_drag)) {
    Send_Info(load_drag);
    get_drag_position = load_drag.get_drag_position;
    get_zoom_position = load_drag.get_zoom_position;
    OnImg();
}

function reset() {
    scale = 1.0;
    get_zoom_position = {
        x: 0,
        y: 0
    }
    get_int_zoom = 0;
    ConfigPlayer();
};

// GUI
$('#config_setimg').on('change', function () {
    isfliter = this.checked;
});
$('#config_allowdrag').on('change', function () {
    allow_drag = this.checked;
});

// Update Resize
window.addEventListener('resize', OnImg(), false);

function OnImg(f = null) {

    w = window.innerWidth;
    h = window.innerHeight;

    if (!ctx_player) {
        return;
    }

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

                JSManipulate.contrast.filter(dt, {
                    amount: 2,
                });
                JSManipulate.gain.filter(dt, {
                    gain: 0.22,
                    bias: 0.77
                });
        */

        //Now finally put the data back into the context, which will render
        //ctx_player.clear();
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
        addtext("FPS " + fps + " | Zoom " + get_int_zoom + " | Size " + w + "x" + h + " | Total " + formatBytes(total_bit) + " (" + formatBytes(last_bit) + ") | Frame " + totalframe + " | Format " + last_format + " ");
    }

}

// add text
var line = 10;

function addtext(c, font = 42) {
    if (!ctx_player) {
        return;
    }
    ctx_player.font = font + 'px sans-serif';
    var ho = h - ht;
    ctx_player.fillText(c, 0, (ho - -font) - line);
}

function AutoConfig(d) {
    Send_Info(d);

}

function HLS_Player(url = "", type = "application/x-mpegURL") {

    if (!isEmpty(url)) {
        if (!isEmpty(type)) {
            try {

                Send_Info('Start play...', true);

                // NEW OPEN
                if (videojs.getAllPlayers().length == 0) {

                    PlayerHLS = videojs('hls_player', {
                        liveui: true,
                        loadingSpinner: false,
                        sources: [{
                            type: type,
                            src: url
                        }]
                    });

                    PlayerHLS.qualityMenu({
                        defaultResolution: isres + 'p'
                    });

                    PlayerHLS.on('ready', function (e) {
                        if (ismute == "true") {
                            PlayerHLS.muted(true);
                        }
                        PlayerHLS.play();
                        Send_Info();
                    });
                    PlayerHLS.on(['play', 'playing', 'durationchange', 'loadedmetadata', 'loadeddata', 'loadstart', 'durationchange', 'canplay', 'canplaythrough', 'waiting', 'ended', 'pause', 'error', 'suspend', 'abort', 'interruptbegin', 'interruptend', 'stalled'], function (e) { //resize       , 'seeked', 'seeking'                 

                        hls_playing = e.type;
                        //Send_Info(hls_playing);

                        // API ERROR CHECK
                        try {

                            var view_error = PlayerHLS.error();
                            if (view_error) {

                                last_info = view_error.message;

                                if (view_error.message.includes("disabled")) {

                                    is_hls_bad();

                                } else if (view_error.message.includes("not supported")) {

                                    is_hls_bad();

                                } else if (view_error.message.includes("corruption")) {
                                    // JUST SKIP
                                    is_hls_bad(false);
                                } else {
                                    // JUST SKIP
                                }

                            } else {
                                // JUST SKIP
                                is_hls_bad(false);
                            }

                        } catch (error) {
                            Send_Info(error);
                        }

                    });

                } else {
                    // NEW URL
                    PlayerHLS.src({
                        src: url,
                        type: type
                    });
                    if (ismute == "true") {
                        PlayerHLS.muted(true);
                    }
                    PlayerHLS.play();
                }

                /*
                PlayerHLS.reloadSourceOnError({
                    getSource: function (r) {
                    },
                    errorInterval: 6
                });
                */

            } catch (error) {
                Send_Info(error);
            }
        } else {
            Send_Info('No type...', true);
        }
    } else {
        Send_Info('No found url', true);
    }
}

// LOOP
var wait_reload = 5;
var tmp_wait_reload = 0;
var check_live = 3600;
var tmp_check_live = 0;
var cek_pause;
setInterval(function () {

    // Time
    var tdt = moment().tz(zona).format('DD/MM/YYYY HH:mm:ss');
    if (document.getElementById("settime")) {
        document.getElementById("settime").innerHTML = tdt;
    }

    // ICON PAUSE
    if (!pause) {
        $("#iconplay").attr('class', 'fal fa-pause');
    } else {
        $("#iconplay").attr('class', 'fal fa-play');
    }
    // ICON MUTE
    if (isaudio) {
        $("#icon_audio").show();
    } else {
        $("#icon_audio").hide();
    }

    // OBS
    if (OBSMode) {
        Play(true, OBS_ON ? 0 : 1);
        if (!OBS_ON)
            return null
    }

   // console.log(player_format);

    return null;

    pause = hls_pause;
    if (hls_pause)
        return null; //Send_Info('PAUSE MANUAL!');

    // STA PLAYER
    if (hls_playing == "play" || hls_playing == "playing" || hls_playing == "canplaythrough" || hls_playing == "loadedmetadata") {
        Send_Info();
        is_hls_bad(false);
    } else if (hls_playing == "pause" || hls_playing == "waiting") {
        if (!hls_need_reload) {
            if (hls_temp_bad_wait >= hls_bad_wait) {
                last_info = 'Too slow for realtime :(';
                hls_temp_bad_wait = 0;
                is_hls_bad();
            } else {
                hls_temp_bad_wait++;
                Send_Info("BAD WAIT " + hls_temp_bad_wait);
                icon_player("fal fa-spinner fa-spin");
            }
        }
    } else {
        // IF ERROR
        is_hls_bad();
        //console.log(hls_playing);
    }

    // Check Expire Time
    if (dt) {

        // TYPE FORMAT
        if (dt.type == 3) {
            // YOUTUBE
            var tm = dt.expire1_time_yt - Math.floor(Date.now() / 1000);
            $("#debug_youtube_time").html("Youtube expire link " + tm + " in sec");
            if (dt.tm > 0) {
                is_hls_bad();
            }
        }

    }

    // CHECK NEW URL
    if (hls_need_reload) {
        if (tmp_wait_reload >= wait_reload) {
            tmp_wait_reload = 0;

            if (tmp_try_link >= try_link) {

                tmp_try_link = 0;

                if (!isEmpty(cambk)) {
                    last_info = 'Looks like camera is offline trying to find an alternative';
                    // if not found id last try add it id camera backup
                    if (cambk !== idcam_last) {
                        idcam_last = cambk;
                        camid = cambk;
                    } else {
                        //if found id cam last try back to id cam
                        camid = idcam_last;
                        idcam_last = cambk;
                    }
                } else {
                    last_info = 'Looks like camera is offline, please wait for operator to change camera manually';
                }

            } else {
                //last_info = 'Doing check';
                tmp_try_link++;
            }

            Direct(true);

        } else {
            tmp_wait_reload++;
            Send_Info('Check new link in ' + (wait_reload - tmp_wait_reload) + ' sec | ' + tmp_try_link + 'X | ' + last_info, true);
        }
    }

    // KEEP LOW LC
    if (tmp_check_live > check_live) {
        tmp_check_live = 0;
        try {
            Direct();
            //PlayerHLS.liveTracker.seekToLiveEdge();
        } catch (error) {

        }
    } else {
        tmp_check_live++;
    }

    //Snapshot();

    // CHECK AUDIO
    if (PlayerHLS) {
        isaudio = !PlayerHLS.muted();
    }

}, 1000 * 1);

async function Snapshot() {

    try {
        var aw;
        if (snp_tmp_wait >= snp_reload) {
            snp_tmp_wait = 0;
            aw = await Addimg(URL_IMG);
        } else {
            snp_tmp_wait++;
        }
        if (aw) {
            //cek last error
            if (aw.code !== 200) {
                SendLog("Error load img");
            } else {
                ProxyData({
                    image: true,
                    format: 'image2',
                    buffer: aw.data
                });
            }
        }

    } catch (e) {
        Send_Info(e);
    }
}


function title(msg) {
    document.getElementById("text_me").innerHTML = msg;
}


function ProxyData(e) {
    console.log(e);
}

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

    Send_Info('' + set_start + ' - ' + set_end + ' - ' + title + ' - ' + whattype);

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

                Send_Info(tes);
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
            Send_Info(a);
            $('#getinfo').show();
            // $('#loadff').hide();
            $('#cloban').show();
        });
    } else if (whattype == 3) {
        type = 'rec';
        RpPlayer.start();
    } else {
        Send_Info('come soon');
    }


})

$('#what_use').change(function (e) {
    wtf = $(this).val();
    Send_Info(wtf);
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
        Send_Info(wtf);
    }
});

// OBS API
try {
    if (window.obsstudio) {
        var OBS_VER = window.obsstudio.pluginVersion;
        if (!isEmpty(OBS_VER)) {
            OBSMode = true;
            window.addEventListener('obsSceneChanged', function (e) {
                Send_Info({
                    info: "obsSceneChanged",
                    data: e
                });
            });
            window.obsstudio.getStatus(function (e) {
                Send_Info({
                    info: "OBS: Status",
                    data: e
                });
            });
            window.obsstudio.getCurrentScene(function (e) {
                Send_Info({
                    info: "OBS: CurrentScene",
                    data: e
                });
            })
            window.obsstudio.onVisibilityChange = function (e) {
                /*
                Send_Info({
                    info: "OBS: VisibilityChange",
                    data: e
                });
                */
                OBS_ON = e;
            };
            window.obsstudio.onActiveChange = function (e) {
                Send_Info({
                    info: "OBS: ActiveChange",
                    data: e
                });
            };
        } else {
            Send_Info("NO OBS SUPPORT!!!");
        }
    }
} catch (error) {
    Send_Info(error);
}

function NextText(i) {
    if (next_title.length > i) {
        if (!isEmpty(next_title[i])) {
            document.getElementById("text_me").innerHTML = name_cam + ' - ' + next_title[i];
        }
        setTimeout(function () {
            NextText(++i);
        }, 1000 * 10);
    } else if (next_title.length == i) {
        NextText(0);
    }
}
NextText(0);

var last_msg;

function Send_Info(msg = "", gui = false, gui2 = false, type = 0, log = true) {

    // STOP SPAM!
    if (last_msg == msg) {
        return null;
    }

    last_msg = msg;

    // Object
    if (watchlog == "true" || gui) {
        if (typeof msg == 'object') {
            msg = (JSON && JSON.stringify ? JSON.stringify(msg, undefined, 2) : msg) + '<br>';
        }
    }

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
                $("#error").html('<div class="toast fade show position-absolute top-50 start-50 translate-middle"><div class="toast-header"><strong class="me-auto">VolcanoYT</strong><small>INFO</small></div><div class="toast-body"><h1>' + msg + '</h1></div></div>');
            } catch (error) {
                //skip
            }
        }
        // LOG CONSOLE GUI
        if (watchlog == "true") {
            try {
                var g = document.getElementById("console_gui_input");
                g.scrollTop = g.scrollHeight;
                $('#console_gui_input').append(msg + '\n');
                //homeTown.scrollIntoView(false);
                //document.getElementById("console_gui_input").value += homeTown;                
            } catch (error) {
                //skip
            }
        }
        // TODO: TO SERVER
    }
}

/*
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
*/

$('#set_start').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
    defaultDate: moment().add(-1, 'hours').format('YYYY-MM-DD HH:mm'),
});
$('#set_end').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
    defaultDate: moment().format('YYYY-MM-DD HH:mm'),
});

// IF ALL READY
$(document).ready(function () {
    // TODO
});

function is_hls_bad(i = true) {
    if (i) {
        hls_need_reload = true;
        $('#html5_player').show();
        $('#hls_player').hide();
        icon_player("fa fa-exclamation-triangle");
    } else {
        hls_need_reload = false;
        tmp_wait_reload = 0;
        hls_temp_bad_wait = 0;
        $('#html5_player').hide();
        $('#hls_player').show();
        icon_player("fal fa-satellite-dish");
    }
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

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

function draw_image(imgdata) {
    var image = new Image();
    image.onload = function () {
        OnImg(image);
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