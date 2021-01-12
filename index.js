const express = require('express')
const app = express()
const path = require('path')
const server = require('http').Server(app)

app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
})

const PORT = process.env.PORT || 9999

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'build')))

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'))
    })
}

const rooms = new Map()

app.get('/rooms/:id', (req, res) => {
    const { id: roomId } = req.params
    const obj = rooms.has(roomId)
        ? {
              users: [...rooms.get(roomId).get('users').values()],
              messages: [...rooms.get(roomId).get('messages').values()],
          }
        : { users: [], messages: [] }

    res.json(obj)
})

app.post('/rooms', (req, res) => {
    const { roomId } = req.body

    if (!rooms.has(roomId)) {
        rooms.set(
            roomId,
            new Map([
                ['users', new Map()],
                ['messages', []],
            ]),
        )
    }
    
    res.json(Array(...rooms))
})

io.on('connection', socket => {
    socket.on('ROOM:JOIN', ({ roomId, userName }) => {
        socket.join(roomId)
        rooms.get(roomId).get('users').set(socket.id, userName)
        const users = [...rooms.get(roomId).get('users').values()]
        socket.to(roomId).emit('ROOM:SET_USERS', users)
    })
    
    socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
        const obj = {
            userName,
            text,
        }

        rooms.get(roomId).get('messages').push(obj)
        socket.to(roomId).broadcast.emit('ROOM:NEW_MESSAGE', obj)
    })


    socket.on('disconnect', () => {
        rooms.forEach((value, roomId) => {
            if (value.get('users').delete(socket.id)) {
                const users = [...value.get('users').values()]
                socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users)
            }
        })
    })
})

server.listen(PORT, err => {
    if (err) {
        throw Error(err)
    }

    console.log(`server is running on port: ${PORT}`)
})
