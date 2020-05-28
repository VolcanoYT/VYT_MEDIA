var tmpid = true;
var noblock = true;
var idlast;
var searchz = "";
var tp;
var idv;
var errnyt = true;
var isonline = false;
var myprofil;
var timep;
var setcamerasetting;
var setselectidsetting;
$.fn.modal.Constructor.prototype._enforceFocus = function () {};
var isbeta = getAllUrlParams().beta;

//buat ambil info dasar
try {
    var rootz = document.location.pathname.split('/');
    tp = rootz[1]; //type  
    idv = rootz[2]; //id
    var nid = rootz[3]; //.replace("-", " "); //url title 
    if (tp == "volcano") {
        //var namavolcano = $('h1').attr('title');
        if (!isEmpty(idv)) {
            GetMirova(idv);
        }
    }
    timep = Date.now(); //moment().utc().format('YmdH');
} catch (error) {
    console.log(error);
}

// buat cari info
$('.search').on('click', async function (e) {
    console.log(idv + ' | ' + tp);
    var home = false;

    if (tp == 'volcano') {
        if (!isNaN(idv)) {
            tp = 'report'; //TODO: find by report
        }
    }

    if (isEmpty(tp)) {
        const {
            value: firme
        } = await Swal.fire({
            title: 'What do you want to look for?',
            input: 'select',
            inputOptions: {
                camera: 'Camera',
                volcano: 'Volcano',
                report: 'Volcano Daily Report',
                earthquake: 'Earthquake',
            },
            showCancelButton: true,
        })

        if (firme) {
            home = true;
            tp = firme;
        } else {
            return;
        }
    }

    Swal.fire({
        title: 'Search ' + tp + '?',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Look up'
    }).then((result) => {
        console.log(idv + ' | ' + tp + ' | ' + result.value);
        if (result.value) {
            if (tp == 'camera' || tp == 'volcano' || tp == 'report') {

                //TODO: cari laporan dari volcano?
                if (tp == "report") {
                    //tp='volcano'
                    return Swal.fire('currently not available');
                }

                if (!isNaN(idv) || home) {
                    return window.location.replace("/" + tp + "?search=" + result.value);
                }

                $('#load').attr("data-search", result.value);
                $('#load').attr("data-pages", 1);
                $('#post-data').empty(); //blogvolcano
                $('#load').click();
            }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            if (home) {
                tp = "";
            }
        }
    })
})

//ini buat list upload
var lisupload;
var detailRows = [];
function format(d) {
    console.log(d);
    var htmlp = "";
    if (d.type == 1) {
        htmlp = '<div class="form-group"><label>Unique Code</label><input type="text" class="form-control" value="' + d.code + '" readonly></div>';
        htmlp += '<div class="form-group"><label>idyt</label><input type="text" class="form-control" value="' + d.idyt + '" readonly></div>';
        htmlp += '<div class="form-group"><label>refresh_token</label><input type="text" class="form-control" value="' + d.refresh_token + '" readonly></div>';
        htmlp += '<div class="form-group"><label>token</label><input type="text" class="form-control" value="' + d.token + '" readonly></div>';
    }
    return htmlp;
}
$('body').on('click', '.reloadlisupload', async function (e) {
    console.log(e);
    try {
        lisupload.clear().draw();
        lisupload.destroy();
        detailRows = [];
    } catch (error) {

    }
    lisupload = $('#GoListUpload').DataTable({
        "ajax": URL_API + 'camera/upload/view.json' + setcamerasetting,
        "columns": [{
                "class": "detailscm fas fa-chevron-circle-up",
                "orderable": false,
                "data": null,
                "defaultContent": ""
            },
            {
                "data": "idtp"
            },
            {
                mRender: function (data, type, row) {
                    var idtext = "IDK";
                    if (row.activate == 1) {
                        idtext = "Youtube";
                    } else if (row.activate == 2) {
                        idtext = "FTP";
                    }
                    return idtext
                }
            },
            {
                mRender: function (data, type, row) {
                    var idtext = "IDK";
                    if (row.activate == 1) {
                        idtext = row.ytnama;
                    } else if (row.activate == 2) {
                        idtext = row.hostname;
                    }
                    return idtext
                }
            },
            {
                mRender: function (data, type, row) {
                    var idtext = "Not active";
                    if (row.activate == 1) {
                        idtext = "Active";
                    }
                    return idtext
                }
            },
            {
                mRender: function (data, type, row) {
                    var idtext = "Not active";
                    if (row.notif == 1) {
                        idtext = "Active";
                    }
                    return idtext
                }
            },
            {
                mRender: function (data, type, row) {
                    var privacy = 'private';
                    if (row.privacy == 0) {
                        privacy = "public";
                    } else if (row.privacy == 2) {
                        privacy = "unlisted";
                    }
                    return privacy
                }
            }
        ]
    });

    lisupload.on('draw', function () {
        $.each(detailRows, function (i, id) {
            $('#' + id + ' td.detailscm').trigger('click');
        });
    });

})
$('.opensettings').on('shown.bs.modal', function () {
    $(document).off('focusin.modal');
});
$('body').on('click', 'tr td.detailscm', function () {
    var tr = $(this).closest('tr');
    var row = lisupload.row(tr);
    var idx = $.inArray(tr.attr('id'), detailRows);

    if (row.child.isShown()) {
        tr.removeClass('details');
        row.child.hide();

        // Remove from the 'open' array
        detailRows.splice(idx, 1);
    } else {
        tr.addClass('details');
        row.child(format(row.data())).show();

        // Add to the 'open' array
        if (idx === -1) {
            detailRows.push(tr.attr('id'));
        }
    }
});

