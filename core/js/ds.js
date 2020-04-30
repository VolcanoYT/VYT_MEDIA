var eqwatch = [];
var vvwatch = [];
var pertama = true;
var limit = 10;
var en = getAllUrlParams().en;
var source_volcano = getAllUrlParams().sv;
var name_volcano = getAllUrlParams().nv;
var source_eq = getAllUrlParams().sq;
var read_volcano = getAllUrlParams().rv;
var hidebar = getAllUrlParams().hidebar;
var hidenews = getAllUrlParams().hidenews;
var notifme = getAllUrlParams().notif;
if (hidebar == "true") {
    $('.bar').css("display", "none");
}
if (hidenews == "true") {
    $('.ticker-wrap').css("display", "none");
}
/*
if(en == 'id'){
    en = 'Google Bahasa Indonesia';
}else{
    en='Google US English';
}
*/
if (isEmpty(en)) {
    en = 'en';
}
if (en == 'id') {
    moment.locale('id-ID');
}

var got = {
    features: {
        paginate: false,
        recordCount: false,
        sorting: false,
        search: false
    }
};
$('#volcano').dynatable(got);
$('#gempa').dynatable(got);

function GetApi() {
    $('.ticker').html('');
    $.ajax({
        method: "GET",
        dataType: "json",
        data: {
            update: localDate,
            limit: limit,
            upto: 2.4,
            source: source_eq
        },
        url: URL_API+"earthquake/geo.json",
    }).done(function(data) {
        if (data && data.meta) {
            if (data.meta.code == 200) {
                if (data.features) {
                    data.features.sort(comp);
                    for (let b in data.features) {
                        if (b == data.features.length - 1) {
                            add(data.features[b], true);
                        } else {
                            add(data.features[b]);
                        }
                    }
                    GetVolcano();
                } else {
                    // NotifMe("Earthquake: Data not available right now.");
                }
            } else {
                // NotifMe(data.meta.status);
            }
        } else {
            // NotifMe("Earthquake: Unknown problem");
        }
    }).fail(function(a) {
        //tifMe("Earthquake: Failed to update!");
    });
}

function comp(a, b) {
    return new Date(a.properties.time).getTime() - new Date(b.properties.time).getTime();
}

function comp2(a, b) {
    return new Date(a.time.input).getTime() - new Date(b.time.input).getTime();
}

function GetVolcano() {
    $.ajax({
        method: "GET",
        dataType: "json",
        data: {
            update: localDate,
            limit: limit,
            allow: source_volcano,
            allow_by: 'source',
            search: name_volcano,
        },
        url: URL_API+"report/list.json",
    }).done(function(data) {
        if (data && data.results) {
            data.results.sort(comp2);
            for (var b in data.results) {
                if (b == data.results.length - 1) {
                    vv(data.results[b], true);
                } else {
                    vv(data.results[b]);
                }
            }
        } else {
            // NotifMe("Earthquake: Unknown problem");
        }
    }).fail(function(a) {
        //tifMe("Earthquake: Failed to update!");
    });
}
GetApi();
setInterval(function() {
    try {
        GetApi();
    } catch (error) {
        console.log(error);
    }
}, 30000);

function vv(spawn, audio = false) {
    var ecid = spawn.id;
    var noproblem = true;
    for (var j in vvwatch) {
        if (vvwatch[j].id == ecid) {
            noproblem = false;
            break
        }
    }

    var list = $('#volcano');

    var timelocal = moment.utc(spawn.time.input, 'YYYY-MM-DD HH:mm:ss') //.local();
    var lefttime = timelocal.local().fromNow();
    var fff = spawn.title.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/#/g, "").replace(/[{()}]/g, ''); //.replace (/:/g, "");

    if (hidenews !== "true") {
        $('.ticker').prepend('<div class="s">Volcano ' + spawn.name + ': ' + fff + ' (' + spawn.time.input + ' UTC) (' + spawn.source + ')</div>');
    }

    if (noproblem) {
        if (notifme == "true") {
            //$('.eqinfo').html('<div class="alert alert-warning" role="alert"><h2>' + spawn.name + ': ' + fff + '<br>' + lefttime + ' (' + spawn.source + ')</h2></div>');
            //setTimeout(() => $('.eqinfo').html(''), 1000 * 30);
        }
        if (en == 'id') {
            if (spawn.source == "Mirova") {
                fff = 'Titik panas ' + spawn.mirova.power + 'mw terdeteksi dekat gunung pada ' + lefttime;
            }
        }
        if (audio) {
            if (read_volcano == 'true') {
                //NotifMe("", fff, "", true, en, 0.8)
                    //saySomething(fff,en);
                    /*
                    listaudio.push({
                        url: fff,
                        volume: 0.8,
                        en:en,
                        type:2
                      });

                      listaudio.push({
                        url: "ini sudah",
                        volume: 0.8,
                        en:en,
                        type:2
                      });
                      */
            } else {
                //NotifMe("", 'there is activity volcano ' + spawn.name + ' occurred on ' + lefttime + '', "", true, en, 0.8)
            }

        }
        var vv = '<tr><th scope="row"><time data-now="' + spawn.time.input + '"></time> - ' + spawn.name + ': ' + fff + '</th></tr>';
        cek(list, vv);
        vvwatch.push({
            spawn: spawn,
            id: ecid
        });
    } else {
        //TODO: update volcano
    }
}

