var wait = ms => new Promise((r, j) => setTimeout(r, ms));

var date1 = convertTZ("09/19/2021", "Atlantic/Canary");

setInterval(function () {
    var abc = convertTZ(new Date(), "Atlantic/Canary");

    // To calculate the time difference of two dates
    var Difference_In_Time = abc.getTime() - date1.getTime();

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    document.getElementById("atas").innerHTML = "Time: " + formatDate(abc) + " (" + Difference_In_Days.toFixed(0) + " day)";
}, 1000 * 1);
async function updatecek() {

    var abc = convertTZ(new Date(), "Atlantic/Canary");
    var hour = ("0" + abc.getHours()).slice(-2);
    var hour1 = ("0" + (hour - 1)).slice(-2);
    var month = ("0" + (abc.getMonth() + 1)).slice(-2);
    var date = ("0" + abc.getDate()).slice(-2);

    try {
        var url = [
            /*
            {
        url: 'https://video.twimg.com/tweet_video/FA92EpHVcAc-EX3.mp4',
        name: 'MAP',
        format: 1
    },
    {
        url: 'https://video.twimg.com/ext_tw_video/1445056680300064773/pu/vid/640x360/qZzhmy9VZPs5-VRZ.mp4?tag=12',
        name: 'Drone Video 1 (03/10/21)',
        format: 1
    }, 
    {
        url: 'https://video.twimg.com/ext_tw_video/1445367018258042883/pu/vid/1280x720/1czvQwuclhD3p3e3.mp4?tag=12',
        name: 'Drone Video 2 (03/10/21)',
        format: 1
    },  
    {
        url: 'https://video.twimg.com/amplify_video/1444807060013658112/vid/1280x720/uclHOYcF4r2k--7P.mp4?tag=14',
        name: 'Drone Video 3 (03/10/21)',
        format: 1
    }, 
    */
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/DIA/PA01_2021-' + month + '-' + date + '_F1.jpg',
                name: 'STA TBT (La Palma) (24 hour)',
            },
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/HORA/PA01_2021-' + month + '-' + date + '_' + hour1 + '-' + hour + '_F1.jpg',
                name: 'STA TBT (1 hour)',
            },
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/DIA_SP/PA01_2021-' + month + '-' + date + '_sp_F1.jpg',
                name: 'STA TBT (24 hour)'
            },
            {
                url: 'https://www.ign.es/web/resources/volcanologia/DATOS/2021/' + month + '/PA01/imagenes_sismica/HORA_SP/PA01_2021-' + month + '-28_' + hour1 + '-' + hour + '_sp_F1.jpg',
                name: 'STA TBT (1 hour)'
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/SIS/jpg/PA_SIS_rsam_CENR_07_s.jpg',
                name: 'RSAM (La Palma)',
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/GPS/jpg/PA_GPS_LP04_90d.png',
                name: 'GPS LP4 90 day',
            },
            {
                url: 'http://www.ign.es/web/resources/volcanologia/GPS/jpg/PA_GPS_LP03_90d.png',
                name: 'GPS LP3 90 day',
            },
            /*
            {
                url: 'http://www.ign.es/resources/sismologia/www/estaciones_sismicas/ruido_sismico/ES.TBT..HHZ.png',
                name: 'Seismic Noise',
            },     
            {
                url: 'https://pbs.twimg.com/media/FAWw7kSXIAM_fEG?format=jpg&name=medium', // TODO AUTO
                name: 'Map by @CopernicusEMS (08:08 green)',
                cache: true,
            }, 
            {
                url: 'https://pbs.twimg.com/media/FAZPeZ2VQAUp-8p?format=jpg&name=medium', // TODO AUTO
                name: 'Map by @CabLaPalma (12:00 blue)',
                cache: true,
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/386/raw.jpg',
                name:'La Palma (C1)'
            },*/
            {
                url: 'https://cdn.volcanoyt.com/timelapse/390/raw.jpg',
                name: 'La Palma (C4)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/391/raw.jpg',
                name: 'La Palma (C5)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/395/raw.jpg',
                name: 'La Palma (C8)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/396/raw.jpg',
                name: 'La Palma (C9)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/403/raw.jpg',
                name: 'La Palma (C10)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/404/raw.jpg',
                name: 'La Palma (C11)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/406/raw.jpg',
                name: 'La Palma (C13)'
            },
            {
                url: 'https://cdn.volcanoyt.com/timelapse/407/raw.jpg',
                name: 'La Palma (C14)'
            },
            /*
            { 
                url: 'https://volcanoes.usgs.gov/vsc/captures/kilauea/RIMD-24h.png',
                name:'STA RIMD (Kilauea) (24 hour)'
            },
            { 
                url: 'https://volcanoes.usgs.gov/vsc/captures/kilauea/RIMD-6h.png',
                name:'STA RIMD (6 hour)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/221/raw.jpg',
                name:'Kilauea (KWcam)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/345/raw.jpg',
                name:'Kilauea (S1cam)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/16/raw.jpg',
                name:'Kilauea (F1cam)'
            },
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/401/raw.jpg',
                name:'Kilauea (KPcam)'
            },
            */
            /*
            { 
                url: 'https://cdn.volcanoyt.com/timelapse/287/raw.jpg',
                name:'Mount Kea (View Kilauea)'
            },
            */
        ];
        for (const b of url) {
            var info = await get(b);            
        };
        return updatecek();
    } catch (error) {

    }
}

function formatDate(date) {
    return date.getFullYear() + '/' +
        (date.getMonth() + 1) + '/' +
        date.getDate() + ' ' +
        date.getHours() + ':' +
        date.getMinutes() + ':' +
        date.getSeconds()
}

function get(addme) {
    return new Promise(resolve => {
        try {
            var iscc = false;
            var format = 0;
            var wait = 30;
            if (addme.cache) {
                iscc = addme.cache;
            }
            if(addme.format){
                format = addme.format;
            }
            if(addme.next){
                wait = addme.next;
            }
            if (format == 0) {
                $("#gg").html("<img id='zz'>");
                jQuery.ajax({
                    url: addme.url,
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

                            $('#namax').text(addme.name);

                            setTimeout(function(){ resolve(200); }, 1000*wait);
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
                $('#namax').text(addme.name);
                $("#gg").html("<video id='video' autoplay muted><source src='"+addme.url+"' type='video/mp4'></video>");
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
updatecek();

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
        timeZone: tzString
    }));
}