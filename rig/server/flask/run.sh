#!/bin/bash

# start flask server

# As per guidance from https://docs.docker.com/config/containers/logging/
# and https://github.com/nginxinc/docker-nginx/blob/8921999083def7ba43a06fabd5f80e4406651353/mainline/jessie/Dockerfile#L21-L23
# forward request and error logs to docker log collector
ln -sf /dev/stdout access.log \
	&& ln -sf /dev/stderr error.log


gunicorn --worker-class gthread server:app --access-logfile access.log --log-file error.log -w ${SKETCH_API_WSGI_WORKERS} --threads ${SKETCH_API_WSGI_THREADS} -b 0.0.0.0:5000 ; cat error.log
