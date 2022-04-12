var eqwatch = [];
var vvwatch = [];
var pertama = true;
var limit = 4;

var source_volcano = getAllUrlParams().sv;
var name_volcano = getAllUrlParams().nv;
var source_eq = getAllUrlParams().sq;
var read_volcano = getAllUrlParams().rv;
var hidebar = getAllUrlParams().hidebar;
var hidenews = getAllUrlParams().hidenews;
var notifme = getAllUrlParams().notif;

setInterval(async () => {
    time = moment();
    document.getElementById("time").innerHTML = time.format("HH:mm:ss DD/MM/YYYY");
}, 1000 * 1);

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
            upto: 2,
            source: source_eq
        },
        url: URL_API + "earthquake/geo.json",
    }).done(function (data) {
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
                    console.log("Earthquake: Data not available right now.");
                }
            } else {
                console.log(data.meta.status);
            }
        } else {
            console.log("Earthquake: Unknown problem");
        }
    }).fail(function (a) {
        console.log(a);
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
        url: URL_API + "report/list.json",
    }).done(function (data) {
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
    }).fail(function (a) {
        //tifMe("Earthquake: Failed to update!");
    });
}
GetApi();
setInterval(function () {
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

    if (noproblem) {
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
    var counttwo = spawn.properties.count;
    var mystatus = getstatus(spawn.properties.status);

    if (noproblem) {

        console.log(spawn);

        document.getElementById("eqname1").innerHTML = spawn.properties.country;
        document.getElementById("eqname2").innerHTML = spawn.properties.city;
        document.getElementById("eqnum").innerHTML = magnitudetwo;

        document.getElementById("eqtime").innerHTML = "" + timeutc + " UTC";
        document.getElementById("eqtime1").innerHTML = '<time data-now="' + timeutc + '"></time>';

        document.getElementById("eqlocal").innerHTML = " " + lokasi + " | " + depthtwo + "KM";
        document.getElementById("eqstatus").innerHTML = "SC: " + provider + " / " + mystatus + " (" + counttwo + "X)";

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

function loopme() {

    setTimeout(function () {

        document.getElementById("nav-vc-tab").click();

        setTimeout(function () {

            document.getElementById("nav-eq-tab").click();

            // BACK
            setTimeout(function () {
                loopme();
            }, 1000 * 120);

        }, 1000 * 60);

    }, 1000 * 60);
};
loopme();

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
        synth.onvoiceschanged = function () {
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