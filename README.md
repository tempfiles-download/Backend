# TempFiles Backend
[![GitHub](https://img.shields.io/github/license/tempfiles-download/Backend?style=for-the-badge)](https://github.com/tempfiles-download/Backend/blob/master/LICENSE)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/tempfiles-download/Backend?style=for-the-badge)](https://github.com/tempfiles-download/Backend/releases)
[![Docker](https://img.shields.io/badge/Docker-Download-2496ed?style=for-the-badge&logo=docker&logoColor=fff)](https://hub.docker.com/r/tempfiles/backend)
## API calls :mega:
A list of available API calls can be found over at [Postman](https://documenter.getpostman.com/view/TzK2bEsi).

## Deployment via Docker Compose
1. Set up a new directory for TempFiles  
    ```BASH
    mkdir /opt/tempfiles
    cd /opt/tempfiles
    ```

1. Copy the resource files.
    Set up a virtual server config for nginx to use.
    ```BASH
    mkdir resources
    curl https://raw.githubusercontent.com/tempfiles-download/Backend/master/resources/nginx.conf > nginx.conf
    curl https://raw.githubusercontent.com/tempfiles-download/Backend/master/resources/php.ini > php.ini
    ```

1. Create a docker-compose.yml file.  
	```BASH
	nano docker-compose.yml
	```

   And paste in the following:
   ```YAML 
   version: '3.2'
   services:
     tmpfiles:
       image: tempfiles/backend
       ports:
       - "5392:5392"
       - "5393:5393"
       volumes:
       - ./resources/nginx.conf:/opt/docker/etc/nginx/vhost.conf:ro
       - ./resources/php.ini:/usr/local/etc/php/conf.d/php.ini:ro
       restart: always
   ```

1. Set up a second webserver as a reverse proxy for the docker container(s).  
   _This can be done with Apache or Nginx. Here's an example config for Nginx:_
    ```NGINX
	# API
	server {
	  listen 443 ssl http2;
	  server_name api.tempfiles.download;

	  ssl_certificate <certificate path>;
	  ssl_certificate_key <certificate key path>;
	  ssl_ciphers 'CDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384';

	  # 100M = Total file upload limit of 100 MegaBytes.
	  client_body_buffer_size 128M;
	  client_max_body_size 128M;

	  location / {
	    proxy_pass http://127.0.0.1:5392;
	  }
	}

	# Download
	server {
	  listen 443 ssl http2;
	  server_name d.tempfiles.download;

	  ssl_certificate <certificate path>;
	  ssl_certificate_key <certificate key path>;
	  ssl_ciphers 'CDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384';

	  location / {
	    proxy_pass http://127.0.0.1:5393;
	  }
	}
   ```

1. Run the container
   ```BASH
   docker-compose up -d
   ```

## Manual Deployment :desktop_computer:
Installation can also be done without using Docker.  
Here's how to set up TempFiles-Backend directly on a Linux server:

1. Install PHP, Nginx, Git, Composer  
   ```BASH
   sudo apt update
   sudo apt upgrade
   sudo apt install nginx php php-fpm composer php-curl php-mbstring git
   ```

1. Download the source code  
   ```BASH
   git clone https://github.com/tempfiles-download/Backend.git 
   cd Backend/
   ```

1. Download dependencies  
   ```BASH
   composer install --no-dev
   ```

1. Set file path  
   ```BASH
   nano src/com/carlgo11/tempfiles/config.php
   ```
   Change `'file-path'` to a suitable directory and create said directory.
   ```BASH
   mkdir /tempfiles # file path directory
   chown www-data:www-data /tempfiles -R
   chmod 0700 /tempfiles -R
   ```

1. Copy the Nginx configurations to the sites-available directory.  
   ```BASH
   cp ./ressouces/nginx/*.conf > /etc/nginx/sites-available/
   ```

1. Generate certificates.  
   For HTTPS to work you'll need a certificate. Due to the many different certificate companies and their different ways of generating certificates I won't go into that in this text.
   When you have a certificate, change the following lines in both nginx configs:
   ```BASH
   nano /etc/nginx/sites-available/*.conf
   ```
   ```NGINX
   ssl_certificate {path_to_cert}/cert.pem; #Change path
   ssl_certificate_key {path_to_key}/privkey.pem; #Change path
   ```

1. Restart Nginx  
   ```BASH
   sudo systemctl restart nginx
   ```

## Environment variables
|Name| Default Value                                   |Type|Description|
|----|-------------------------------------------------|----|-----------|
|TMP_PATH| /tmp/tempfiles                                  |String|Path where encrypted files should be saved to|
|TMP_MAX_SIZE| 128M                                            |String|Max file size|
|TMP_ENCRYPTION_ALGO| aes-256-gcm                                     |String|File encryption algorithm|
|TMP_STORAGE_METHOD| File                                            |String|Storage method. Available methods are: File, MySQL|
|TMP_HASH_COST| 10                                              |Integer|Bcrypt hashing cost. Only used for hashing deletion password.|
|TMP_DOWNLOAD_URL| https://d.tempfiles.download/%1$$s/?p=%2$$s |String|URL where the user can download the file. `%1$$s`=ID `%2$$s`=Password|
|TMP_404_URL| https://tempfiles.download/download/?404=1      |String|URL to redirect to if a file can't be downloaded.|
