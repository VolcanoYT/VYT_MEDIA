$('body').on('click', '.mirova_loader', function (e) {
    var id = $(this).attr("data-id");
    var nama = $(this).attr("data-nama");
    $.ajax({
        method: "GET",
        dataType: "json",
        data: {
            id: id
        },
        cache: false,
        url: URL_API + "volcano/stats/mirova.json",
    }).done(function (bb) {
        //console.log(bb);
        if (bb && bb.code) {
            if (bb.code == 200) {
                var dataz = [];
                $('.mirova_loader').replaceWith('<div id="mirova"></div>');
                $.each(bb.results, function (index, value) {
                    dataz.push([value.time * 1000, value.count]);
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
                        name: nama,
                        data: dataz
                    }],
                    title: {
                        text: 'Volcanic '+nama+' Hotspot by Mirova',
                        align: 'left'
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
                    },
                    yaxis: {
                        title: {
                            text: 'Mw (Middle Wavelength)'
                        }
                    }
                }
                var chart = new ApexCharts(document.querySelector("#mirova"), options);
                chart.render();
            } else {
                //skip if not found
            }
        } else {
            //skip if not found
        }
    }).fail(function (a) {
        Swal.fire({
            type: 'error',
            title: 'Error load data mirova'
        })
    });
});