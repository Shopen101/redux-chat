import React, { useEffect } from 'react'
import './App.css'

import { useSelector, useDispatch } from 'react-redux'
import { joined, setUsers as setUsersDispatch, newMessage, onLoginUser} from './redux/actions/connect'

import socket from './socket'
import axios from 'axios'

import { JoinBlock, Chat } from './components'

// node scripts/start.js // node index.js
// "proxy": "http://localhost:9999",

function App() {
    const dispatch = useDispatch()
    const joinedUser = useSelector(({ connection }) => connection.joined)

    const onLogin = async obj => {
        dispatch(onLoginUser(obj))     
        // await socket.emit('ROOM:JOIN', obj)
        
        // const { data } = await axios.get(`/rooms/${obj.roomId}`)
        // setUsers(data.users)

        // dispatch(joined(obj))
        // TODO: выше это я уже переписал на REDUX THUNK
    }

    const setUsers = users => {
        dispatch(setUsersDispatch(users))
    }

    const addMessage = message => {
        dispatch(newMessage(message))
    }

    useEffect(() => {
        socket.on('ROOM:SET_USERS', (users) => {setUsers(users)})
        socket.on('ROOM:NEW_MESSAGE', (message) => {addMessage(message)})
    }, [])

    return (
        <div className="wrapper">
            {!joinedUser ? <JoinBlock onLogin={onLogin} /> : <Chat onAddMessage={addMessage} />}
        </div>
    )
}

export default App
