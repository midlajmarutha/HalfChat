import React from 'react'

function Loading() {
  return (
    <div className='w-full min-h-[500px] flex justify-center items-center flex-grow'>
      <div className='w-6 h-6 bg-gray-500 rounded-[50%] border-white p-1 animate-ping'>
      </div>
    </div>
  )
}

export default Loading
