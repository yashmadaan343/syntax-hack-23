const mongoose = require('mongoose'),
    reqString = { type: String, required: true },
    nonreqString = { type: String, required: false },
    reqBoolean = { type: Boolean, required: true, default: false },
    moment = require('moment'),
    now = new Date(),
    dateStringWithTime = moment(now).format('YYYY-MM-DD HH:MM:SS'),
    { uuid } = require('uuidv4');

const passportLocalMongoose = require("passport-local-mongoose");



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        default: uuid()
    },
    email: reqString,
    name: reqString,
    password: reqString,
    phoneno: reqString,
    date: {
        type: String,
        default: dateStringWithTime
    },
    userId: reqString,
    admin: reqBoolean,
    lockers: []
})
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", userSchema)
