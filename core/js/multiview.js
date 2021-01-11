console.log('Browser: ', navigator.userAgent);
console.log('Cookies: ', Cookies.get());

var token_user = getAllUrlParams().token_user;
var setuser = getAllUrlParams().user;
var setscene = getAllUrlParams().scene;
var setpass = getAllUrlParams().password;

var seturl = getAllUrlParams().URL;
var isauto = getAllUrlParams().autoplay;
var isremotonly = getAllUrlParams().remotonly;

var isadmin = getAllUrlParams().admin;

var watchlog    = getAllUrlParams().watchlog;
var isreconnect = getAllUrlParams().reconnect;
var isnopower   = getAllUrlParams().nopower;

var can_draggable = false;
var can_resizable = false;

if(isadmin == 'true'){
    can_draggable = true;
    can_resizable = true;
}

var edit_mode = false;
var is_not_load = true;
var data_config_tmp = [];
var join_tmp = [];

var config = {
    scene: "",
    password: "",
    user: ""
};

//costum api connect
if (!isEmpty(seturl)) {
    console.log('URL Proxy: ', seturl);
    URL_APP = seturl;
}

//config auto
if (!isEmpty(setscene)) {
    $('#join_room .join').val(setscene);
}
if (!isEmpty(setpass)) {
    $('#join_room .password').val(setpass);
}
if (!isEmpty(setuser)) {
    $('#join_room .name').val(setuser);
}

if (isremotonly == "true") {
    $('#edit').hide();
}

if (isauto == "true") {
    setTimeout(function () {
        $('#join_room .proses').trigger('click');
    }, 3000);
} else {
    //auto show
    login();
}

var multiview = io(URL_APP + 'multiview', {
    query: {
        version: '1.1.0',
        referrer: document.referrer
    },
    transports: ['websocket']
});
multiview.on('disconnect', function () {
    Toastify({
        text: "Disconnect to Multiview Web...",
    }).showToast();
})
multiview.on('connect', function () {
    Toastify({
        text: "Connect to Multiview Web...",
    }).showToast();

    //reconnect
    if (!isEmpty(config.scene)) {
        login(config);
    }
})
multiview.on('error', (error) => {
    Toastify({
        text: "Error Multiview, Check log",
    }).showToast();
    console.log('Error Multiview: ', error);
});
multiview.on('request', function (request) {

    console.log('request ', request);

    if (!isEmpty(request.message)) {
        Toastify({
            text: request.message,
        }).showToast();
    }
    config = join_tmp;
    join_tmp = "";
    lock(false);

    if (request.code == 200) {
        $('#join_room').modal('hide');
        $('#add_camera').modal('hide');
        if (!isEmpty(request.source)) {

            var name_scene = request.data.name;
            request.source.forEach((source, index_source) => {

                var idurl = source.url;
                var idsource = source.id;
                var type = source.type;
                var name = source.source;
                var scene = source.scene;

                var html = "";
                var urlz = "";
                var edits = "display: none;";
                var htmlbox = '' + name + ' (' + idurl + ')';
                if (type == 1) {
                    urlz = URL_API + 'spanel/player.php?cam=' + idurl + '&token_user=' + token_user + '&watchlog='+watchlog+'&reconnect='+isreconnect+'&autoplay=true&nopower='+isnopower+'&URL=' + seturl;
                    html = '<iframe src="' + urlz + '"></iframe>';
                } else {
                    console.log('come soon');
                }

                var doc = document.getElementById(idsource);
                if (doc == null) {

                    //no player no frame
                    if (isremotonly == "true") {
                        html = "";
                        edits = "display: block;";
                    }

                    $("#load_source").append('<div class="source" id="' + idsource + '" data-type="' + type + '" data-url="' + idurl + '" data-source="' + name + '" data-scene="' + name_scene + '" data-id-scene="' + scene + '"><div class="box text-center noselect" style="' + edits + '">' + htmlbox + '</div>' + html + '</div>');

                } else {

                    //hanya tag type saja yang boleh ubah jika doc sudah ada
                    if (!isEmpty(request.type)) {

                        //jika sumber edit
                        if (request.type == "edit_source") {

                            //all
                            var main = $('#' + idsource);
                            if (main.attr('id') !== idsource) {
                                main.attr('id', idsource);
                            }
                            if (main.attr('data-type') !== type) {
                                main.attr('data-type', type);
                            }
                            if (main.attr('data-url') !== idurl) {
                                main.attr('data-url', idurl);
                                main.find(".box").html(htmlbox);
                            }
                            if (main.attr('data-source') !== name) {
                                main.attr('data-source', name);
                            }
                            if (main.attr('data-scene') !== name_scene) {
                                main.attr('data-scene', name_scene);
                            }
                            if (main.attr('data-id-scene') !== scene) {
                                main.attr('data-id-scene', scene);
                            }

                            //offlince camera
                            if (type == 1) {
                                var sub = $('#' + idsource + " > iframe");
                                if (sub.attr('src') !== urlz) {
                                    sub.attr('src', urlz);
                                }
                            }

                        } else {
                            Toastify({
                                text: "Come soon " + request.type,
                            }).showToast();
                        }
                    }

                }

                //reconfig
                if (type == 1) {
                    load_source([source]);
                }

                //check after end list
                if ((request.source.length - 1) == index_source) {

                    //make sure source config not duplicated
                    if (is_not_load) {
                        is_not_load = false;

                        // Api Load force config localhost
                        //load_source(tryParse(Cookies.get(nama_ck)));
                    }
                }
            });
        }
    }
    /*
    else if (request.code == 0 || request.code == 1) {
        //if code 0 or 1 try reconnect
        login();
    }*/
});

