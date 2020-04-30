var dt;
var socket;

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "15000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

setInterval(function(){ 
  dt = new Date().getTime();
}, 1000);

var noplay=true;
function PlayMe(dd,volum=1){
  if(noplay){
    noplay=false;
    var sound = new Howl(
    {
      src: [dd],
      volume: volum,
      onend: function() {
        //console.log('Finished!');
        noplay=true;
      }
    });
    sound.play(); 
  } 
}

function sendme(status,message,password){
  socket.emit('admin', {status:status,message:message,password:password});
}

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}

function isEmpty(value){
  return (value == null || value.length === 0);
}

$(function() {

  socket = io('https://main.siakbary.com:4002/');
  socket.connect();  

  var namaserver = "Unknown";
  if(!isEmpty(getAllUrlParams().nama)){
    namaserver = getAllUrlParams().nama;
  }

  socket.on('connect', function(){
    toastr["info"](namaserver+": Connect to network!");
  })

  socket.on('disconnect', function(){
    toastr["info"](namaserver+": Disconnect to network!");
  })
/*
  socket.on('userCount', function (data) {
    //number
  });
*/
  socket.on('emergency', function (data) {
    console.log(data);
    if(data && data.status){
      if(data.status == "reset"){
        var curr_page = location.protocol + '//' + location.host + location.pathname;        
        var next_page = next_page = curr_page+"?time="+dt+"&nama="+namaserver;
        window.location = next_page;
      }else if(data.status == "message"){
        //toastr["info"](data.message);
        if(data.message){

         if(data.message.priority == "pop"){

          let timerInterval
          swal({
           title: data.message.title,
           html: data.message.msg,
           type: data.message.icon,
           timer: data.message.timer,
           onOpen: () => {
            swal.showLoading()
           },
           onClose: () => {
            clearInterval(timerInterval)
           }
          }).then((result) => {
              if (
    // Read more about handling dismissals
    result.dismiss === swal.DismissReason.timer
              ) {
                 console.log('I was closed by the timer')
              }
           })

        } else if (data.message.priority == "nopop") {
            toastr[data.message.icon](data.message.msg,data.message.title, {timeOut: data.message.timer,positionClass:data.message.positionClass});
        }else{
            //toastr["info"]("Message is not clear #1");
        }

    }else{
       // toastr["info"]("Message is not clear #2");
    }

      }else if(data.status == "beep"){
        PlayMe(data.url);      
      }else {
      //  toastr["info"]("Emergency Status Unknown");
      }
    }else{
    //  toastr["info"]("Emergency Message Unknown");
    }
  });

/*
  socket.on('FromAPI', function(data){
   //api ews  
  })
*/

  

});
