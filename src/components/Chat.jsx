import React from 'react';
import socket from '../socket'

import { useSelector } from 'react-redux'

function Chat({ onAddMessage }) {
    const [messageValue, setMessageValue] = React.useState('')
    const messagesRef = React.useRef(null)

    const { users, messages, userName, roomId } = useSelector(({ connection }) => connection)

    const onSendMessage = () => {
        socket.emit('ROOM:NEW_MESSAGE', {
            userName,
            roomId,
            text: messageValue
        })

        onAddMessage({ userName, text: messageValue })
        setMessageValue('')
    }

    React.useEffect(() => {
        messagesRef.current.scroll(0, messagesRef.current.scrollHeight)
    }, [messages])

    return (
        <div className="chat">
            <div className="chat-users">
                Комната: <b>{roomId}</b>
                <hr />
                <b>Онлайн ({users.length}):</b>
                <ul>
                    {users.map((name, index) => (<li key={`${name}__${index}`}>{name}</li>))}
                </ul>
            </div>
            <div className="chat-messages">
                <div ref={messagesRef} className="messages">
                    {messages.map((message, index) => (
                        message.userName === userName ? (
                            <div key={message + index} className="message message--right">
                                <div className="left">
                                    <p>{message.text}</p>
                                    <div className="right-name">
                                        <span>{message.userName}</span>
                                    </div>
                                </div>
                            </div>
                        )
                            : (
                                <div key={message + index} className="message">
                                    <p>{message.text}</p>
                                    <div>
                                        <span>{message.userName}</span>
                                    </div>
                                </div>
                            )
                    ))}
                </div>
                <form>
                    <textarea
                        value={messageValue}
                        onChange={(e) => setMessageValue(e.target.value)}
                        className="form-control"
                        rows="3"></textarea>
                    <button onClick={onSendMessage} type="button" className="btn btn-primary">
                        Отправить
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chat;