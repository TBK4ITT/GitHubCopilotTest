import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { UserProvider } from '../context/UserContext'

describe('ProtectedRoute', () => {
  test('redirects to login when no user', () => {
    render(
      <UserProvider>
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route path="/" element={<div>LoginPage</div>} />
            <Route path="/home" element={<ProtectedRoute><div>Protected</div></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    )

    expect(screen.getByText('LoginPage')).toBeInTheDocument()
  })

  test('renders children when user present', () => {
    // set user in localStorage so UserProvider picks it up
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com', name: 'Tester' }))

    render(
      <UserProvider>
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route path="/home" element={<ProtectedRoute><div>Protected</div></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    )

    expect(screen.getByText('Protected')).toBeInTheDocument()
    localStorage.removeItem('user')
  })
})