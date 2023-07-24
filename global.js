const config = require('./config')
const fs  = require('fs');
const path = require('path')


const admin = require('firebase-admin');
admin.initializeApp({  credential: admin.credential.cert(config.serviceAccount), storageBucket: config.storageBucket });

process.on('uncaughtException', (err) => { console.error('Errory:', err);});
process.on('unhandledRejection', (reason, promise) => { console.error('Error:', promise, 'reason:', reason) });

/** function */
const readFeatures = () => {
    const dir = path.join(__dirname, "./api");
    const dirs = fs.readdirSync(dir);
    const list = {};
    try {
        for (const res of dirs) {
            const groups = res.toLowerCase();
            list[groups] = [];
            const files = fs.readdirSync(`${dir}/${res}`).filter(file => file.endsWith(".js"));
            for (const file of files) {
                const fitur = require(`${dir}/${res}/${file}`);
                list[groups].push(fitur);
            }
        }
        API.list = list;
    } catch (e) {
        console.error(e);
    }
};

/** global */
global.__path = process.cwd()
global.config = require('./config')
global.totalLimit = 25
global.admin = admin
global.bucket = admin.storage().bucket();
global.db = admin.firestore()
global.API = {}
readFeatures()