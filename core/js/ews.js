var ewsio;
var gps = {
    isfake: true,
    lat: "",
    lot: ""
};

//Get GPS
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition, showError);
} else {
    NotifMe("Geolocation is not supported by your browser.");
}

function showPosition(position) {
    SetGPS(position.coords.latitude, position.coords.longitude);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            NotifMe("Geolocation: your denied request!!!")
            break;
        case error.POSITION_UNAVAILABLE:
            NotifMe("Geolocation: Location information is unavailable.")
            break;
        case error.TIMEOUT:
            NotifMe("Geolocation: Request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            NotifMe("Geolocation: An unknown error occurred.")
            break;
    }
}

//https://stackoverflow.com/a/29544442
function getAvg(grades) {
    const total = grades.reduce((acc, c) => acc + c, 0);
    return total / grades.length;
}

//API Sensor
var isno = true;
var args = {
    frequency: 100, // ( How often the object sends the values - milliseconds )
    gravityNormalized: true, // ( If the gravity related values to be normalized )
    orientationBase: GyroNorm.WORLD, // ( Can be GyroNorm.GAME or GyroNorm.WORLD. gn.GAME returns orientation values with respect to the head direction of the device. gn.WORLD returns the orientation values with respect to the actual north direction of the world. )
    decimalCount: 2, // ( How many digits after the decimal point will there be in the return values )
    logger: null, // ( Function to be called to log messages from gyronorm.js )
    screenAdjusted: true // ( If set to true it will return screen adjusted values. )
};
var gn = new GyroNorm();

var sampel = [];
var event = [];

