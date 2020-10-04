var setscene = getAllUrlParams().scene;
var setsource = getAllUrlParams().source;
var ismultiview = false;

var tmpid = 0;

var seturl = getAllUrlParams().URL;
if (!isEmpty(seturl)) {
    console.log('URL Proxy: ', seturl);
    URL_APP = seturl;
}

var multiview = io(URL_APP + 'multiview');
multiview.on('disconnect', function () {
    $("#namax").html('Connect to Multiview Web...');
})
multiview.on('connect', function () {
    $("#namax").html('Connect to Multiview Web...');
    multiview.emit('access', {
        scene: setscene,
        source: setsource,
    });
})
multiview.on('error', (error) => {
    console.log(error);
});
multiview.on('request', function (x) {    
    $("#namax").html(x.message);
    var start_move=false;
    var idtmp = 0;
    //cek apakah respon 200
    if (x.code == 200) {
        //cek apakah ada info
        if(x.info){
            //list info
            $("#namax").html("This Source does not have a camera, please type in chat !bot cam "+setscene+" "+setsource+" idcam ");
            x.info.forEach((item_add, index_scene) => {
                //jika ada nama source
                if (item_add.source == setsource) {
                    start_move = true;
                    idtmp = item_add.idcam;
                }
            })
        }else{
            console.log('no info');
        }
    }
    if (start_move) {
        if(tmpid !== idtmp){
            tmpid = idtmp;
            $("#put").html('<iframe src="' + URL_API + 'spanel/player.php?cam=' + idtmp + '&autoplay=true&info=true"></iframe>');
            $("#namax").html("");
        }else{
            console.log('skip sama saja??');
        }        
    }
    console.log(x);
});