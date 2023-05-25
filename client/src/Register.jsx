import { useContext, useState} from "react"
import axios from 'axios'
import { Link } from "react-router-dom";
import {UserContext} from './UserContext'


export default function Register(){
    const [Username, setUsername]=useState('');
    const [Password, setPassword]=useState('');
    const [Email, setEmail]=useState('');
    const {setLoggedUserId,setLoggedUserName}=useContext(UserContext)
    async function register (e){
        e.preventDefault();
        const res = await axios.post('/register',{Email,Username,Password})
        setLoggedUserId(res.data.Id)
        setLoggedUserName(res.data.Username)
        
    }
    return(
        <div className="bg-gray-900 h-screen flex items-center">
            <form className="w-64 mx-auto mb-8" onSubmit={register}>
                <input value={Email} onChange={e => {setEmail(e.target.value)}} type="email" placeholder="Email" className="block w-full rounded-md mb-2 p-2  bg-gray-950 text-gray-400"/>
                <input value={Username} onChange={e => {setUsername(e.target.value)}} type="text" placeholder="Username" className="block w-full rounded-md mb-2 p-2  bg-gray-950 text-gray-400"/>
                <input value={Password} onChange={e => {setPassword(e.target.value)}} type="password" placeholder="Password" className="block w-full rounded-md mb-2 p-2  bg-gray-950 text-gray-400"/>
                <button type="submit" className="bg-blue-800 p-2 w-full text-gray-200">Register</button>
                <Link to={'/login'}>Already have an account?</Link>
            </form>
        </div>
    )
}