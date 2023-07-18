const { ensureAdminAuthenticated, ensureAuthenticated } = require('../middleware/authenticate');
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER
const client = require('twilio')(accountSid, authToken);


function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
  

const router = require('express').Router()
const Locker = require('../schemas/lockerSchema.js'),
    moment = require('moment'),
    now = new Date(),
    dateStringWithTime = moment(now, moment.ISO_8601)
const { nanoid } = require("nanoid");
    
const User = require('../schemas/userSchema.js');

router.get('/', ensureAuthenticated, async (req, res)=>{
    let lockers = await Locker.find({regUserId: req.user.userId})
    res.render("locker/lockers", {lockers})
})

router.get('/deposit', async (req, res)=>{
    res.render("locker/deposit")
})



router.post('/deposit', ensureAuthenticated, async (req, res)=>{
    let user = await User.findOne({userId: req.user.userId})
    const lockers = await Locker.find({size: req.body.size})
    const otp = generateOTP()
    for (let i = 0; i < lockers.length; i++) {
        if(lockers[i].filled == false){
                let doc = await Locker.findOneAndUpdate({number: lockers[i].number}, {
                    filled: true,
                    regUserId: user.userId,
                    regName: user.name, 
                    phoneno: user.phoneno,
                    code: otp,
                    regTime: dateStringWithTime,
                }, {new: true})
                let doc2 = await User.findOneAndUpdate({userId: user.userId}, {
                    $push: { lockers: lockers[i].number } 
                }, {new: true})
                // .then(()=>{
                // client.messages
                // .create({
                //     body: 'Your code for the locker is: ' + otp.toString(),
                //     from: twilioPhone,
                //     to: req.user.phoneno
                // })
                // .then(message => console.log(message.sid));
                // })
                console.log(doc)
                break;
        }
        else if(i+1 == lockers.length){
            res.send("No Lockers Available in selected size.")
        }
      }
    const phoneno = user.phoneno
    // let doc = await Locker.findOneAndUpdate({number: lockerNum}, {
    //     filled: true,
    //     regUserId: user.userId,
    //     regName: user.name, 
    //     phoneno: user.phoneno,
    //     code: nanoid(),
    //     regTime: dateStringWithTime
    // }, {new: true})
    // let doc2 = await User.findOneAndUpdate({userId: user.userId}, {
    //     $push: { lockers: lockerNum } 
    // }, {new: true})
    // console.log(doc2)
})
router.get('/:id', ensureAuthenticated, async (req, res)=>{
    let lockNum = req.params.id
    if (!isNaN(parseFloat(lockNum)) && isFinite(lockNum)){
        let locker = await Locker.findOne({number: parseInt(lockNum)})
        let user = await User.findOne({userId: req.user.userId})
        let filledByUser = false
        if(!locker) res.send("Locker not found")
        else{
            lockNumToStr = lockNum.toString()
            if(user.lockers.includes(lockNumToStr)) filledByUser = true 
            res.render("locker/locker", {locker, filledByUser})
        } 
    }else{
       res.send("No such locker found.")
    }
})

router.post('/retrieve/:id', async (req, res)=>{    
    const lockerNum = req.params.id
    const locker = await Locker.findOne({number: lockerNum})
    const code = locker.code
    const {otp} = req.body
    if(code == otp){
        let doc = await Locker.findOneAndUpdate({number: lockerNum}, {
            filled: false,
            regUserId: null,
            regName: null, 
            phoneno: null,
            code: null,
            regTime: null,
            momentDate: null
        }, {new: false})
    
        let date1 = new Date()
        let date2 = new Date(parseInt(doc.regTime))
        var hours = Math.abs(date1 - date2) / 36e5;
        console.log(hours)   
        let doc2 = await User.findOneAndUpdate({userId: req.user.userId}, {
            $pull: { lockers: lockerNum } 
        },{new: true}).then(()=> {
            // client.messages
            // .create({
            //     body: 'test message',
            //     from: twilioPhone,
            //     to: req.user.phoneno
            // })
            // .then(message => console.log(message.sid));
        
            res.send("Payment Page here")
        })
    }else{
        res.send("Wrong OTP entered")
    }
})

module.exports = router;
