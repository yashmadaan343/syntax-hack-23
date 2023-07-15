const { ensureAdminAuthenticated, ensureAuthenticated } = require('../middleware/authenticate');

const router = require('express').Router()
const Locker = require('../schemas/lockerSchema.js'),
    moment = require('moment'),
    now = new Date(),
    dateStringWithTime = moment(now).format('YYYY-MM-DD HH:MM:SS')
const { nanoid } = require("nanoid");
    
const User = require('../schemas/userSchema.js');

router.get('/deposit', ensureAuthenticated, (req, res)=>{
    res.render("locker/deposit", {filled: "hello"})
})

router.post('/deposit/:id', ensureAuthenticated, async (req, res)=>{
    let user = await User.findOne({userId: req.user.userId})
    const lockerNum = req.params.id
    let doc = await Locker.findOneAndUpdate({number: lockerNum}, {
        filled: true,
        regUserId: user.userId,
        regName: user.name, 
        phoneno: user.phoneno,
        code: nanoid(),
        regTime: dateStringWithTime
    }, {new: true})
    let doc2 = await User.findOneAndUpdate({userId: user.userId}, {
        $push: { lockers: lockerNum } 
    }, {new: true})
    console.log(doc2)
})

router.post('/retrieve/:id', async (req, res)=>{
    let user = await User.findOne({userId: req.user.userId})
    const lockerNum = req.params.id
    let doc = await Locker.findOneAndUpdate({number: lockerNum}, {
        filled: false,
        regUserId: null,
        regName: null, 
        phoneno: null,
        code: null,
        regTime: null
    }, {new: true})

    console.log(doc)
})

module.exports = router;
