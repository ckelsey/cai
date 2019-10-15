- Start instance
- yum install cmake
- wget https://inkscape.org/gallery/item/13330/inkscape-0.92.4_A6N0YOn.tar.bz2 -O - | tar -xj
- cd inkscape-0.92.4 && mkdir build && cd build
- cmake ..
- make
- make install





- wget https://github.com/Kitware/CMake/releases/download/v3.15.0-rc4/cmake-3.15.0-rc4-Linux-x86_64.sh -O - | tar -xj


NOPE
- vim bootstrap.sh
- paste contents of bootstrap.sh
- chmod +x bootstrap.sh
- ./bootstrap.sh