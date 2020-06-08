// https://www.seiscomp3.org/doc/seattle/2012.279/apps/seedlink.html
// https://blog.freifunk.net/2017/06/26/choosing-spectrogram-visualization-library-javascript/
// https://ds.iris.edu/ds/products/seissound/
// https://ds.iris.edu/ds/support/faq/6/what-is-a-count-in-timeseries-data/
// http://www.lolisetriani.web.id/2015/06/macam-macam-gelombang-gempa-dan.html
// https://www.imv.co.jp/e/pr/seismic_monitoring/knowledge/
// http://eqseis.geosc.psu.edu/cammon/HTML/Classes/IntroQuakes/Notes/earthquake_size.html
var event = [];
var station = [];
var nama_db = "db_event";

// higher less accurate because less data sampel but faster processing and does not take much memory (sampleRate=20)
var TMP_Sampel = 1000;

var Gain = 1000000;

var NTime = 1000;

var amp_max = 3000;
var amp_min = -3000;

// every 1 seconds synchronizes all stations.
// make sure data received from proxy-seedlink also belongs to same value as this (HEARTBEAT_INTERVAL_MS).
var delayed_sync_data = 1000;

// if gai activity has increased, try analysis it
// https://en.wikipedia.org/wiki/Peak_ground_acceleration
var earthquake_come_soon = 0.0020;

// false when you are ready, gui is very useful when you are still debugging process but it is quite slow for analysis data.
var gui = true;
var gui_div = "auto";
var delayed_sync_render_gui = 3;
var gui_wait_tmp = 0;
var longbeep = 3;
var long_line = 4;
var beep_volume = 0;

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
function getDates(startDate, stopDate, sampel = 0) {
    var dateArray = new Array();
    var currentDate = startDate;

    if (sampel !== 0) {
        currentDate = Math.floor(currentDate / sampel);
        stopDate = Math.floor(stopDate / sampel);
    }

    while (currentDate <= stopDate) {
        dateArray.push(currentDate);
        currentDate++;
    }
    return dateArray;
}

function Station(addsta) {

    var id = addsta.id;

    var start = Math.floor(addsta.start / TMP_Sampel);
    var end = Math.floor(addsta.end / TMP_Sampel);

    var sampel = addsta.data;
    var STA_SampleRate = addsta.sampleRate;

    //Data RAW
    var data_sampel = [];
    var index_time = getDates(start, end);
    sampel.forEach((val, index) => {

        //we need here config gain,locate,offset,filiter,sampel for each station, so that the info is more accurate?
        if (id == "II.KAPI.00.BHZ") {
            // val = val+879;
        }

        data_sampel.push({
            x: index_time[index],
            y: val
        });
    });

    //cari station dulu
    var new_station = true;
    for (var j in station) {
        if (station[j].id == id) {
            new_station = false;

            station[j].sampel.raw = data_sampel;
            station[j].sampel.end = end;
            station[j].sampel.start = start;

            break;
        }
    }

    if (new_station) {
        station.push({
            id: id,

            input: start,

            sampel: {
                raw: data_sampel,
                start: start,
                end: end,
                tmp: data_sampel
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
                cek: end,
                chart: null
            }
        });
    }
}

