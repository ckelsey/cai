FROM amazonlinux
RUN /bin/bash -c "curl --silent --location https://rpm.nodesource.com/setup_10.x | bash"
RUN /bin/bash -c "yum -y install gcc gcc-c++ make"
RUN /bin/bash -c "yum -y install tar bzip2 bzip2-libs"
RUN /bin/bash -c "yum -y install libstdc++ freetype urw-fonts libXext libXrender fontconfig libfontconfig.so.1"
RUN /bin/bash -c "yum -y install nodejs"
CMD /bin/bash -c "cd render-export/linux && npm i"