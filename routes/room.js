const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const auth = require('../middleware/auth')
const Room = require('../models/room')

router.post('/room', upload.single('thumbnail'), async (req, res) => {
  
    try{
        var path = "/images/default.jpg";
        if (req.file) {
          path = req.file.destination.slice(6) + "/" + req.file.filename;
        }

        const isExist = await Room.findOne({'name' : req.body.name})
        //console.log("isExist ",  isExist)
        if(isExist){
            res.status(401).send('Room name Already Exist.')
            return
        }

        const room = new Room(req.body)
        room.image = path
        await room.save()
        res.status(200).send(room)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/room/:id',  async (req, res) => {
  
    try{
        var room = await Room.find({'user_id' : req.params.id})
        //console.log("room ", room)
       
        res.status(200).send(room)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/user-room/:id',  async (req, res) => {
  
    try{
        var room = await Room.find({'owner_id' : req.params.id})
        //console.log("room ", room)
       
        res.status(200).send(room)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/room-detail/:id',  async (req, res) => {
  
    try{
        var room = await (await Room.findOne({'_id' : req.params.id}).populate('user_id')).execPopulate()

        //console.log("room ", room)
       
        res.status(200).send(room)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/room/:id', async (req, res) => {
        const updates = Object.keys(req.body)
        const allowUpdates = ['name', 'image', 'user_id']
        const allowerOperation = updates.every((item) => allowUpdates.includes(item))

        if(!allowerOperation){
           return res.status(400).send('invalid updates')
        }

    try{
        const isExist = await Room.findOne({"_id" : req.params.id ,"user_id" : req.body.user_id})
        console.log(isExist)
        if(isExist){
            res.status(401).send('You are already in this group')
            return
        }

        const room = await Room.findOneAndUpdate({_id : req.params.id},{
            $push : {"user_id" : req.body.user_id}},
            {new : true, upsert : true})
            res.send(room)
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router