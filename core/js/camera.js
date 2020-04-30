var sdk = $('.sdk');
var id = sdk.attr('date-id');
var myIndex = 0;
var timer;
var slideIndex = 1;
var speed=160;

window.onload = function() {         
    vd(id); 
};

function vd(id){
  $("#videohere").prepend('<video id="MY_VIDEO_1" class="video-js vjs-default-skin vjs-fluid" poster="https://api.volcanoyt.com/timelapse/'+id+'/last.jpg" data-setup="{}"><source src="https://api.volcanoyt.com/timelapse/'+id+'/last.mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>');
  videois=videojs("MY_VIDEO_1", { "controls": true, "autoplay": false, "preload": "none" });
  var dropdown = $('#pilihvideo');
  dropdown.empty();
  dropdown.append('<option selected="true" disabled>Choose</option>');
  dropdown.prop('selectedIndex', 0);
  
  $.getJSON("https://api.volcanoyt.com/camera/data.json?id="+id+"&type=2", function (z) {
  var options = [];
  $.each(z.data.file, function (key, entry) {
    var tp = entry.url.replace(/^.*[\\\/]/, '').replace(".mp4", '');
    if(tp == "last"){
      //tp = "The Latest";
    }else{      
      options.push({value: entry.url, label: tp});      
    }
  })
  options = options.sort(function(a, b) {
    var x = b['label']; var y = a['label'];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
   });

  $.each(options, function(i, option) {
    dropdown.append($('<option></option>').attr('value', "https://api.volcanoyt.com"+option.value).text(moment.unix(option.label).format("DD-MM-YYYY HH:mm:ss")));
  });
  dropdown.append($('<option></option>').attr('value', "https://api.volcanoyt.com/timelapse/"+id+"/last.mp4").text("The Latest"));
  dropdown.change(function() {

    if($('option:selected', this).text() == "The Latest"){
      $("#videohere").hide();
      snap(id);
    }else{
      stop(true);
      $("#CCTV0").hide();
      $("#loading").hide();
      $("#videohere").show();
      $("#console").hide();
      var thhis = $('option:selected', this).val().replace("..",'');
      videois.src({"src": thhis});
      videois.play();
    }

  });  
  });
}
function snap(id){
  $.getJSON("https://api.volcanoyt.com/camera/data.json?id="+id+"&type=1", function (z) {
    stop();
    var options2 = [];    
    $.each(z.data.file, function (key, entry) {
      var tp = entry.url.replace(/^.*[\\\/]/, '').replace(".jpg", '');
      options2.push({value: entry.url, label: tp});  

    });
    options2 = options2.sort(function(a, b) {
      var x = a['label']; var y = b['label'];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
     });

     $("#CCTV0").hide();
     $("#loading").show();
     $("#console").hide();
     var count=0;
     $.each(options2, async function( key, value ) {      
      await Addimg("https://api.volcanoyt.com"+value.value.replace("..",''),value.label,true);
      count++;
      if(count == options2.length){
        tinysort('div#CCTV0>div>img',{attr:'id'});
        $("#CCTV0").show();
        $("#console").show();
        $("#loading").hide();
        slideIndex = 1;
        myIndex = 0;
        start();        
      }

      var current_progress = percentage(count,options2.length);
      $("#loadingc").css("width", current_progress + "%").attr("aria-valuenow", current_progress).text(current_progress + "% Complete | wait making timelapse...");
     });
  }); 
}
function carousel() {
    var i;
    var x = document.getElementsByClassName("mySlides");
    for (i = 0; i < x.length; i++) {
       x[i].style.display = "none";
    }
    myIndex++;
    if (myIndex > x.length) {myIndex = 1}
    x[myIndex-1].style.display = "block";
}
function plusDivs(n) {
    showDivs(slideIndex += n);
}
function currentDiv(n) {
    showDivs(slideIndex = n);
}
function showDivs(n) {
    var i;
    var x = document.getElementsByClassName("mySlides");
    if (n > x.length) {slideIndex = 1}
    if (n < 1) {slideIndex = x.length}
    for (i = 0; i < x.length; i++) {
       x[i].style.display = "none";
    }
    x[slideIndex-1].style.display = "block";
    myIndex = slideIndex -1;
}
function start(){     
      if(timer){
         clearInterval(timer);
         timer=null;
      } else {
         timer = setInterval(carousel,speed);
      }
}
function stop(focus=false){
    if(focus){
      $('#CCTV0').empty();
    }
    if(timer){
       clearInterval(timer);
       timer=null;
    }
}
$(".download").on("click",function() {    
    console.log($(this).attr("name"));
    if($(this).attr("name") == "reloadthis"){
      saveAs($("#reloadthis").attr("src"), "image.jpg");
    }else{
      saveAs($('.mySlides > :visible')[0].currentSrc, "image.jpg");      
    }
 });
 $('.full').on('click', function(){
  // https://stackoverflow.com/questions/7130397/how-do-i-make-a-div-full-screen
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    element = $('#'+$(this).attr("name")).get(0);
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
});