//user join manual
$('#join_room .proses').on('click', function (e) {
    var set_scene = $('#join_room .join').val();
    var set_passs = $('#join_room .password').val();
    var set_npass = $('#join_room .password_new').val();
    var set_what = $('#join_room .what').val();
    var set_user = $('#join_room .name').val();
    if (!isEmpty(set_scene)) {
        /*
        if (config.scene == set_scene) {
            Toastify({
                text: "You are in room (2)",
            }).showToast();
        } else {
        }
        */
        //clear source
        $('#load_source').html("");

        //normal cek
        if (set_what == 3) {
            if (isEmpty(set_npass)) {
                //return;
            }
        }

        var d = {
            scene: set_scene,
            password: set_passs,
            new_pass: set_npass,
            type: set_what,
            user: set_user
        };

        console.log(d);

        //login yok
        login(d);
    } else {
        Toastify({
            text: "Please type a name room like 'main' or 'merapi'",
        }).showToast();
    }
});

function lock(lock = true) {
    $("form :input").attr("disabled", lock);
    $('.proses').attr("disabled", lock);
}

function login(join = null) {
    if (isEmpty(join)) {
        $('#join_room').modal('show');
    } else {
        if (isEmpty(join_tmp)) {
            lock();
            Toastify({
                text: "Start Login...",
            }).showToast();
            multiview.emit('update', {
                type: 'join',
                data: join,
            });
            join_tmp = join;
        } else {
            Toastify({
                text: "You've tried logging in, please wait",
            }).showToast();
        }
    }
}

interact('.source')
    .resizable({
        edges: {
            left: true,
            right: true,
            bottom: true,
            top: true
        },
        listeners: {
            move(event) {
                if (can_resizable)
                    save_source(event, "resizable");
            },
            end(event) {
                if (can_resizable)
                    save_source(event, "resizable", false);
            }
        },
        modifiers: [
            interact.modifiers.restrictSize({
                min: {
                    width: 100,
                    height: 50
                }
            })
        ],
        inertia: true
    })
    .draggable({
        listeners: {
            move(event) {
                if (can_draggable)
                    save_source(event, "draggable");
            },
            end(event) {
                if (can_draggable)
                    save_source(event, "draggable", false);
            }
        }
    })

function load_source(load_scene) {
    if (!isEmpty(load_scene)) {
        load_scene.forEach((item) => {
            var target = document.getElementById(item.id);
            if (target) {
                target.style.width = item.width + 'px';
                target.style.height = item.height + 'px';
                target.style.transform = 'translate(' + item.x + 'px,' + item.y + 'px)';
                target.setAttribute('data-x', item.x);
                target.setAttribute('data-y', item.y);
            } else {
                Toastify({
                    text: "This Source not load because not find id source",
                }).showToast();
            }
        });
    } else {
        Toastify({
            text: "There are no files for load scene",
        }).showToast();
    }
}

