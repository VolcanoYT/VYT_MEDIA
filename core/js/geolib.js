/**
 * 
 * @param {*} data
 * What is the status of an earthquake?
 */
function EarthquakeStatus(data) {
    if (data == "0") {
        return "Automatic";
    } else if (data == "1") {
        return "Preliminary";
    } else if (data == "2") {
        return "Confirmed";
    } else if (data == "3") {
        return "Update";
    } else if (data == "4") {
        return "Delete (wrong)";
    } else if (data == "99") {
        return "NotSure";
    } else {
        return "Unknown";
    }
}

/**
 * 
 * @param {*} level
 * What is the status of an volcano?
 */
function VolcanoStatus(level) {
    if (level == 1) {
        return "Normal";
    } else if (level == 2) {
        return "Unrest";
    } else if (level == 3) {
        return "Minor";
    } else if (level == 4) {
        return "Eruption";
    } else if (level == 5) {
        return "Danger";
    } else {
        return "Unknown";
    }
}

/**
 * 
 * @param {*} coord 
 * https://math.stackexchange.com/questions/1191689/how-to-calculate-the-antipodes-of-a-gps-coordinate
 * Antipodes are mostly used to predict earthquakes but that does not mean it will certainly happen
 */
function antipode(coord) {
    return new L.LatLng(-1 * coord['lat'], coord['lng'], coord['alt']);
}

/**
 * Return the radius of the circle in which the mmi is greater than 3.
 * The unit is km.
 * https://github.com/SPREP/mhews/blob/master/imports/api/geoutils.js
 */
function getIntensityCircleRadius(mw, depth) {
    let radiusResolution = 100;
    let maximumRadius = 1000;
    let radius = 0;
    for (let sx = radiusResolution; sx <= maximumRadius; sx += radiusResolution) {
        let mmi = getMMI(calculatePGV(mw, depth, sx));
        if (mmi < 4) {
            return radius;
        }
        radius = sx;
    }
    return radius;
}

/**
 * According to the table in http://earthquake.usgs.gov/earthquakes/shakemap/background.php#wald99b.
 * MMI=2 is skipped.
 */
function getMMI(pgv) {
    if (pgv < 0.1) return 1;
    else if (pgv < 1.1) return 3;
    else if (pgv < 3.4) return 4;
    else if (pgv < 8.1) return 5;
    else if (pgv < 16) return 6;
    else if (pgv < 31) return 7;
    else if (pgv < 60) return 8;
    else if (pgv < 116) return 9;
    else return 10;
}

/**
 * Calculate PGV at the surface distance sx from the epicenter.
 * According to http://www.data.jma.go.jp/svd/eew/data/nc/katsuyou/reference.pdf
 */
function calculatePGV(mw, depth, sx) {
    let l = Math.pow(10, 0.5 * mw - 1.85);
    let x = Math.max(sx / Math.cos(Math.atan2(depth, sx)) - l * 0.5, 3);
    let pgv600 = Math.pow(10, 0.58 * mw + 0.0038 * depth - 1.29 - log10(x + 0.0028 * Math.pow(10, 0.5 * mw) - 0.002 * x));
    let pgv700 = pgv600 * 0.9;
    let avs = 600;
    let arv = Math.pow(10, 1.83 - 0.66 * log10(avs));
    let pgv = arv * pgv700;

    return pgv;
}

/**
 * Math.log10 seems not yet supported by all devices, so we define it here.
 */
function log10(value) {
    return Math.log(value) / Math.log(10);
}

/**
 * Vivid red color for a strong magnitude, mild yellow color for a weak magnitude.
 */
function getMagnitudeColor(mw) {
    if (mw < 3) {
        return '#FFFF00';
    } else if (mw < 4) {
        return '#FFCC00';
    } else if (mw < 5) {
        return '#FF9900';
    } else if (mw < 6) {
        return '#FF6600';
    } else if (mw < 7) {
        return '#FF3300';
    }
    return '#FF0000';
}

/**
 * Color based on depth base
 */
function ColorDepth(depthtwo) {
    var normalicon = "blue";
    if (depthtwo > 70) {
        normalicon = "green";
    }
    if (depthtwo > 150) {
        normalicon = "yellow";
    }
    if (depthtwo > 300) {
        normalicon = "orange";
    }
    if (depthtwo > 700) {
        normalicon = "pink";
    }
    return normalicon;
}

/**
 * Just random color :)
 */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// https://stackoverflow.com/a/17268489
// https://en.wikipedia.org/wiki/Peak_ground_acceleration
function getColor(value) {
    //value from 0 to 1
    var hue = ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
}