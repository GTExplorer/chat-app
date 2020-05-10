const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/user')
// server (emit) -> client (receive) --acknowledgement -> server,   countUpdated
// client (emit) -> server (receive) --acknowledgement -> client,    increment

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDir = path.join(__dirname,'../public')
app.use(express.static(publicDir))

// THIS IS SERVER SIDE 
// CHAT
io.on('connection', (socket) => {
    console.log('New Websocket connection!')
    
    //socket.emit('MessageFromServer','Welcome message!')                     // send to new user
    //socket.broadcast.emit('MessageFromServer','A new user joined')         // broadcast = everyone except new user

    

    socket.on('join', ( {username,room}, callback ) => {      // listener for join
        const {error, user} = addUser({ id: socket.id, username, room})
        if( error ) {
            return callback(error)
        }

        socket.join( user.room )   // emit events only for that room

        //console.log(username,room)
        socket.emit('MessageFromServer', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('MessageFromServer', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()   // means no error

        // socket.emit                  - send to specific client
        // io.emit                     - all clients
        // socket.broadcast.emit      - send to all except this socket
        // io.to.emit                 --- emit in the specifc room
        // socket.broadcast.to.emit   --- broadcast in the specifc room

    })

    socket.on('sendMessageFromClient', (messagetoall, callback) => {
        
        const user = getUser(socket.id)

        const filter = new Filter()

        if( filter.isProfane(messagetoall)) {
            return callback('Profanity not allowed')
        }

        io.to(user.room).emit('MessageFromServer', generateMessage( user.username, messagetoall))           // emit to all connections
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        //io.emit('MessageFromServer', `Locations: ${coords.latitude}, ${coords.longitude}`) // emit to all connections
        const user = getUser(socket.id)
        const url1 = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        
        io.to(user.room).emit('LocationFromServer', generateLocationMessage( user.username, url1 ))
        callback() 
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if( user ) {  // user was not part of the room
            io.to(user.room).emit('MessageFromServer',generateMessage(`${user.username} has left!` ))   // send to everyone
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    }) 
})
 
server.listen( port, () => {
    console.log('Server is up on port', port)
})
