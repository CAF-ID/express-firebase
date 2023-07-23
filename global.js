const config = require('./config')
const admin = require('firebase-admin');
admin.initializeApp({ 
    credential: admin.credential.cert(config.serviceAccount),
    storageBucket: config.storageBucket
});

process.on('uncaughtException', (err) => {
    console.error('Errory:', err);
});
  
process.on('unhandledRejection', (reason, promise) => {
    console.error('Error:', promise, 'reason:', reason);
});

/** global */
global.__path = process.cwd()
global.config = require('./config')
global.totalLimit = 25
global.admin = admin
global.bucket = admin.storage().bucket();
global.db = admin.firestore()