//sync both stations so that they can pick up in real time later and maybe we can analyze data directly here
function sync() {
    var tnow = Math.floor(new Date().getTime() / NTime);

    //line
    var go_start = tnow - long_line * 60;
    var go_end = tnow + 1 * 10;

    var unlock_gui = false;
    if (gui) {
        if (gui_wait_tmp >= delayed_sync_render_gui) {
            gui_wait_tmp = 0;
            unlock_gui = true;
        } else {
            (gui_wait_tmp++) + (delayed_sync_data / NTime);
        }
    }

    for (var now in station) {
        var alwaysscan = true;
        var newdata = false;
        var count_secondary = 0;
        var count_primer = 0;

        var sta = station[now];

        var tmp_sampel = sta.sampel.tmp;
        var raw_sampel = sta.sampel.raw;
        var start_sampel = sta.sampel.start;
        var last_sampel_update = sta.sampel.end;
        var last_sampel_cek = sta.tmp.cek;

        var get_primer_start = sta.primer.start;
        var get_primer_end = sta.primer.end;
        var get_primer_sampel = sta.primer.sampel;

        var get_secondary_start = sta.secondary.start;
        var get_secondary_end = sta.secondary.end;
        var get_secondary_sampel = sta.secondary.sampel;

        //update dan fiter
        var newupdate = removeDuplicates(tmp_sampel.concat(...raw_sampel).filter(function (item) {
            return go_start <= item.x
        }));
        station[now].sampel.tmp = newupdate;
        raw_sampel = null;
        tmp_sampel = null;

        //update cek
        if (last_sampel_update !== last_sampel_cek) {
            station[now].tmp.cek = last_sampel_update;
            newdata = true;
        }

        //ini index end terbaru         
        var first_index = newupdate[0];
        var first_always_primer_start = first_index.x;
        var last_index = newupdate[newupdate.length - 1];
        var always_primer_start = last_index.x;
        var always_primer_end = last_index.x - 10;
        var noalways_primer_start = first_index.x;
        var noalways_primer_end = first_index.x - 10;

        var delayed = tnow - last_sampel_cek;

        //Data Select
        var always_primer_select = [];
        newupdate.forEach((val) => {
            //Only pick up if have eq     
            if (always_primer_start >= val.x && always_primer_end <= val.x) {
                always_primer_select.push(val.y);
            }
        });

        var select_first_index = always_primer_select[0];
        var select_first_always_primer_start = select_first_index.x;
        var select_last_index = always_primer_select[always_primer_select.length - 1];
        var select_last_start = select_last_index.x;
        var select_last_end = select_last_index.x + 10;

        var GAL_raw = Math.max(...always_primer_select);
        always_primer_select = null;
        var GAL = (GAL_raw / Gain).toFixed(4);

        var total_sampel = newupdate.length;

        //jika ada gempa base gain, TODO: use AI Mode
        var tgr_update = sta.tgr.update;
        //var tgr_cek = sta.tgr.cek;
        //var tgr_start = sta.tgr.start;

        if (GAL >= earthquake_come_soon) {
            //update tgr
            station[now].tgr.update = always_primer_start;
            station[now].tgr.cek = last_sampel_cek;

            if (tgr_update == last_sampel_cek) {
                //console.log("gempa lama");
                get_secondary_start = get_primer_end;
                station[now].secondary.start = get_primer_end;
                get_secondary_end = always_primer_start;
                station[now].secondary.end = always_primer_start;
            } else {
                //station[now].tgr.start = always_primer_start;
                //console.log('gempa baru');
                //update perimer
                //always_primer_start = first_index.y;
                //always_primer_end = first_index.y - 10;
                get_primer_start = select_first_always_primer_start;
                station[now].primer.start = select_first_always_primer_start;
                get_primer_end = select_last_start;
                station[now].primer.end = select_last_start;
            }

            count_secondary = get_secondary_end - get_secondary_start;
            count_primer = get_primer_end - get_primer_start;

            console.log(tgr_update + " | " + last_sampel_cek + " | " + delayed + " | " + count_secondary + " | " + count_primer);

            if (get_primer_start >= go_start && get_primer_end <= go_end) {
                alwaysscan = false;
            }

            if (get_secondary_start >= go_start && get_secondary_end <= go_end) {
                alwaysscan = false;
            }

        } else {

            //jika gempa sudah tidak berlanjut tapi...
            if (tgr_update == last_sampel_cek) {
                console.log('ending');
                station[now].tgr.end = always_primer_end;
            }
            console.log("monitor!");
        }

        //hapus
        newupdate = null;

        //Update GUI
        if (unlock_gui) {

            var gui_y = earthquake_come_soon * Gain;

            //buat sampel tmp
            var sampel_tmp = [];
            var index_tmp_time = getDates(go_start, go_end);
            index_tmp_time.forEach((val, index) => {
                sampel_tmp.push({
                    x: val,
                    y: null //getRndInteger(-10000, 10000) TODO: coba nilai rata-rata
                })
            });
            index_tmp_time = null;

            //set real sampel val to sampel tmp
            var sampel = sta.sampel.tmp;
            for (var sr in sampel) {
                for (var jt in sampel_tmp) {
                    if (sampel[sr].x == sampel_tmp[jt].x) {
                        sampel_tmp[jt].y = sampel[sr].y;
                        break;
                    }
                };
                //debugger;
            };

            var info_pga = 'NO DATA';
            if (GAL >= 0) {
                info_pga = GAL + 'g (' + GAL_raw + ')';
            }

            var out = document.getElementById(gui_div);
            // update body
            var infobody =
                ('\
                 Time Start: ' + moment(start_sampel).format('DD/MM/YYYY HH:mm:ss') + ' Time End: ' + moment(last_sampel_update).format('DD/MM/YYYY HH:mm:ss') + ' LC <br>\
                 PGA: ' + info_pga + ' (' + moment(always_primer_start * NTime).format('DD/MM/YYYY HH:mm:ss') + ' Last Update) <br>\
                 Delayed: ' + delayed + ' sec <br>\
                 Total Sampel: ' + total_sampel + ' \
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
                        name: 'Ground Acceleration',
                        data: sampel_tmp
                    }],
                    chart: {
                        id: 'realtime',
                        height: 350,
                        type: 'line',
                        animations: {
                            enabled: false,
                        },
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
                                newupdate = null;
                                event = null;

                                //console.log(yaxis);
                                //console.log(chartContext);
                            },
                            /*
                            scrolled: function (chartContext, {
                                xaxis
                            }) {
                                console.log("scrolled",xaxis);
                            },
                            dataPointMouseLeave: function (event, chartContext, config) {
                                console.log('dataPointMouseLeave');
                            },
                            dataPointMouseEnter: function (event, chartContext, config) {
                                console.log('dataPointMouseEnter');
                            },
                            dataPointSelection: function (event, chartContext, config) {
                                console.log('dataPointSelection');
                            },
                            selection: function (chartContext, {
                                xaxis,
                                yaxis
                            }) {
                                console.log("selection: "+xaxis + " | " + yaxis);
                            }    

                            */
                        }
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
                    xaxis: {
                        type: 'numeric',
                        labels: {
                            formatter: function (value, timestamp, index) {
                                return (Math.floor(new Date().getTime() / NTime) - timestamp)
                            }
                        },
                        tooltip: {
                            enabled: false
                        }
                    },
                    yaxis: {
                        max: amp_max,
                        min: amp_min
                    }
                });
                chart.render();

                //pust chart
                station[now].tmp.chart = chart;
                tb = chart;

            } else {
                tb.updateSeries([{
                    data: sampel_tmp
                }]);
            }

            sampel_tmp = null;

            // update body
            document.getElementById(sta.id).querySelector('#subbody').innerHTML = infobody;

            //input chart here
            if (tb !== null) {
                tb.clearAnnotations();
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
                        x: always_primer_start,
                        x2: always_primer_end,
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