// ajax add akun youtube buat auto upload
$('body').on('click', '.addaccupload', async function (e) {
    //var id = $(this).attr("data-id");
    const {
        value: open
    } = await Swal.fire({
        title: 'Where do you want to upload it?',
        input: 'select',
        inputOptions: {
            youtubead: 'YouTube',
            ytcode: 'YouTube via Code',
            ftp: 'FTP',
            googledrive: 'Google Drive'
        },
        showCancelButton: true,
    })

    if (open == "youtubead") {

        var newWindow = window.open(URL_API + 'google/login.json' + setcamerasetting + 'autologin=true&gl=youtube', 'VolcanoYT Login', 'width=500,height=800')
        newWindow.focus();
        var pollTimer = window.setInterval(function () {
            if (newWindow.closed !== false) { // !== is required for compatibility with Opera
                window.clearInterval(pollTimer);
                if (errnyt) {
                    Swal.fire({
                        type: 'error',
                        title: 'There is a problem with respon api or user close it'
                    })
                }
            }
        }, 200);
    } else if (open == "ytcode") {

        Swal.fire({
            title: 'Enter Your Unique Code',
            input: 'password',
            inputPlaceholder: '123',
            inputAttributes: {
                maxlength: 16,
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Add'
        }).then((result) => {
            console.log(result);
            if (result.value) {

                $.ajax({
                        url: URL_API + 'google/ytcode.json' + setcamerasetting + 'code=' + result.value,
                        type: "get",
                        cache: false,
                        beforeSend: function () {
                            Swal.showLoading();
                        }
                    })
                    .done(function (c) {
                        console.log(c);
                        if (c.code == 200) {
                            Swal.fire(c.status);
                            $(".reloadlisupload").click();
                        } else {
                            Swal.fire({
                                type: 'error',
                                title: c.status
                            })
                        }

                    })
                    .fail(function (jqXHR, ajaxOptions, thrownError) {
                        Swal.fire({
                            type: 'error',
                            title: 'server not responding...'
                        })
                    });

            } else if (result.dismiss === Swal.DismissReason.cancel) {

            }
        })

    } else {
        Swal.fire({
            type: 'error',
            title: 'Soon ;)'
        })
    }

})

//ajax post-id
$('body').on('click', '.post-id', async function (e) {
    if (!isonline) {
        return;
    }

    e.preventDefault();
    try {
        var id = $(this).attr("data-id");
        var judul = $(this).find("h2").text();
        console.log(judul);

        const {
            value: open
        } = await Swal.fire({
            title: 'What do you want to do?',
            input: 'select',
            inputOptions: {
                link: 'Open Link',
                multiview: 'Multiview',
                settings: 'Settings'
            },
            showCancelButton: true,
        })

        if (open == "multiview") {
            var multi;
            multi = await Swal.fire({
                title: 'Where you put it',
                input: 'select',
                inputOptions: {
                    "t-0": 'Top left',
                    "t-1": 'Top right',
                    "u-0": 'Middle left',
                    "u-1": 'Middle right',
                    "s-0": 'Main Camera',
                    "n-1": 'Camera 1',
                    "n-2": 'Camera 2',
                    "n-3": 'Camera 3',
                    "n-4": 'Camera 4',
                    "n-5": 'Camera 5',
                },
                showCancelButton: true,
            })
            console.log(multi);

            if (multi.value) {
                $.ajax({
                        url: 'https://tapp.volcanoyt.com/bb?query=' + multi.value + '|' + id + '&password=TeamVolcanoYT&user=' + myprofil.username,
                        type: "get",
                        cache: false,
                        beforeSend: function () {
                            Swal.showLoading();
                        }
                    })
                    .done(function (c) {
                        Swal.fire({
                            type: 'success',
                            title: c
                        })
                    })
                    .fail(function (jqXHR, ajaxOptions, thrownError) {
                        Swal.fire({
                            type: 'error',
                            title: 'server not responding...'
                        })
                    });
            }

        } else if (open == "link") {
            location.replace($(this).attr("href"))
        } else if (open == "settings") {
            Swal.fire({
                title: 'Loading...',
                showCancelButton: false,
                showCloseButton: false
            });

            if ($('#putme').is(':empty')) {
                await GetJson("https://volcanoyt.com/html/camset.html")
                    .then(response => {
                        $("#putme").html(response);
                    })
                    .catch(error => {
                        Swal.fire({
                            type: 'error',
                            title: 'Error load Camera settings'
                        })
                        return;
                    });
            }

            setcamerasetting = '?id=' + id + '&token_user=' + myprofil.token.private + '&';
            setselectidsetting = id;
            $.ajax({
                    url: URL_API + 'camera/view.json' + setcamerasetting,
                    type: "get",
                    cache: false,
                    beforeSend: function () {
                        Swal.showLoading();
                    }
                })
                .done(function (c) {
                    console.log(c);
                    if (c.code == 200) {
                        var p = c.data;
                        if (p.user == myprofil.id) {
                            $('#set_id').val(p.id);
                            $('#set_user').val(p.user);
                            $('#set_time_update').val(p.time.now);
                            $('#set_time_published').val(p.time.since);
                            $('#set_time_nextscan').val(p.time.ytnext);
                            $('#set_youtube_link').val(p.ytdl);

                            $("#set_webcam_hide").prop('checked', p.hide);
                            $("#set_webcam_scan").prop('checked', p.scan);
                            $("#set_webcam_makeff").prop('checked', p.timelapse);

                            $('#set_webcam_url').val(p.url);
                            $('#set_webcam_url_backup').val(p.url_backup);

                            $('#set_webcam_youtube_ytid').val(p.ytid);
                            $('#set_webcam_youtube_ytno').val(p.ytno);
                            $('#set_webcam_youtube_ytmp').val(p.ytmp);

                            $('#set_webcam_name').val(p.name);
                            $('#set_webcam_source').val(p.source);
                            $('#set_webcam_source_url').val(p.source_url);
                            $('#set_webcam_embed').val(p.embed);

                            $('#set_webcam_lot_latitude').val(p.location.latitude);
                            $('#set_webcam_lot_longitude').val(p.location.longitude);

                            $('#webcam_description').val(p.info);

                            $('#set_webcam_interval_live option[value=' + p.refresh_live + ']').prop('selected', true);
                            $('#set_webcam_interval_timelaspe option[value=' + p.refresh + ']').prop('selected', true);
                            $('#set_webcam_type option[value=' + p.type + ']').prop('selected', true);
                            $('#set_webcam_timezone option[value="' + p.time.timezone + '"]').prop('selected', true);

                            $('#set_webcam_resolution option[value=' + p.hd + ']').prop('selected', true);
                            $('#set_webcam_quality option[value=' + p.imgquality + ']').prop('selected', true);
                            $('#set_webcam_fps option[value=' + p.fps + ']').prop('selected', true);

                            Swal.close();
                            $('.opensettings').modal('toggle');
                        } else {
                            Swal.fire('You do not have permission for this camera');
                        }
                    } else {
                        Swal.fire({
                            type: 'error',
                            title: c.status
                        })
                    }
                })
                .fail(function (jqXHR, ajaxOptions, thrownError) {
                    Swal.fire({
                        type: 'error',
                        title: 'server not responding...'
                    })
                });
        }

    } catch (error) {
        console(error);
    }
});

$('#type').change(function () {
    var numbrty = $('option:selected', this).val();
    var ytz = $("#youtubeinput");
    var urlp = $("#thisurl");
    if (numbrty == 3) {
        ytz.show();
        urlp.hide();
    } else {
        ytz.hide();
        urlp.show();
    }
    console.log(numbrty);
});

// buat ambil data dari Mirova
function GetMirova(n) {
    $.ajax({
        method: "GET",
        dataType: "json",
        data: {
            id: n
        },
        cache: false,
        url: URL_API + "volcano/stats/mirova.json",
    }).done(function (bb) {
        if (bb && bb.code) {
            if (bb.code == 200) {
                var dataz = [];
                $('<div id="mirova" class="box text-white bg-dark shadow-none mb-3"></div>').insertBefore(".putmehere");
                $.each(bb.results, function (index, value) {
                    dataz.push([value.time * 1000, value.count]);
                });
                var options = {
                    chart: {
                        background: '#343a40',
                        height: 350,
                        type: 'line',
                        shadow: {
                            enabled: true,
                            color: '#000',
                            top: 18,
                            left: 7,
                            blur: 10,
                            opacity: 1
                        }
                    },
                    theme: {
                        mode: 'dark',
                        palette: 'palette1',
                    },
                    //colors: ['#77B6EA', '#545454'],
                    dataLabels: {
                        enabled: true,
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    series: [{
                        name: n,
                        data: dataz
                    }],
                    title: {
                        text: 'Volcanic Hotspot by Mirova',
                        align: 'left'
                    },
                    grid: {
                        borderColor: '#e7e7e7',
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                        },
                    },
                    markers: {
                        size: 6
                    },
                    xaxis: {
                        type: "datetime"
                    },
                    yaxis: {
                        title: {
                            text: 'Mw (Middle Wavelength)'
                        }
                    }
                }
                var chart = new ApexCharts(document.querySelector("#mirova"), options);
                chart.render();
            } else {
                //skip if not found
            }
        } else {
            //skip if not found
        }
    }).fail(function (a) {
        Swal.fire({
            type: 'error',
            title: 'Error load data mirova'
        })
    });
}

// buat loading animasi
function onme(on = true) {
    if (on) {
        $('#load').html('More Data');
        $('#load').prop('disabled', false);
    } else {
        $('#load').prop('disabled', true);
        $('#load').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...');
    }
}

// buat auto scroll
var CheckIfScrollBottom = debouncer(function () {
    if (getDocHeight() == getScrollXY()[1] + window.innerHeight) {
        if ($("#load").length >= 1) {
            //$('#load').click();
        }
    }
}, 500);
document.addEventListener('scroll', CheckIfScrollBottom);
function debouncer(a, b, c) {
    var d;
    return function () {
        var e = this,
            f = arguments,
            g = function () {
                d = null, c || a.apply(e, f)
            },
            h = c && !d;
        clearTimeout(d), d = setTimeout(g, b), h && a.apply(e, f)
    }
}
function getScrollXY() {
    var a = 0,
        b = 0;
    return "number" == typeof window.pageYOffset ? (b = window.pageYOffset, a = window.pageXOffset) : document.body && (document.body.scrollLeft || document.body.scrollTop) ? (b = document.body.scrollTop, a = document.body.scrollLeft) : document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop) && (b = document.documentElement.scrollTop, a = document.documentElement.scrollLeft), [a, b]
}
function getDocHeight() {
    var a = document;
    return Math.max(a.body.scrollHeight, a.documentElement.scrollHeight, a.body.offsetHeight, a.documentElement.offsetHeight, a.body.clientHeight, a.documentElement.clientHeight)
}

