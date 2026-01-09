import React from 'react'
import { useUser } from '../context/UserContext'

export default function Dashboard() {
  const { user } = useUser()

  return (
    <div className="app-container">
      <h1>Dashboard</h1>
      <p>This is a small dashboard. {user ? `You are logged in as ${user.email}` : 'You are not logged in.'}</p>
    </div>
  )
}
