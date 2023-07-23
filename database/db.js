async function addUser(email, username, password, apikey, opt) {
  const newUser = {
    email: email,
    username: username,
    password: password,
    apikey: apikey,
    createdAT: Date.now(),
    ...opt
  };
  await db.collection('users').add(newUser).then(async(doc) => doc.update({ id: doc.id }));
}
module.exports.addUser = addUser

function updateData(id, json) {
  return new Promise((resolve, reject) => {
    db.collection('users').doc(id).set(json, { merge: true }).then(()=>{
      resolve(true);
    }).catch(e =>{ reject(e) })
  })
}
module.exports.updateData = updateData

async function findAndEdit(title, value, json) {
  const collectionRef = db.collection('users');
  const querySnapshot = await collectionRef.where(title, '==', value).get();
  querySnapshot.forEach(async (doc) => {
    const docId = doc.id;
    await collectionRef.doc(docId).set(json, { merge: true });
  });
  
}
module.exports.findAndEdit = findAndEdit

async function reduceLimit(api) {
  if(api == "" || api == null || api == undefined) return false
  const collectionRef = db.collection('users');
  const querySnapshot = await collectionRef.where('apikey', '==', api).get();
  // const reducedValue = currentValue - 1;
  querySnapshot.forEach(async (doc) => {
    await collectionRef.doc(doc.id).set({ limit: doc.data().limit - 1}, { merge: true });
  });
  
}
module.exports.reduceLimit = reduceLimit

function checkLimit(api) {
  return new Promise(async(resolve, reject) => {
    const collectionRef = db.collection('users');
    const querySnapshot = await collectionRef.where('apikey', '==', api).get();
    var result = []
    // doc.data().limit
    querySnapshot.forEach(async (doc) => {
      result.push(doc.data())
    })
    if(result.length > 0){
      return resolve(result[0].limit)
    } else {
      return resolve(false)
    }
  })
}
module.exports.checkLimit = checkLimit

function checkUser(username, email) {
  var data = db.collection('users')
  var user = data.where('username', '==', username).get()
  var email = data.where('email', '==', email).get()
  return Promise.all([user, email]).then(([userSnap, emailSnap]) => {
    const results = [];
    userSnap.forEach((doc) => { const user = doc.data(); results.push(user); });
    emailSnap.forEach((doc) => { const user = doc.data(); results.push(user); });
    if(results.length > 0){
      return true
    } else {
      return false
    }
  })
}
module.exports.checkUser = checkUser
    
function getDataByID(id) {
  return new Promise((resolve, reject) => {
    var data = db.collection('users')
    data.where('id', '==', id).get().then((query) => {
      resolve(query.docs[0].data());
    })
  })
}
module.exports.getDataByID = getDataByID

async function uploadBufferToStorage(buffer, opt) {
  return new Promise(async(resolve, reject) => {
    var { filename, mimetype } = opt
    var file = await bucket.file(filename)
    // V1
    await file.save(buffer, { resumable: false, contentType: mimetype }).then(async() => {
      await file.getSignedUrl({
        action: 'read',
        expires: '03-01-3000',
      }).then(res => {
        return resolve({ status: true, url: res[0] })
      }).catch(e => reject(e))
    }).catch(e => reject(e))
    /** Nih cikk tambahan untuk public file, tapi kurang konsisten menurut watashi  */
    /*
    // v2
      await file.save(buffer, { public: true, contentType: mimetype }).then(async() => {
        return resolve({ status: true, url: `https://storage.googleapis.com/${config.storageBucket}/${filename}` })
      }).catch(e => reject(e))
    */
  })
}
module.exports.uploadBufferToStorage = uploadBufferToStorage

async function deleteFileFromStorage(path) {
  return new Promise(async(resolve, reject) => {
    try {
      const file = bucket.file(path);
      await file.delete();
      return resolve(true)
    } catch(e) {
      return reject(e)
    }
  })
}
module.exports.deleteFileFromStorage = deleteFileFromStorage