//ini buat like
$('body').on('click', '#like,#dislike', function (e) {

    if (!isonline) {
        loginweb();
        return;
    }

    var islike = 0;
    var target = $(this).attr('id');
    if (target == 'like') {
        islike = 1;
        console.log('like me');
    }
    Swal.fire('Wait...');
    $.ajax({
            url: URL_API + 'camera/like.json',
            type: "get",
            cache: false,
            data: {
                token_user: islogin.token_private,
                like: islike,
                id: idv
            },
            beforeSend: function () {
                Swal.showLoading();
            }
        })
        .done(function (c) {
            //TODO update count like?
            Swal.fire({
                type: 'success',
                title: c.status
            })
        })
        .fail(function (jqXHR, ajaxOptions, thrownError) {
            Swal.fire({
                type: 'error',
                title: 'server not responding...'
            })
        });
})

//ini buat koment
$('body').on('click', '#diqus_loader', function (e) {
    // Prepare the trigger and target
    var disqus_trigger = document.getElementById('diqus_loader'),
        disqus_target = document.getElementById('disqus_thread'),
        disqus_embed = document.createElement('script'),
        disqus_hook = (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]);

    // Load script asynchronously only when the trigger and target exist
    if (disqus_target && disqus_trigger) {
        disqus_embed.type = 'text/javascript';
        disqus_embed.async = true;
        disqus_embed.src = '//https-camera-volcanoyt-com.disqus.com/embed.js';
        disqus_hook.appendChild(disqus_embed);
        disqus_trigger.remove();
        console.log('Disqus loaded.');
    }
})

