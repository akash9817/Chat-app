const express = require('express')
const router = express.Router()
const Room = require('../models/room')

router.post('/search', async(req, res) => {
    try{
        const room = await Room.find({'name' : {$regex : req.body.search, $options : 'i'}})
        res.send(room)
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router