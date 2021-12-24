var set_url = getAllUrlParams().url;
var set_zona = getAllUrlParams().zona;

moment.tz.setDefault(set_zona);

var time;

setInterval(async () => {
    time = moment();
}, 1000 * 1);

function replaceURLMarkers(url) {

    var hour    = time.format('HH');
    var hour1   = time.subtract(1, "hours").format('HH');
    var minutes = time.format('mm').slice(0, -1);
    var month   = time.format('MM');
    var date    = time.format('DD');
    var yy      = time.format('YY');

    url = url.replace(/###ZZ###/g, minutes);  
    url = url.replace(/###YY###/g, yy);   
    url = url.replace(/###MM###/g, month);
    url = url.replace(/###DD###/g, date);
    url = url.replace(/###HH###/g, hour);
    url = url.replace(/###HH1###/g, hour1);

    return url;
}

async function updatecek() {
    if (time) {
        try {
            GetJson(set_url)
                .then((async (data) => {
                    //console.log(data);
                    for (const b of data) {
                        var info = await get(b);
                    };
                    //TODO: add time wait to next
                    return updatecek();
                }))
                .catch(error => {
                    console.log(error);
                    setTimeout(function () {
                        updatecek();
                    }, 5000);
                });
        } catch (error) {
            console.log(error);
            setTimeout(function () {
                updatecek();
            }, 5000);
        }        
    }else{
        setTimeout(function () {
            updatecek();
        }, 5000);
    }
}
updatecek();

function get(addme) {
    return new Promise(resolve => {
        try {
            var iscc = false;
            var format = 0;
            var wait = 30;
            if (addme.cache) {
                iscc = addme.cache;
            }
            if (addme.format) {
                format = addme.format;
            }
            if (addme.next) {
                wait = addme.next;
            }
            if (format == 0) {
                $(".box").html("<img id='zz'>");
                jQuery.ajax({
                    url: replaceURLMarkers(addme.url),
                    cache: iscc,
                    timeout: 1000 * 10,
                    xhr: function () {
                        var xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob'
                        return xhr;
                    },
                    success: async function (data) {
                        var img = document.getElementById("zz");
                        var url = window.URL || window.webkitURL;
                        try {
                            img.src = url.createObjectURL(data);

                            $('.kiri').text(addme.name);

                            setTimeout(function () {
                                resolve(200);
                            }, 1000 * wait);
                        } catch (error) {
                            console.log(error);
                            resolve(404);
                        }
                    },
                    error: function () {
                        resolve(404);
                    }
                });
            } else if (format == 1) {
                $('.kiri').text(addme.name);
                $(".box").html("<video id='video' autoplay muted><source src='" + addme.url + "' type='video/mp4'></video>");
                var myVideo = document.getElementsByTagName("video")[0];
                myVideo.addEventListener("ended", function () {
                    resolve(200);
                }, true);
            }

        } catch (error) {
            resolve(405);
        }
    });
}