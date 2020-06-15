// https://www.seiscomp3.org/doc/seattle/2012.279/apps/seedlink.html
// https://blog.freifunk.net/2017/06/26/choosing-spectrogram-visualization-library-javascript/
// https://ds.iris.edu/ds/products/seissound/
// https://ds.iris.edu/ds/support/faq/6/what-is-a-count-in-timeseries-data/
// http://www.lolisetriani.web.id/2015/06/macam-macam-gelombang-gempa-dan.html
// https://www.imv.co.jp/e/pr/seismic_monitoring/knowledge/
// http://eqseis.geosc.psu.edu/cammon/HTML/Classes/IntroQuakes/Notes/earthquake_size.html
// http://geofon.gfz-potsdam.de/fdsnws/station/1/query?network=GE&station=JAGI&level=resp&format=sc3ml
// https://github.com/crotwell/seisplotjs
var event = [];
var station = [];
var nama_db = "db_event";

// higher less accurate because less data sampel but faster processing and does not take much memory (sampleRate=20)
var MsSampel = 1000;
var MsMin = 10 * 1000;

var Gain = 1000000;
var amp_max = 3000;
var amp_min = -3000;

var line_start = 4 * 60 * 1000;
var line_end = 1 * 2 * 1000;

// every 1 seconds synchronizes all stations.
// make sure data received from proxy-seedlink also belongs to same value as this (HEARTBEAT_INTERVAL_MS).
var delayed_sync_data = 3000;

// if gai activity has increased, try analysis it
// https://en.wikipedia.org/wiki/Peak_ground_acceleration
var earthquake_come_soon = 0.0020;

// false when you are ready, gui is very useful when you are still debugging process but it is quite slow for analysis data.
var gui = true;
var gui_div = "auto";
var delayed_sync_render_gui = 3;
var gui_wait_tmp = 0;
var longbeep = 3;
var beep_volume = 0;
var uplot = true;
var debug = 0;
var logit = 0;
var reindex = false;

var seedlink = new ReconnectingWebSocket("wss://seedlink.volcanoyt.com");
seedlink.onopen = function (event) {
    seedlink.send(JSON.stringify({
        "subscribe": "GE.PLAI",
    }));
    /*
    seedlink.send(JSON.stringify({
        "subscribe": "II.KAPI",
    }));
    seedlink.send(JSON.stringify({
        "subscribe": "GE.JAGI",
    }));
*/
    if (gui)
        $('#isonline').html("Online");
};
seedlink.onmessage = function (eventt) {
    var json = JSON.parse(eventt.data);
    if (json.error) {
        console.error(json.error);
    } else if (json.success) {
        console.log(json.success);
    } else {
        Station(json);
    }
};
seedlink.onclose = function (eventt) {
    console.log("close", eventt);
};

//Get Index Time
function getDates(startDate, stopDate, ms = 0) {
    var dateArray = new Array();
    var currentDate = startDate;

    while (currentDate <= stopDate) {
        if (ms !== 0) {
            dateArray.push(Math.floor(currentDate) / ms);
        } else {
            dateArray.push(currentDate);
        }
        currentDate++;
    }
    return dateArray;
}

function Station(addsta) {
    var id = addsta.id;

    var start = addsta.start;
    var end = addsta.end;

    var sampel = addsta.data;
    var STA_SampleRate = addsta.sampleRate;

    //Data RAW
    var data_raw = [];
    var index_time = getDates(start, end);
    sampel.forEach((val, index) => {
        data_raw.push({
            x: index_time[index],
            y: val
        });
    });

    //cari station dulu
    var new_station = true;
    for (var j in station) {
        if (station[j].id == id) {
            new_station = false;

            station[j].sampel.raw = data_raw;
            station[j].sampel.end = end;
            station[j].sampel.start = start;

            break;
        }
    }

    //baru
    if (new_station) {

        station.push({
            id: id,

            input: start,

            sampel: {
                raw: data_raw,
                start: start,
                end: end,
            },

            config: {
                sampleRate: STA_SampleRate
            },

            primer: {
                start: start,
                end: end,
                sampel: []
            },

            secondary: {
                start: start,
                end: end,
                sampel: []
            },

            tgr: {
                start: start,
                end: end,
                cek: end,
                update: end,
            },

            tmp: {
                cek: start,
                chart: null,
                sampel: data_raw,
                pga:[]
            }
        });
    }
}

