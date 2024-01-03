import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from './UserContext'
import Login from './Login'
import axios from 'axios'
import '../src/App.css'
import Contacts from './Contacts'
import { useNavigate } from 'react-router-dom'
import Loading from './Loading'


function Chat() {
  const [email, setEmail] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const { loggeduserid, loggedusername, isloading, loggedstatus } = useContext(UserContext)
  const [ws, setWs] = useState('')
  const [searchOrCancel, setSearchOrCancel] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newMessage, setNewMessage] = useState(null)

  const [messages, setMessages] = useState()
  const [newContacts, setNewContacts] = useState([])
  const [onlinePeople, setOnlinePeople] = useState([])
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3000");
    setWs(websocket)
    websocket.addEventListener('message', handleMessage)
  }, [])
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data)
    if ('online' in messageData) {
      setOnlinePeople(messageData.online);

    } else if ('Message' in messageData) {
      let messageContainer = document.getElementById("messages");
      console.log([{ messageData }])
      setMessages((prev) => ([...prev, messageData]));
      messageContainer.scrollBy(0, 100)
    }
    else if ('messagedata' in messageData) {

    }

  }
  function getUser(e) {
    e.preventDefault()
    axios.post('/user', { email: email }).then(user => {
      if (user.data) {
        setFoundUser(user.data)
      } else {
        setFoundUser(null)
      }
      setSearchOrCancel(false)

    })
  }
  function resetSearch(e) {
    setEmail('')
    setFoundUser(null)
    setSearchOrCancel(true)

  }
  function showmessages() {
    messages.forEach((message) => {
      return (
        <div>
          {message.Message}
        </div>
      )
    })
  }
  function handleFollow() {
    axios.get('/follow', { params: { id: foundUser._id } }).then((res) => {
      setNewContacts(prev => [...prev, res])
    })
  }
  function sendMessage(ev) {
    ev.preventDefault();
    setMessages(prev => [...prev, { Recipient: selectedUser._id, Message: newMessage, incoming: false }])
    ws.send(JSON.stringify({
      Sender: loggeduserid,
      Recipient: selectedUser._id,
      Message: newMessage
    }
    ))
    setNewMessage('')
  }
  function fetchMessages(userid) {
    axios.get('/fetchMessages', { params: { loggedUserId: loggeduserid, selectedUserId: userid } }).then(messageData=>{
      console.log(messageData.data.length)
      if(messageData.data.length !== 0){
        setMessages(messageData.data)
      }
      else{
        setMessages(undefined)
      }
    })
  }

  const navigate = useNavigate();
  if (isloading) {
    return <Loading />
  }
  else if (!isloading && !loggeduserid) {
    console.log('no user logged in');
    navigate("/login");
  }
  else {
    return (
      <>
        <div className='flex h-screen'>
          <div className={'w-1/3 h-full bg-gray-900 p-4 ' + (!selectedUser ? 'max-md:w-full' : 'max-md:hidden')}>
            <h1 className='text-gray-100 font-bold text-'>HalfChat</h1>
            <div className='mt-2 flex'>
              <form action="" onSubmit={getUser} onReset={resetSearch} className='flex w-full'>
                <input value={email} onChange={e => { setEmail(e.target.value); setSearchOrCancel(true) }} type="text" className='flex-grow p-1 pl-3 rounded-l-lg bg-gray-950 search_input' placeholder='Search user by E-mail..' id='search' required />
                {searchOrCancel ?
                  <button className='p-2 bg-gray-950 text-gray-300 rounded-r-lg' type='submit' >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                  :
                  <button className='p-2 bg-gray-950  text-gray-300 rounded-r-lg' type='reset' >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }

              </form>
            </div>
            {foundUser ?
              <div className='flex my-2 bg-gray-950 px-4 py-2 rounded-lg backdrop:shadow-sm'>
                <div className="flex flex-col flex-grow h-full ">
                  <h1 className='first-letter:uppercase font-poppins font-bold text-blue-900'>{foundUser.Username}</h1>
                  <h6 className='lowercase font-thin mt-0 text-xs text-gray-500  font-josefin '>{foundUser.Email}</h6>
                </div>
                <div className='my-auto'>
                  <button className='bg-blue-500 text-white rounded-md p-1 px-2 font-semibold font-thin text-center' onClick={handleFollow}>follow</button>
                </div>
              </div>
              : null
            }
            <div className='mt-2'>
              <Contacts selectedUser={selectedUser} setSelectedUser={setSelectedUser} online={onlinePeople} fetchMessages={fetchMessages} />
            </div>
          </div>
          <div className={'w-2/3 h-full bg-gray-800 p-4 flex flex-col transition-all ' + (selectedUser ? 'max-md:w-full' : 'max-md:hidden')}>
            {!selectedUser && (
              <div className="flex h-full flex-grow items-center justify-center text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <h1>Select a user from sidebar</h1>
              </div>
            )}
            {!!selectedUser && (

              <div className="flex h-full flex-col">
                <div className='flex justify-between'>
                  <div className='flex'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600" onClick={() => { setSelectedUser(null); setNewMessage(null) }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>

                    <h1 className='text-gray-300 first-letter:uppercase font-bold'>{selectedUser.Username}</h1>
                  </div>
                  {/* logged User */}
                  <div className='bg-blue-600 text-white rounded-full p-1 '>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </div>
                <div className='flex flex-grow flex-col overflow-y-scroll text-gray-500  ' id='messages'>
                  {messages ?
                    messages.map((message) =>
                    (<div className={"p-2 text-sm" + (message.incoming || message.Sender == selectedUser._id ? ' bg-blue-700 text-white  rounded-md my-3 w-fit max-w-[40%]' : ' bg-blue-400 text-white rounded-md my-3 w-fit max-w-[40%] self-end')}>
                      {message.Message}
                    </div>
                    ))
                    :
                    <div className='flex flex-col justify-center items-center text-gray-500  cursor-pointer'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <h1>Say <span className='font-poppins text-gray-200 '>Hello</span> To <span className='font-poppins text-gray-200'>{selectedUser.Username}</span> </h1>
                    </div>}
                </div>

                <div >
                  <form action="" className='flex gap-2' onSubmit={sendMessage}>
                    <input type="text" name='Message' placeholder='Type your message here..' className='flex-grow h-10 p-3 rounded bg-gray-900 text-gray-400'
                      value={newMessage}
                      onChange={ev => setNewMessage(ev.target.value)}
                      id='message_input'
                      required />
                    <button className='bg-blue-500 px-3 text-white rounded-md'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

export default Chat
