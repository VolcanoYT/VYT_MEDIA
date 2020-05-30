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

function addZero(x, n) {
    while (x.toString().length < n) {
        x = "0" + x;
    }
    return x;
}

var event_tab = $('#event').DataTable();

//API Sensor
var isno = true;
var args = {
    frequency: 100, // ( How often the object sends the values - milliseconds )
    gravityNormalized: true, // ( If the gravity related values to be normalized )
    orientationBase: GyroNorm.WORLD, // ( Can be GyroNorm.GAME or GyroNorm.WORLD. gn.GAME returns orientation values with respect to the head direction of the device. gn.WORLD returns the orientation values with respect to the actual north direction of the world. )
    screenAdjusted: true // ( If set to true it will return screen adjusted values. )
};
var gn = new GyroNorm();

var sampel = [];
var event = [];

gn.init(args).then(function () {
    gn.start(function (data) {
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
                        https://mobiforge.com/design-development/html5-mobile-web-device-orientation-events
                        Buat belajar http://repository.uinjkt.ac.id/dspace/bitstream/123456789/5825/1/Fauzi-FST_NoRestriction.pdf
            */

            //TODO: save time_step & with multi channel
            // timestamp is UTC?
            var time = Math.floor((new Date()).getTime() / 1000);

            var d = new Date();
            var x = document.getElementById("ztime");
            var h = addZero(d.getUTCHours(), 2);
            var m = addZero(d.getUTCMinutes(), 2);
            var s = addZero(d.getUTCSeconds(), 2);
            var ms = addZero(d.getUTCMilliseconds(), 3);
            x.innerHTML = h + ":" + m + ":" + s + ":" + ms;

            sampel.push(data.dm.x);

            $('#x').html(data.dm.x); // LNX (Datar) (Merah)
            $('#y').html(data.dm.y); // LNY (Kiri-Kanan) (Hijau)
            $('#z').html(data.dm.z); // LNZ (Atas-Bawah) (Biru)

            /*
            Moment Tensor (https://gfzpublic.gfz-potsdam.de/rest/items/item_272892/component/file_541895/content)
            Mekanisme fokus gempa menggambarkan deformasi di wilayah sumber yang menghasilkan gelombang seismik.
            # https://stackoverflow.com/a/48750814
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

                /*
                https://www.bmkg.go.id/gempabumi/skala-mmi.bmkg
                https://en.wikipedia.org/wiki/Gal_(unit)
                https://www.quora.com/What-are-units-of-amplitude
                Fungsi Math.max() mengembalikan nilai terbesar dari zero atau lebih besar.
                */
                gal = Math.max(...sampel);

                //nilai awal
                var between_time = 0;
                var timeeq = intervalo;

                //sampel awal
                var last_sampel;

                //cek last event
                if (event.length > 0) {

                    //ambil last sampel
                    last_sampel = event[event.length - 1];

                    //cek waktu last_sampel dan sekarang
                    between_time = time - last_sampel.update;

                    //jika gempa masih lanjut hitung di sini waktunya?
                    if (between_time == intervalo) {
                        timeeq = time - last_sampel.input;
                    }

                }

                /*
                https://www.bgs.ac.uk/discoveringGeology/hazards/earthquakes/magnitudeScaleCalculations.html
                ML = logA + 2.56logD - 1.67
                Base https://github.com/UFOP-CSI477/2019-02-atividades-tulio-s-jardim/blob/master/AtvPrat01/js/03-richter.js#L22
                */
                var magnitude = (Math.log10(gal) + 3 * Math.log10(8 * timeeq) - 2.92).toFixed(2);

                //mulai ambil event
                if (gal > 0.1) {

                    $('#nogempa').hide();
                    $('#adagempa').show();

                    //cek skala
                    var skala = "I";
                    if (gal >= 2.9 && gal <= 10) {
                        //no noise here
                    } else if (gal >= 10 && gal <= 88) {
                        skala = "II";
                    } else if (gal > 88 && gal <= 167) {
                        skala = "III";
                    } else if (gal > 167 && gal <= 564) {
                        skala = "IV";
                    } else if (gal > 564) {
                        skala = "V";
                    }

                    if (between_time == intervalo) {
                        console.log('gempa lama...');
                        //secondary: jika gempa masih berlanjut update event "last_sampel" dan data kasih masuk di secondary dan nilai ini sebagi gempa jauh (bukan lokal?)
                        for (var j in event) {
                            if (event[j].update == last_sampel.update) {
                                Array.prototype.push.apply(event[j].secondary, sampel);
                                event[j].historian.push({
                                    gal: gal,
                                    magnitude: magnitude,
                                    time: time,
                                });
                                event[j].update = time;
                                event[j].eqtime = timeeq;
                                try {
                                    /*
                                    var id = t.row('[id=' + symbol + ']').index();
                                    t.cell({
                                        row: id,
                                        column: 2
                                    }).data(response.c).draw(false);
                                    */
                                   //TODO: update rata-rata disini
                                    event_tab.row('#' + event[j].input).data([
                                        moment.unix(event[j].input).utc().format('YYYY-MM-DD HH:mm:ss'),
                                        moment.unix(time).utc().format('YYYY-MM-DD HH:mm:ss'),
                                        event[j].primer.magnitude,
                                        event[j].primer.gal,
                                        event[j].primer.skala,
                                        event[j].eqtime
                                    ]).draw();
                                } catch (error) {
                                    console.log('error add tab', error);
                                }
                                break;
                            }
                        }
                    } else {
                        //primer jika gempa masih baru
                        event.push({
                            sampel: sampel,
                            secondary: [],
                            historian: [],
                            primer: {
                                gal: gal,
                                magnitude: magnitude,
                                intensity: skala
                            },
                            update: time,
                            input: time,
                            eqtime: timeeq
                        });

                        try {
                            event_tab.row.add([
                                moment.unix(time).utc().format('YYYY-MM-DD HH:mm:ss'),
                                "wait...",
                                magnitude,
                                gal,
                                skala,
                                timeeq
                            ]).node().id = time;
                        } catch (error) {
                            console.log('error add tab', error);
                        }

                        event_tab.draw(false);
                    }

                    $('#intensity').html(skala);
                    $('#timep').html(timeeq);
                    $('#magnitude').html(magnitude);
                    $('#gal').html(gal);

                    if (gal >= 2.9) {
                        NotifMe("Terjadi gempa skala intensitas " + skala + " dengan PGA: " + gal + " gal (" + timeeq + " detik)");
                    }

                } else {
                    $('#nogempa').show();
                    $('#adagempa').hide();
                }

                //hapus sampel
                while (sampel.length > 0) {
                    sampel.pop();
                }
            }

            //local view data seimo
            if (document.getElementById("local") !== null) {
                addstream('local', [data.dm.x, data.dm.y, data.dm.z]);
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