Object.assign({
    flash: {
        hls: {
            withCredentials: false
        },
        swf: '/static/video-js.swf'
    }
}, this.options)

var JSPlayer;
var FSPlayer;
var IoPlayer;

var Interval_Update;

var displayz = new Array();

var j = $('#judul');
var div_player = "#player";
var div_ld = "#loading";
var div_live = "#live";
var div_tl_raw = "#player_timelapse_raw";
var div_tl_vd = "#player_timelapse_video";

var pw = 0;
var lastlog = '';
var myIndex = 0;
var slideIndex = 1;
var timer = false;
var hideimg = true;
var showliveimg = false;
var ispause = false;
var playt = "live";
var countl = 0;
var timezone = 'Asia/Makassar';

var ffisplay = false;
var cek_broke_link = false;

var live_io = false;

var types;
var setimg;
var ext;
var pp;

var flash = getAllUrlParams().flash;
var rtyt = getAllUrlParams().rtyt;
var camid = getAllUrlParams().cam; //auto setup cam
//var uproxy = getAllUrlParams().uproxy; //force proxy auto
var namacam = getAllUrlParams().nama; //nama kamera
var setvol = getAllUrlParams().audio;
var volume = parseFloat(setvol / 100);
var setplay = getAllUrlParams().autoplay;
var setforce = getAllUrlParams().force;
var tp = getAllUrlParams().tp || 'last'; //last or raw
var sereload = parseInt(getAllUrlParams().r) || 60; //reload img
var wt = getAllUrlParams().wt;
var skiplive = false; //getAllUrlParams().skiplive;

var usebackup = getAllUrlParams().backup;
var token_user = getAllUrlParams().token_user;

var useurl = getAllUrlParams().URL;
var live_mode = getAllUrlParams().live;
if (!isEmpty(useurl)) {
    console.log('Io PLayer Proxy ', useurl);
    URL_APP = useurl;
}

var dev = getAllUrlParams().dev;
$('.log').hide();
if (dev == "true") {
    $('.log').show();
} else {
    $('#debug_console').css("display", "contents"); //not yet fix
}

$('.log').on('click', function (e) {
    if ($('#debug_console').css('display') == 'contents') {
        $("#debug_console").css('display', 'flow-root');
    } else {
        $("#debug_console").css('display', 'contents');
    }
})

displayz[0] = namacam;

if (wt == "1") {
    function random() {
        displayz[1] = "Time: " + moment().tz(timezone).format('DD/MM/YYYY HH:mm');
        var rand = Math.floor(Math.random() * displayz.length);
        $('#judul').text(displayz[rand]);
    }
    setInterval(random, 1000 * 10);
    random();
};

if (!isEmpty(camid)) {
    GetJson(URL_API + "camera/view.json?ceklive=true&id=" + camid + "&token_user=" + token_user)
        .then(response => {
            return RunLive(response);
        })
        .catch(error => {
            SendLog('Error Get Info');
        });
} else {
    SendLog('No Id Found');
}

function SendLog(txt = "") {
    if (!isEmpty(txt)) {
        j.css("display", "");
        lastlog = txt;
    } else {
        j.css("display", "none");
    }
}

function good(msg, count = true) {
    if (!isEmpty(msg)) {
        console.log(msg);
    }
    if (types == 6) {
        showliveimg = true;
    } else {
        showliveimg = false;
    }
    cek_broke_link = false;
    if (count)
        countl = 0;
}

function bad(msg) {
    if (!isEmpty(msg)) {
        console.log(msg);
    }
    showliveimg = true;
    cek_broke_link = true;
}

function StopP(id = 'vid1') {
    try {
        videojs(document.getElementById(id)).dispose();
        if (id == 'vid1') {
            JSPlayer.destroy();
            JSPlayer = null;
        } else {
            FSPlayer.destroy();
            FSPlayer = null;
        }
    } catch (error) {}
}

var StartLive;
var StartLive2;
var isPlaying = "loading";
var last_loading = null;

