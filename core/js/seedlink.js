// https://www.seiscomp3.org/doc/seattle/2012.279/apps/seedlink.html
// https://blog.freifunk.net/2017/06/26/choosing-spectrogram-visualization-library-javascript/
// https://ds.iris.edu/ds/products/seissound/
// https://ds.iris.edu/ds/support/faq/6/what-is-a-count-in-timeseries-data/
// http://www.lolisetriani.web.id/2015/06/macam-macam-gelombang-gempa-dan.html
var event = [];
var station = [];

// higher less accurate because less data sampel but faster processing and does not take much memory
var TMP_Sampel_Rate = 1000;

var Gain = 1000000;

// every 1 seconds synchronizes all stations.
// make sure data received from proxy-seedlink also belongs to same value as this (HEARTBEAT_INTERVAL_MS).
var delayed_sync_data = 1;

// if gai activity has increased, try analysis it
// https://en.wikipedia.org/wiki/Peak_ground_acceleration
var earthquake_come_soon = 0.039;

// false when you are ready, gui is very useful when you are still debugging process but it is quite slow for analysis data.
var gui = true;
var gui_div = "auto";
var delayed_sync_render_gui = 5;
var gui_wait_tmp = 0;

var seedlink = new ReconnectingWebSocket("wss://seedlink.volcanoyt.com");
seedlink.onopen = function (event) {
    seedlink.send(JSON.stringify({
        "subscribe": "II.KAPI",
    }));
    seedlink.send(JSON.stringify({
        "subscribe": "GE.JAGI",
    }));
    seedlink.send(JSON.stringify({
        "subscribe": "GE.PLAI",
    }));

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

function Station(data) {

    var id = data.id;
    var start = data.start;
    var end = data.end;
    var sampel = data.data;
    var STA_SampleRate = data.sampleRate;

    //Data RAW
    var data_sampel = [];
    var index_time = getDates(start, end, TMP_Sampel_Rate);
    sampel.forEach((val, index) => {

        //we need here config gain,locate,offset,filiter,sampel for each station, so that the info is more accurate?
        if(id == "II.KAPI.00.BHZ"){
            val = val+879;
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

            station[j].sampel = station[j].sampel.concat(...data_sampel);
            //console.log("sample collected: ", station[j].sampel.length);
            station[j].end = end; //TODO: update "end" dengan data last sampel ketika di hapus

            break;
        }
    }

    if (new_station) {
        station.push({
            id: id,
            chart: null,
            collection: [],
            sampel: data_sampel,
            start: start,
            end: end,
            sampleRate: STA_SampleRate
        });
    }
}

//sync both stations so that they can pick up in real time later and maybe we can analyze data directly here
function sync() {
    var tnow = new Date().getTime();
    //var t_w_s = Math.floor(tnow / TMP_Sampel_Rate);

    //line
    var go_start = tnow - 4 * 60 * 1000;
    var go_center = Math.floor(go_start / TMP_Sampel_Rate);
    var go_end = tnow + 1 * 10 * 1000;

    var unlock_gui = false;
    if (gui) {
        if (gui_wait_tmp > delayed_sync_render_gui) {
            gui_wait_tmp = 0;
            unlock_gui = true;
        } else {
            gui_wait_tmp++;
            //console.log('wait gui: ',gui_wait_tmp);
        }
    }

    for (var sta in station) {

        var data = station[sta];

        //sebelum mulai cek dulu data lama
        var newupdate = data.sampel.filter(function (item) {
            return go_center <= item.x
        })
        station[sta].sampel = newupdate;

        /*
         - Analyze dulu -
        // Peak ground acceleration (PGA) sama dengan percepatan tanah maksimum yang terjadi selama gempa bumi di suatu lokasi. PGA sama dengan amplitudo percepatan absolut terbesar yang tercatat pada accelerogram di suatu lokasi saat terjadi gempa bumi tertentu.

        Akselerasi puncak tanah dapat dinyatakan dalam g (percepatan karena gravitasi Bumi, setara dengan g-force) baik sebagai desimal atau persentase; dalam m/s2 (1 g = 9,81 m/s2) di mana 1 Gal sama dengan 0,01 m/s² (1 g = 981 Gal).
        */

        var last_index = newupdate[newupdate.length - 1];
        var go_select_start = last_index.x;
        var go_select_end = last_index.x - 10;

        //console.log("Pick Up (RR): " + (go_select_start));

        //Data Select
        var data_select = [];
        newupdate.forEach((val) => {
            //Only for pick up         
            if (go_select_start >= val.x && go_select_end <= val.x) {
                data_select.push(val.y);
            }
        });
        var GAL_raw = Math.max(...data_select);
        var GAL = (GAL_raw / Gain).toFixed(4);
        data_select = null;

        if (GAL >= 0) {
            //var GAL_SampleRate = (GAL / data.sampleRate).toFixed(3);
            if (GAL >= earthquake_come_soon) {
                console.log('ada gempa');

                //tetap buka gui tanpa wait jika ada gempa
                if (gui) {
                    beepme(50, 700, TMP_Sampel_Rate);
                    unlock_gui = true;
                }

            }
        }

        //Update GUI
        if (unlock_gui) {

            var time_sec = Math.floor(tnow / 1000);
            var gui_y = earthquake_come_soon * 1000;

            //buat sampel tmp
            var sampel_tmp = [];
            var index_tmp_time = getDates(go_start, go_end, TMP_Sampel_Rate);
            index_tmp_time.forEach((val, index) => {
                sampel_tmp.push({
                    x: val,
                    y: 0 //getRndInteger(-1000, 1000) TODO: coba nilai rata-rata
                })
            });
            index_tmp_time = null;

            //set real sampel val to sampel tmp
            var sampel = data.sampel;
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
                info_pga = GAL + 'g ('+GAL_raw+')';
            }

            var out = document.getElementById(gui_div);
            // update body
            var infobody =
                ('\
                 Time Start: ' + moment(data.start).format('DD/MM/YYYY HH:mm:ss') + ' Time End: ' + moment(data.end).format('DD/MM/YYYY HH:mm:ss') + ' LC <br>\
                 PGA: ' + info_pga + ' (' + moment(go_select_start * TMP_Sampel_Rate).format('DD/MM/YYYY HH:mm:ss') + ' Last Update) <br>\
                 Delayed: ' + (time_sec - go_select_start) + ' sec <br>\
                ');

            var tb = data.chart;
            if (tb == null) {
                //jika belum ada chart

                //buat dulu
                out.insertAdjacentHTML('beforeend',
                    '<div class="modal-content mb-3" id="' + data.id + '">\
                     <div class="modal-header">\
                     <h5 class="modal-title" id="judul">' + data.id + '</h5>\
                     </div>\
                     <div class="modal-body" id="body"><div id="subbody">' + infobody + '</div><div id="chart"></div></div>\
                    </div>\
                    ');

                //lalu input data chart
                var chart = new ApexCharts(document.getElementById(data.id).querySelector('#chart'), {
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
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: false
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    title: {
                        text: 'RAW DATA',
                        align: 'left'
                    },
                    xaxis: {
                        type: 'numeric',
                    }
                });
                chart.render();

                //pust chart
                station[sta].chart = chart;
                tb = chart;

            } else {
                tb.updateSeries([{
                    data: sampel_tmp
                }]);
            }

            sampel_tmp = null;

            //input chart here
            if (tb !== null) {
                tb.clearAnnotations();
                tb.addXaxisAnnotation({
                    x: time_sec,
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
                tb.addXaxisAnnotation({
                    x: go_select_start,
                    x2: go_select_end,
                    fillColor: '#B3F7CA',
                    label: {
                        text: 'Primer (P-wave) (' + GAL_raw + 'g)'
                    }
                });
            }

            // update body
            document.getElementById(data.id).querySelector('#subbody').innerHTML = infobody;
        }
    };
}
setInterval(sync, TMP_Sampel_Rate * delayed_sync_data);

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}