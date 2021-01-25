const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocationMessage } = require('./utils/messages')
const { addUser , removeUser , getUser , getUsersInRoom } = require('./utils/users')  

const app = express()
const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000 
const publicDirectoryPath = path.join(__dirname , '../public')
app.use(express.static(publicDirectoryPath))


io.on('connection' , (socket)=> {
    console.log('new web socket connection')



    socket.on( 'join' , ( { username , room } , callback )=> {

        const { error , user } = addUser({ id: socket.id , username , room })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit ( 'message' , generateMessage( 'Admin' , 'welcome!'))
        socket.broadcast.to(user.room).emit('message' , generateMessage( 'Admin' , `${user.username} has joined !`))
        io.to(user.room).emit('roomData' , {
            room : user.room ,
            users : getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage' , (message , callback)=> {

        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profantiy is not allowed , gaali mt do saaalo !')
        }
        io.to(user.room).emit('message' , generateMessage(user.username , message))
        callback()
    })

    socket.on('sendLocation' , (location , callback)=> {

        const user = getUser(socket.id)

        const locationURL = `https://google.com/maps?q=${location.latitude},${location.longitude}`
        io.to(user.room).emit('locationMessage' , generateLocationMessage( user.username ,locationURL) )
        
        callback('location shared !')
    })


    socket.on('disconnect' , ()=> {

        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message' , generateMessage( 'Admin' , `${user.username} has left!`))
            io.to(user.room).emit('roomData' , {
                room : user.room ,
                users : getUsersInRoom(user.room)
            })
        }
    })
    // socket.emit('countUpdated', count)

    // socket.on('increment' , ()=> {
    //     count++
    //     io.emit('countUpdated' , count)
    // })
})

server.listen(port , ()=> {
    console.log(`we are running on port - ${port}`)
})