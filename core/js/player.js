var FSPlayer;
var IoPlayer;

var div_player = "#player";
var div_ld = "#loading";
var div_live = "#live";
var div_tl_raw = "#player_timelapse_raw";
var div_tl_vd = "#player_timelapse_video";

var myIndex = 0;
var slideIndex = 1;
var timer = false;

var playt = "live";

var ffisplay = false;

var types;

var camid = getAllUrlParams().cam;

var setvol = getAllUrlParams().audio;
var volume = parseFloat(setvol / 100);

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
                                var tpX = entry.url.replace(/^.*[\\\/]/, '').replace(".jpg", '');
                                options2.push({
                                    value: entry.url,
                                    label: tpX
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

// Api OpenTab
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
        console.log(error);
    }
}

// Api Proses Loading Raw Timelaspe
function proses(current_progress) {
    $("#loadingc").css("width", current_progress + "%").attr("aria-valuenow", current_progress).text(current_progress + "% Complete | wait making timelapse...");
}

//Api Control FF
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

// APi Time Lapse Raw
var tmp = 0;
var file = 1440;
var fps = 30;
var fast = 2;
var getdiv;

function TimeLapse(Z = null) {
    try {
        var i;
        var x = document.getElementsByClassName("mySlides");

        //tutup yang lain
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }

        if (isEmpty(Z)) {
            //jika tidak di set gunakan index
            myIndex++;
            if (myIndex > x.length) {
                myIndex = 1
            }
            x[myIndex - 1].style.display = "block";
        } else {
            //jika di set gunakan
            if (Z > x.length) {
                slideIndex = 1
            }
            if (Z < 1) {
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

// Tombol Play API
function start() {

    return console.log('not yet supported');
    
}

$('#set_start').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
});
$('#set_end').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
});

//API IoPlayer
var noenter= true;
var IoPlayer = io(URL_APP + 'camera');
IoPlayer.on('connect', function () {
    IoPlayer.emit('access', {
        cam: camid,
        token_user: token_user
    });
});
IoPlayer.on('disconnect', function () {
    $("#error").html('<div class="alert alert-primary" role="alert"><h3>Camera disconnected</h3></div>');
});
IoPlayer.on('stream', function (e) {
    if (e.image) {
        document.getElementById("live").src = 'data:image/jpeg;base64,' + base64ArrayBuffer(e.buffer);
        if(noenter){
            noenter = false;
            $("#error").html('');
        }
    } else {
        console.log(e.data);
        noenter = true;
        $("#error").html('<div class="alert alert-primary" role="alert"><h3>'+e.data.message+'</h3></div>');
        
        // API Player (Live)
        try {
            if (typeof e.data.online !== "undefined") {
                window.parent.postMessage({
                    "api": "player_update",
                    "data": {
                        "type": "live",
                        "count": e.data.online,
                        "message": e.data.message
                    }
                }, "*");            
            } else {
                window.parent.postMessage({
                    "api": "player_update",
                    "data": {
                        "type": "message",
                        "message": e.data.message
                    }
                }, "*");
            }
        } catch (error) {
            console.log('error send data');
        }
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