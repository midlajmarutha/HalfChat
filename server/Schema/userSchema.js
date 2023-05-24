const mongoose = require('mongoose');
const collections=require('../config/collection')
const userSchema = new mongoose.Schema({
    Username : {type:String,unique:true,required:true},
    Email   :{type:String,unique:true,required:true},
    Password : {type:String,required:true},
    Chatlist:[{type:mongoose.Schema.Types.ObjectId}]
},{timestamps:true})
const userModel = mongoose.model(collections.USER_COLLECTION,userSchema)
module.exports = userModel;