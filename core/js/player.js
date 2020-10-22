//console.log('Browser: ', navigator.userAgent);
//console.log('Cookies: ', Cookies.get());
// Player use io for proxy stream
var IoPlayer;
// Player Time Lapse use for playback
var PrPlayer;
// Player for recod
var RpPlayer;

var live = false;
var type = "live";

var div_ld = "#loading";
var div_live = "#player_new";
var div_tl_raw = "player_timelapse_raw";
var div_tl_vd = "#player_timelapse_video";

var camid      = getAllUrlParams().cam;
var showinfo   = getAllUrlParams().info;
var useurl     = getAllUrlParams().URL;
var token_user = getAllUrlParams().token_user;
var isobson    = getAllUrlParams().obs;
var istes      = getAllUrlParams().tes;

var tmpg = true;
var nologo     = getAllUrlParams().nologo;
if(nologo == 'true'){
    tmpg =false;
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
var name = "NoName";

//URL Proxy Player for localhost or multi node
if (!isEmpty(useurl)) {
    if (useurl !== 'undefined') {
        console.log('Io Player Proxy ', useurl);
        URL_APP = useurl;
    }
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
        //console.log(xhr.getAllResponseHeaders())
        $('.download').children().removeClass('fal fa-sync fa-spin').addClass('fal fa-camera-retro');
        $('.download').prop('disabled', false);
        if (this.status == 200) {
            var myBlob = this.response;
            var filetime = Math.floor(Date.now() / 1000); //'tes';//xhr.getResponseHeader('Last-Modified');
            saveAs(myBlob, name + '-volcanoyt-' + filetime + '.webp');
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
        console.log('type ' + type + ' - ' + manual + ' - id ' + id + ' ');
        if (id == 'vid2') {
            console.log('No suppot player video');
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
                console.log('belum support11 ', id);
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
            console.log('belum support ', id);
        }
    } catch (error) {
        console.log(error);
    }
}

//API Exit Player FF
function exitff() {
    console.log("exit ", type);
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
        console.log(error);
    }
})

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
            console.log('faild set?', error);
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
                            console.log(getsc);
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
                console.log(error);
                try {
                    mtp = 'video/webm;codecs=h264';
                    recorder = new MediaRecorder(stream, {
                        mimeType: mtp,
                    });
                } catch (error) {
                    console.log(error);
                    try {
                        mtp = 'video/webm';
                        recorder = new MediaRecorder(stream, {
                            mimeType: mtp,
                        });
                    } catch (error) {
                        console.log(error);
                        try {
                            mtp = 'video/webm,codecs=vp9';
                            recorder = new MediaRecorder(stream, {
                                mimeType: mtp,
                            });
                        } catch (error) {
                            console.log(error);
                            try {
                                mtp = 'video/vp8';
                                recorder = new MediaRecorder(stream, {
                                    mimeType: mtp,
                                });
                            } catch (error) {
                                console.log(error);
                                try {
                                    mtp = 'video/webm;codecs=vp8,opus';
                                    //for mozilla (https://github.com/w3c/mediacapture-record/issues/194#issue-561863354)
                                    recorder = new MediaRecorder(stream, {
                                        mimeType: mtp,
                                    });
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }
                    }
                }
            }

            if (recorder) {
                console.log(recorder);
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
                console.log('no suppot');
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
                console.log('not yet');
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
        //console.log(evt);
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
    console.log(load_zoom);
    scale = load_zoom.scale;
    get_int_zoom = load_zoom.get_int_zoom;
    resize();
}

var load_drag = tryParse(Cookies.get('drag_cam_' + camid));
if (!isEmpty(load_drag)) {
    console.log(load_drag);
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
    var w = window.innerWidth;
    var h = window.innerHeight;

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

        //pixel data
        var dt = ctx_player.getImageData(0, 0, w, h);

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

    //selalu paling bawah
    if (watermark) {
        ctx_player.font = '42px sans-serif';
        ctx_player.fillStyle = '#444';
        //ctx_player.textAlign = 'center';
        // ctx_player.textBaseline = 'middle';

        var c = 'VolcanoYT';
        var metrics = ctx_player.measureText(c);
        //var fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        var actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        ctx_player.fillText(c, (w - ctx_player.measureText(c).width) - 4, (h - ht) + 10);

        ctx_player.font = '12px sans-serif'; // (Watch " + online + ") 
        c = "" + moment().tz(zona).format('DD/MM/YYYY HH:mm:ss');
        ctx_player.fillText(c, (w - ctx_player.measureText(c).width) - 10, (h - ht) - -30);
    }
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

function BarInfo(is = "fal fa-spinner fa-spin") {
    if (showinfo == "true") {
        $('#judul').html('<i class="' + is + '" aria-hidden="true"></i> ' + name + " (" + moment().tz(zona).format('DD/MM/YYYY HH:mm:ss') + ")");
    }
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

var noenter = true;

var reason = "";
var reason_icon = "fad fa-wifi-slash";

var IoPlayer = io(URL_APP + 'camera', {
    query: {
        cam: camid,
        token_user: token_user,
        version: '1.0.7',
        referrer: document.referrer,
        iframe: inIframe()
    },
    transports: ['websocket']
});

IoPlayer.on('connect', function (e) {
    BarInfo('fad fa-wifi-2');
});
IoPlayer.on('error', (error) => {
    console.log('Error IoPlayer: ', error);
});
IoPlayer.on('disconnect', function () {
    $("#error").html('<div class="alert alert-primary" role="alert"><h3>Camera Disconnected: ' + reason + '</h3></div>');
    BarInfo(reason_icon);
    StopStart('meow', false);
    live = false;
});
IoPlayer.on('stream', function (e) {
    if (e) {
        if (e.image) {
            draw_image('data:image/webp;base64,' + base64ArrayBuffer(e.buffer),tmpg);

            //TODO: get time base framer
            var is = "fal fa-camera"
            if (e.live) {
                is = "fal fa-satellite-dish";
            }

            if (istes == "true")
                console.log(e);

            BarInfo(is);

            //just use last ping
            if (noenter) {
                noenter = false;
                live = true;
                StopStart('meow', true);
                $("#error").html('');
            }
        } else {

            noenter = true;
            StopStart('meow', false);

            console.log(e);

            if (e.data.code == 601) {
                //info camera
                try {
                    interval = e.data.info.interval;
                    zona = e.data.info.time.timezone;
                    name = e.data.info.name;
                } catch (error) {
                    console.log(error);
                }
                BarInfo('fal fa-file-invoice');
            } else if (e.data.code == 0) {
                //exit camera
                reason = e.data.message;
                StopStart('dcio');
            } else if (e.data.code == 204) {
                //loading
                BarInfo();
            } else if (e.data.code == 600) {
                //info online
                online = e.data.online;
                //BarInfo('fal fa-user-plus');
            } else {
                $("#error").html('<div class="alert alert-primary" role="alert"><h3>' + e.data.message + '</h3></div>');
                BarInfo('fal fa-exclamation-triangle');
            }

            //API Player
            try {
                window.parent.postMessage({
                    "api": "player_update",
                    "data": e.data
                }, "*");
            } catch (error) {
                console.log('error send data');
            }

        }
    } else {
        console.log('hmm no data?');
    }
});

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

    console.log('' + set_start + ' - ' + set_end + ' - ' + title + ' - ' + whattype);

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

                console.log(tes);
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
            console.log(a);
            $('#getinfo').show();
            // $('#loadff').hide();
            $('#cloban').show();
        });
    } else if (whattype == 3) {
        type = 'rec';
        RpPlayer.start();
    } else {
        console.log('come soon');
    }


})

$('#what_use').change(function (e) {
    wtf = $(this).val();
    console.log(wtf);
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
        console.log(wtf);
    }
});

//for obs stream
var no_first_time = false;
if (isobson == "true") {
    try {
        console.log('OBS Debug: ', window.obsstudio.pluginVersion);
        window.addEventListener('obsSceneChanged', function (event) {
            console.log('obsSceneChanged: ', event);
        });
        window.obsstudio.getStatus(function (status) {
            console.log('Status OBS: ', status);
        });
        window.obsstudio.getCurrentScene(function (scene) {
            console.log('OBS Secene: ', scene);
        })
        window.obsstudio.onVisibilityChange = function (visibility) {
            console.log('OBS Visibility? ', visibility);
        };
        window.obsstudio.onActiveChange = function (active) {
            console.log('OBS Active? ', active);
            if (active) {
                StopStart('cnio');
            } else {
                StopStart('dcio');
            }
        };
    } catch (error) {
        console.log(error);
    }
}