function RunLive(df) {
    try {

        if (isPlaying == "disabled")
            return console.log('disabled player');

        if (isEmpty(df))
            return console.log('No Config');

        last_loading = df;
        console.log("API Start", df);

        var c = df.data;
        displayz[0] = "Cam: " + c.name;
        displayz[2] = "Source: " + c.source;
        timezone = c.time.timezone;
        types = c.type;
        sereload = c.refresh;
        setimg = URL_CDN + "timelapse/" + camid + "/" + tp + ".jpg";
        pw = sereload;

        //if live mode, check live tag
        if (live_mode) {
            if (c.refresh_live == 0) {
                live_mode = false;
            } else {
                IoPlayer.disconnect();
                IoPlayer.connect();
                isPlaying = "playing";
                types = 6;
                showliveimg = true;
                return console.log('live mode');
            }
        }

        //API Sudah di Set
        Run_Update(true);
        Run_Update();

        //debug mode
        if (!isEmpty(token_user)) {
            //Jika Ada Api Youtube Fokus ke youtube live dari pada live gambar
            if (usebackup == "true") {
                if (!isEmpty(c.url_backup)) {
                    types = 2;
                    c.url = c.url_backup;
                }
            }

            if (!isEmpty(c.ytid)) {
                //force use yt
                ext = "video/youtube";
                pp = 'https://www.youtube.com/watch?v=' + c.ytmp;
                types = 3;
                if (rtyt == 'true') {
                    //Youtube Stream Tanpa API IF
                    types = 2;
                    idrt = c.ytdl;
                }
            }

            //Api FTP
            if (types == 5) {
                types = 1;
            }

            //Cek Jika hanya URL Embed
            if (!isEmpty(c.embed)) {
                types = 6;
                $(div_player).html(c.embed);
            }

            //Cek Vaild URL
            if (types !== 3) {
                //jangan cek yt?
                if (!isValidUrl(c.url)) {
                    isPlaying = 'disabled';
                    console.log('URL Vaild? ', c.url);
                }
            }
            //API rtmp
            if (types == 2) {
                ext = "application/x-mpegURL";
                if ((c.url).includes("rtmp")) {
                    ext = "rtmp/mp4";
                } else if ((c.url).includes("h5player")) {
                    ext = "video/x-flv";
                } else if ((c.url).includes("rtsp")) {
                    ext = "rtmp/mp4";
                }
                pp = c.url;
            }
            if (('' + pp + '').includes('skylinewebcams')) {
                skiplive = 'true';
            }
        } else {
            skiplive = "true";
        }

        // skip live mode start up
        if (skiplive == "true") {
            types = 1;
            ext = null;
        }

        //Api Img
        if (types == 1) {
            showliveimg = true;
        }

        if (!isEmpty(ext)) {
            console.log('Start with: ' + ext + ' with url ' + pp);
            StopP();
            $(div_player).html('<video id="vid1" class="video-js vjs-default-skin" controls></video>'); //controls
            var psp = psp = ['html5', 'flash', "youtube"];
            if (flash == "true") {
                psp = ['flash'];
            }

            JSPlayer = videojs('vid1', {
                //liveui: true,
                techOrder: psp,
                youtube: {
                    "rel": 0,
                    "showinfo": 0,
                    "ecver": 2,
                    "playsinline": 1,
                    "modestbranding": 1,
                    "iv_load_policy": 3,
                    "disablekb": 0,
                    "fs": 0,
                    "controls": 0,
                    "cc_load_policy": 1,
                    "origin": window.location.href, //window.location.origin,
                    "host": `${window.location.protocol}//www.youtube.com`, //'https://www.youtube.com',
                },
                html5: {
                    hls: {
                        overrideNative: true
                    },
                    nativeAudioTracks: false,
                    nativeVideoTracks: false
                },
                sources: [{
                    type: ext,
                    src: pp
                }]
            });
            //JSPlayer.log.level('debug');
            JSPlayer.log.history.clear();
            JSPlayer.log.history.disable();
            JSPlayer.on('ready', function (e) {
                JSPlayer.poster(setimg);
                JSPlayer.pause();
                JSPlayer.muted(true);
                if (setplay == "true") {
                    playvd();
                }
            });
            JSPlayer.on(['play', 'playing', 'durationchange', 'loadedmetadata', 'loadeddata', 'loadstart', 'durationchange', 'canplay', 'canplaythrough', 'waiting', 'ended', 'pause', 'error', 'suspend', 'abort', 'interruptbegin', 'interruptend', 'stalled', 'resize', 'seeked', 'seeking'], function (e) { //ratechange

                isPlaying = e.type;

                //jika error coba debung
                try {
                    var view_error = JSPlayer.error();
                    if (view_error) {
                        console.log("INFO: ", view_error);
                        if (view_error.message.includes("disabled")) {
                            isPlaying = 'disabled';
                        } else if (view_error.message.includes("not supported")) {
                            //yakin?
                            isPlaying = 'disabled';
                        } else if (view_error.message.includes("corruption")) {
                            RunLive(df);
                        } else {
                            bad(view_error.message);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }

                if (dev)
                    console.log(e);

            });

        } else {
            isPlaying = 'disabled';
        }

    } catch (error) {
        return SendLog('Error Load Player: ', error);
    }
}

function playvd() {
    ispause = true;
    try {
        if (!StartLive2) {
            StartLive2 = setTimeout(function () {
                var waitplay = JSPlayer.play();
                if (waitplay !== undefined) {
                    waitplay.then(function (defs) {
                        if (volume > 0.1) {
                            var waitX = JSPlayer.muted(false);
                            if (waitX !== undefined) {
                                waitX.then(function (defs) {
                                    JSPlayer.volume(volume);
                                    ispause = false;
                                })
                            } else {
                                ispause = false;
                            };
                        } else {
                            ispause = false;
                        }
                    }).catch(err => {
                        ispause = true;
                    });
                } else {
                    ispause = true;
                }
            }, 1000 * 3);
        } else {
            clearTimeout(StartLive2);
            StartLive2 = null;
            return playvd();
        }
    } catch (error) {
        console.log(error);
    }
}

var aw;
async function UpdateMe() {

    //jika live gambar ada
    if (!showliveimg) return false;

    //jika live mode aktif jangan pakai snapshot
    if (live_io) return false;

    //jika sedang pause
    if (ispause) return false;

    //jika tiemaslpe sedang jalan
    if (ffisplay) return false;

    try {
        //API Player (Snapshot)
        try {
            window.parent.postMessage({
                "api": "player_update",
                "data": {
                    "count": sereload - pw,
                    "aw": aw
                }
            }, "*");
        } catch (error) {
            console.log('error send data');
        }

        if (!isEmpty(setimg)) {
            if (pw >= sereload) {
                pw = 0;
                aw = await Addimg(setimg, div_live, false, null, null, false, sereload + 2);
            } else {
                pw++;
            }
            if (aw) {
                //cek last error
                if (aw.code !== 200) {
                    SendLog("Error load img");
                } else {
                    displayz[3] = "Updated since " + moment.utc(aw.update).fromNow();
                }
            }
        } else {
            console.log('no url?');
        }
    } catch (e) {
        console.log('Error update img: ', e);
    }
}

function Run_Update(kill = false) {
    if (kill) {
        try {
            clearInterval(Interval_Update);
        } catch (error) {
            console.log('error kill update image');
        }
    } else {
        Interval_Update = setInterval(UpdateMe, 1000);
    }
}

//cek status player
setInterval(function () {

    //console.log("Status: "+isPlaying+" | Image DIV "+showliveimg+" ");

    try {
        if (showliveimg) {
            $(div_live).css("position", "");
            $(div_live).css("display", "");
        } else {
            $(div_live).css("display", "none");
            $(div_live).css("position", "fixed");
        }
        if (ispause) {
            $("#iconplay").attr('class', 'fas fa-play');
        } else {
            $("#iconplay").attr('class', 'fas fa-pause');
        }
    } catch (error) {
        //NOTING HERE
    }

    if (ffisplay)
        return null;

    if (types == 1)
        return null;

    if (types == 6)
        return null;

    if (setplay !== "true")
        return null;

    if (isPlaying == "disabled") {
        showliveimg = true;
        ispause = false;
        if (JSPlayer) {
            try {
                JSPlayer.dispose();
                JSPlayer = null;
            } catch (error) {

            }
        }
        //bad("This camera is not permitted");
        return null;
    }

    if (isPlaying == "pause") {
        playvd();
    } else if (isPlaying == "durationchange" || isPlaying == "resize" || isPlaying == "seeked") {
        //for api noting?
        good();
    } else if (isPlaying == "canplaythrough" || isPlaying == "canplay" || isPlaying == "waiting" || isPlaying == "loadstart") {

        var keep_reload = true;

        if (types == 3) {
            keep_reload = false;
        }

        if (keep_reload) {
            if (countl >= 120) {
                good("reload");
                return RunLive(last_loading);
            } else {
                console.log("wair reload" + countl);
                countl++;
                good("", false);
            }
        } else {
            showliveimg = true;
        }

    } else if (isPlaying == "play" || isPlaying == "playing") {
        good();
    } else {
        bad(isPlaying + " :" + countl);
        countl++;
    }

}, 1000 * 1);

//Automatic Check
setInterval(function () {
    if (cek_broke_link) {
        cek_broke_link = false;
        FastCek();
    }
    try {
        if (types == 3) {
            JSPlayer.currentTime(9999999999999999999999999999999999999);
        }
    } catch (error) {}
}, 1000 * 30);

function FastCek() {
    GetJson(URL_API + "camera/view.json?id=" + camid + "&ceklive=true&token_user=" + token_user)
        .then(c => {
            RunLive(c);
        })
        .catch(error => {
            SendLog("Stream still not available or error load");
        });
}

$('.full').on('click', function () {
    // https://stackoverflow.com/questions/7130397/how-do-i-make-a-div-full-screen
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

//Tombol Download
$('.download').on('click', function (ex) {
    $('.download').children().removeClass('fas fa-download').addClass('fas fa-sync fa-spin');
    $('.download').prop('disabled', true);
    var xhr = new XMLHttpRequest();
    var live = div_live;
    if (!isEmpty(getdiv)) {
        live = "#" + getdiv;
    } else if ($("#vid2_html5_api").length == 1) {
        live = $("#vid2_html5_api");
    }
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

//Tombol settings
$('.kkp').on('click', function (e) {
    if ($('.waz').css('display') == 'none') {
        $(".showme").show();
        $(".goset").hide();
    } else {
        $(".showme").hide();
        $(".goset").show();
    }
})

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


//Tombol settings
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

//Tombol Timelaspe
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
                    var tp = entry.url.replace(/^.*[\\\/]/, '').replace(".mp4", '');
                    if (tp !== "last") {
                        options.push({
                            value: entry.url,
                            label: tp
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
                    OpenTab(4);

                    //Jika Mode Foto
                    if ($('option:selected', this).text() == "Today" || $('option:selected', this).text() == "Daily") {
                        var isjoin = 1;
                        if ($('option:selected', this).text() == "Daily") {
                            isjoin = 3
                        }

                        //Api load type find file
                        $.getJSON(URL_API + "camera/data.json?id=" + camid + "&type=" + isjoin, async function (z) {

                            var options2 = [];
                            $.each(z.file, function (key, entry) {
                                var tp = entry.url.replace(/^.*[\\\/]/, '').replace(".jpg", '');
                                options2.push({
                                    value: entry.url,
                                    label: tp
                                });
                            });
                            options2 = options2.sort(function (a, b) {
                                var x = a['label'];
                                var y = b['label'];
                                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                            });

                            var countx = 0;
                            for (const value of options2) {

                                //jika timer jalan stop lalu hapus?
                                if (timer) {
                                    break;
                                }

                                var datax = await Addimg(URL_CDN + value.value.replace("..", ''), value.label, true, div_tl_raw);
                                countx++;
                                proses(percentage(countx, options2.length));
                                if (datax.code == 200) {
                                    //done
                                    if (countx == options2.length) {

                                        //sort div ke last
                                        tinysort('div' + div_tl_raw + '>img', {
                                            attr: 'id'
                                        });
                                        OpenTab(2);
                                    }
                                } else {
                                    console.log("Error load img: ", datax);
                                }
                            };

                        });

                    } else {

                        //Jika Video API
                        $(div_tl_vd).html('<video id="vid2" class="video-js vjs-default-skin" controls></video>');
                        FSPlayer = videojs('vid2', {
                            plugins: {
                                abLoopPlugin: {}
                            }
                        });
                        var thhis = $('option:selected', this).val().replace("..", '');
                        FSPlayer.src({
                            src: thhis,
                            type: "video/mp4"
                        });
                        FSPlayer.play();
                        OpenTab(3);
                    }

                });
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log('getJSON request failed! ' + textStatus);
            })

        } catch (error) {
            console.log('FF errp: ', error);
        }
    } else {
        $(".gotimelapse").hide();
        OpenTab();
    }
})

function OpenTab(open = 1) {
    try {
        if (open == 1) {
            //player normal
            playt = 'live';
            ffisplay = false;
            timer = false;
            StopP('vid2');
            $(div_player).show();
            $(div_tl_vd).hide();
            $(div_tl_raw).hide();
            $(div_ld).hide();
            $(div_tl_raw).empty();
        } else if (open == 2) {
            //player ff foto
            playt = 'fotott';
            slideIndex = 1;
            myIndex = 0;
            timer = true;
            ffisplay = true;
            StopP('vid2');

            $(div_player).hide();
            $(div_tl_vd).hide();
            $(div_tl_raw).show();
            $(div_ld).hide();
            //$(div_tl_raw).empty();
        } else if (open == 3) {
            //player ff video
            ffisplay = true;
            timer = false;
            playt = 'videott';
            $(div_player).hide();
            $(div_tl_vd).show();
            $(div_tl_raw).hide();
            $(div_ld).hide();
            $(div_tl_raw).empty();
        } else if (open == 4) {
            //loading player
            playt = 'loading';
            timer = false;
            proses(0);
            StopP('vid2');
            $(div_tl_raw).empty();
            $(div_player).show();
            $(div_tl_vd).hide();
            $(div_tl_raw).hide();
            $(div_ld).show();
        }
    } catch (error) {
        console(error);
    }
}

function proses(current_progress) {
    $("#loadingc").css("width", current_progress + "%").attr("aria-valuenow", current_progress).text(current_progress + "% Complete | wait making timelapse...");
}

//Api Control
document.addEventListener('keydown', (event) => {
    //console.log(event.key);
    switch (event.key) {
        case "ArrowLeft":
            MoveTo(-1);
            break;
        case "ArrowRight":
            MoveTo(1);
            break;
        case " ":
            start();
            break;
    }
})

//APi Time Lapse
var tmp = 0;
var file = 1440;
var fps = 30;
var fast = 2;
var getdiv;

function TimeLapse(setimg = null) {
    try {
        var i;
        var x = document.getElementsByClassName("mySlides");

        //tutup yang lain
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }

        if (isEmpty(setimg)) {
            //jika tidak di set gunakan index
            myIndex++;
            if (myIndex > x.length) {
                myIndex = 1
            }
            x[myIndex - 1].style.display = "block";
        } else {
            //jika di set gunakan
            if (setimg > x.length) {
                slideIndex = 1
            }
            if (setimg < 1) {
                slideIndex = x.length
            }
            x[slideIndex - 1].style.display = "block";
            myIndex = slideIndex - 1;
        }
        //udi
        getdiv = x[myIndex - 1].id;

    } catch (error) {
        console.log(error)
    }

}

