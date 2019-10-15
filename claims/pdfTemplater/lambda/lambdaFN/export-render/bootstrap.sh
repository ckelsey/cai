#!/bin/bash
set -e

#####################
# Inkscape Install # 
#####################
# Script installs Inkscape from source for Amazon AMI Instance (CentOS/REHL)
#
# Works as of 01/03/2016

# Dep Versions:
#####################
# libsigc++-2.6.2
# cairomm-1.12.0
# glib-2.46.2
# glibmm-2.46.3
# atk-2.19.90
# gdk-pixbuf-2.32.3
# gtk+-2.24.29
# pango-1.30.1
# pangomm-2.27.1
# atkmm-2.22.7
# gtkmm-2.24.4
# librevenge-0.0.1
# libwpd-0.10.0
# libwpg-0.3.1
# libvisio-0.1.0
# libcdr-0.1.2
# inkscape-0.91

# update yum packages
sudo yum -y update
sudo yum -y upgrade

# enable EPEL6 by changing enabled=0 -> enabled=1
# sudo sed -i -e '/\[epel\]/,/^\[/s/enabled=0/enabled=1/' /etc/yum.repos.d/epel.repo
sudo yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo yum-config-manager --enable epel

# Install available dependencies from PPA
sudo yum -y groupinstall "Development Tools"
sudo yum -y install python-devel cpp gcc gcc-c++ make ImageMagick-c++-devel ImageMagick-c++ ImageMagick-devel ImageMagick intltool gc gc-devel lcms lcms-devel gsl gsl-devel libxml2-devel libxslt-devel boost-devel popt-static poppler-devel autoconf automake intltool libtool libffi libffi-devel pcre pcre-devel ruby ruby-devel pango pango-devel libicu-devel gperf

# Export the pkgconfig locations
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig/:/usr/share/pkgconfig/:/usr/lib64/pkgconfig/

cwd=$(pwd)
CPU_COUNT=$(nproc)
cd /tmp/

if [ -d "InkDownloads" ]; then
  echo "Download Dir already exists!"
  echo "Aborting Install"
  exit 
fi

mkdir InkDownloads
cd InkDownloads/

# Install libsigc++-
wget http://ftp.gnome.org/pub/GNOME/sources/libsigc++/2.6/libsigc++-2.6.2.tar.xz
tar xf libsigc++-2.6.2.tar.xz
cd libsigc++-2.6.2
./configure && make -j $CPU_COUNT && sudo make install
cd ../
rm libsigc++-2.6.2.tar.xz
rm -rf libsigc++-2.6.2

# Install cairomm
wget http://cairographics.org/releases/cairomm-1.12.0.tar.gz
tar xf cairomm-1.12.0.tar.gz
cd cairomm-1.12.0
./configure && make -j $CPU_COUNT && sudo make install
cd ../
rm cairomm-1.12.0.tar.gz
rm -rf cairomm-1.12.0

# Install glib
wget http://ftp.gnome.org/pub/gnome/sources/glib/2.46/glib-2.46.2.tar.xz
tar xf glib-2.46.2.tar.xz
cd glib-2.46.2
./configure && make -j $CPU_COUNT && sudo make install
cd ../
rm glib-2.46.2.tar.xz
rm -rf glib-2.46.2

# Install glibmm
wget http://ftp.gnome.org/pub/gnome/sources/glibmm/2.46/glibmm-2.46.3.tar.xz
tar xf glibmm-2.46.3.tar.xz
cd glibmm-2.46.3
./configure && make -j $CPU_COUNT && sudo make install
cd ../
rm glibmm-2.46.3.tar.xz
rm -rf glibmm-2.46.3

# Install cairo
gem install cairo

# Install atk
wget http://ftp.gnome.org/pub/GNOME/sources/atk/2.19/atk-2.19.90.tar.xz
tar xf atk-2.19.90.tar.xz
cd atk-2.19.90
./configure --disable-glibtest && make -j $CPU_COUNT && sudo make install
cd ../
rm atk-2.19.90.tar.xz
rm -rf atk-2.19.90

# Install gdk-pixbuf
wget http://ftp.gnome.org/pub/gnome/sources/gdk-pixbuf/2.32/gdk-pixbuf-2.32.3.tar.xz
tar xf gdk-pixbuf-2.32.3.tar.xz
cd gdk-pixbuf-2.32.3
./configure --disable-glibtest && make -j $CPU_COUNT && sudo make install
cd ../
rm gdk-pixbuf-2.32.3.tar.xz
rm -rf gdk-pixbuf-2.32.3

