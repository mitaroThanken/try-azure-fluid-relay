FROM haproxy-with-minica/certs:latest as certs
FROM debian:bookworm

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# https://manpages.debian.org/bookworm/ca-certificates/update-ca-certificates.8.en.html
COPY --from=certs /certs/minica.crt /usr/local/share/ca-certificates/minica.crt
RUN update-ca-certificates
