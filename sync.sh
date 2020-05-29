#!/bin/sh
echo "Sync Media...."
patch="/usr/share/nginx/html/core/t/"
tmp="${patch}/tmp"

echo "Hapus file lama...."
rm -rf $patch

mkdir -p $tmp && cd $tmp || exit

echo "Download Fontawesome"
versi_font=5.13.0
mkdir -p $tmp/fontawesome && cd $tmp/fontawesome || exit
wget https://github.com/ngdanghau/fontawesome-pro/releases/download/$versi_font/fontawesome-pro-$versi_font.zip
unzip -o fontawesome-pro-$versi_font.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
unzip -o fontawesome-pro-$versi_font-web.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}fontawesome/ && mkdir -p ${patch}fontawesome/
cp -r fontawesome-pro-$versi_font-web/* ${patch}fontawesome/

cd $tmp || exit

echo "Download VideoJS"
versi_videojs=7.8.2
mkdir -p $tmp/videojs && cd $tmp/videojs || exit
wget https://github.com/videojs/video.js/releases/download/v$versi_videojs/video-js-$versi_videojs.zip
unzip -o video-js-$versi_videojs.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm video-js-$versi_videojs.zip
rm -rf ${patch}videojs/ && mkdir -p ${patch}videojs/
cp -r * ${patch}videojs/
rm -rf ${patch}videojs/examples

cd $tmp || exit

echo "Download Cesium for 3D Map"
versi_cesium=1.69
mkdir -p $tmp/cesium && cd $tmp/cesium || exit
wget https://github.com/CesiumGS/cesium/releases/download/$versi_cesium/Cesium-$versi_cesium.zip
unzip -o Cesium-$versi_cesium.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}Cesium/ && mkdir -p ${patch}Cesium/
cp -r Build/Cesium/* ${patch}Cesium/

cd $tmp || exit

echo "Download Bootstrap"
versi_bootstrap=4.5.0
mkdir -p $tmp/bootstrap && cd $tmp/bootstrap || exit
wget https://github.com/twbs/bootstrap/releases/download/v$versi_bootstrap/bootstrap-$versi_bootstrap-dist.zip
unzip -o bootstrap-$versi_bootstrap-dist.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}bootstrap/ && mkdir -p ${patch}bootstrap/
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
rm -rf ${patch}apexcharts/ && mkdir -p ${patch}apexcharts/
cp -r apexcharts.js-master/dist/* ${patch}apexcharts/

cd $tmp || exit

echo "Download Leaflet.ExtraMarkers for Map (DEV)"
mkdir -p $tmp/extramarkers && cd $tmp/extramarkers || exit
wget https://github.com/coryasilva/Leaflet.ExtraMarkers/archive/master.zip
unzip -o master.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}extramarkers/ && mkdir -p ${patch}extramarkers/
cp -r Leaflet.ExtraMarkers-master/dist/* ${patch}extramarkers/

cd $tmp || exit

echo "Download Jquery-UI"
mkdir -p $tmp/jquery-ui && cd $tmp/jquery-ui || exit
versi_jsui=1.12.1
wget https://jqueryui.com/resources/download/jquery-ui-$versi_jsui.zip
unzip -o jquery-ui-$versi_jsui.zip | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
rm -rf ${patch}jquery-ui/ && mkdir -p ${patch}jquery-ui/
cp -r jquery-ui-$versi_jsui/* ${patch}jquery-ui/

cd $tmp || exit

npmjs(){
  nama=$1
  versi=$2
  folder=$3
  owner=$4

  echo "Download $nama: $versi"
  mkdir -p $tmp/$nama && cd $tmp/$nama || exit

  # https://registry.npmjs.org/@videojs/http-streaming/-/http-streaming-1.13.3.tgz
  # http-streaming-1.13.3.tgz

  if [ ! -z "$owner" ]
  then
    wget https://registry.npmjs.org/$owner/$nama/-/$nama-$versi.tgz
  else
    wget https://registry.npmjs.org/$nama/-/$nama-$versi.tgz
  fi

  tar zxvf $nama-$versi.tgz | awk 'BEGIN {ORS=" "} {if(NR%10==0)print "."}'
  rm -rf ${patch}${nama}/ && mkdir -p ${patch}${nama}/

  if [ ! -z "$folder" ]
  then
    cp -r package/$folder/* ${patch}${nama}/
  else
    cp -r package/* ${patch}${nama}/
  fi

  echo "Install done..."

  cd $tmp || exit

  sleep 2

}

#TODO: why no just use http://browserify.org/? and keep last update
# dom-to-image html2canvas FileSaver
npmjs js-cookie 3.0.0-rc.0 dist
npmjs socket.io-client 2.3.0 dist
npmjs esri-leaflet 2.4.1 dist
npmjs leaflet.heat 0.2.0 dist
npmjs jquery 3.5.1 dist
npmjs sweetalert2 9.13.1 dist
npmjs moment 2.26.0 min
npmjs moment-timezone 0.5.31 builds
npmjs jquery-ui-dist 1.12.1
npmjs toastify-js 1.7.0 src
npmjs tinysort 3.2.7 dist
npmjs lazysizes 5.2.2
npmjs tempusdominus-bootstrap-4 5.1.2 build

npmjs videojs-abloop 1.1.2 dist
# npmjs videojs-contrib-hls 5.15.0 dist
npmjs videojs-flash 2.2.1 dist
npmjs videojs-youtube 2.6.1 dist
npmjs http-streaming 2.0.0-rc.2 dist @videojs

cd $tmp || exit

echo "Download CDN...."
mkdir cdn && cd cdn || exit

wget https://markknol.github.io/console-log-viewer/console-log-viewer.js
wget https://raw.githubusercontent.com/joewalnes/smoothie/master/smoothie.js
wget https://github.com/dorukeker/gyronorm.js/raw/master/dist/gyronorm.complete.min.js
# wget https://s.ytimg.com/yts/jsbin/www-widgetapi-vflh3Z-Yc/www-widgetapi.js -O youtube.js

cp * $patch

cd $tmp || exit

echo "Buat Folder agar bisa di akses user lain"
# https://chmodcommand.com/chmod-755/
chmod -R 755 $patch

echo "bye..."
rm -rf $tmp