function add(spawn, audio = false) {
    var ecid = spawn.id;
    var noproblem = true;
    for (var j in eqwatch) {
        if (eqwatch[j].id == ecid) {
            noproblem = false;
            break
        }
    }

    var list = $('#gempa');

    var latx = spawn.geometry.coordinates[1];
    var lotx = spawn.geometry.coordinates[0];
    var lokasi = '' + latx + ", " + lotx + '';
    var whereeq = spawn.properties.title;
    var timeutc = spawn.properties.time;
    var timelocal = moment.utc(timeutc, 'YYYY-MM-DD HH:mm:ss').local();
    var lefttime = timelocal.local().fromNow();
    var provider = spawn.properties.sources;
    var mt = spawn.properties.magType;
    var magnitude = spawn.properties.mag;
    var magnitudetwo = Number(magnitude).toFixed(1);
    var depth = spawn.geometry.coordinates[2];
    var depthtwo = Number(depth).toFixed(0);
    var mystatus = getstatus(spawn.properties.status);

    if (hidenews !== "true") {
        $('.ticker').prepend('<div class="s">Earthquake ' + mt + '' + magnitudetwo + ' in ' + whereeq + ' with depth ' + depthtwo + ' km (' + timeutc + ' UTC) (' + provider + ')</div>');
    }

    if (noproblem) {
        var pesan = 'earthquake occurred in ' + whereeq + ' with magnitude ' + magnitudetwo + '  status ' + mystatus + ' and a Depth of ' + depthtwo + ' kilometers   occurred on ' + lefttime + ' source by ' + provider + '';
        if (en == 'id') {
            pesan = 'telah terjadi gempa bumi di ' + whereeq + ' dengan besarnya ' + magnitudetwo + '  dan Kedalaman ' + depthtwo + ' kilometer pada ' + lefttime + ' sumber dari ' + provider + ''
        }
        var pesangempa = "Info Earthquake";
        if (en == 'id') {
            pesangempa = "Gempa Bumi";
        }
        if (audio) {
            //NotifMe("", pesan, "", true, en, 0.8)
            if (notifme == "true") {
                $('.eqinfo').html('<div class="lindu"><h3 class="margin-bottom-10 center felt">' + pesangempa + '</h3><h5 class="center">' + timeutc + ' UTC (' + provider + ')</h5><div id="map"></div><ul class="infolindu"><li><img src="https://warning.bmkg.go.id/img/magnitude.png">' + mt + '' + magnitudetwo + '</li> <li><img src="https://warning.bmkg.go.id/img/kedalaman.png">' + depthtwo + ' km<span>Kedalaman</span></li><li><img src="https://warning.bmkg.go.id/img/koordinat.png">' + whereeq + '</li></ul>');

                var map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([latx, lotx], 6);
                L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                    maxZoom: 12,
                    minZoom: 3
                }).addTo(map);
                var marker = L.marker([latx, lotx]).addTo(map);

                var counter = 0;
                var i = setInterval(function() {
                    circle.setRadius(counter);
                    counter = counter + 1000;
                    if (counter > 70000) {
                        counter = 0;
                    }
                }, 30);

                var circle = L.circle([latx, lotx], 70000, {
                    weight: 3,
                    color: '#ff185a',
                    opacity: 0.75,
                    fillColor: '#ff185a',
                    fillOpacity: 0.25
                }).addTo(map);
                setTimeout(function() {
                    $('.eqinfo').html('');
                }, 1000 * 20);
            }
        }
        var vv = '<tr><th scope="row"><time data-now="' + timeutc + '"></time> - ' + mt + '' + magnitudetwo + ' (' + depthtwo + 'Km) | ' + whereeq + ' | ' + provider + ' with ' + mystatus + '</th></tr>'; //(<time data-now="'+timeutc+'"></time>)
        cek(list, vv);
        eqwatch.push({
            spawn: spawn,
            id: ecid
        });
    } else {
        //TODO: update eq
    }
}

function cek(list, vv) {
    list.prepend(vv);
    /*
    var listc = list.children('tr > th').detach().get();    
    listc.sort(function(a, b) {
    return new Date($(a).data("date")) - new Date($(b).data("date"));
    });
    list.append(listc);
    */
    if (list.children().length > limit + 1) {
        list.children().last().remove();
    }
}

function getstatus(data) {
    if (data == "0") {
        return "Automatic";
    } else if (data == "1") {
        return "Preliminary";
    } else if (data == "2") {
        return "Confirmed";
    } else if (data == "3") {
        return "Update";
    } else {
        return "Unknown";
    }
}

function saySomething(whatToSay, s = "Google US English") {
    const synth = window.speechSynthesis;
    // enter your voice here, because voices list loads asynchronously.. check the console.log below.
    getVoice(s, synth)
        .then(voice => {
            var utterThis = new SpeechSynthesisUtterance(whatToSay);
            utterThis.voice = voice;
            synth.speak(utterThis);
        })
        .catch(error => console.log("error: ", error));
}

function getVoice(voiceName, synth) {
    return new Promise((resolve, reject) => {
        synth.onvoiceschanged = function() {
            const voices = synth.getVoices();

            console.log("see all available languages and voices on your system: ", voices);

            for (let i = 0; i < voices.length; i++) {
                if (voices[i].name == voiceName) {
                    resolve(voices[i]);
                }
            }
        }
        synth.getVoices();
    });
}