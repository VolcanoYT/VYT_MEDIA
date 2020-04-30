let ajaxUrl = "https://api.volcanoyt.com/site/stats.json";
let dataSet = [];
let VdataSet = [];
let lowdataSet = [];

function ajax_request(url) {
    let xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            handle_chart(this);
        }
    }
    xhttp.open("GET", url, true);
    xhttp.send();
}

function handle_chart(data) {
    let parsed_data = JSON.parse(data.responseText);
    $.each(parsed_data.data.earthquake, function(index, value) {
        dataSet.push([value.time * 1000, value.count]);
    });
    $.each(parsed_data.data.volcano, function(index, value) {
        VdataSet.push([value.time * 1000, value.count]);
    });
    $.each(parsed_data.data.earthquakelow, function(index, value) {
        lowdataSet.push([value.time * 1000, value.count]);
    });

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
        series: [{
                name: "Earthquake",
                data: dataSet
            },
            {
                name: "Volcano",
                data: VdataSet
            },
            {
                name: "Microquake",
                data: lowdataSet
            }
        ],
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
        document.querySelector("#chart"),
        options
    );
    chart.render();
}
$(window).on('load', function() {
    ajax_request(ajaxUrl);
    var eqtab = $('#eqt').DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "https://api.volcanoyt.com/earthquake/geo.json",
            "data": function(d) {
                d.limit = 10;
                d.format = 'jsonp';
                d.upto = 2;
                // d.custom = $('#myInput').val();
                // etc
            },
            dataSrc: 'results'
                /*
                "dataSrc": function ( json ) {
                    //console.log(json)
                  var newarr=[];
                  var q=[];
                  for ( var i=0, ien=json.features.length ; i<ien ; i++ ) {
                      var data = json.features[i];
                      //console.log(data);
                      var newpp=[];
                      newpp.push(data['properties']['time']);
                      newpp.push(data['properties']['time']);
                      newpp.push(data['properties']['mag']);
                      newpp.push(data['geometry']['coordinates'][2]);
                      newpp.push(data['properties']['title']);
                      newpp.push(data['properties']['sources']);
                      newarr[i] = newpp;
                    //json.data[i][0] = '<a href="/message/'+[0]+'>View message</a>';
                  }             
                  q['data']=newarr;
                  console.log(q);
                  return q;
                }*/
        },
        "columns": [{
                data: 'data'
            },
            {
                data: 'magnitude'
            },
            {
                data: 'depth'
            },
            {
                data: 'place'
            },
            {
                data: 'provider'
            }
        ],
        "order": [
            [0, "desc"]
        ]
    });

    function statsstream() {
        $.ajax({
            method: "GET",
            dataType: "json",
            data: {
                update: localDate
            },
            url: "https://api.volcanoyt.com/streaminfo.json",
        }).done(function(data) {
            try {
                //console.log(data);
                $.each(data.simpel, function(index, value) {
                    try {
                        $("#ss-" + index).html(value);
                    } catch (error) {
                        console.log('My array has at position ' + index + ', this value: ' + value);
                    }
                });
                for (let value in data.data) {
                    var obj = data.data[value];
                    if (obj.raw.code !== 501) {
                        console.log(obj);
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }).fail(function(a) {
            console.log(a);
        });

        $.ajax({
            method: "GET",
            dataType: "json",
            data: {
                update: localDate
            },
            url: "https://app.volcanoyt.com/online",
        }).done(function(data) {
            try {
                //console.log(data);
                $.each(data, function(index, value) {
                    try {
                        $("#online-" + index).html(value);
                    } catch (error) {
                        console.log('My array has at position ' + index + ', this value: ' + value);
                    }
                });
                for (let value in data.data) {
                    var obj = data.data[value];
                    if (obj.raw.code !== 501) {
                        console.log(obj);
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }).fail(function(a) {
            console.log(a);
        });
    }

    setInterval(function() {
        eqtab.ajax.reload(null, false);
    }, 1000 * 300);

    setInterval(function() {
        statsstream();
    }, 1000 * 30);

    statsstream();
});