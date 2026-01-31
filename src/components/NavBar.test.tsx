import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import NavBar from './NavBar'
import { UserProvider } from '../context/UserContext'
import { ToastProvider } from '../context/ToastContext'

describe('NavBar', () => {
  test('shows user name and logs out with toast', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com', name: 'Tester' }))

    render(
      <ToastProvider>
        <UserProvider>
          <MemoryRouter initialEntries={["/home"]}>
            <NavBar />
            <Routes>
              <Route path="/" element={<div>LoginPage</div>} />
            </Routes>
          </MemoryRouter>
        </UserProvider>
      </ToastProvider>
    )

    expect(screen.getByText(/Welcome, Tester/)).toBeInTheDocument()
    const user = userEvent.setup()
    await act(async () => {
      await user.click(screen.getByText('Logout'))
      await screen.findByText('LoginPage')
      await screen.findByText('Logged out')
    })

    expect(localStorage.getItem('user')).toBeNull()
    expect(screen.getByText('LoginPage')).toBeInTheDocument()
    expect(screen.getByText('Logged out')).toBeInTheDocument()
  })

  test('profile navigates to profile page', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com', name: 'Tester' }))

    render(
      <ToastProvider>
        <UserProvider>
          <MemoryRouter initialEntries={["/home"]}>
            <NavBar />
            <Routes>
              <Route path="/profile" element={<div>ProfilePage</div>} />
            </Routes>
          </MemoryRouter>
        </UserProvider>
      </ToastProvider>
    )

    const user = userEvent.setup()
    await act(async () => {
      await user.click(screen.getByText('Profile'))
      await screen.findByText('ProfilePage')
    })

    expect(screen.getByText('ProfilePage')).toBeInTheDocument()
  })

  test('does not render when no user', () => {
    localStorage.removeItem('user')

    render(
      <ToastProvider>
        <UserProvider>
          <MemoryRouter>
            <NavBar />
          </MemoryRouter>
        </UserProvider>
      </ToastProvider>
    )

    expect(screen.queryByText(/Welcome/)).toBeNull()
  })
})