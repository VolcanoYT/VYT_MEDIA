// https://www.seiscomp3.org/doc/seattle/2012.279/apps/seedlink.html
var event = [];
var station = [];

// higher less accurate because less data sampel but faster processing and does not take much memory
var TMP_Sampel_Rate = 1000;

// every 3 seconds synchronizes all stations.
var delayed_sync_data = 3;

// false when you are ready, gui is very useful when you are still debugging process but it is quite slow for analysis data.
var gui = true;
var gui_div = "auto";

var seedlink = new WebSocket("wss://seedlink.volcanoyt.com");
seedlink.onopen = function (event) {
    seedlink.send(JSON.stringify({
        "subscribe": "GE.JAGI",
    }));
    seedlink.send(JSON.stringify({
        "subscribe": "GE.PLAI",
    }));

    if (gui)
        $('#isonline').html("Online");
}
seedlink.onmessage = function (eventt) {
    var json = JSON.parse(eventt.data);
    if (json.error) {
        console.error(json.error);
    } else if (json.success) {
        console.log(json.success);
    } else {
        Station(json);
    }
}

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
    var sampel_tmp = [];

    var tnow = new Date().getTime();
    //var t_w_s = Math.floor(tnow / TMP_Sampel_Rate);

    //line
    var go_start = tnow - 4 * 60 * 1000;
    var go_center = Math.floor(go_start / TMP_Sampel_Rate);
    var go_end = tnow + 1 * 10 * 1000;

    //pick up
    var go_select_start = Math.floor(go_start / TMP_Sampel_Rate) + 240;
    var go_select_end = Math.floor(go_end / TMP_Sampel_Rate) - 20;

    //console.log("pick up: " + (go_select_start - go_select_end));

    // index tmp
    var index_time = getDates(go_start, go_end, TMP_Sampel_Rate);
    index_time.forEach((val, index) => {
        sampel_tmp.push({
            x: val,
            y: 0 //getRndInteger(-1000, 1000) TODO: coba nilai rata-rata
        })
    });
    index_time = null;

    for (var sta in station) {

        var data = station[sta];

        //sebelum mulai cek dulu data lama
        var newupdate = data.sampel.filter(function (item) {
            return go_center <= item.x
        })
        station[sta].sampel = newupdate;

        //ini sampel dari raw
        var sampel = data.sampel;
        for (var sr in sampel) {
            //ini sampel tmp buat cari blok dari sampel real
            for (var jt in sampel_tmp) {
                //jika cocok ubah
                if (sampel[sr].x == sampel_tmp[jt].x) {
                    sampel_tmp[jt].y = sampel[sr].y;
                    break;
                }
            };
            //debugger;
        };

        /*
         - Analyze dulu -
        // Peak ground acceleration (PGA) sama dengan percepatan tanah maksimum yang terjadi selama gempa bumi di suatu lokasi. PGA sama dengan amplitudo percepatan absolut terbesar yang tercatat pada accelerogram di suatu lokasi saat terjadi gempa bumi tertentu.

        Akselerasi puncak tanah dapat dinyatakan dalam g (percepatan karena gravitasi Bumi, setara dengan g-force) baik sebagai desimal atau persentase; dalam m/s2 (1 g = 9,81 m/s2) di mana 1 Gal sama dengan 0,01 m/s² (1 g = 981 Gal).
        */

        var dt = new Date();
        var timenow = dt.getTime();

        var delayed = Math.floor(timenow / 1000) - Math.floor(data.end / 1000);
        var time = '' + moment(data.start).format('DD/MM/YYYY HH:mm:ss') + ' - ' + moment(data.end).format('DD/MM/YYYY HH:mm:ss') + ' (' + moment(timenow).format('DD/MM/YYYY HH:mm:ss') + ')';

        //Data Select
        var data_select = [];
        newupdate.forEach((val) => {
            //Only for pick up         
            if (go_select_start >= val.x && go_select_end <= val.x) {
                data_select.push(val.y);
            }
        });
        var GAL = Math.max(...data_select) / 1000;
        data_select = null;

        var info_pga = 'NO DATA';
        if (GAL >= 0) {
            var gal_rate = (GAL / data.sampleRate).toFixed(3);
            info_pga = GAL + ' (' + gal_rate + ')';            
            /*
            if(data.id == "GE.JAGI..BHZ"){
                var nilai = 700+(GAL * 10);
                beepme(50,nilai,TMP_Sampel_Rate);
                console.log("beep: ",nilai);
            } 
            console.log('ada data');
            */

            if (gal_rate >= 0.200) {
                console.log('ada gempa');
                beepme(50,nilai,TMP_Sampel_Rate);
            } else {
                //console.log('tidak ada gempa');
            }            
        }

        //jika tmp sampel sudah di update, update it ke gui
        if (gui) {
            var out = document.getElementById(gui_div);
            // update body
            var infobody =
                ('\
                 Time: ' + time + ' LocalTime <br>\
                 PGA: ' + info_pga + ' <br>\
                 Delayed: ' + delayed + ' sec <br> \
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

            //input chart here
            if (tb !== null) {
                tb.clearAnnotations();
                tb.addXaxisAnnotation({
                    x: Math.floor(timenow / TMP_Sampel_Rate),
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
                        text: 'Analyze'
                    }
                });
            }

            // update body
            document.getElementById(data.id).querySelector('#subbody').innerHTML = infobody;
        }

    };

    sampel_tmp = null;
}
setInterval(sync, TMP_Sampel_Rate * delayed_sync_data);

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}