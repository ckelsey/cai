FROM amazonlinux
RUN /bin/bash -c "curl --silent --location https://rpm.nodesource.com/setup_10.x | bash"
RUN /bin/bash -c "yum -y install gcc-c++ make"
RUN /bin/bash -c "yum -y install nodejs tar bzip2 build-essential g++ flex bison gperf ruby perl curl libsqlite3-dev libfontconfig1-dev libicu-dev libfreetype6 libssl-dev libpng-dev libjpeg-dev python libx11-dev libxext-dev"
CMD /bin/bash -c "cd render-export/linux && npm i"