var setscene = getAllUrlParams().scene;
var seturl = getAllUrlParams().URL;
var token_user = getAllUrlParams().token_user;

if (!isEmpty(seturl)) {
    console.log('URL Proxy: ', seturl);
    URL_APP = seturl;
}

var multiview = io(URL_APP + 'multiview', {
    query: {
        scene: setscene,
        token_user: token_user,
        version: '1.0.6',
        referrer: document.referrer
    },
    transports: ['websocket']
});
multiview.on('disconnect', function () {
    $("#namax").html('Connect to Multiview Web...');
})
multiview.on('connect', function () {
    $("#namax").html('Connect to Multiview Web...');
    /*
    multiview.emit('access', {
        scene: setscene,
        source: setsource,
    });
    */
})
multiview.on('error', (error) => {
    console.log(error);
});
multiview.on('request', function (x) {
    if (x.code == 200) {
        if (x.info) {
            x.info.forEach((source, index_scene) => {
                var idcam = source.idcam;
                $("body").append('<div class="source" id="' + idcam + '"><div id="box"></div><iframe width="100%" height="100%" src="' + URL_API + 'spanel/player.php?cam=' + idcam + '&autoplay=true&info=true&URL=' + seturl + '"></iframe></div>');
                //$('#'+idcam).draggable().resizable(); 
                //$("body").append('<iframe class="source" id="' + idcam + '" src="' + URL_API + 'spanel/player.php?cam=' + idcam + '&autoplay=true&info=true&URL=' + seturl + '"></iframe>');
            })
        } else {
            console.log('no info');
        }
    }
    console.log(x);
});

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
                var target = event.target
                var x = (parseFloat(target.getAttribute('data-x')) || 0);
                var y = (parseFloat(target.getAttribute('data-y')) || 0);
                target.style.width = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';
                x += event.deltaRect.left;
                y += event.deltaRect.top;
                target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            end(event) {
                console.log(event);
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
                var target = event.target;
                var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            end(event) {
                console.log(event);
            }
        }
    })