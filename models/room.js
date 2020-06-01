const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    name : {type :String, trim : true},
    password : {type : String},
    image : String,
    owner_id : {type : mongoose.Schema.Types.ObjectId, ref : 'User'},
    user_id : [{type : mongoose.Schema.Types.ObjectId, ref : 'User'}]
})

const Room = mongoose.model('Room', roomSchema)

module.exports = Room