export default function sendMessage(ev, message, file) {
    return new Promise((resolve, reject) => {
      if (ev) {
        ev.preventDefault();
      }
      if (!file) {
        setMessages(prev => [...prev, { Recipient: selectedUser._id, Message: message ? message : newMessage, incoming: false }])
      }
      ws.send(JSON.stringify({
        Sender: loggeduserid,
        Recipient: selectedUser._id,
        Message: message ? message : newMessage,
        File: file ? file : null
      }
      ))
      setNewMessage('')
      resolve()
    })
  }