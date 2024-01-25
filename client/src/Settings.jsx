import React, { useContext, useEffect } from 'react'
import { UserContext } from './UserContext'

function Settings() {
  const {loggedusername} = useContext(UserContext)
  return (
    <div className='m-7'>
      <span className='flex'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg> Home</span>
        <div className='m-4'>
          {loggedusername}
        </div>
    </div >
  )
}

export default Settings
