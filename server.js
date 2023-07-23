require('./global')
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressLayout = require('express-ejs-layouts');
const rateLimit = require("express-rate-limit");
const passport = require('passport');
const MemoryStore = require('memorystore')(session);
const compression = require('compression');
/* config */
app.set('json spaces', 4);
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(compression());
app.use(expressLayout);
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }))
app.use(rateLimit({ windowMs: 1 * 60 * 1000,  max: 2000, message: 'Terlalu banyak requests' }));
app.use('/assets', express.static('assets'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: 'CAF-id', resave: true, saveUninitialized: true, cookie: { maxAge: 86400000 }, store: new MemoryStore({ checkPeriod: 86400000 }) }));
require('./lib/config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.user = req.user || null;
  next();
})

const userRouters = require('./routes/user');
app.use('/users', userRouters);

app.get('/', async (req, res) => {
  res.redirect('/users/profile')
});



app.listen(3000, () => {
    console.log('Server berjalan pada http://localhost:3000');
});
  