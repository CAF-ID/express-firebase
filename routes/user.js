const axios = require('axios');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateApikey, getHashedPassword } = require('../lib/function')
const { addUser, checkUser, updateData, uploadBufferToStorage, deleteFileFromStorage } = require('../database/db')


// ROUTER GET
router.get('/login', (req, res) => {
    res.render('loginregis', { layout: false, login: true })
});
router.get('/register', (req, res) => {
    res.render('loginregis', { layout: false, login: false });
});
router.get('/profile', async(req, res) => {
    res.render('profile', {
        layout: false,
        profileImg: '/users/profile-image',
        data: req.isAuthenticated() ? req.user : 'Login dulu cik!!'
    })
})
router.get('/profile-image', async(req, res) => {
    axios.get(!req.isAuthenticated() ? 'https://caf-id.github.io/kotone.jpeg' : (req.user.profile_image ? req.user.profile_image.url : 'https://caf-id.github.io/kotone.jpeg'), { responseType: 'stream' }).then(({ data }) => {
        data.pipe(res)
    })
})
router.get('/data', async (req, res) => {
    var isLogin = req.isAuthenticated()
    res.json({
      login: isLogin,
      data: req.user
    });
  });
// ROUTER POST
/** INI BONUS DOANK buat nampilin message dari passport nya */
// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', (err, user, info) => {
//         if (err) { return next(err); }
//         if (!user) { return res.json(info); }
//         req.logIn(user, (err) => {
//             if (err) { return next(err); }
//             return res.json(info);
//         });
//     })(req, res, next);
//   });
// // BY CAF

router.post('/login', async(req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next);
});

router.post('/register', async(req, res) => {
    let {email, username, password, confirmPassword } = req.body;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.json({ status: false, msg: 'Email tidak valid' });
    if(username.length < 4) return res.json({ status: false, msg: 'Username minimal 4 karakter' })
    if (password.length < 6 || confirmPassword < 6) return res.json({ status: false, msg: 'Password minimal 6 karakter' });
    if(password === confirmPassword) {
        let checking = await checkUser(username, email)
        if(checking) {
            return res.json({ status: false, msg: 'Username atau Email sudah digunakan' });
        } else {
            let hashedPassword = await getHashedPassword(password);
            addUser(email, username, hashedPassword, await generateApikey(username, password)).then(() =>{
                return res.json({ status: true, msg: 'Register berhasil silahkan Login' })
            }).catch(() => {
                return res.json({ status: false, msg: 'Register gagal' })
            })
        }
    } else {
        return res.json('Password tidak sesuai');
    }
})

router.post('/profile', async(req, res) => {
    if(!req.isAuthenticated()) {
        return res.json({ status: false, title: 'Failed', msg: 'User tidak ditemukan'})
    } else if (!req.files) {
        return res.json({ status: false, msg: 'Tidak ada berkas yang diunggah' });
    } if(!/^image\/(jpg|jpeg|png|bmp|svg|webp)$/.test(req.files.files.mimetype))  {
        return res.json({ status: false, msg: 'Media tidak validd' });
    }else if (req.files.files.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: 'Ukuran file terlalu besar. Maksimal ukuran file adalah 5 MB.' });
    }else{
        var { name, data, mimetype } = req.files.files;
        var filename = `assets/${req.user.username}/profile-image/profile.png`
        var updateProfile = await uploadBufferToStorage(data, { filename, mimetype })
        if(updateProfile.status) {
            updateData(req.user.id, { profile_image: { path: filename, url: updateProfile.url } }).then(()=>{
                return res.json({ status: true, msg: 'Berhasil mengganti Foto Profile', data: '/users/profile-image' });  
            })
        } else {
            return res.json({ status: false, msg: 'Gagal mengganti Foto Profile' });  
        }
    }
});


router.get('/logout', (req,res) => {
    if(req.user) {
        req.logout();
        return res.json({ status: true, msg: 'Berhasil Logout' })
    } else {
        return res.json({ status: true, msg: 'Tidak terdapat sesi User' })
    }
});


module.exports = router
