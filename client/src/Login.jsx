import { useContext, useState } from "react"
import axios from 'axios'
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";
export default function Login(){
    const [Password, setPassword]=useState('');
    const [Email, setEmail]=useState('');
    const {setLoggedUserId,setLoggedUserName}=useContext(UserContext)
    
    async function login (e){
        e.preventDefault();
        axios.post('/login',{Email,Password}).then((res)=>{
            console.log(res)
            setLoggedUserName(res.data.Username)
            setLoggedUserId(res.data.Id)
        })

    }
    return(
        <div className="bg-gray-900 h-screen flex items-center">
            <form className="w-64 mx-auto mb-8" onSubmit={login}>
                <input value={Email} onChange={e => {setEmail(e.target.value)}} type="email" placeholder="Email" name="Email" className="block w-full rounded-md mb-2 p-2 bg-gray-950 text-gray-400"/>
                <input value={Password} onChange={e => {setPassword(e.target.value)}} type="password" placeholder="Password" name="Password" className="block w-full rounded-md mb-2 p-2 bg-gray-950 text-gray-400"/>
                <button type="submit" className="bg-blue-800 p-2 w-full text-white ">Login</button>
                <Link to={'/register'} className="text-gray-400">Don't have an account? </Link>
                <Link to={'/'}>Home</Link>
            </form>
        </div>
    )
}