gn.init(args).then(function () {
    gn.start(function (data) {
        var isAvailable = gn.isAvailable();
        try {

            /*
            //send to server
            if (isAvailable.accelerationAvailable) {
                var send = {
                    gps: gps,
                    acceleration: data,
                    isAvailable: isAvailable
                };
                ewsio.emit('user_ews', send);
            }
*/

            /*
                        https://stackoverflow.com/questions/19627392/understanding-device-motion-data-received-from-event-acceleration-in-js
                        https://ds.iris.edu/ds/nodes/dmc/data/formats/seed-channel-naming/
                        https://www.mathworks.com/help/supportpkg/android/ref/accelerometer.html
                        Buat belajar http://repository.uinjkt.ac.id/dspace/bitstream/123456789/5825/1/Fauzi-FST_NoRestriction.pdf
            */
            //TODO: save time_step & with multi channel
            var time = Math.floor(Date.now() / 1000);
            sampel.push(data.dm.y);

            $('#x').html(data.dm.x); // LNX (Datar) (Merah)
            $('#y').html(data.dm.y); // LNY (Kiri-Kanan) (Hijau)
            $('#z').html(data.dm.z); // LNZ (Atas-Bawah) (Biru)

            /*
            Moment Tensor (https://gfzpublic.gfz-potsdam.de/rest/items/item_272892/component/file_541895/content)
            Mekanisme fokus gempa menggambarkan deformasi di wilayah sumber yang menghasilkan gelombang seismik.
            */
            var x = data.dm.x; // In degree in the range [-180,180]
            var y = data.dm.y; // In degree in the range [-90,90]
            var ball = document.querySelector('.ball');
            var garden = document.querySelector('.garden');
            var maxX = garden.clientWidth - ball.clientWidth;
            var maxY = garden.clientHeight - ball.clientHeight;
            if (x > 90) {
                x = 90
            };
            if (x < -90) {
                x = -90
            };
            x += 90;
            y += 90;
            ball.style.top = (maxY * y / 180 - 10) + "px";
            ball.style.left = (maxX * x / 180 - 10) + "px";

            /*
            Ada 2 macam gelombang badan, yaitu gelombang primer atau gelombang P (primary wave) dan gelombang sekunder atau gelombang S (secondary wave). Gelombang P atau gelombang mampatan (compression wave),

            coba ambil sampel primer dulu selama 5 detik lalu cek lagi gelombang primer jika sampel tidak terputus selama 2 detik pada saat last primer ubah data primer jadi secondary dan seterusnya.... sampai tidak ada gelombang berlanjutan...
            */

            //primer (50x100ms=5000 milliseconds aka 5 seconds)
            var intervalo = 5;
            if (sampel.length == 50) {

                //Fungsi Math.max() mengembalikan nilai terbesar dari zero atau lebih besar.
                gal = Math.max(...sampel);

                //https://www.bgs.ac.uk/discoveringGeology/hazards/earthquakes/magnitudeScaleCalculations.html
                //ML = logA + 2.56logD - 1.67
                var magnitude = (Math.log10(gal) + 3 * Math.log10(8 * intervalo) - 2.92).toFixed(2);
                $('#magnitude').html(magnitude);

                /*
                https://www.bmkg.go.id/gempabumi/skala-mmi.bmkg
                https://en.wikipedia.org/wiki/Gal_(unit)
                https://www.quora.com/What-are-units-of-amplitude
                */
                $('#gal').html(gal);

                //save event sementara
                if (magnitude > 0.89) {

                    var between_time = 0;
                    var last_sampel;

                    if (event.length > 0) {
                        //ambil last sampel
                        last_sampel = event[event.length - 1];
                        //cek waktu last_sampel dan sekarang
                        between_time = time - last_sampel.time;
                    } else {
                        //belum ada event gempa?
                    }

                    //console.log("Event: "+time+" | cek "+between_time+" sec",last_sampel);

                    if (between_time == intervalo) {
                        //secondary
                        console.log('Gempa masih lanjut...');
                        //jika gempa masih berlanjut update event "last_sampel" dan data kasih masuk di secondary dan nilai ini sebagi gempa jauh (bukan lokal?)
                        for (var j in event) {
                            if (event[j].time == last_sampel.time) {
                                Array.prototype.push.apply(event[j].secondary, sampel);
                                event[j].historian.push({
                                    gal: gal,
                                    magnitude: magnitude,
                                    time: time,
                                });
                                event[j].time = time;
                                break;
                            }
                        }
                    } else {
                        //primer
                        console.log('Gempa baru setelah lewat ' + between_time + ' detik lalu');
                        event.push({
                            sampel: sampel,
                            secondary: [],
                            historian: [],
                            primer: {
                                gal: gal,
                                magnitude: magnitude,
                            },
                            time: time
                        });
                    }

                }

                //send notif
                if (gal >= 2.9 && gal <= 10) {
                    NotifMe("Terjadi gempa skala intensitas BMKG 1 (Tidak dirasakan) dengan PGA : " + gal + " gal");
                } else if (gal >= 10 && gal <= 88) {
                    NotifMe("Terjadi gempa skala intensitas BMKG II (Dirasakan) dengan PGA : " + gal + " gal");
                } else if (gal > 88 && gal <= 167) {
                    NotifMe("Terjadi gempa skala intensitas BMKG III (kerusakan ringan) dengan PGA : " + gal + " gal");
                } else if (gal > 167 && gal <= 564) {
                    NotifMe("Terjadi gempa skala intensitas BMKG IV (kerusakan sedang) dengan PGA : " + gal + " gal");
                } else if (gal > 564) {
                    NotifMe("Terjadi gempa skala intensitas BMKG V (kerusakan berat) dengan PGA : " + gal + " gal");
                }

                //hapus sampel
                while (sampel.length > 0) {
                    sampel.pop();
                }
            }

            //local view data seimo
            if (document.getElementById("local") !== null) {
                if (isAvailable.accelerationAvailable) {
                    addstream('local', [data.dm.x, data.dm.y, data.dm.z]);
                    isno = true;
                } else {
                    //addstream('local',[Math.floor(Math.random() * 30),Math.floor(Math.random() * 50),Math.floor(Math.random() * 200)]);
                    if (isno) {
                        var c = document.getElementById("local");
                        var ctx = c.getContext("2d");
                        ctx.font = "15px Arial";
                        ctx.fillText("Sensor on this system is not available", 10, 30);
                        isno = false;
                    }
                }
            }

        } catch (e) {
            console.log(e);
        }
    });
}).catch(function (e) {
    console.log(e);
});

//API Socket
ewsio = io(URL_APP + 'ews', {
    transports: ['websocket'],
    upgrade: false
});
ewsio.on('disconnect', function () {
    if (document.getElementById("putmap") !== null) {
        $('#isonline').html("Offline");
    }
    NotifMe("Disconnect to network!");
    socketrun = false;
})
ewsio.on('connect', function () {
    if (document.getElementById("putmap") !== null) {
        $('#isonline').html("Online");
    }
    NotifMe("Connect to network!");
    socketrun = true;
})
ewsio.on('error', (error) => {
    NotifMe(error);
});
ewsio.on('info', function (x) {
    OnData(x);
});

