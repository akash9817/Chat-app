const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const User = require('../models/user')


router.post('/signup', async(req, res) =>{
    try{
        const user = new User(req.body)
        console.log("user "  , user)
        const token = await user.generateAuthToken()

        await user.save()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/login', async (req, res) => {
    try{
        const user = await User.fetchByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})


router.patch("/user", auth, upload.single("thumbnail"), async (req, res) => {
    //console.log("req.file  "  + req.file)
    var path = req.user.avatar;
    if (req.file !== undefined) {
      path = req.file.destination.slice(6) + "/" + req.file.filename;
      //console.log("path " + path);
    }
    const updates = Object.keys(req.body);
    //console.log("updates " + updates);
    const allowUpates = ["name", "email", "thumbnail"];
    const allowedOperation = updates.every((update) =>
      allowUpates.includes(update)
    );
    //console.log("allowUpdates  " + allowedOperation);
  
    if (!allowedOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }
  
    try {
      //console.log("req.user " + req.user);
      updates.forEach((update) => (req.user[update] = req.body[update]));
      //console.log("req.user " + req.user);
      req.user.avatar = path;
      //console.log("req.user " + req.user);
      await req.user.save();
      res.send(req.user);
    } catch (e) {
      res.status(400).send();
    }
  });

module.exports = router