$('body').on('click', '#share', function (e) {
console.log(e);
})

$('body').on('click', '#load', function (e) {
    var a = $(this);
    var getsort = a.attr("data-sort");
    var type = a.attr("data-type");
    var limit = a.attr("data-limit");
    var noallow = a.attr("data-noallow");
    var noallowby = a.attr("data-noallowby");
    var cari = a.attr("data-search");
    var p = parseInt(a.attr("data-pages"));

    if (idlast == p) {
        console.log('sama');
    } else {
        idlast = p;
    }

    $.ajax({
            url: URL_API + type + '/list.json?search=' + cari + '&sort=' + getsort + '&limit=' + limit + '&pages=' + p + '&noallow=' + noallow + '&noallow_by=' + noallowby + '&allow=&allow_by=',
            type: "get",
            cache: false,
            beforeSend: onme(false),
            complete: onme()
        })
        .done(function (c) {
            a.attr("data-pages", c.pages);
            if (c.code == 200) {
                for (let i in c.results) {
                    var data = c.results[i];
                    if (type == "volcano") {
                        var idimg = data.VPImageNum;
                        if (isEmpty(idimg)) {
                            idimg = "error";
                        }
                        $("#post-data").append('<a class="col-xl-3 col-sm-6 mb-3" href="/volcano/' + data.id + '/' + data.seo_url + '"><div class="card bg-dark shadow-none"><img loading="lazy" class="vidt lazyload" data-src="' + URL_API + 'val/' + idimg + '.jpg"><h2 class="card-img-overlay yo">' + data.name + ' (' + data.Country + ')</h2></div></a>');
                    } else if (type == "report") { //alt="' + data.name + '"
                        var eh = '<div class="card shadow-none">';
                        if (!isEmpty(data.pic)) {
                            eh += '<img class="card-img-top lazyload" data-src="' + data.pic + '">';
                        }
                        eh += '<div class="card-body">';
                        if (isEmpty(data.info)) {
                            eh += '<p class="card-text">' + data.title + '</p>';
                        } else {
                            eh += '<h5 class="card-title text-light">' + data.title + '</h5>';
                            eh += '<p class="card-text">' + data.info + '</p>';
                        }
                        eh += '<p class="card-text"><small class="text-muted">' + data.source + ' - ' + data.time.input + ' UTC (<time data-now="' + data.time.input + '"></time>)</small></p>';
                        eh += '</div></div>';
                        $(".blogvolcano").append(eh);
                    } else if (type == "camera") {
                        var nobeta = '<img class="vidt lazyload" id="' + data.id + '" data-src="' + URL_CDN + 'timelapse/' + data.id + '/tumb.jpg?time=' + timep + '">';
                        if (isbeta == 'true') {
                            nobeta = '<video loading="lazy" class="vidt" poster="' + URL_CDN + 'timelapse/' + data.id + '/tumb.jpg?time=' + timep + '" autoplay loop muted playsinline><source src="' + URL_CDN + 'timelapse/' + data.id + '/gif.mp4?time=' + timep + '" type="video/mp4"></video>';
                        }
                        $("#post-data").append('<a class="col-xl-3 col-sm-6 mb-3 post-id" data-id="' + data.id + '" href="/camera/' + data.id + '/' + data.seo_url + '"><div class="card shadow-none">' + nobeta + '<h2 class="card-img-overlay">' + data.name + '</h2></div></a> ');
                    } else {
                        console.log(data);
                    }
                }
            } else {
                Swal.fire({
                    type: 'error',
                    title: type + ': ' + c.status
                })
            }
        })
        .fail(function (jqXHR, ajaxOptions, thrownError) {
            Swal.fire({
                type: 'error',
                title: 'server not responding...'
            })
        });
})

