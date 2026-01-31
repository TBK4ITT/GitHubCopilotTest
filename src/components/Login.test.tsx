import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import * as auth from '../api/auth'
import { vi } from 'vitest'
import { UserProvider } from '../context/UserContext'  

describe('Login component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('shows validation errors for empty fields', async () => {
    render(
      <UserProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </UserProvider>
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

  test('shows error for invalid email and short password', async () => {
    render(
      <UserProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </UserProvider>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'bad-email')
    await user.type(screen.getByLabelText(/password/i), 'short')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Email is invalid')).toBeInTheDocument()
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument()
  })

  test('calls authenticate and navigates to home on success', async () => {
    const spy = vi.spyOn(auth, 'authenticate').mockResolvedValue({ ok: true, user: { id: '1', email: 'test@example.com', name: 'Test User' } })

    render(
      <UserProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<div>HomePage</div>} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password1')
    await user.click(screen.getByRole('button'))

    expect(spy).toHaveBeenCalledWith('test@example.com', 'Password1')
    expect(localStorage.getItem('user')).toBeTruthy()
    expect(await screen.findByText('HomePage')).toBeInTheDocument()
  })

  test('shows api error on bad credentials', async () => {
    vi.spyOn(auth, 'authenticate').mockResolvedValue({ ok: false, message: 'Invalid email or password' })

    render(
      <UserProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </UserProvider>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'noone@example.com')
    await user.type(screen.getByLabelText(/password/i), 'WrongPass1')
    await user.click(screen.getByRole('button'))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
  })
})