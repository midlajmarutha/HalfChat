import React from 'react'

function Avatar({userId}) {
  let colors=['bg-red-800','bg-teal-800','bg-green-800','bg-purple-900','bg-cyan-800']
  let userIdBase10=parseInt(userId,16)
  let colorIndex=userIdBase10 % colors.length
  let color=colors[colorIndex]
  return (
    <div className={"rounded-full p-1 "+color}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
  )
}

export default Avatar
