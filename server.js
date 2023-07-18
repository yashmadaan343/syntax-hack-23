require("dotenv").config()
const express = require('express')
const app = express()
const session = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const bodyparser = require('body-parser');
const ejs  = require('ejs');
// const ejsLayouts = require('express-ejs-layouts');
const cors = require('cors');
const passportInit = require('./middleware/passport.js')
var server = require('http').createServer(app);

//file imports
const landing = require('./routes/landing')
const auth = require('./routes/auth')
const dashboard = require('./routes/dashboard')
const locker = require('./routes/locker')

if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');
}
else {
    app.disable('trust proxy');
}


//cors middleware
const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true
}
app.use(cors(corsOptions))

//middlewares
app.use(express.json({ limit: '50mb' }), express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static('public'))
// app.use(ejsLayouts)

app.set('view engine', 'ejs')
app.set('views', 'views')
if (process.env.NODE_ENV === 'production') {
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        sameSite: 'none',
        overwrite: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }));
} else {
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }));
} 
app.use(cookieParser(process.env.SESSION_SECRET));

passportInit(passport)
//initialize passport after thiss
app.use(passport.initialize());
app.use(passport.session());

//connect to mongodb
const dbUri = process.env.MONGO_URI
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("Connected to mongodb"))

//routing
app.use('/', landing)
app.use('/dashboard', dashboard)
app.use('/auth', auth)
app.use('/locker', locker)


//listen
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Connected on port ${PORT}`))