//https://stackoverflow.com/a/8142000
//https://gist.github.com/mbajur/8325540
//https://stackoverflow.com/a/3291931
//https://stackoverflow.com/a/24995065
function loginweb() {
    if (isonline) {
        Swal.fire({
            title: 'Do you want to log out?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00ADFF',
            cancelButtonColor: '#ff0000',
            confirmButtonText: 'Logout'
        }).then((result) => {
            if (result.value) {
                Cookies.remove('profil');
                Cookies.remove('login');
                location.reload(true);
            }
        })
    } else {
        var newWindow = open(URL_API + 'login.php?autoclose=true', 'VolcanoYT Login', 'width=500,height=800')
        newWindow.focus();
        var pollTimer = window.setInterval(function () {
            if (newWindow.closed !== false) { // !== is required for compatibility with Opera
                window.clearInterval(pollTimer);
                if (errnyt) {
                    Swal.fire({
                        type: 'error',
                        title: 'There is a problem with respon api or user close it'
                    })
                }
            }
        }, 200);
    }
}

var lastupdate;
window.onerror = function (err) {
    console.log("Windows Error: ", err);
};

window.addEventListener("message", pesanku, false);
navigator.serviceWorker.addEventListener("message", pesanku, false);

function pesanku(event) {
    if ((event.origin).includes("volcanoyt")) {
        var data = event.data;
        if (data.api == 'login') {
            // ini buat login
            data = data.data;
            errnyt = false;
            if (data.status == "Account Upload Successfully added") {
                $(".reloadlisupload").click();
            } else {
                if (data.code == 200) {
                    Cookies.set('login', JSON.stringify(data));
                    location.reload(true);
                } else {
                    Swal.fire({
                        type: 'error',
                        title: data.status
                    })
                }
            }
        } else if (data.api == 'player_update') {
            // ini data buat update data player dari ie
            data = data.data;
            $("#got").html(' (Update in ' + (data.count) + ' seconds)');
            if (data.aw) {
                if (data.aw.code == 200) {
                    if (lastupdate != data.aw.update) {
                        lastupdate = data.aw.update;
                        $("#updatetm").attr('data-now', data.aw.update);
                    }
                }
            }
        } else if (data.api == 'push') {
            // data disini di kirim lewat push data
            data = data.data;
            if(data.tag == "earthquake"){
                console.log('ini gempa')
            }else if(data.tag == "volcano"){
                console.log('ini volcano')
            }else{
                console.log('raw push: ',data);
            }
            NotifMe(data.title + ': ' + data.body);
        } else {
            console.log("Type Event ini tidak tersedia: ",data);
        }
    } else {
        console.log('Info Bukan dari VolcanoYT: ', event);
    }
}

