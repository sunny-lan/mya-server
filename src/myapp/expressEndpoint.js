const os = require('os');
const fs = require('fs');

const express = require('express');
const uniqueFilename = require('unique-filename');
const formidable = require('formidable');

const {MyaError}=require('../error');

module.exports = function makeMyappEndpoint(myapp) {
    const endpoint = express.Router();

    endpoint.post('/createApp', (req, res) => {
        const form = new formidable.IncomingForm();
        form.parse(req);
        let uploaded = false;
        form.on('file', function handleUpload(name, file) {
            uploaded = true;
            myapp.createApp(file.path, req.body.appID).then(appID => {
                //once app is done creating, send response
                res.send(appID);
            });
        });
        form.on('end', () => {
            if (!uploaded)
                throw new MyaError('Invalid upload', 'INVALID_UPLOAD');
        });
    });

    endpoint.post('/createInstance', async (req, res) => {
        const instanceID = await myapp.createInstance(req.body.appID);
        res.send(instanceID);
    });

    //TODO change html appID to instanceID
    endpoint.post('/test', async (req, res) => {
        const instanceID = req.body.instanceID;
        const ui = await myapp.getUI(instanceID);
        res.send(`
        <html lang="en">
        <head>
            <script src="/js/myapi.js"></script>
            <title>test</title>
        </head>
        <body>
            <div appID="${instanceID}">
                ${ui.toString().replace('<%=id>', instanceID)}
            </div>
        </body>
        </html>
        `);
    });

    return endpoint;
};
