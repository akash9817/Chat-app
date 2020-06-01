const multer = require('multer')
const fs = require('fs')

var name= 'default'
const storage = multer.diskStorage({
    destination : function(req, file , cb){
        console.log('file 0000000000', file)
        name = req.path.slice(1)
        var uploadPath = `public/images/${name}`
        fs.exists(uploadPath, function(exists){
            if(!exists){
                fs.mkdir(uploadPath, function(err){
                    if(err){
                        console.log('Error in folder creation')
                    }
                    cb(null, uploadPath)
                })
            }else{
                cb(null, uploadPath)
            }
        })
    },
    filename : function(req, file, cb){
        name = req.path.slice(1)
        var fileExtension = file.originalname.split('.')[1]
        return cb(null, `${name}-${Date.now()}.${fileExtension}`)
    }
})

var upload = multer({storage : storage})
module.exports = upload
  