var FSPlayer;
var IoPlayer;
var PrPlayer;

var live = false;
var type = "live";

var div_ld = "#loading";
var div_live = "#live";
var div_tl_raw = "player_timelapse_raw";
var div_tl_vd = "#player_timelapse_video";

var camid = getAllUrlParams().cam;

//URL DEV
var useurl = getAllUrlParams().URL;
var token_user = getAllUrlParams().token_user;
if (!isEmpty(useurl)) {
    console.log('Io PLayer Proxy ', useurl);
    URL_APP = useurl;
}

//Log DEV
var dev = getAllUrlParams().dev;
$('.log').hide();
if (dev == "true") {
    $('.log').show();
} else {
    $('#debug_console').css("display", "contents"); //not yet fix
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
    $('.download').children().removeClass('fas fa-download').addClass('fas fa-sync fa-spin');
    $('.download').prop('disabled', true);
    var xhr = new XMLHttpRequest();
    var live = div_live;

    /*
    if (!isEmpty(getdiv)) {
        live = "#" + getdiv;
    } else if ($("#vid2_html5_api").length == 1) {
        live = $("#vid2_html5_api");
    }
    */

    xhr.open('GET', $(live)[0].src, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
        //console.log(xhr.getAllResponseHeaders())
        $('.download').children().removeClass('fas fa-sync fa-spin').addClass('fas fa-download');
        $('.download').prop('disabled', false);
        if (this.status == 200) {
            var myBlob = this.response;
            var filetime = Math.floor(Date.now() / 1000); //'tes';//xhr.getResponseHeader('Last-Modified');
            saveAs(myBlob, 'volcanoyt-' + filetime + '.jpg');
        }
    };
    xhr.send();
});

// Tombol settings
$('.kkp').on('click', function (e) {
    if ($('.btt').css('display') == 'none') {
        $(".showme").show();
        $(".goset").hide();
    } else {
        $(".showme").hide();
        $(".goset").show();
    }
})

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


// Tombol Create Time lapse
$('#proses').on('click', function (e) {
    console.log(e);
    var set_start = moment($('#set_start').val()).utc().format("X");
    var set_end = moment($('#set_end').val()).utc().format("X");
    var title = $('#title').val();
    var tweet = $('#tweet').val();
    console.log(set_start + set_end + title);
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
            fps: 10,
            hd: 2
        },
        url: URL_API + 'camera/timelapse/create.json',
    }).done(function (data) {
        $('#getinfo').show();
        $('#loadff').hide();
        $('#cloban').show();
        if (data.code == 200) {
            $('#msg').append('<div class="form-group"><video width="100%" height="240" controls autoplay mute loop><source src="' + URL_CDN + 'collection/' + data.md5 + '.mp4" type="video/mp4"></video><label>Download Link</label><div class="input-group"><input type="text" class="form-control" value="' + URL_CDN + 'collection/' + data.md5 + '.mp4"></div></div>');
        }
        $('#msg').append('<div class="alert alert-warning" role="alert">' + data.status + '</div>');
    }).fail(function (a) {
        $('#cloban').show();
        $('#getinfo').show();
        $('#loadff').hide();
        $('#msg').append('<div class="alert alert-warning" role="alert">Error Load</div>');
    });
})

