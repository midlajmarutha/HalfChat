import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from './UserContext'
import Login from './Login'
import axios from 'axios'
import '../src/App.css'
import Contacts from './components/Contacts'
import { useNavigate } from 'react-router-dom'
import Loading from './components/Loading'


function Chat() {
  const [email, setEmail] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const { loggeduserid, loggedusername, isloading, setLoggedUserName, setLOggedUserId } = useContext(UserContext)
  const [files, setFiles] = useState([])
  const [ws, setWs] = useState('')
  const [searchOrCancel, setSearchOrCancel] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [lastMessageDate, setLastMessageDate] = useState()

  const [messages, setMessages] = useState([])
  const [newContacts, setNewContacts] = useState([])
  const [onlinePeople, setOnlinePeople] = useState([])
  useEffect(() => {
    const websocket = new WebSocket("wss://halfchat.onrender.com/");
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
  function handleFollow() {
    axios.get('/follow', { params: { id: foundUser._id } }).then((res) => {
      setNewContacts(prev => [...prev, res])
    })
  }
  function logOut() {
    axios.get("/logout").then(() => {
      setLoggedUserName(null)
      setLOggedUserId(null)
    })
  }
  function sendMessage(ev, message, file) {
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
  function fetchMessages(userid) {
    axios.get('/fetchMessages', { params: { loggedUserId: loggeduserid, selectedUserId: userid } }).then(messageData => {
      console.log(messageData.data.length)
      if (messageData.data.length !== 0) {
        setMessages(messageData.data)
      }
      else {
        setMessages([])
      }
    })
  }

  function notifyMessage(sender, data) {
    let senderCard = document.getElementById(sender)

  }

  function sendFirstHello(e) {
    sendMessage(e, "Hello👋");
  }

  const chunkSize = 1024 * 1024
  let currentChunkIndex = 0;

  function sendFile(ev) {
    console.log(ev.target.files[0])
    let inputfiles = ev.target.files;
    let totalChunks = Math.ceil(inputfiles[0].size / chunkSize)
    let from = currentChunkIndex * chunkSize;
    let to = from + chunkSize;
    let blob = inputfiles[0].slice(from, to)
    console.log(totalChunks)
    console.log(inputfiles[0].slice(from, to))
    const filereader = new FileReader()
    filereader.readAsDataURL(blob)
    filereader.onload = () => {
      sendMessage(null, null, { name: ev.target.files[0].name, type: ev.target.files[0].type, isLastChunk: currentChunkIndex + 1 === totalChunks, file: filereader.result }).then(() => {
        if (currentChunkIndex + 1 === totalChunks) {
          currentChunkIndex = 0;
        } else {
          currentChunkIndex++;
          sendFile(ev)
        }
      })
    }
  }
  function startRecording(){
    navigator.mediaDevices.getUserMedia({audio:true})
  }
  function scrollToBottom() {
    let messagecontainer = document.getElementById("messages")
    console.log(messagecontainer.style.height)
  }
  const navigate = useNavigate();
  function showSettings() {
    navigate("/settings")
  }

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
            <div className='flex justify-between items-center'>
              <h1 className='text-gray-100 font-extrabold text-lg'>HalfChat</h1>
              {/* <h2 className='text-gray-100 font-bold first-letter:uppercase'>{loggedusername}</h2> */}

              <div className='text-gray-200  p-2 cursor-pointer bg-gray-800 gap-2 rounded-md flex hover:bg-gray-700 transition-colors' onClick={showSettings} title='Settings'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>

              </div>
              {/* <div className='text-red-600  p-2 cursor-pointer bg-gray-800 gap-2 rounded-md flex hover:bg-gray-700 transition-colors' onClick={logOut}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </div> */}
            </div>
            <div className='mt-2 flex'>
              <form action="" onSubmit={getUser} onReset={resetSearch} className='flex w-full'>
                <input value={email} onChange={e => { setEmail(e.target.value); setSearchOrCancel(true) }} type="text" title='Type E-mail address' className='flex-grow p-1 pl-3 rounded-l-lg bg-gray-950 search_input' placeholder='Search user by E-mail..' id='search' required />
                {searchOrCancel ?
                  <button className='p-2 bg-gray-950 text-gray-300 rounded-r-lg' type='submit' title='Search'>
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
              :
              null
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
                  <div className='flex gap-7 pr-2 text-blue-600'>
                    <div className='cursor-pointer' title={"Audio call " + selectedUser.Username}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div className='cursor-pointer' title={'Video call ' + selectedUser.Username}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className='flex flex-grow flex-col overflow-y-scroll text-gray-500  px-2 mb-2' id='messages'>
                  {messages.length !== 0 ?
                    messages.map((message) =>
                    (<div className={"p-2 text-sm break-words w-fit max-w-[40%]" + (message.incoming || message.Sender == selectedUser._id ? ' bg-blue-700 text-white  rounded-md my-3' : ' bg-blue-400 text-white rounded-md my-3  self-end')}>
                      {message.File ?
                        <div>
                          <div>

                          </div>
                          <div className='flex items-center'>
                            {/* {message.File.file_type.includes("image/") && <img src={axios.defaults.baseURL + "/uploads/" + message.File.file_name} width={50}></img>} */}

                            <a href={axios.defaults.baseURL + "/uploads/" + message.File.file_name}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                              </svg>
                            </a>
                          </div>
                        </div>
                        :
                        <p>{message.Message}</p>
                      }
                    </div>)
                    )
                    :
                    <div className='flex flex-col justify-center items-center text-gray-500  cursor-pointer' onClick={sendFirstHello}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <h1>Say <span className='font-poppins text-gray-200 '>Hello👋</span> To <span className='font-poppins text-gray-200'>{selectedUser.Username}</span> </h1>
                    </div>}
                </div>

                <div >
                  <form action="" className='flex gap-2' onSubmit={sendMessage}>
                    <label type='button' className='bg-blue-500 p-2 cursor-pointer text-white rounded-sm ' title='Click to record voice notes' onClick={startRecording}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>

                    </label>
                    <input type="text" name='Message' placeholder='Type your message here..' title='Type your message here..' className='flex-grow h-10 p-3 rounded bg-gray-900 text-gray-400'
                      value={newMessage}
                      onChange={ev => setNewMessage(ev.target.value)}
                      id='message_input'
                      required />
                    <label type='button' className='bg-blue-500 p-2 cursor-pointer text-white rounded-sm ' title='Select and send file'>
                      <input type="file" name="File" id="" className='hidden' onChange={sendFile} />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                    </label>
                    <button className='bg-blue-500 px-3 text-white rounded-sm' onClick={scrollToBottom} title='Send message'>
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
