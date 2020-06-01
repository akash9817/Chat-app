const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email : String,
    name : String,
    password : String,
    avatar : {
        type : String,
        default : '/images/default.jpg'
    },
    tokens : [
        {
            token : String
        }
    ]
})


userSchema.virtual('rooms', {
    ref: "Room",
    localField : "_id",
    foreignField : 'user_id'
})

userSchema.virtual('chat', {
    ref: "Chat",
    localField : "_id",
    foreignField : 'messages.user'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({id: user._id.toString()}, process.env.JSON_WEBTOKEN)
    user.tokens = user.tokens.concat({token})

    return token
}

userSchema.statics.fetchByCredentials = async (email, password) => {
    const user = await User.findOne({email : email})
    if(!user){
        throw new Error('unable to login')
    }
    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid){
        throw new Error('unable to login')
    }
    return user
}

userSchema.pre('save', async function(next){
    const user= this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User