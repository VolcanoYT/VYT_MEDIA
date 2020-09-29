var wait = ms => new Promise((r, j) => setTimeout(r, ms))
async function updatecek() {
    $.ajax({
            method: "GET",
            dataType: "json",
            cache: false,
            url: URL_API+"camera/list.json",
        }).done(async function(c) {
            for (i in c.results) {
                var addme = c.results[i];
                var info = await get(addme);
                await wait(1000 * 15);
            };
            return updatecek();
        })
        .fail(async function(a) {
            console.log(a);
            await wait(1000 * 15);
            return updatecek();
        });
}

function get(addme) {
    return new Promise(resolve => {
        if(![192,191].includes(addme.id)) {
            jQuery.ajax({
                url: URL_CDN+"timelapse/" + addme.id + "/raw.webp",
                cache: false,
                xhr: function() {
                    var xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob'
                    return xhr;
                },
                success: async function(data) {
                    var img = document.getElementById("AGCCTV0");
                    var url = window.URL || window.webkitURL;
                    img.src = url.createObjectURL(data);
                    $('#namax').text(addme.name); // + " (" + addme.id+")"
                    resolve(200);
                },
                error: function() {
                    resolve(404);
                }
            });
        }else{
            resolve(401);
        }
        
    });
}

updatecek();