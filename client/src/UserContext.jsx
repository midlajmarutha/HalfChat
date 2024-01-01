import {createContext, useState,useEffect} from 'react';
import axios from 'axios'


export const UserContext=createContext()


export function UserContextProvider({children}){
    const [isloading,setLoading] = useState(true)
    const [loggedusername,setLoggedUserName]=useState(false)
    const [loggeduserid,setLoggedUserId] = useState(false)
    const [loggestatus,setLoggedStatus] = useState(false)
    useEffect(()=>{
        axios.get('/profile').then((res)=>{
            if(!res.data.logstatus){
                setLoggedUserId(false);
                setLoggedUserName(false)
                setLoading(false)
            }
            else{
                setLoggedStatus(true)
                setLoggedUserId(res.data.Id)
                setLoggedUserName(res.data.User)
                setLoading(false)
            }
        })
      })

    return(
        <UserContext.Provider value={{loggeduserid,loggedusername,loggestatus,isloading,setLoggedUserId,setLoggedUserName,setLoggedStatus}}>{children}</UserContext.Provider>
    )
}