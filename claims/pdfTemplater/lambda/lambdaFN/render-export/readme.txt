COMMANDS

removes stuff
- docker system prune -a

get to bash
docker run --name nginx-bg -d nginx
docker exec -it nginx-bg /bin/bash
docker run --name bg -it 9c1715b82290 -v $(pwd):/render-export


docker build -t amazon-linux .
docker images -a
docker run -v $(pwd):/render-export -it 9c1715b82290


 freetype-devel fontconfig-devel
  flex bison gperf ruby php-gd freetype* perl sqlite-devel libfontconfig libicu-devel openssl-devel libpng-devel libjpeg-turbo-devel python libX11-devel libXext libXrender

  RUN /bin/bash -c "yum -y install fontconfig libstdc++"
RUN /bin/bash -c "yum -y install freetype"
RUN /bin/bash -c "yum -y install urw-fonts"

        "phantomjs-prebuilt": "^2.1.16",


        find . -name libfontconfig.so.1


        CMD /bin/bash -c "cd render-export/linux && npm i"