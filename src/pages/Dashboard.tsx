import React from 'react'
import { useUser } from '../context/UserContext'

export default function Dashboard() {
  const { user } = useUser()
  if (!user) return null

  return (
    <div className="app-container">
      <h1>Dashboard</h1>
      <p>This is a small dashboard. You are logged in as {user.email}.</p>
    </div>
  )
}
