var tp;
var idv;

var errnyt = true;
var isonline = false;
var myprofil;

var timep;
$.fn.modal.Constructor.prototype._enforceFocus = function () {};

//buat ambil info dasar
try {
    var rootz = document.location.pathname.split('/');
    tp = rootz[1]; //type  
    idv = rootz[2]; //id
    var nid = rootz[3]; //.replace("-", " "); //url title 
    if (tp == "volcano") {
        //var namavolcano = $('h1').attr('title');
        if (!isEmpty(idv)) {
            //GetMirova(idv);
        }
    }
    timep = Date.now(); //moment().utc().format('YmdH');
} catch (error) {
    console.log(error);
};

// buat cari info
$('.search').on('click', async function (e) {
    console.log(idv + ' | ' + tp);

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
    });

    Swal.fire({
        title: 'Search ' + firme + '?',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Look up'
    }).then((result) => {
        console.log(idv + ' | ' + firme + ' | ' + result.value);
        if (result.value) {
            return window.location.replace("/" + firme + "?search=" + result.value);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            //batal
        }
    })
});

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
});

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
/*
window.onerror = function (err) {
    console.log("Windows Error: ", err);
};
*/
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
            if(data.type == 'live'){
                $("#get_live").html("("+data.count+"  Watching)");
                $("#get_message").html('<h6>Message:</h6>'+data.message);
            }else if(data.type == 'message'){
                $("#get_message").html('<h6>Message:</h6>'+data.message);
            }
            
        } else if (data.api == 'push') {
            // data disini di kirim lewat push data
            data = data.data;
            if (data.tag == "earthquake") {
                console.log('ini gempa')
            } else if (data.tag == "volcano") {
                console.log('ini volcano')
            } else {
                console.log('raw push: ', data);
            }
            NotifMe(data.title + ': ' + data.body);
        } else {
            console.log("Type Event ini tidak tersedia: ", data);
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