//sync both stations so that they can pick up in real time later and maybe we can analyze data directly here
function sync() {

    var tnow = new Date().getTime();

    var go_start = tnow - line_start;
    var go_end = tnow;

    var total_line = go_end - go_start;

    var gui_y = earthquake_come_soon * Gain;

    var unlock_gui = false;
    if (gui) {
        if (gui_wait_tmp >= delayed_sync_render_gui) {
            gui_wait_tmp = 0;
            unlock_gui = true;
        } else {
            (gui_wait_tmp++) + (delayed_sync_data / 1000);
        }
    }

    for (var now in station) {
        var alwaysscan = true;
        var newdata = false;

        var count_secondary = 0;
        var count_primer = 0;
        var total_sampel_up = 0;
        var total_index_up = 0;

        var sta = station[now];

        var tmp_sampel = sta.tmp.sampel;
        var raw_sampel = sta.sampel.raw;
        var start_sampel = sta.sampel.start;
        var end_sampel = sta.sampel.end;
        var last_sampel_update = sta.sampel.end;
        var last_sampel_cek = sta.tmp.cek;

        var get_primer_start = sta.primer.start;
        var get_primer_end = sta.primer.end;
        var get_primer_sampel = sta.primer.sampel;

        var get_secondary_start = sta.secondary.start;
        var get_secondary_end = sta.secondary.end;
        var get_secondary_sampel = sta.secondary.sampel;

        var sampleRate = sta.config.sampleRate;

        var total_sampel_with_rate = raw_sampel.length / sampleRate;
        var total_sampel_in_sec = (end_sampel - start_sampel) / MsSampel;
        var total_sampel_raw = raw_sampel.length;
        var total_sampel_tmp = tmp_sampel.length;

        var delayed_in_ms = tnow - last_sampel_cek;
        var delayed_in_sec = Math.floor(delayed_in_ms / 1000);

        // RAW DATA
        var get_raw_index_last = raw_sampel[raw_sampel.length - 1];
        var get_raw_first = raw_sampel[0];
        var get_raw_index_start = get_raw_first.x;
        var get_raw_index_end = get_raw_index_last.x;
        var get_point_end = get_raw_index_end;
        var get_point_start = get_point_end - line_end;

        //Select Mode via Reindex
        var data_select = [];
        raw_sampel.forEach((val) => {
            if (get_point_start >= val.r && get_point_end <= val.r) {
                data_select.push(val.y);
            }
        });
        var GAL_raw = Math.max(...data_select); // total_gal data yang di dapat 24 detik, TODO: pastikan hanya dapat max 5 detik?
        var GAL = (GAL_raw / Gain).toFixed(4);
        var total_data_select = data_select.length;
        data_select = null;

        //Update datebase
        var noraw_data = [];
        if (last_sampel_update !== last_sampel_cek) {
            newdata = true;

            //join tabel tmp dengan data baru (raw) lalu hapus data lama
            noraw_data = tmp_sampel.concat(raw_sampel).filter(function (item) {
                return go_start <= item.x
            });

            //update station
            station[now].tmp.sampel = noraw_data;
            station[now].tmp.cek    = last_sampel_update;
            station[now].tmp.pga.push({

            });
        } else {
            //jika data masih lama jangan proses pakai yang sudah ada
            noraw_data = tmp_sampel;
        }
        tmp_sampel = null;
        var total_sampel_noraw = noraw_data.length;

        // LAST INDEX (JOIN DATEBASE)     
        var last_index = noraw_data[noraw_data.length - 1];
        var first_index = noraw_data[0];
        var last_index_end = last_index.x;
        var last_index_start = first_index.x;

        console.log({
            GAL: GAL,
            tnow: tnow,
            total_data_select: total_data_select,
            total_sampel_noraw: total_sampel_noraw,
            total_sampel_with_rate: total_sampel_with_rate,
            total_sampel_in_sec: total_sampel_in_sec,
            total_sampel_raw: total_sampel_raw,
            total_sampel_tmp: total_sampel_tmp,
            delayed_in_sec: delayed_in_sec,
            total_line: total_line,
            gui_y: gui_y
        });

        //console.log('gui_index: ' + last_gui_index_end + ' | ' + last_gui_point);
        //console.log('last_index: ' + last_index_start + ' | ' + last_index_end + ' - go_start: ' + go_start + ' | ' + go_end);
        //debugger;

        //Update GUI
        if (unlock_gui) {

            /*

            //Reindex for GUI
            var gui_tmp = [];
            var index_tmp_time = getDates(last_index_start, get_now_index_end).sort((a, b) => b - a);
            for (var nt in index_tmp_time) {
                try {
                    if (noraw_data.length > nt) {
                        //index_tmp_time[nt]
                        gui_tmp.push({
                            x: nt,
                            y: noraw_data[nt].y,
                            r: noraw_data[nt].x
                        });
                    } else {
                        break;
                    }
                } catch (error) {
                    console.log(error);
                    break;
                }
            };
            noraw_data = null;
            index_tmp_time = null;
            var last_gui_index = gui_tmp[gui_tmp.length - 1];
            var first_gui_index = gui_tmp[0];
            //console.log('last_gui_index',last_gui_index);
            //console.log('first_gui_index',first_gui_index);
            //debugger;
            var last_gui_index_end = last_gui_index.r;
            var last_gui_index_start = first_gui_index.r;
            var last_gui_point = last_gui_index_end - line_end;

            */

            var info_pga = 'NO DATA';
            if (GAL >= 0) {
                info_pga = GAL + 'g (' + GAL_raw + ')';
            }

            var out = document.getElementById(gui_div);
            // update body
            var infobody =
                ('\
                 Time Start: ' + moment(start_sampel).format('DD/MM/YYYY HH:mm:ss') + ' Time End: ' + moment(last_sampel_update).format('DD/MM/YYYY HH:mm:ss') + ' LC <br>\
                 PGA: ' + info_pga + ' (' + moment(get_point_end).format('DD/MM/YYYY HH:mm:ss') + ' Last Update) <br>\
                 Delayed: ' + delayed_in_sec + ' sec <br>\
                 Total Sampel: ' + total_sampel_tmp + ' - ' + total_sampel_raw + ' \
                ');

            var tb = sta.tmp.chart;
            if (tb == null) {
                //jika belum ada chart

                //buat dulu
                out.insertAdjacentHTML('beforeend',
                    '<div class="modal-content mb-3" id="' + sta.id + '">\
                     <div class="modal-header">\
                     <h5 class="modal-title" id="judul">' + sta.id + '</h5>\
                     </div>\
                     <div class="modal-body" id="body"><div id="subbody">' + infobody + '</div><div id="chart"></div></div>\
                    </div>\
                    ');

                //lalu input data chart
                var chart = new ApexCharts(document.getElementById(sta.id).querySelector('#chart'), {
                    series: [{
                        name: 'PGA',
                        data: noraw_data
                    }],
                    chart: {
                        id: 'realtime',
                        height: 350,
                        type: 'line',
                        animations: {
                            enabled: false,
                        },
                        /*
                        events: {
                            zoomed: function (chartContext, {
                                xaxis,
                                yaxis
                            }) {
                                //Select Map
                                var select_map = [];
                                (sta.sampel.tmp).forEach((val) => {
                                    //Only for pick up         
                                    if (val.x >= xaxis.min && val.x <= xaxis.max) {
                                        select_map.push(val);
                                    }
                                });
                                var event = {
                                    nama: sta.id,
                                    sampel: select_map,
                                    start: xaxis.min,
                                    end: xaxis.max,
                                    type: 1
                                };

                                CopyEvent(event);

                                select_map = null;
                                event = null;
                            }
                        }
                        */
                    },
                    dataLabels: {
                        enabled: false
                    },
                    tooltip: {
                        enabled: true,
                        x: {
                            show: false,
                        }
                    },
                    title: {
                        text: sta.id,
                        align: 'left'
                    },
                    yaxis: {
                        max: amp_max,
                        min: amp_min
                    },
                    xaxis: {
                        type: 'numeric',
                        labels: {
                            show: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    },
                });
                chart.render();

                //pust chart
                station[now].tmp.chart = chart;
                tb = chart;

            } else {
                tb.updateSeries([{
                    data: noraw_data
                }]);
            }

            // update body
            document.getElementById(sta.id).querySelector('#subbody').innerHTML = infobody;

            //input chart here
            if (tb !== null) {
                /*
                tb.updateOptions({
                    xaxis: {
                        min: last_gui_index_end,
                        max: last_gui_index_start,
                        labels: {
                            formatter: function (value, timestamp, index) {
                                return (Math.floor(timestamp / 1000) - Math.floor(go_end / 1000))
                            }
                        }
                    }
                });
                */
                // tb.clearAnnotations();

                /*
                tb.addXaxisAnnotation({
                    x: tnow,
                    strokeDashArray: 0,
                    borderColor: "#775DD0",
                    label: {
                        borderColor: "#775DD0",
                        style: {
                            color: "#fff",
                            background: "#775DD0"
                        },
                        text: "Time Now"
                    }
                });
                tb.addYaxisAnnotation({
                    y: gui_y,
                    borderColor: '#e3004d',
                    label: {
                        borderColor: '#e3004d',
                        style: {
                            color: '#fff',
                            background: '#e3004d'
                        },
                        text: 'Trigger'
                    }
                });
                if (alwaysscan) {
                    tb.addXaxisAnnotation({
                        x: last_gui_point,
                        x2: last_gui_index_end,
                        fillColor: '#B3F7CA',
                        label: {
                            text: 'Always Primer'
                        }
                    });
                } else {
                    if (count_secondary >= count_primer) {
                        tb.addXaxisAnnotation({
                            x: get_secondary_start,
                            x2: get_secondary_end,
                            fillColor: '#B3F7CA',
                            label: {
                                text: 'Secondary'
                            }
                        });
                    }
                    //hapus Primer jika waktu sudah lewat
                    tb.addXaxisAnnotation({
                        x: get_primer_start,
                        x2: get_primer_end,
                        fillColor: '#B3F7CA',
                        label: {
                            text: 'Primer'
                        }
                    });
                }
                */

            }

        }
    };
};
setInterval(sync, delayed_sync_data);

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//this func no blok it?
function CopyEvent(data) {
    localforage.getItem(nama_db).then(function (value) {
        //baru pertama kali?
        if (isEmpty(value)) {
            value = [];
        }
        value.push(data);
        localforage.setItem(nama_db, value);
    }).catch(function (err) {
        console.log("Error Copy Event", err);
    });
}

function ReadEvent() {
    localforage.getItem(nama_db).then(function (value) {
        // This code runs once the value has been loaded
        // from the offline store.
        if (!isEmpty(value)) {
            console.log(value);
        } else {
            console.log('hmm');
        }

    }).catch(function (err) {
        // This code runs if there were any errors
        //console.log(err);
    });
}

function ClearEvent() {
    localforage.removeItem(nama_db).then(function () {
        // Run this code once the key has been removed.
        console.log('Key is cleared!');
    }).catch(function (err) {
        // This code runs if there were any errors
        //console.log(err);
    });
}

//FOR TESTING
/**
 * Calculate the expected value
 */
function expectancy(arrayOfValues) {
    let sumTotal = function (previousValue, currentValue) {
        return previousValue + currentValue;
    };
    let u = arrayOfValues.reduce(sumTotal);
    // Assume each member carries an equal weight in expected value
    u = u / arrayOfValues.length;
    return u;
}

/**
 * Calculate consistency of the members in the vector
 * @param {Array<number>} The vector of members to inspect for similarity
 * @return {number} The percentage of members that are the same
 */
var similarity = function (arrayOfValues) {
    let sumTotal = function (previousValue, currentValue) {
        return previousValue + currentValue;
    };
    // Step 1: Calculate the mean value u
    let u = expectancy(arrayOfValues); // Calculate the average
    // Step 2: Calculate the standard deviation sig
    let sig = [];
    let N = 1 / arrayOfValues.length;

    for (let i = 0; i < arrayOfValues.length; i++) {
        sig.push(N * (arrayOfValues[i] - u) * (arrayOfValues[i] - u));
    }
    // This only works in mutable type, such as found in JavaScript, else sum it up
    sig = sig.reduce(sumTotal);
    // Step 3: Offset from 100% to get the similarity
    return 100 - sig;
}

function removeDuplicates(array) {
    return array.filter((a, b) => array.indexOf(a) === b)
};

//answer = similarity(ar1);