# Install gtk
wget http://ftp.acc.umu.se/pub/gnome/sources/gtk+/2.24/gtk+-2.24.29.tar.xz
tar xf gtk+-2.24.29.tar.xz
cd gtk+-2.24.29
./configure --disable-glibtest && make -j $CPU_COUNT && sudo make install
cd ../
rm gtk+-2.24.29.tar.xz
rm -rf gtk+-2.24.29

# Install pango
wget http://ftp.acc.umu.se/pub/GNOME/sources/pango/1.30/pango-1.30.1.tar.xz
tar xf pango-1.30.1.tar.xz
cd pango-1.30.1
./configure && make -j $CPU_COUNT && sudo make install
cd ../
rm pango-1.30.1.tar.xz
rm -rf pango-1.30.1

# Install pangomm
wget http://ftp.acc.umu.se/pub/gnome/sources/pangomm/2.27/pangomm-2.27.1.tar.gz
tar xf pangomm-2.27.1.tar.gz
cd pangomm-2.27.1
./configure --disable-glibtest CXXFLAGS='-g -O2 -std=c++11' && make -j $CPU_COUNT && sudo make install
cd ../
rm pangomm-2.27.1.tar.gz
rm -rf pangomm-2.27.1

# Install atkmm
wget http://ftp.gnome.org/pub/gnome/sources/atkmm/2.22/atkmm-2.22.7.tar.xz
tar xf atkmm-2.22.7.tar.xz
cd atkmm-2.22.7
./configure CXXFLAGS='-g -O2 -std=c++11' && make -j $CPU_COUNT && sudo make install
cd ../
rm atkmm-2.22.7.tar.xz
rm -rf atkmm-2.22.7

# Install gtkmm
wget http://ftp.acc.umu.se/pub/gnome/sources/gtkmm/2.24/gtkmm-2.24.4.tar.xz
tar xf gtkmm-2.24.4.tar.xz
cd gtkmm-2.24.4
./configure CXXFLAGS='-g -O2 -std=c++11' && make -j $CPU_COUNT && sudo make install
cd ../
rm gtkmm-2.24.4.tar.xz
rm -rf gtkmm-2.24.4

# Install librevenge
wget http://downloads.sourceforge.net/project/libwpd/librevenge/librevenge-0.0.1/librevenge-0.0.1.tar.xz
tar xf librevenge-0.0.1.tar.xz
cd librevenge-0.0.1
./configure --disable-tests && make -j $CPU_COUNT && sudo make install
cd ../
rm librevenge-0.0.1.tar.xz
rm -rf librevenge-0.0.1

# Install libwpd
wget http://downloads.sourceforge.net/project/libwpd/libwpd/libwpd-0.10.0/libwpd-0.10.0.tar.xz
tar xf libwpd-0.10.0.tar.xz
cd libwpd-0.10.0
./configure && make -j $CPU_COUNT && sudo make install
cd ../
rm libwpd-0.10.0.tar.xz
rm -rf libwpd-0.10.0

# Install libwpg
wget http://downloads.sourceforge.net/project/libwpg/libwpg/libwpg-0.3.1/libwpg-0.3.1.tar.xz
tar xf libwpg-0.3.1.tar.xz
cd libwpg-0.3.1
./configure && make -j $CPU_COUNT && sudo make install
cd ../
rm libwpg-0.3.1.tar.xz
rm -rf libwpg-0.3.1

# Install libvisio
wget http://dev-www.libreoffice.org/src/libvisio/libvisio-0.1.0.tar.xz
tar xf libvisio-0.1.0.tar.xz
cd libvisio-0.1.0
./configure --disable-tests && make -j $CPU_COUNT && sudo make install
cd ../
rm libvisio-0.1.0.tar.xz
rm -rf libvisio-0.1.0

# Install libcdr
wget http://dev-www.libreoffice.org/src/libcdr/libcdr-0.1.2.tar.xz
tar xf libcdr-0.1.2.tar.xz
cd libcdr-0.1.2
./configure --disable-tests && make -j $CPU_COUNT && sudo make install
cd ../
rm libcdr-0.1.2.tar.xz
rm -rf libcdr-0.1.2

# Finally Install Inkscape!!!
wget https://inkscape.org/en/gallery/item/3860/inkscape-0.91.tar.bz2
tar xf inkscape-0.91.tar.bz2
cd inkscape-0.91
./configure CXXFLAGS='-g -O2 -std=c++11' && make -j $CPU_COUNT && sudo make install
cd ../
rm inkscape-0.91.tar.bz2
rm -rf inkscape-0.91

cd ../
rm -rf InkDownloads
cd $cwd

# Breathe - Its all over
echo "Install Finished!"