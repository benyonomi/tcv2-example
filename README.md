# Yonomi ThinCloudv2 sample NodeJS client

## Setup
To get running:
1. Run `npm install`  to install dependencies.
1. Create a `certs` folder and drop three files in it
    * deviceCert.key (device key)
    * deviceCertAndCACert.crt (device cert)
    * AmazonRootCA.pem (root CA)
1. Create a file called `.env` and place the following:
```
IOT_HOST=<IoT endpoint URL>
CLIENT_ID=<Iot Client ID/Public Fingerprint>
IOT_PORT=8883
PRODUCT_ID=<Device's Product ID>
```
## Run
Run `npm start` to start the client.