function MoveTo(n) {
    TimeLapse(slideIndex += n);
}

function SetId(n) {
    TimeLapse(slideIndex = n);
}

//https://stackoverflow.com/a/19773537
//https://stackoverflow.com/a/44013686
setInterval(function () {
    if (!timer)
        return
    try {
        var t = (file / (fps * fast));
        if (tmp >= t) {
            tmp = 0;
            TimeLapse();
        } else {
            tmp++;
        }
    } catch (error) {}
});

//API Play
function start() {
    console.log("Go " + playt + " | " + types);
    if (types == 6) {
        return console.log('not yet supported');
    }

    if (ispause) {
        ispause = false;
    } else {
        ispause = true;
    }

    if (playt == "live") {
        if (types == 1) {} else {
            try {
                if (ispause) {
                    JSPlayer.pause();
                } else {
                    playvd();
                }
            } catch (error) {
                console.log(error);
            }
        }
    } else if (playt == "videott") {
        try {
            if (ispause) {
                FSPlayer.pause();
            } else {
                FSPlayer.play();
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        if (timer) {
            timer = false;
        } else {
            timer = true;
        }
    }
}

$('#set_start').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
});
$('#set_end').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
});

//API IoPlayer
var IoPlayer = io(URL_APP + 'camera', {
    //transports: ['websocket'],
    //upgrade: false
    autoConnect: false
});
IoPlayer.on('connect', function () {
    console.log('player konek');
    live_io = true;
    IoPlayer.emit('access', {
        cam: camid,
        password: "0000"
    });
});
IoPlayer.on('disconnect', function () {
    console.log('player putus');
    live_io = false;
});
IoPlayer.on('stream', function (e) {
    if (e.image) {
        document.getElementById("live").src = 'data:image/jpeg;base64,' + base64ArrayBuffer(e.buffer);
    } else {
        console.log(e.data);
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