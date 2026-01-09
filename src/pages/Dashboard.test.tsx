import React from 'react'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { UserProvider } from '../context/UserContext'

describe('Dashboard page', () => {
  test('renders user info when logged in', () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com', name: 'Tester' }))
    render(
      <UserProvider>
        <Dashboard />
      </UserProvider>
    )

    expect(screen.getByText(/Dashboard/)).toBeInTheDocument()
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
    localStorage.removeItem('user')
  })
})