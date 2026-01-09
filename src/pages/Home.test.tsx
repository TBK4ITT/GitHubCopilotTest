import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from './Home'
import { UserProvider } from '../context/UserContext'

describe('Home page', () => {
  test('shows welcome with user info from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'Tester' }))
    render(
      <UserProvider>
        <Home />
      </UserProvider>
    )
    expect(screen.getByText(/Welcome, Tester/)).toBeInTheDocument()
    localStorage.removeItem('user')
  })

  test('shows a generic welcome when no user present', () => {
    localStorage.removeItem('user')
    render(
      <UserProvider>
        <Home />
      </UserProvider>
    )
    expect(screen.getByText(/Welcome/)).toBeInTheDocument()
  })
})
