import socket from '../../socket'
import axios from 'axios'

export const joined = obj => ({
    type: 'JOINED',
    payload: obj,
})

export const setUsers = users => ({
    type: 'SET_USERS',
    payload: users
})

export const newMessage = messages => ({
    type: 'NEW_MESSAGE',
    payload: messages
})

export const onLoginUser = (obj) => async (dispatch) => {
    await socket.emit('ROOM:JOIN', obj)

    const { data } = await axios.get(`/rooms/${obj.roomId}`)
    dispatch(setUsers(data.users))
    
    dispatch(joined(obj))
}