//New Data Info
function OnData(x) {
    console.log(x);
    datap = x.data;

    if (document.getElementById("map") !== null) {
        if (x.type == "earthquake") {
            var loc = L.latLng(datap.eq_lat, datap.eq_lon);
            map.setView(loc, 8);
            circle.setLatLng(loc);
        }
    } else if (document.getElementById("putmap") !== null) {
        if (x.type == "earthquake") {
            var loc = L.latLng(datap.eq_lat, datap.eq_lon);
            var whereeq = '' + Number(datap.distance).toFixed(2) + ' miles of ' + datap.city + ' - ' + datap.country + '';
            var toutc = datap.data;
            var loctxt = '' + (datap.eq_lat).toFixed(4) + ',' + (datap.eq_lon).toFixed(4) + '';
            $('#timeutc').html('<time data-now="' + toutc + '">' + toutc + '</time>');
            $('#mag').html((datap.magnitude).toFixed(2));
            $('#tymag').html(datap.mt);
            $('#deep').html((datap.depth).toFixed(0));
            $('#loc').html(loctxt);
            var fulltext = 'Earthquake Info ' + datap.mt + ':' + datap.magnitude + ', ' + toutc + ', Lok: ' + loctxt + ' (' + whereeq + '), depth: ' + datap.depth + 'Km #' + datap.provider + '';
            $('#infolengkap').html(fulltext);
            OnMap(loc, whereeq);
        } else {
            var loc = L.latLng(datap.latitude, datap.longitude);
            var info = datap.info;
            //var sumber = datap.source;

            $('#vcjudul').html(datap.nama);
            $('#fullvc').html(datap.info);
            $('#timevc').html('<time data-now="' + datap.date_input + '">' + datap.date_input + '</time>');
            $('#lvvc').html(OnStatus(datap.status));
            $('#elevation').html(datap.elevation);
            $('#typesvc').html(datap.types);
            OnMap(loc, info, 'tmpvc', "vcmap");
        }
    }
}

//Set Map
function OnMap(latp, judul, idtmp = "ewsmap", idreal = "putmap", iscircle = true) {
    $('#' + idreal + '').html('<div id="' + idtmp + '"></div>');
    var map = L.map(idtmp, {
        zoomControl: false,
        attributionControl: false,
        keyboard: false,
        dragging: false,
        boxZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        tap: false,
        touchZoom: false,
    }).setView(latp, 6);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 12,
        minZoom: 3
    }).addTo(map);
    var showicon = URL_CDN + 'core/img/magnitude.png';
    if (idreal == "vcmap") {
        showicon = URL_CDN + 'core/img/volcano.png';
    }
    var eqicon = L.icon({
        iconUrl: showicon,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [18, 14], // point of the icon which will correspond to marker's location
    });
    L.marker(latp, {
        icon: eqicon
    }).addTo(map).bindPopup(judul).openPopup();
    if (iscircle) {
        var counter = 0;
        var i = setInterval(function () {
            circle.setRadius(counter);
            counter = counter + 1000;
            if (counter > 70000) {
                counter = 0;
            }
        }, 30);
        var circle = L.circle(latp, 70000, {
            weight: 3,
            color: '#ff185a',
            opacity: 0.75,
            fillColor: '#ff185a',
            fillOpacity: 0.25
        }).addTo(map);
    }
}

//Volcano Status
function OnStatus(level) {
    if (level == 1) {
        return "Normal";
    } else if (level == 2) {
        return "Unrest";
    } else if (level == 3) {
        return "Minor";
    } else if (level == 4) {
        return "Eruption";
    } else if (level == 5) {
        return "Danger";
    } else {
        return "Unknown";
    }
}

//Set GPS
function SetGPS(Latitude, Longitude, isfake = false) {
    try {
        gps.lat = Latitude;
        gps.lot = Longitude;
        gps.isfake = isfake;
    } catch (error) {
        console.log(error);
    }
}

$.getJSON(URL_APP + 'warning', function (data) {
    try {
        for (let b in data) {
            OnData({
                "type": b,
                "data": data[b]
            });
        }
    } catch (error) {
        console.log(error);
    }
});
$.getJSON('https://json.geoiplookup.io', function (data) {
    try {
        SetGPS(data.latitude, data.longitude, true);
    } catch (error) {
        console.log(error);
    }
});