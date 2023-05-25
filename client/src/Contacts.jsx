import React,{useState,useEffect} from 'react'
import axios from 'axios'
import Avatar from './Avatar'

function Contacts({selectedUser,setSelectedUser,online}) {
    const [contacts,setContacts]=useState(null)
    useEffect(()=>{
        axios.get('/chatlist').then((res)=>{
            setContacts(res.data)
        })
    },[]) 
  return (
      <div className='flex flex-col overflow-y-scroll flex-grow h-full contacts_container'>
                {contacts?
                <div className='' >
                    {contacts.map((el)=>{
                        return(
                        <div onClick={()=>{setSelectedUser(el)}} className='mt-1'>
                        <div className={'flex text-gray-300 p-2 flex-grow rounded-md hover:bg-gray-800 transition-all cursor-pointer'+(!!selectedUser && el._id===selectedUser._id? ' bg-gray-950 border-blue-700 border-l-4' :'')}>
                            <Avatar userId={el._id}/>
                            
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
