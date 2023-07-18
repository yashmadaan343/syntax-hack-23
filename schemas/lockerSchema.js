const mongoose = require('mongoose'),
    reqString = { type: String, required: true }


const lockerSchema = new mongoose.Schema({
        number: {type:Number, required: true},
        filled: {type: Boolean, required: true, default: false},
        size: reqString,
        regUserId: String,
        regName: String, 
        phoneno: String,
        code: String,
        regTime: String,
    })
    
module.exports = mongoose.model("Locker", lockerSchema)