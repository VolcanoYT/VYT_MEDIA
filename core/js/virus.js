var tmp = [];

function old(sumber, pco, nilai) {
    var noproblem = true;
    for (var j in tmp) {
        if (tmp[j].pco == pco) {
            if (tmp[j].source == sumber) {
                var nilaib = nilai - tmp[j].nilai;
                if (tmp[j].nilai !== nilai) {
                    tmp[j].nilai = nilai;
                    tmp[j].time = new Date();
                }
                return number_format(nilaib);
            }
        }
    }
    if (noproblem) {
        tmp.push({
            source: sumber,
            pco: pco,
            nilai: nilai,
            time: new Date()
        });
    }
    return 0;
}

var livefind;
$(document).ready(function () {

    var vcot = $('#countv').DataTable({
        "processing": true,
        "ajax": {
            "url": URL_API+"virus/get.json",
            "data": function (d) {
                d.count = true;
                d.cache = true;
            },
            dataSrc: 'results'
        },
        "columns": [{
                data: 'source',
                render: function (data, type, row) {
                    var go = 'Unknown';
                    if (data == 'CNA0') {
                        go = '<a href="https://github.com/nyem69/coronavirus_data/blob/master/data/cna.tsv" target="_blank" rel="sponsored">ChannelNewsAsia (BK)</a>';
                        //https://infographics.channelnewsasia.com/covid-19/map.html
                    } else if (data == 'CSSE0') {
                        go = '<a href="https://github.com/nyem69/coronavirus_data/blob/master/data/jhu-opsdashboard.tsv" target="_blank" rel="sponsored">JHU-CSSE Dashboard (BK)</a>';
                        //https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6
                    } else if (data == 'BNO0') {
                        go = '<a href="https://github.com/nyem69/coronavirus_data/blob/master/data/bno.tsv" target="_blank" rel="sponsored">BNO News (BK)</a>'; //14 hari lalu
                    } else if (data == 'BNO1') {
                        go = '<a href="https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vR30F8lYP3jG7YOq8es0PBpJIE5yvRVZffOyaqC0GgMBN6yt0Q-NI8pxS7hd1F9dYXnowSC6zpZmW9D/pubhtml/sheet?headers=false&gid=0" target="_blank" rel="sponsored">BNO News (DT)</a>'; //14 hari lalu
                    } else if (data == 'WHO0') {
                        //https://experience.arcgis.com/experience/685d0ace521648f8a5beeeee1b9125cd
                        go = '<a href="https://github.com/nyem69/coronavirus_data/blob/master/data/who.tsv" target="_blank" rel="sponsored">WHO Dashboard (BK)</a>'; //8 hari lalu
                    } else if (data == 'WDM0') {
                        go = '<a href="https://www.worldometers.info/coronavirus/" target="_blank" rel="sponsored">WorldoMeters (DT)</a>';
                    } else if (data == 'CDS0') {
                        go = '<a href="https://blog.lazd.net/coronadatascraper/#data.csv" target="_blank" rel="sponsored">Corona Data Scraper (Global/BK)</a>';
                    }
                    return go;
                }
            },
            {
                data: 'deaths',
                render: function (data, type, row) {
                    return ' ' + number_format(data) + ' (' + old(row.source, 'deaths', data) + ') ';
                }
            },
            {
                data: 'recovered',
                render: function (data, type, row) {
                    return ' ' + number_format(data) + ' (' + old(row.source, 'recovered', data) + ') ';
                }
            },
            {
                data: 'confirmed',
                render: function (data, type, row) {
                    return ' ' + number_format(data) + ' (' + old(row.source, 'confirmed', data) + ') ';
                }
            }
        ],
        "paging": false,
        "ordering": false,
        "info": false,
        "searching": false
    });

    var vtab = $('#virus').DataTable({
        "processing": true,
        "serverSide": true,
        //"paging": false,
        "ordering": false,
        "info": false,
        "searching": false,
        "bLengthChange": false,
        "ajax": {
            "url": URL_API+"virus/get.json",
            "data": function (d) {
                d.limit = 10;
                d.cache = true;
                d.search = livefind;
            },
            dataSrc: 'results'
        },
        "columns": [{
                data: 'country'
            },
            {
                data: 'state'
            },
            {
                data: 'nama'
            },

            {
                data: 'deaths',
                render: function (data, type, row) {
                    return ' ' + number_format(data) + ' (' + number_format(row.comparison2) + ') ';
                }
            },
            {
                data: 'recovered',
                render: function (data, type, row) {
                    return ' ' + number_format(data) + ' (' + number_format(row.comparison1) + ') ';
                }
            },
            {
                data: 'confirmed',
                render: function (data, type, row) {
                    return ' ' + number_format(data) + ' (' + number_format(row.comparison) + ') ';
                }
            },

            {
                data: 'tupdate',
                render: function (data, type, row) {
                    return '<time data-now="' + data + '">' + data + '</time>';
                }
            },

            {
                data: 'source'
            }
        ],
        "order": [
            [6, "desc"]
        ]
    });

    // this is the id of the form
    $("#find").submit(function (e) {

        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        var term = form.find('input').val();
        //console.log(term);
        livefind = term;
        vtab.ajax.reload();

    });

    function ajaxr() {
        $.ajax({
            method: "GET",
            dataType: "json",
            cache: false,
            url: URL_API+"virus/get.json",
            data: {
                count: true,
                cache: true
            }
        }).done(function (data) {
            try {
                console.log(data)
            } catch (error) {
                console.log(error);
            }
        }).fail(function (a) {
            console.log(a);
        });
    }

    setInterval(function () {
        vtab.ajax.reload(null, false);
        vcot.ajax.reload(null, false);
        handle_chart(tmp);
    }, 1000 * 60);

    var pertamakali = false;
    var datap = [];

    function handle_chart(data) {
        //let parsed_data = JSON.parse(data.response);
        //console.log(data);

        $.each(data, function (index, value) {
            console.log(value);
            var noproblem = true;
            for (j in datap) {

                //jika sudah ada log
                if (datap[j].source == value.source) {
                    noproblem = false;
                    datap[j].data.push([value.time, value.nilai]); //save ke log              
                    break
                } else {

                }
            }

            if (noproblem) {
                datap.push({
                    source: value.source,
                    data: [
                        [value.time, value.confirmed]
                    ]
                });
            }
            //dataSet.push([value.time * 1000, value.count]);
        });
        //console.log(datap);

        /*
        $.each(parsed_data.data.volcano, function (index, value) {
            VdataSet.push([value.time * 1000, value.count]);
        });
        $.each(parsed_data.data.earthquakelow, function (index, value) {
            lowdataSet.push([value.time * 1000, value.count]);
        });
        */
        /*
                var options = {
                    chart: {
                        background: '#343a40',
                        height: 350,
                        type: 'line',
                        shadow: {
                            enabled: true,
                            color: '#000',
                            top: 18,
                            left: 7,
                            blur: 10,
                            opacity: 1
                        }
                    },
                    theme: {
                        mode: 'dark',
                        palette: 'palette1',
                    },
                    //colors: ['#77B6EA', '#545454'],
                    dataLabels: {
                        enabled: true,
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    series: datap,
                    title: {
                        text: 'Daily Activities',
                        align: 'center'
                    },
                    grid: {
                        borderColor: '#e7e7e7',
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                        },
                    },
                    markers: {
                        size: 6
                    },
                    xaxis: {
                        type: "datetime"
                    }
                }
                var chart = new ApexCharts(
                    document.querySelector("#virusdaily"),
                    options
                );
                chart.render();
                */
    }
});