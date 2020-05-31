//API Sensor
//https://stackoverflow.com/a/9672223
var EWS;
(EWS = function () {}).prototype = {
    _iseq: false,
    _event: [],
    get earthquake() {
        return this._iseq;
    },
    get event() {
        return this._event;
    },
    listen: function (type, method, scope, context) {
        var listeners, handlers;
        if (!(listeners = this.listeners)) {
            listeners = this.listeners = {};
        }
        if (!(handlers = listeners[type])) {
            handlers = listeners[type] = [];
        }
        scope = (scope ? scope : window);
        handlers.push({
            method: method,
            scope: scope,
            context: (context ? context : scope)
        });
    },
    fireEvent: function (type, data, context) {
        var listeners, handlers, i, n, handler, scope;
        if (!(listeners = this.listeners)) {
            return;
        }
        if (!(handlers = listeners[type])) {
            return;
        }
        for (i = 0, n = handlers.length; i < n; i++) {
            handler = handlers[i];
            if (typeof (context) !== "undefined" && context !== handler.context) continue;
            if (handler.method.call(
                    handler.scope, this, type, data
                ) === false) {
                return false;
            }
        }
        return true;
    },
    start: function () {
        var _b = this;
        var args = {
            frequency: 100, // ( How often the object sends the values - milliseconds )
            gravityNormalized: true, // ( If the gravity related values to be normalized )
            orientationBase: GyroNorm.WORLD, // ( Can be GyroNorm.GAME or GyroNorm.WORLD. gn.GAME returns orientation values with respect to the head direction of the device. gn.WORLD returns the orientation values with respect to the actual north direction of the world. )
            screenAdjusted: true // ( If set to true it will return screen adjusted values. )
        };
        var gn = new GyroNorm();

        var waitprimer = 5;
        var sampel_length = 50;

        //TODO: hapus event file tiap 30 menit atau kalau sudah full
        var sampel = [];

        gn.init(args).then(function () {
            var isAvailable = gn.isAvailable();
            if (isAvailable.deviceOrientationAvailable) {
                gn.start(function (data) {
                    try {
                        _b.fireEvent("raw", data);

                        var x = data.dm.x; // In degree in the range [-180,180] LNX (Datar) (Merah)
                        var y = data.dm.y; // In degree in the range [-90,90] LNY (Kiri-Kanan) (Hijau)           
                        var z = data.dm.z; // LNZ (Atas-Bawah) (Biru)

                        // timestamp is UTC
                        var d = new Date();
                        var time = Math.floor(d.getTime() / 1000);

                        //ambil sampel
                        //TODO: save time_step & with multi channel
                        sampel.push(x);

                        /*
                        Ada 2 macam gelombang badan, yaitu gelombang primer atau gelombang P (primary wave) dan gelombang sekunder atau gelombang S (secondary wave). Gelombang P atau gelombang mampatan (compression wave),
    
                        coba ambil sampel primer dulu selama 5 detik lalu cek lagi gelombang primer jika sampel tidak terputus selama 2 detik pada saat last primer ubah data primer jadi secondary dan seterusnya.... sampai tidak ada gelombang berlanjutan...

                        primer (50x100ms=5000 milliseconds aka 5 seconds)
                        */
                        if (sampel.length == sampel_length) {

                            /*
                            https://www.bmkg.go.id/gempabumi/skala-mmi.bmkg
                            https://en.wikipedia.org/wiki/Gal_(unit)
                            https://www.quora.com/What-are-units-of-amplitude
                            Fungsi Math.max() mengembalikan nilai terbesar dari zero atau lebih besar.
                            */
                            gal = Math.max(...sampel);

                            //mulai ambil event
                            if (gal > 0.1) {

                                _b._iseq = true;

                                //nilai awal
                                var timeeq = waitprimer;                                
                                var neweq = true;

                                //sampel awal
                                var last_sampel;

                                //cek last event
                                if (_b._event.length > 0) {
                                    //ambil last sampel
                                    last_sampel = _b._event[_b._event.length - 1];

                                    //Cek Waktu
                                    var between_times = time - last_sampel.update;
                                    //jika waktu update masih sama jangan bikin gempa baru
                                    if (between_times == waitprimer) {
                                        neweq = false;
                                    }

                                    //Cek Waktu sekarang dengan last input
                                    timeeq = time - last_sampel.input;
                                    if(timeeq>=waitprimer){
                                        timeeq = timeeq+waitprimer;
                                    }
                                }                            

                                /*
                                https://www.bgs.ac.uk/discoveringGeology/hazards/earthquakes/magnitudeScaleCalculations.html
                                ML = logA + 2.56logD - 1.67
                                Base https://github.com/UFOP-CSI477/2019-02-atividades-tulio-s-jardim/blob/master/AtvPrat01/js/03-richter.js#L22
                                */
                                var magnitude = (Math.log10(gal) + 3 * Math.log10(8 * timeeq) - 2.92).toFixed(2);

                                //BMKG Intensity
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

                                //Info saat ini
                                var info_now = {
                                    gal: gal,
                                    magnitude: magnitude,
                                    intensity: skala,
                                    time: timeeq,
                                    timestamp: time,
                                    sampel: sampel,
                                }

                                if (neweq) {
                                    //save to tmp
                                    _b._event.push({
                                        input: time,
                                        update: time
                                    });

                                    //send to event
                                    var plus = {
                                        type: 0,
                                        input: time
                                    };
                                    _b.fireEvent("info", {
                                        type: "earthquake",
                                        data: Object.assign(info_now, plus)
                                    });
                                } else {
                                    for (var j in _b._event) {
                                        if (_b._event[j].input == last_sampel.input) {
                                            _b._event[j].update = time;

                                            //update event
                                            var plus = {
                                                type: 1,
                                                input: _b._event[j].input,
                                                update: time
                                            };
                                            _b.fireEvent("info", {
                                                type: "earthquake",
                                                data: Object.assign(info_now, plus)
                                            });
                                            break;
                                        }
                                    }
                                }

                            } else {
                                _b._iseq = false;
                                _b._event = [];
                            }

                            //hapus sampel
                            while (sampel.length > 0) {
                                sampel.pop();
                            }
                        }

                    } catch (e) {
                        _b.fireEvent("error", {
                            type: "send",
                            error: e
                        });
                    }

                });
            } else {
                _b.fireEvent("error", {
                    type: "compatible",
                    error: isAvailable
                });
            }
        }).catch(function (e) {
            _b.fireEvent("error", {
                type: "catch",
                error: e
            });
        });
    }
};