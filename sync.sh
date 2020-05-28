#!/bin/sh
echo "Sync Media...."
patch="/usr/share/nginx/html/core/t/"
tmp="${patch}/tmp"

mkdir -p $tmp && cd $tmp || exit

echo "Download Fontawesome"
versi_font=5.13.0
mkdir -p $tmp/fontawesome && cd $tmp/fontawesome || exit
wget https://github.com/ngdanghau/fontawesome-pro/releases/download/$versi_font/fontawesome-pro-$versi_font.zip
unzip -o fontawesome-pro-$versi_font.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
unzip -o fontawesome-pro-$versi_font-web.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
cp -r fontawesome-pro-$versi_font-web/* ${patch}fontawesome/

cd $tmp || exit

echo "Download VideoJS"
versi_videojs=7.8.2
mkdir -p $tmp/videojs && cd $tmp/videojs || exit
wget https://github.com/videojs/video.js/releases/download/v$versi_videojs/video-js-$versi_videojs.zip
unzip -o video-js-$versi_videojs.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm video-js-$versi_videojs.zip
cp -r * ${patch}videojs/
rm -rf ${patch}videojs/examples

cd $tmp || exit

echo "Download Cesium for 3D Map"
versi_cesium=1.69
mkdir -p $tmp/cesium && cd $tmp/cesium || exit
wget https://github.com/CesiumGS/cesium/releases/download/$versi_cesium/Cesium-$versi_cesium.zip
unzip -o Cesium-$versi_cesium.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
cp -r Build/Cesium/* ${patch}Cesium/

cd $tmp || exit

echo "Download Bootstrap"
versi_bootstrap=4.5.0
mkdir -p $tmp/bootstrap && cd $tmp/bootstrap || exit
wget https://github.com/twbs/bootstrap/releases/download/v$versi_bootstrap/bootstrap-$versi_bootstrap-dist.zip
unzip -o bootstrap-$versi_bootstrap-dist.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
cp -r bootstrap-$versi_bootstrap-dist/* ${patch}bootstrap/

cd $tmp || exit

echo "Download Leaflet for 2D Map"
mkdir -p $tmp/leaflet && cd $tmp/leaflet || exit
versi_leaflet=1.6.0
wget https://github.com/Leaflet/Leaflet/archive/v$versi_leaflet.zip
unzip -o v$versi_leaflet.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}leaflet/ && mkdir -p ${patch}leaflet/
cp -r Leaflet-${versi_leaflet}/dist/* ${patch}leaflet/

cd $tmp || exit

echo "Download DataTables for Tabel (DEV)"
mkdir -p $tmp/DataTables && cd $tmp/DataTables || exit
wget https://github.com/DataTables/DataTables/archive/master.zip
unzip -o master.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}DataTables/ && mkdir -p ${patch}DataTables/
cp -r DataTables-master/media/* ${patch}DataTables/

cd $tmp || exit

echo "Download ApexCharts for Charts (DEV)"
mkdir -p $tmp/apexcharts && cd $tmp/apexcharts || exit
wget https://github.com/apexcharts/apexcharts.js/archive/master.zip
unzip -o master.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
cp -r apexcharts.js-master/dist/* ${patch}apexcharts/

cd $tmp || exit

echo "Download Leaflet.ExtraMarkers for Map (DEV)"
mkdir -p $tmp/extramarkers && cd $tmp/extramarkers || exit
wget https://github.com/coryasilva/Leaflet.ExtraMarkers/archive/master.zip
unzip -o master.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
cp -r Leaflet.ExtraMarkers-master/dist/* ${patch}extramarkers/

cd $tmp || exit

echo "Download Jquery-UI"
mkdir -p $tmp/jquery-ui && cd $tmp/jquery-ui || exit
versi_jsui=1.12.1
wget https://jqueryui.com/resources/download/jquery-ui-$versi_jsui.zip
unzip -o jquery-ui-$versi_jsui.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
cp -r jquery-ui-$versi_jsui/* ${patch}jquery-ui/

cd $tmp || exit

echo "Download Sweetalert2"
mkdir -p $tmp/sweetalert2 && cd $tmp/sweetalert2 || exit
versi_sweetalert2=9.13.1
wget https://registry.npmjs.org/sweetalert2/-/sweetalert2-$versi_sweetalert2.tgz
tar zxvf sweetalert2-$versi_sweetalert2.tgz | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}sweetalert2/ && mkdir -p ${patch}sweetalert2/
cp -r package/dist/* ${patch}sweetalert2/

cd $tmp || exit

echo "Download Jquery"
mkdir -p $tmp/jquery && cd $tmp/jquery || exit
versi_jquery=3.5.1
wget https://registry.npmjs.org/jquery/-/jquery-$versi_jquery.tgz
tar zxvf jquery-$versi_jquery.tgz | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}jquery/ && mkdir -p ${patch}jquery/
cp -r package/dist/* ${patch}jquery/

cd $tmp || exit

echo "Download Esri for Map"
mkdir -p $tmp/esri && cd $tmp/esri || exit
versi_esri=2.4.1
wget https://registry.npmjs.org/esri-leaflet/-/esri-leaflet-$versi_esri.tgz
tar zxvf esri-leaflet-$versi_esri.tgz | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}esri/ && mkdir -p ${patch}esri/
cp -r package/dist/* ${patch}esri/

cd $tmp || exit

echo "Download socket.io-client for realtime data (Move to engine.io)"
mkdir -p $tmp/socket && cd $tmp/socket || exit
versi_socket=2.3.0
wget https://registry.npmjs.org/socket.io-client/-/socket.io-client-$versi_socket.tgz
tar zxvf socket.io-client-$versi_socket.tgz | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}socket/ && mkdir -p ${patch}socket/
cp -r package/dist/* ${patch}socket/

cd $tmp || exit

#echo "Download CDN...."
#mkdir cdn && cd cdn || exit

#wget https://markknol.github.io/console-log-viewer/console-log-viewer.js
#wget 

echo "Buat Folder agar bisa di akses user lain"
# https://chmodcommand.com/chmod-755/
chmod -R 755 $patch

echo "bye..."
rm -rf $tmp/*