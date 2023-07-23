const LocalStrategy = require('passport-local').Strategy;
const { generateApikey, getHashedPassword } = require('../../lib/function')



module.exports = function(passport) {
    passport.use(
        new LocalStrategy((username, password, done) => {
          var data = db.collection('users')
          var user = data.where('username', '==', username).get()
          var email = data.where('email', '==', username).get()
          return Promise.all([user, email]).then(([userSnap, emailSnap]) => {
            const results = [];
            userSnap.forEach((doc) => { const user = doc.data(); results.push(user); });
            emailSnap.forEach((doc) => { const user = doc.data(); results.push(user); });
            if(results.length < 1) { return done(null, false, { status: false, msg: 'Username tidak ditemukan' }) }
            var user = results[0]
            let hashedPassword = getHashedPassword(password);
            if(user.password === hashedPassword) { return done(null, user, { status: true, msg: 'Login Berhasil' }) } 
            else { return done(null, false, { status: false, message: 'Password tidak sesuai' }) }
          })
        })
      );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      db.collection('users').doc(id).get()
        .then((doc) => {
          if (!doc.exists) {
            return done(new Error('User tidak ditemukan'));
          }
          const user = doc.data();
          return done(null, user);
        })
        .catch((error) => {
          return done(error);
        });
    });
}