try {
    // Ping lewat BroadcastChannel (gak di pakai)
    const channel = new BroadcastChannel('sw-volcanoyt');
    channel.addEventListener('message', event => {
        console.log('Received', event);
    });
} catch (error) {

}

//ini buat login
var islogin = tryParse(Cookies.get('login'));
if (islogin && !isEmpty(islogin.token_private)) {
    var dbprofil = tryParse(Cookies.get('profil'));
    if (dbprofil && !isEmpty(dbprofil.name)) {
        setprofil(dbprofil);
    } else {
        $.ajax({
            method: "GET",
            dataType: "json",
            cache: false,
            data: {
                token: islogin.token_private,
                fields: 'account',
                //gtoken: token youtube
            },
            url: URL_API + 'account/v4/access.json',
        }).done(function (data) {
            if (data.code == 200) {
                var cekprofil = data.fields.account;
                Cookies.set('profil', JSON.stringify(cekprofil));
                setprofil(cekprofil);
            } else {
                Swal.fire({
                    type: 'error',
                    title: data.status
                })
            }
        }).fail(function (a) {
            Swal.fire({
                type: 'error',
                title: 'Server Error'
            })
        });
    }
} else {
    console.log('Belum Login');
}

//ini buat set profil jika sudah login atau edit
function setprofil(data) {
    isonline = true;
    var username = data.username;
    $("#loginm").html(' <i class="soc fas fa-user"></i>' + username);
    console.log(data);
    myprofil = data;
}