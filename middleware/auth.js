const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try{
    const token = req.header('Authorization').replace('Bearer ', '')
    const decode = jwt.verify(token , process.env.JSON_WEBTOKEN)

    const user = await User.findOne({_id : decode.id})
    if(!user){
        throw new Error()
    }
    req.user = user
    req.token = token
    next()
    }catch(e){
        
        res.status(401).send({error : 'Please Authenticate'})
    }
}

module.exports = auth