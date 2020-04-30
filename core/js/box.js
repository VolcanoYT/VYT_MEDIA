var camerasan;
var namaserver = "Unknown";
var idcamp = 0;
var bb = $("#showme");

var nama = getAllUrlParams().nama;
var camnam = getAllUrlParams().camn;

//var hidehd = getAllUrlParams().hidehd;
var hidebt = getAllUrlParams().hidebt;
var uproxy = getAllUrlParams().uproxy;

var flash = getAllUrlParams().flash;
var rtyt = getAllUrlParams().rtyt;

//var byjam = getAllUrlParams().byjam;
//var bysource = getAllUrlParams().bysource;

var boxio = io('https://app.volcanoyt.com/box', {
    transports: ['websocket'],
    upgrade: false
});

if (!isEmpty(nama)) {
    namaserver = nama;
}

//NET API
boxio.on('disconnect', function(e) {
    console.log("disconnect", e);
    online(false, "Disconnected with Box: " + namaserver);
})
boxio.on('connect', function(e) {
    console.log("konek: ", e);
    AutoIndex();
})
boxio.on('error', (error) => {
    console.log(error);
    online(false, "Error 1");
});

//Box API
boxio.on('request', function(data) {
    if (data) {
        if (data.box == namaserver) {
            CameraMove(data.cam);
        }
    }
});

function CameraMove(idp) {
    online();
    idcamp = idp;
    if (idp == "random") {
        bb.html('<iframe src="https://api.volcanoyt.com/spanel/random.html?update=' + new Date().getTime() + '"></iframe>');
    } else if (idp == "blank") {
        bb.html('');
    } else {
        bb.html('<iframe src="https://api.volcanoyt.com/spanel/player.php?cam=' + idp + '&autoplay=true&mute=0&hidebt=' + hidebt + '&tp=raw&force=true&flash=' + flash + '&rtyt=' + rtyt + '&uproxy=' + uproxy + '"></iframe>');
        //versi=' + Math.floor(Date.now() / 1000) + '&//&byjam=' + byjam + '&bysource=' + bysource + '&uproxy=' + uproxy + '&hidehd=' + hidehd + '
    }
}

function online(online = true, pesan = "", nextindex = false) {
    if (!isEmpty(pesan)) {
        $('#namax').text(pesan);
    } else {
        $('#namax').text("");
    }
    if (online) {
        $("#info").hide();
        $("#namax").hide();
    } else {
        $("#info").show();
        $("#namax").show();
    }
    //jika gagal cari index
    if (nextindex) {
        setTimeout(function() {
            AutoIndex();
        }, 1000 * 10);
    }
}

function AutoIndex() {
    $.ajax({
        method: "GET",
        dataType: "json",
        cache: false,
        url: "https://app.volcanoyt.com/scene",
        data: {
            name: namaserver
        }
    }).done(function(data) {
        try {
            if (!isEmpty(data)) {
                CameraMove(data[0].idcam);
            } else {
                online(false, "No Camera Index", true);
                //console.log(data);               
            }
        } catch (error) {
            online(false, "Big Error AutoIndex: " + namaserver, true);
        }
    }).fail(function(a) {
        online(false, "fail index: " + namaserver, true);
    });
}