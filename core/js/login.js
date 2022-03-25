//force use https for safety
if (location.protocol != 'https:') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
var URL_API = "https://api.volcanoyt.com/";
var wtf = "Login";
var url_cek = 'login';
var autoclose = getAllUrlParams().autoclose;

$('#Wanttodo').change(function (e) {
    wtf = $(this).val();

    isVaild('', 'info', true); // recek

    if (wtf == "Login") {
        $("#tusername").show();
        $("#tname").hide();
        $("#temail").hide();
        $("#ttoken").hide();
        $("#tpassword").show();
        url_cek = 'login';
    } else if (wtf == "Forgot Password") {
        $("#tusername").hide();
        $("#tname").hide();
        $("#temail").show();
        $("#ttoken").show();
        $("#tpassword").show();
        url_cek = 'forgot';
    } else if (wtf == "Register") {
        $("#tusername").show();
        $("#tname").show();
        $("#temail").show();
        $("#ttoken").hide();
        $("#tpassword").show();
        url_cek = 'create';
    } else if (wtf == "Verification") {
        $("#tusername").hide();
        $("#tname").hide();
        $("#temail").show();
        $("#ttoken").show();
        $("#tpassword").hide();
        url_cek = 'verification';
    } else if (wtf == "Login with Google Acount" || wtf == "Login with Twitter Acount") {
        isVaild('Click Submit to login with your social network account', 'info', true);
        $("#tusername").hide();
        $("#tname").hide();
        $("#temail").hide();
        $("#ttoken").hide();
        $("#tpassword").hide(); //bisa costum username dan password
    } else {
        console.log(wtf);
    }
});

function onSubmit(tokeng) {
    if (!isEmpty(tokeng)) {

        if (wtf == "Login with Google Acount") {
            return gogoogle();
        }
        if (wtf == "Login with Twitter Acount") {
            return gotwitter();
        }

        var username = $('#username').val();
        var password = $("#password").val();
        var token = $("#token").val();
        var email = $("#email").val();
        var name = $("#name").val();


        isVaild('Data is being checked...', 'info', false);
        
        $.ajax({
            method: "GET",
            dataType: "json",
            data: {
                username: username,
                name: name,
                password: password,
                email: email,
                token: token,
                gtoken: tokeng
            },
            url: URL_API + "account/v4/" + url_cek + ".json"
        }).done(function (data) {
            Go(data);
        }).fail(function (a) {
            isVaild('There is a problem with server, try asking admin');
        });

    } else {
        isVaild('You are not human?');
    }
};

//https://stackoverflow.com/a/8142000
//https://gist.github.com/mbajur/8325540
var errnyt = true;

function gogoogle(r = true, a = true) {
    isVaild('Login Google...', 'info', false);
    var newWindow = open(URL_API + 'google/login.json?redirect=' + r + '&autologin=' + a + '', 'Google Login', 'width=500,height=800')
    newWindow.focus();
    var pollTimer = window.setInterval(function () {
        if (newWindow.closed !== false) { // !== is required for compatibility with Opera
            window.clearInterval(pollTimer);
            if (errnyt) {
                isVaild('There is a problem with respon api google, try asking admin');
            }
        }
    }, 200);
}

function gotwitter(r = true, a = true) {
    isVaild('Login Twitter...', 'info', false);
    var newWindow = open(URL_API + 'twitter/login.json?redirect=' + r + '&autologin=' + a + '', 'Twitter Login', 'width=500,height=800')
    newWindow.focus();
    var pollTimer = window.setInterval(function () {
        if (newWindow.closed !== false) { // !== is required for compatibility with Opera
            window.clearInterval(pollTimer);
            if (errnyt) {
                isVaild('There is a problem with respon api twitter, try asking admin');
            }
        }
    }, 200);
}

function receiveMessage(event) {

    // TODO: multi api
    // if (event.origin !== URL_API)
    //     return;

    if (event.data.api == "login") {
        errnyt = false;
        Go(event.data.data);
    } else {
        console.log("No Login?", event);
    }
}

window.addEventListener("message", receiveMessage, false);

function Go(data) {
    if (!isEmpty(data)) {
        if (data.code == 200) {
            $("#loading").hide();
            try {
                $('#token_private').val(data.token_private);
                if (wtf == "Login" || wtf == "Login with Google Acount" || wtf == "Login with Twitter Acount") {
                    if (autoclose == "true") {
                        $('#pesan').html('<div class="alert alert-info" role="alert">' + data.status + ', windows login will close automatically in 5 seconds</div>');
                        window.opener.postMessage({
                            "api": "login",
                            "data": data
                        }, "*");
                        setTimeout(function () {
                            window.close();
                        }, 5000);
                        return null;
                    }
                    $("#copy").show();
                }
                $('#pesan').html('<div class="alert alert-info" role="alert">' + data.status + '</div>');
                $("#login").show();

            } catch (error) {
                console.log(error);
            }

        } else {
            isVaild(data.status, 'warning');
        }
    } else {
        isVaild('There is a problem with server, try asking admin');
    }
}

function isVaild(pesan = "", alert = 'danger', show = true) {
    if (show) {
        $("#login").show();
        $("#loading").hide();
    } else {
        $("#login").hide();
        $("#loading").show();
    }
    if (isEmpty(pesan)) {
        $('#pesan').html('');
    } else {
        $('#pesan').html('<div class="alert alert-' + alert + '" role="alert">' + pesan + '</div>');
    }

}

$('[data-toggle="password"]').each(function () {
    var input = $(this);
    var eye_btn = $(this).parent().find('.input-group-text');
    eye_btn.css('cursor', 'pointer').addClass('input-password-hide');
    eye_btn.on('click', function () {
        if (eye_btn.hasClass('input-password-hide')) {
            eye_btn.removeClass('input-password-hide').addClass('input-password-show');
            eye_btn.find('.fa').removeClass('fa-eye-slash').addClass('fa-eye')
            input.attr('type', 'text');
        } else {
            eye_btn.removeClass('input-password-show').addClass('input-password-hide');
            eye_btn.find('.fa').removeClass('fa-eye').addClass('fa-eye-slash')
            input.attr('type', 'password');
        }
    });
});

$('[data-input="copy"]').each(function () {
    $(this).on('click', function (e) {
        try {
            this.select();
            var eye_btn = $(this).parent().parent().find('label')[0].innerText;
            $('#pesan').html('<div class="alert alert-info" role="alert">Copy ' + eye_btn + '</div>');
            if (this.type == 'password') {
                this.type = 'text';
            }
            document.execCommand('copy');
            if (this.type == 'text') {
                this.type = 'password';
            }
        } catch (error) {
            console.log(error);
        }
    });
});

function isEmpty(str) {
    return (!str || 0 === str.length);
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

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

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