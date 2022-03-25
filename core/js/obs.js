var OBSMode = false;
var OBSBypass = getAllUrlParams().OBSBypass;
try {
    if (window.obsstudio) {
        var OBS_VER = window.obsstudio.pluginVersion;
        if (!isEmpty(OBS_VER)) {
            OBSMode = true;
        }
    }
} catch (e) {
    //Noting
}
if (OBSBypass !== "true") {
    if (OBSMode) {
        window.location.href = "/obs.php";
    }
}