// Tombol Timelaspe
$('.timelapse_bt').on('click', function (e) {
    if ($('.gotimelapse').css('display') == 'none') {
        $(".gotimelapse").show();
        try {

            $('.gotimelapse').css("display", "");

            //idk
            var dropdown = $('#select_timelapse');
            dropdown.empty();
            dropdown.append('<option selected="true" disabled>Choose</option>');
            dropdown.prop('selectedIndex', 0);

            $.getJSON(URL_API + "camera/data.json?id=" + camid + "&type=2").done(function (z) {

                var options = [];
                $.each(z.file, function (key, entry) {
                    var tpZ = entry.url.replace(/^.*[\\\/]/, '').replace(".mp4", '');
                    if (tpZ !== "last") {
                        options.push({
                            value: entry.url,
                            label: tpZ
                        });
                    }
                })
                options = options.sort(function (a, b) {
                    var x = b['label'];
                    var y = a['label'];
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
                $.each(options, function (i, option) {
                    dropdown.append($('<option></option>').attr('value', URL_CDN + option.value).text(moment.unix(option.label).format("DD-MM-YYYY HH:mm:ss")));
                });

                //API Pilih
                dropdown.append($('<option></option>').attr('value', "").text("Today"));
                dropdown.append($('<option></option>').attr('value', "").text("Daily"));

                dropdown.change(function (ex) {
                    console.log(ex);

                    //Jika Mode Foto
                    if ($('option:selected', this).text() == "Today" || $('option:selected', this).text() == "Daily") {
                        var isjoin = 1;
                        if ($('option:selected', this).text() == "Daily") {
                            isjoin = 3
                        }

                        //Api load type find file
                        $.getJSON(URL_API + "camera/data.json?id=" + camid + "&type=" + isjoin, function (z) {

                            if (PrPlayer)
                                PrPlayer.clear();


                            var options2 = [];
                            $.each(z.file, function (key, entry) {
                                var tp = entry.url.replace(/^.*[\\\/]/, '').replace(".jpg", '');
                                options2.push({
                                    url: URL_CDN + entry.url,
                                    index: tp
                                });
                            });

                            OpenTab(2);

                            PrPlayer = new PlayBack({
                                div: div_tl_raw
                            });
                            PrPlayer.proses(options2).then((tes) => {
                                $("#error").html('');
                                PrPlayer.main();
                            });
                            PrPlayer.listen("proses", function (obj, eventType, data) {
                                $("#error").html('<div class="alert alert-primary" role="alert"><h3>' + data + ' % process making timelapse!</h3></div>');
                            });

                        });

                    } else {
                        StopStart('vid2');
                        //Jika Video API
                        $(div_tl_vd).html('<video id="vid2" class="video-js vjs-default-skin" controls></video>');
                        FSPlayer = videojs('vid2', {
                            plugins: {
                                // abLoopPlugin: {}
                            }
                        });
                        var thhis = $('option:selected', this).val().replace("..", '');
                        FSPlayer.src({
                            src: thhis,
                            type: "video/mp4"
                        });
                        FSPlayer.play();
                        OpenTab(3);
                        $("#error").html('');
                    }

                });

            }).fail(function (jqXHR, textStatus, errorThrown) {
                $("#error").html('getJSON request failed! ' + textStatus);
            })

        } catch (error) {
            console.log(error);
            $("#error").html('Error Load FF');
        }

    } else {
        $(".gotimelapse").hide();
        OpenTab();
    }
})

function StopStart(id = '', manual = false, islive = true) {
    try {
        if (id == 'vid2') {
            var element = document.getElementById(id);
            if (element) {
                videojs(element).dispose();
            }
            FSPlayer = null;
        } else if (id == 'manual') {
            if (type == "live") {
                if (live) {
                    IoPlayer.disconnect();
                } else {
                    IoPlayer.connect();

                }
            } else {
                //console.log('belum support11 ', id);
            }
        } else {
            //console.log('belum support ', id);
        }

        if (manual) {
            live = islive;
        }

        if (live) {
            $("#iconplay").attr('class', 'fas fa-pause');
            $(div_live).show();
        } else {
            $("#iconplay").attr('class', 'fas fa-play');
            $(div_live).hide();
        }

    } catch (error) {
        console.log(error);
    }
}

// API OpenTab
function OpenTab(open = 1) {
    try {
        if (open == 1) {
            //player normal
            type = 'live';
            $(div_live).show();

            $(div_tl_vd).hide();

            $("#" + div_tl_raw).hide();
            $("#" + div_tl_raw).empty();

            StopStart('manual');
            StopStart('vid2');

            if (PrPlayer)
                PrPlayer.clear();

        } else if (open == 2) {
            //player ff foto 

            $(div_live).hide();

            $(div_tl_vd).hide();

            $("#" + div_tl_raw).show();

            if (live)
                StopStart('manual');

            StopStart('vid2');

            type = 'raw_ff';
        } else if (open == 3) {
            //player ff video

            if (live)
                StopStart('manual');

            if (PrPlayer)
                PrPlayer.clear();

            $(div_live).hide();

            $(div_tl_vd).show();

            $("#" + div_tl_raw).hide();
            $("#" + div_tl_raw).empty();

            type = 'raw_video';
        }
    } catch (error) {
        console.log(error);
    }
}

//Api Control FF
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "ArrowLeft":
            console.log('ArrowLeft');
            break;
        case "ArrowRight":
            console.log('ArrowRight');
            break;
        case " ":
            console.log('space');
            break;
    }
})

var PlayBack;
(PlayBack = function (config) {
    this.div = config.div;
}).prototype = {

    fps: 30,
    speed: 2,
    total: 1440,
    index: 0,
    frame: null,
    Interval: null,
    ff: false,

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
        if (!this.ff) {
            var sef = this;
            var tmp = 0;
            this.ff = true;
            this.Interval = setInterval(function () {
                try {
                    var t = (sef.total / (sef.fps * sef.speed));
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
            this.ff = false;
        }
    },
    clear: function () {
        this.index = 0;
        this.frame = 0;
        if (this.Interval) {
            clearInterval(this.Interval);
            this.ff = false;
        }
    },
    next: function () {
        if (this.index < (this.frame.length - 1)) {
            this.set(this.index + 1);
        } else {
            this.set(0);
        }
    },
    back: function () {
        if (this.index > (this.frame.length - 1)) {
            this.set(this.index - 1);
        } else {
            this.set(0);
        }
    },
    set: function (index) {
        try {
            document.getElementById(this.div).src = this.frame[index].src;
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

//API IoPlayer
var noenter = true;
var IoPlayer = io(URL_APP + 'camera');
IoPlayer.on('connect', function () {
    IoPlayer.emit('access', {
        cam: camid,
        token_user: token_user,
        version: '1.0.2'
    });
});
IoPlayer.on('disconnect', function () {
    $("#error").html('<div class="alert alert-primary" role="alert"><h3>Camera disconnected</h3></div>');
    live = false;
});
IoPlayer.on('stream', function (e) {
    //console.log(e);
    if (e) {
        if (e.image) {
            document.getElementById("live").src = 'data:image/jpeg;base64,' + base64ArrayBuffer(e.buffer);
            if (noenter) {
                noenter = false;
                StopStart(true, true);
                $("#error").html('');
            }
        } else {
            noenter = true;
            StopStart(true, false);

            //GUI Player
            if (e.data.code == 600 || e.data.code == 601) {
                //TODO: add to list tw              
            } else {
                $("#error").html('<div class="alert alert-primary" role="alert"><h3>' + e.data.message + '</h3></div>');
                console.log(e.data);
            }

            // API Player
            try {
                window.parent.postMessage({
                    "api": "player_update",
                    "data": e.data
                }, "*");
            } catch (error) {
                console.log('error send data');
            }
        }
    }else{
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

$('#set_start').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
});
$('#set_end').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
});