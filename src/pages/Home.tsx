import React from 'react'
import { useUser } from '../context/UserContext'

export default function Home() {
  const { user } = useUser()

  return (
    <div className="app-container">
      <h1>Home</h1>
      <p>Welcome{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email}` : ''}!</p>
    </div>
  )
}
