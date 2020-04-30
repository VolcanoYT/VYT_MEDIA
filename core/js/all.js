const delay = ms => new Promise(res => setTimeout(res, ms));
var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
    },
    decode: function (e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base64._utf8_decode(t);
        return t
    },
    _utf8_encode: function (e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    },
    _utf8_decode: function (e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }
}
var usemp3 = false;
var socketrun = false;
var socket;
var context;
var userLang = navigator.language || navigator.userLanguage;
console.log(userLang);
var localDate;
var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Unknown Browser", this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown Version", this.OS = this.searchString(this.dataOS) || "Unknown OS"
    },
    searchString: function (i) {
        for (var n = 0; n < i.length; n++) {
            var r = i[n].string,
                t = i[n].prop;
            if (this.versionSearchString = i[n].versionSearch || i[n].identity, r) {
                if (-1 != r.indexOf(i[n].subString)) return i[n].identity
            } else if (t) return i[n].identity
        }
    },
    searchVersion: function (i) {
        var n = i.indexOf(this.versionSearchString);
        if (-1 != n) return parseFloat(i.substring(n + this.versionSearchString.length + 1))
    },
    dataBrowser: [{
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
    }, {
        string: navigator.userAgent,
        subString: "OmniWeb",
        versionSearch: "OmniWeb/",
        identity: "OmniWeb"
    }, {
        string: navigator.vendor,
        subString: "Apple",
        identity: "Safari",
        versionSearch: "Version"
    }, {
        prop: window.opera,
        identity: "Opera",
        versionSearch: "Version"
    }, {
        string: navigator.vendor,
        subString: "iCab",
        identity: "iCab"
    }, {
        string: navigator.vendor,
        subString: "KDE",
        identity: "Konqueror"
    }, {
        string: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
    }, {
        string: navigator.vendor,
        subString: "Camino",
        identity: "Camino"
    }, {
        string: navigator.userAgent,
        subString: "Netscape",
        identity: "Netscape"
    }, {
        string: navigator.userAgent,
        subString: "MSIE",
        identity: "Explorer",
        versionSearch: "MSIE"
    }, {
        string: navigator.userAgent,
        subString: "Gecko",
        identity: "Mozilla",
        versionSearch: "rv"
    }, {
        string: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
    }],
    dataOS: [{
        string: navigator.platform,
        subString: "Win",
        identity: "Windows"
    }, {
        string: navigator.platform,
        subString: "Mac",
        identity: "Mac"
    }, {
        string: navigator.userAgent,
        subString: "iPhone",
        identity: "iPhone/iPod"
    }, {
        string: navigator.platform,
        subString: "Linux",
        identity: "Linux"
    }]
};
BrowserDetect.init();
var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i)
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i)
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i)
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i)
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i)
    },
    any: function () {
        return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()
    }
};

try {
    context = new AudioContext();
} catch (e) {
    console.log(e);
    usemp3 = true;
}

try {
    document.querySelector('button').addEventListener('click', function () {
        context.resume().then(() => {
            console.log("Playback resumed successfully");
        });
    });
} catch (error) {
    //tidak harus di pakai   
}
setInterval(function () {
    localDate = Math.floor(new Date().getTime() / 1000);
    try {
        $('#mytime').text("" + moment().utc().format('YYYY/MM/DD HH:mm:ss') + " GMT | " + moment().format('YYYY/MM/DD HH:mm:ss') + " LocalTime");
    } catch (error) {
        //tidak harus di pakai 
    }
}, 1000);

async function GetJson(url, loop = 2, cache = false) {
    return new Promise(async (resolve, reject) => {
        for (var i = 1; i <= loop; i++) {
            jQuery.ajax({
                url: url,
                cache: cache,
                success: function (data, status, xhr) {
                    return resolve(data);
                },
                error: function (jqXHR, textStatus) {
                    console.log('getJSON request failed! (' + i + ')', textStatus);
                }
            });
            await delay(1000 * 5);
        }
        reject(false);
    })
}

function sendme(status, message, password) {
    try {
        socket.emit('admin', {
            status: status,
            message: message,
            password: password
        });
    } catch (error) {
        console.log(error);
    }
}
//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}
// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