function save_source(event, name, islive = true) {

    var target = event.target;
    var id = target.getAttribute('id');

    var x = (parseFloat(target.getAttribute('data-x')) || 0);
    var y = (parseFloat(target.getAttribute('data-y')) || 0);

    if (name == "draggable") {
        var x = x + event.dx;
        var y = y + event.dy;
    }
    if (name == "resizable") {
        target.style.width = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';
        x += event.deltaRect.left;
        y += event.deltaRect.top;
    }

    target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

    var set_passs = $('#join_room  .password').val();
    var set_user = $('#join_room  .name').val();

    var data = {
        source: target.getAttribute('data-source'),
        scene: target.getAttribute('data-scene'),
        url: target.getAttribute('data-url'),
        type: target.getAttribute('data-type'),
        x: x,
        y: y,
        width: parseInt($(target).width()),
        height: parseInt($(target).height())
    }

    if (!islive) {
        //console.log(JSON.stringify(data));
        //Save to Local
        /*
        var new_data = true;
        data_config_tmp.forEach((item, index) => {
            if (item.source == id) {
                new_data = false;
                data_config_tmp[index] = data;
                return;
            }
        });
        if (new_data) {
            data_config_tmp.push(data);
        }
        Cookies.set(nama_ck, JSON.stringify(data_config_tmp));
        */
        //Save to Server

        data.user = set_user;
        data.password = set_passs;
        data.obs_remot = ""; //TODO: edit obs

        console.log('config save: ', data);
        if (multiview) {
            multiview.emit('update', {
                type: 'config',
                data: data
            });
        }
    }
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

// API Edit
$('#edit').on('click', function (ex) {
    if (edit_mode) {
        edit_mode = false;
        $('.box').css("display", "none");
    } else {
        edit_mode = true;
        $('.box').css("display", "block");
    }
});

// API Add Camera
$('#add_camera .proses').on('click', function (e) {

    var set_scene = $('#join_room .join').val();
    var set_passs = $('#join_room .password').val();
    var set_user = $('#join_room .name').val();
    var set_source = $('#add_camera .set_source').val();
    var set_url = $('#add_camera .set_url').val();
    var set_obs_remot = $('#add_camera .set_obs_remot').val();
    var what_use = $('#add_camera .what_use').val();

    if (what_use == '1') {

        var po = $("div[data-url='" + set_url + "']");
        var newor_old = $("div[data-source='" + set_source + "']");
        var can_use = false;

        if (po.length >= 1) {
            if (newor_old.length >= 1) {

                var atsc = po.attr('data-source');
                var urls = po.attr('data-url');

                var stsc = newor_old.attr('data-source');
                var srls = newor_old.attr('data-url');

                Swal.fire({
                    title: 'Do you want to switch source?',
                    text: 'Source ' + atsc + ' (' + urls + ') > ' + stsc + ' (' + srls + ')',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.isConfirmed) {

                        multiview.emit('update', {
                            type: 'add',
                            data: {
                                scene: set_scene,
                                password: set_passs,
                                source: stsc,
                                url: urls,
                                type: 1,
                                user: set_user
                            }
                        });
                        multiview.emit('update', {
                            type: 'add',
                            data: {
                                scene: set_scene,
                                password: set_passs,
                                source: atsc,
                                url: srls,
                                type: 1,
                                user: set_user
                            }
                        });

                    }
                })
            }else{
                can_use = true;
            }
        }else{
            can_use = true;
        }

        if(can_use){
            multiview.emit('update', {
                type: 'add',
                data: {
                    scene: set_scene,
                    password: set_passs,
                    source: set_source,
                    url: set_url,
                    obs_remot: set_obs_remot,
                    type: 1,
                    user: set_user
                }
            });
        }

    } else {
        Toastify({
            text: "Come soon (Add Camera)",
        }).showToast();
    }

})

$('#what_use').change(function (e) {
    wtf = $(this).val();
    console.log(wtf);
    if (wtf == "1") {
        $('#set_obs_remot').parent().hide();
    } else if (wtf == "2") {

    } else if (wtf == "3") {
        $('#set_obs_remot').parent().show();
    }
});

$("#load_source").on('dblclick', '.source', function (e) {
    //Code here
    console.log("source doubleClick", e);
    $('#add_camera').modal('show');
});

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