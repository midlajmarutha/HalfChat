import {createContext, useState,useEffect,useContext} from 'react';
import axios from 'axios'


export const UserContext=createContext()


export function UserContextProvider({children}){
    const [loggedusername,setLoggedUserName]=useState('')
    const [loggeduserid,setLoggedUserId] = useState('')
    useEffect(()=>{
        axios.get('/profile').then((res)=>{
          setLoggedUserId(res.data.Id)
          setLoggedUserName(res.data.User)
        })
      })

    return(
        <UserContext.Provider value={{loggeduserid,loggedusername,setLoggedUserId,setLoggedUserName}}>{children}</UserContext.Provider>
    )
}