function getPathFromUrl(url) {
    return url.split(/[?#]/)[0];
}

function percentage(num, total) {
    return ((num / total) * 100).toFixed(2);
}

function between(x, min, max) {
    return x >= min && x <= max;
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function getTimeValue() {
    var dateBuffer = new Date();
    var Time = dateBuffer.getTime();
    return Time;
}

function getRandomValue() {
    var randomValue = Math.random() * 100;
    return randomValue;
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function inArray(target, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === target) {
            return true;
        }
    }
    return false;
}

function tryParse(input) {
    try {
        return JSON.parse(input);
    } catch (e) {
        return false;
    }
}

function component(x, v) {
    return Math.floor(x / v);
}

function SetMe(nama, nomor) {
    Cookies.remove(nama);
    Cookies.set(nama, nomor);
}

function getAverage(array, skipme) {
    var sum = 0,
        n = 0;
    $.each(array, function (i, item) {
        if (!isEmpty(skipme)) {
            if ((item.channel).indexOf(skipme) >= 0) {
                return true;
            }
        }
        sum += item.pga;
        n++;
    })
    var final = (sum / n);
    return final;
}

//realtime
var soundz;
var listaudio = [];
var audioplay = false;
var synth = window.speechSynthesis;
var voices = synth.getVoices();
var chunkLength = 120;
var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');

function NotifMe(x, m, info = "info", audio = false, lg = "id", volume = 0.5) {
    try {
        console.log(x);
        if (isEmpty(m)) {
            android.popup(x);
        } else {
            android.notif(x, m, audio);
        }
    } catch (error) {
        //console.log(error)
        if (audio) {
            var arr = [];
            var txt = m;
            while (txt.length > 0) {
                arr.push(txt.match(pattRegex)[0]);
                txt = txt.substring(arr[arr.length - 1].length);
            }
            $.each(arr, function () {
                listaudio.push({
                    url: "https://api.volcanoyt.com/google/voice.mp3?say=" + encodeURI(this.trim()) + "&lg=" + lg,
                    volume: volume
                });
            });
        } else {
            Toastify({
                text: x,
                duration: 6000
            }).showToast();
        }
    }
}

setInterval(function () {
    try {
        if (audioplay) {
            //wait data
            //console.log('wait data');
        } else {
            //console.log('start audio');
            for (var j in listaudio) {
                audioplay = true;
                var datap = listaudio[j];

                if (datap.type == 2) {

                    var arr = [];
                    var txt = datap.url;
                    while (txt.length > 0) {
                        arr.push(txt.match(pattRegex)[0]);
                        txt = txt.substring(arr[arr.length - 1].length);
                    }

                    $.each(arr, function () {
                        var utterThis = new SpeechSynthesisUtterance(this.trim());
                        for (i = 0; i < voices.length; i++) {
                            if (voices[i].name === datap.en) {
                                utterThis.voice = voices[i];
                            }
                        }
                        utterThis.volume = datap.volume;
                        synth.speak(utterThis);
                        if (voices.length == i) {
                            utterThis.onend = function () {
                                removeaudio(j);
                            }
                            utterThis.onerror = function () {
                                removeaudio(j);
                            }
                        }

                    });

                } else {

                    soundz = new Howl({
                        src: [datap.url],
                        volume: datap.volume,
                        onend: function () {
                            removeaudio(j);
                        },
                        onplayerror: function () {
                            removeaudio(j);
                        },
                        onloaderror: function () {
                            removeaudio(j);
                        },
                    });
                    soundz.play();

                }
                break;
            }
        }
    } catch (error) {
        console.log(error);
    }
}, 1000);

function removeaudio(j) {
    var toDelete = [j];
    while (toDelete.length) {
        listaudio.splice(toDelete.pop(), 1);
    }
    audioplay = false;
}

function PlayMe(dd, volum) {
    var sound = new Howl({
        src: [dd],
        volume: volum
    });
    sound.play();
}

//https://www.opinionatedgeek.com/codecs/base64encoder
function beepme(w, x, y) {
    if (usemp3) {
        PlayMe("/core/audio/beep.mp3", 1);
    } else {
        v = context.createOscillator()
        u = context.createGain()
        v.connect(u)
        v.frequency.value = x
        v.type = "square"
        u.connect(context.destination)
        u.gain.value = w * 0.01
        v.start(context.currentTime)
        v.stop(context.currentTime + y * 0.001)
    }
}

var smoothie = [];

function addstream(id, data, date = [new Date().getTime(), new Date().getTime(), new Date().getTime()], DataSets = [new TimeSeries(), new TimeSeries(), new TimeSeries(), new TimeSeries()], seriesOptions = [{
        strokeStyle: 'rgba(255, 0, 0, 1)',
        fillStyle: 'rgba(255, 0, 0, 0.1)',
        lineWidth: 3
    },
    {
        strokeStyle: 'rgba(0, 255, 0, 1)',
        fillStyle: 'rgba(0, 255, 0, 0.1)',
        lineWidth: 3
    },
    {
        strokeStyle: 'rgba(0, 0, 255, 1)',
        fillStyle: 'rgba(0, 0, 255, 0.1)',
        lineWidth: 3
    },
], set = {
    grid: {
        sharpLines: true
    },
    tooltip: false,
    timestampFormatter: SmoothieChart.timeFormatter,
    responsive: true
}) {
    var noproblem = true;
    var j;
    for (j in smoothie) {
        if (smoothie[j].id == id) {
            noproblem = false;
            break
        }
    }
    if (noproblem) {
        var chart = new SmoothieChart(set);
        for (var i = 0; i < DataSets.length; i++) {
            chart.addTimeSeries(DataSets[i], seriesOptions[i]);
        }

        chart.streamTo(document.getElementById(id));
        smoothie.push({
            DataSets: DataSets,
            id: id
        });

    } else {
        var jx;
        for (jx in smoothie) {
            if (smoothie[jx].id == id) {
                for (var i = 0; i < smoothie[jx].DataSets.length; i++) {
                    smoothie[jx].DataSets[i].append(date[i], data[i]);
                }
            }
        }
    }
}

//realtime update time
function updateTime() {
    try {
        $("time").each(function (i) {
            var datatime = $(this).attr("data-now");
            var timenow = moment.utc(datatime).fromNow();
            var checktime = $(this).html();
            if (checktime !== timenow) {
                $(this).html(timenow);
            }
        });
    } catch (error) {}
}

//realtime update img
var mylink = [];

function reloadimg() {
    try {
        $(".reloadthis").each(async function (i) {

            //wajib            
            var id = $(this).attr('id');
            if (!isEmpty(id)) {
                //vrabel
                var noproblem = true;
                var needcek = false;
                var tmpev;

                for (let j in mylink) {
                    if (mylink[j].id == id) {

                        noproblem = false;
                        url = mylink[j].url;
                        tmpev = mylink[j].event;

                        //cek time
                        if (mylink[j].tmprd >= mylink[j].reload) {
                            mylink[j].tmprd = 0;
                            needcek = true;
                        } else {
                            mylink[j].tmprd++;
                            needcek = false;
                        }

                        break
                    }
                }

                if (noproblem) {
                    var link = $(this).attr("src");
                    console.log(link);
                    if (!isEmpty(link)) {
                        var url = getPathFromUrl(link);
                        var re = $(this).attr('data-reload');
                        var ev = $(this).attr('data-event');
                        if (re === undefined || re === null) {
                            re = 60;
                        }
                        //console.log(re);
                        //console.log($(this));
                        mylink.push({
                            id: id,
                            url: url,
                            tmprd: 0,
                            reload: re,
                            event: ev,
                        });
                    }
                }

                if (needcek) {
                    //needcek = false;                
                    var r = await Addimg(url + "?time=" + Date.now(), id);
                    //console.log(r);
                }
            }

        });
    } catch (error) {

    }
}

function UpdateIMGDIV(urlimg, idimg) {
    try {
        $(idimg).attr("src", urlimg + new Date().getTime());
    } catch (error) {

    }
}
setInterval(updateTime, 1000);
setInterval(reloadimg, 1000 * 1); //TODO: Support 100ms aka 2Fps or 30Fps

function Addimg(urlimg, idimg, adddiv = false, namadiv = '#CCTV0', tag = 'mySlides', iscache = true, timeout = 10) {
    return new Promise((resolve, reject) => {
        var timerStart = Date.now();
        var hasil = new Array();
        hasil.id = idimg;
        hasil.url = urlimg;

        jQuery.ajax({
            url: urlimg,
            cache: iscache,
            timeout: 1000 * timeout,
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob'
                return xhr;
            },
            success: function (data, status, xhr) {
                try {

                    if (adddiv) {
                        if ($('#' + idimg).length == 0) {
                            $(namadiv).append("<img id='" + idimg + "' class='" + tag + "'>");
                        }
                    }

                    var img = document.getElementById(idimg.replace("#", ""));
                    var filetime = xhr.getResponseHeader('Last-Modified');

                    hasil.update = filetime;
                    hasil.code = 200;
                    hasil.time = Date.now() - timerStart;

                    var url = window.URL || window.webkitURL;
                    img.src = url.createObjectURL(data);
                    hasil.scr = img.src;
                    resolve(hasil);
                } catch (error) {
                    hasil.code = 402;
                    resolve(hasil);
                }
            },
            error: function (jqXHR, textStatus) {
                console.log(jqXHR, textStatus);
                hasil.time = Date.now() - timerStart;
                hasil.code = 404;
                resolve(hasil);
            }
        });
    });
}

function getAllUrlParams(url) {
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    // we'll store the parameters here
    var obj = {};
    // if query string exists
    if (queryString) {
        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];
        // split our query string into its component parts
        var arr = queryString.split('&');
        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');
            // set parameter name and value (use 'true' if empty)
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
            // (optional) keep case consistent
            // paramName = paramName.toLowerCase();
            // if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {
                // create key if it doesn't exist
                var key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];
                // if it's an indexed array e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    // get the index value and add the entry at the appropriate position
                    var index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    // otherwise add the value to the end of the array
                    obj[key].push(paramValue);
                }
            } else {
                // we're dealing with a string
                if (!obj[paramName]) {
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
    }
    return obj;
}

if (window.location.protocol != 'https:') {
    if (getAllUrlParams().nossl !== "true") {
        location.href = location.href.replace("http://", "https://");
    }
}

function number_format (number, decimals, decPoint, thousandsSep) {  
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number
    var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
    var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
    var s = ''
  
    var toFixedFix = function (n, prec) {
      if (('' + n).indexOf('e') === -1) {
        return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
      } else {
        var arr = ('' + n).split('e')
        var sig = ''
        if (+arr[1] + prec > 0) {
          sig = '+'
        }
        return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec)
      }
    }
  
    // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }
  
    return s.join(dec)
  }