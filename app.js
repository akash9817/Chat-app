const express = require('express')
require('./db/mongoose')
const http = require('http')
const socketio = require('socket.io') 
const userRouter = require('./routes/user')
const roomRouter = require('./routes/room')
const serviceRouter = require('./routes/service')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const chat = require('./routes/chat')

const port  = process.env.PORT

app.use(express.json())
app.use(express.static('public'))
app.use(userRouter)
app.use(roomRouter)
app.use(serviceRouter)

chat(io)

server.listen(port, () => {
    console.log('connected successfully')
})