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
    if (x.code == 200) {        
        if(x.info){
            x.info.forEach((source, index_scene) => {
                $("body").html('<iframe data-cam="' + source.cam + '" src="' + URL_API + 'spanel/player.php?cam=' + source.cam + '&autoplay=true&info=true"></iframe>');
            })
        }else{
            console.log('no info');
        }
    }    
    console.log(x);
});