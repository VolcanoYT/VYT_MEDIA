var event = [];
var station = [];

var seedlink = new WebSocket("wss://seedlink.volcanoyt.com");
seedlink.onopen = function (event) {
    seedlink.send(JSON.stringify({
        "subscribe": "GE.JAGI",
    }));
    seedlink.send(JSON.stringify({
        "subscribe": "GE.PLAI",
    }));
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
function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate);
        currentDate++;
        //console.log(currentDate);
    }
    return dateArray;
}

function Station(data, put = "auto") {
    //console.log(data);

    var id = data.id;
    var start = data.start;
    var end = data.end;
    var sampel = data.data;
    var sampleRate = data.sampleRate;

    var dt = new Date();
    var timenow = dt.getTime();
    var delayed = Math.floor(end / 1000) - Math.floor(timenow / 1000);

    var time = '' + moment(start).format('DD/MM/YYYY HH:mm:ss') + ' - ' + moment(end).format('DD/MM/YYYY HH:mm:ss') + ' (' + moment(timenow).format('DD/MM/YYYY HH:mm:ss') + ')';

    //Data RAW
    var data_sampel = [];
    var index_time = getDates(start, end);
    sampel.forEach((val, index) => {
        data_sampel.push({
            x: index_time[index],
            y: val
        })
    });

    //Peak ground acceleration (PGA) sama dengan percepatan tanah maksimum yang terjadi selama gempa bumi di suatu lokasi. PGA sama dengan amplitudo percepatan absolut terbesar yang tercatat pada accelerogram di suatu lokasi saat terjadi gempa bumi tertentu
    var GAL = Math.max(...sampel) / 1000;
    //Akselerasi puncak tanah dapat dinyatakan dalam g (percepatan karena gravitasi Bumi, setara dengan g-force) baik sebagai desimal atau persentase; dalam m/s2 (1 g = 9,81 m/s2) di mana 1 Gal sama dengan 0,01 m/s² (1 g = 981 Gal).
    var gal_rate = (GAL / sampleRate).toFixed(3);

    //console.log("Saat ini PGA "+GAL+" ("+gal_rate+") ");

    //var judul = id;
    var info_pga = GAL + ' (' + gal_rate + ')';

    var collection = [];
    if (gal_rate >= 0.200) {
        console.log('ada gempa');
    } else {
        console.log('tidak ada gempa');
    }

    var infobody = 
    ('\
        Time: ' + time + ' LocalTime <br>\
        PGA: ' + info_pga + ' <br>\
        Delayed: ' + delayed + ' sec (<time data-now="' + start + '" data-type="sec"></time>) <br> \
    ');

    //cek id div, jika belum ada buat template
    if (document.getElementById(id) == null) {
        var out = document.getElementById(put);
        if (out !== null) {

            //buat dulu
            out.insertAdjacentHTML('beforeend',
            '<div class="modal-content mb-3" id="' + id + '">\
             <div class="modal-header">\
             <h5 class="modal-title" id="judul">' + id + '</h5>\
             </div>\
             <div class="modal-body" id="body"><div id="subbody">'+infobody+'</div><div id="chart"></div></div>\
             </div>\
            ');

            //lalu input data chart
            var chart = new ApexCharts(document.getElementById(id).querySelector('#chart'), {
                series: [{
                    data: data_sampel
                }],
                chart: {
                    id: 'realtime',
                    height: 350,
                    type: 'line',
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth'
                },
                title: {
                    text: 'RAW DATA',
                    align: 'left'
                },
                tooltip: {
                    enabled: false
                },
                markers: {
                    size: 0
                },
                xaxis: {
                    type: 'numeric'
                },
                legend: {
                    show: false
                },
            });
            chart.render();

            station.push({
                id: id,
                chart: chart,
                collection: [collection]
            })

        } else {
            console.log('No TAG AUTO');
        }
    }

    //sekali lagi cek id div jika sudah ada proses di sini
    if (document.getElementById(id) !== null) {

        //cari station dulu
        for (var j in station) {
            if (station[j].id == id) {

                station[j].chart.updateSeries([{
                    data: data_sampel
                }]);
                if (collection.length !== 0) {
                    station[j].collection.push(collection); //jika ada info push it
                }
                document.getElementById(id).querySelector('#subbody').innerHTML = infobody;

                break;
            }
        }

    } else {
        console.log('No TAG STATION');
    }
}