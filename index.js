'use strict';
require('dotenv').config();
import { Client, Event } from '@yonomi/thincloud-v2-node-sdk';
import fs from 'fs';
// Import device key, cert, and CA
const KEY = fs.readFileSync(__dirname + '/certs/deviceCert.key');
const CERT = fs.readFileSync(__dirname + '/certs/deviceCertAndCACert.crt');
const CA_FILE = fs.readFileSync(__dirname + '/certs/AmazonRootCA.pem');
// Get environmental variables
const {
    IOT_HOST,
    CLIENT_ID,
    PRODUCT_ID,
    DEVICE_ID,
} = process.env;
process.stdin.resume()
const clientConfig = {
    host: IOT_HOST,
    ca: CA_FILE,
    key: KEY,
    cert: CERT,
    clientId: CLIENT_ID,
    productId: PRODUCT_ID,
    rpcRequestTimeout: 30000,
    isCommissioned: !!DEVICE_ID
}
// Initialize the SDK Client, pass in the config
const client = new Client(clientConfig);
/* Functions that implement various pieces of functionality the SDK provides */
// Disconnect the client connection
const disconnect = async () => {
    await client.disconnect();
    if(!client.isConnected) {
        console.log('Client is disconnected');
    }
}
// Decommission a device
const decommission = async () => {
    const decommissionedPayload = await client.decommission()
    console.log('Decommissioned device', decommissionedPayload)
}
// Commission a device
const commission = async () => {
    const payload = await client.commission({
        productId: PRODUCT_ID,
    });
    console.log('Commissioned device', payload)
    return payload.deviceId
}
// Get device invitation code (part of onboarding an owner to a device)
const getInvitationCode = async () => {
    const invitationCodePayload = await client.getInvitationCode({
        userId: "YOUR_USER_ID", // Fill in user's ID
        accessLevel: 'owner',
    })
    console.log('Invitation code payload', invitationCodePayload)
}
// Run the different processes by invoking functions above
(async () => {
    try {
        // Connect the device
        await client.connect();
        // Once the device is connected, attach event listeners and perform different operations
        if (client.isConnected) {
            console.log('Client is connected')
            // Commission the device is it is not commissioned
            if(!client.isCommissioned) {
                const deviceId = await commission();
                fs.appendFileSync(__dirname  +  '/.env', `DEVICE_ID=${deviceId}`)
                await getInvitationCode();
            }

            // Attach event listeners
            client.on(Event.COMMAND, (data) => {
                const { name, payload } = data
                console.log(name, payload)
                if (name === 'firmwareUpdate') {
                   fs.writeFileSync(__dirname + '/firmware.json', payload + '\n');
                }
                data.success({
                   success: true,
                })
            })
            client.on(Event.STATE, (data) => {
                const { params } = data
                console.log(params)
                const { locked } = params;
                fs.writeFileSync(__dirname + '/device.json', JSON.stringify({
                    locked,
                }) + '\n')
                data.confirm()
            })
            client.on(Event.PRODUCT, (data) => {
                console.log(data)
            })
        }
    } catch(err) {
        console.log(err);
    }
})();
