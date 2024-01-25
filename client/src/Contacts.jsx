import React,{useState,useEffect} from 'react'
import axios from 'axios'
import Avatar from './Avatar'
import Loading from './Loading'

function Contacts({selectedUser,setSelectedUser,online,fetchMessages}) {
    const [contacts,setContacts]=useState(null)
    const [isloading,setLoading]=useState(true)
    useEffect(()=>{
        axios.get('/chatlist').then((res)=>{
            setContacts(res.data)
            setLoading(false)
        })
    },[]) 
    if(isloading){
        return(<Loading/>)
    }
    function filterOnlineContacts(el){
        if(`${el._id}` in online){
            el.isOnline = true;
        }
        else{
            el.isOnline = false;
        }
    }
  return (
      <div className='flex flex-col overflow-y-scroll flex-grow h-full contacts_container'>
                {contacts?
                <div className=''>
                    {contacts.map((el)=>{
                        filterOnlineContacts(el)
                        return(
                        <div onClick={()=>{setSelectedUser(el);fetchMessages(el._id)}} className='mt-1' id={el._id} title={"Chat with "+ el.Username} onMouseDown={e=>{if(e.button === 2){console.log("Right Click")}}}>
                        <div className={'flex text-gray-300 p-2 flex-grow rounded-md hover:bg-gray-800 transition-all cursor-pointer'+(!!selectedUser && el._id===selectedUser._id? ' bg-gray-950 border-blue-700 border-l-4' :'')}>
                            <Avatar userId={el._id} userName={el.Username} isOnline={el.isOnline}/>
                            <div className="flex mx-2">
                                <h2 className='first-letter:uppercase font-josefin '>{el.Username}</h2>
                            </div>
                        </div>
                        </div>
                        )
                    }  
                    )}
                </div>:null}
        </div>
  )
}

export default Contacts
