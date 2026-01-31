import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Profile from './Profile'
import { UserProvider } from '../context/UserContext'
import { ToastProvider } from '../context/ToastContext'
import { simulate } from '../api/user'

beforeEach(() => {
  localStorage.clear()
})

test('prefills fields from user and saves updates', async () => {
  const existing = { id: '1', email: 'test@example.com', name: 'Tester' }
  localStorage.setItem('user', JSON.stringify(existing))

  render(
    <ToastProvider>
      <UserProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    </ToastProvider>
  )

  // inputs should be prefilled
  const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
  expect(nameInput.value).toBe('Tester')
  expect(emailInput.value).toBe('test@example.com')

  const user = userEvent.setup()
  await user.clear(nameInput)
  await user.type(nameInput, 'New Name')
  await user.clear(emailInput)
  await user.type(emailInput, 'new@example.com')
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /save/i }))
    await screen.findByText('Profile updated')
  })

  expect(screen.getByText('Profile updated')).toBeInTheDocument()

  // localStorage should be updated
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  expect(stored.name).toBe('New Name')
  expect(stored.email).toBe('new@example.com')
})

test('shows validation errors and does not save invalid profile', async () => {
  const existing = { id: '1', email: 'test@example.com', name: 'Tester' }
  localStorage.setItem('user', JSON.stringify(existing))

  render(
    <ToastProvider>
      <UserProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    </ToastProvider>
  )

  const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
  const user = userEvent.setup()

  await user.clear(nameInput)
  await user.clear(emailInput)
  await user.type(emailInput, 'bad')
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /save/i }))
    await screen.findByText('Name is required')
  })

  expect(screen.getByText('Name is required')).toBeInTheDocument()
  expect(screen.getByText('Email is invalid')).toBeInTheDocument()

  // ensure no toast
  expect(screen.queryByText('Profile updated')).not.toBeInTheDocument()

  // ensure localStorage unchanged
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  expect(stored.name).toBe('Tester')
  expect(stored.email).toBe('test@example.com')
})

test('shows server error when email already in use', async () => {
  const existing = { id: '1', email: 'test@example.com', name: 'Tester' }
  localStorage.setItem('user', JSON.stringify(existing))
  // create another profile with the email we'll try to use
  localStorage.setItem('profiles', JSON.stringify({ '2': { id: '2', email: 'taken@example.com', name: 'Other' } }))

  render(
    <ToastProvider>
      <UserProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    </ToastProvider>
  )

  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
  const user = userEvent.setup()

  await user.clear(emailInput)
  await user.type(emailInput, 'taken@example.com')
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /save/i }))
    await screen.findByText('Email already in use')
  })

  expect(screen.getByText('Email already in use')).toBeInTheDocument()

  // ensure localStorage user unchanged
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  expect(stored.email).toBe('test@example.com')
})

test('optimistic update rolls back on server failure', async () => {
  const existing = { id: '1', email: 'test@example.com', name: 'Tester' }
  localStorage.setItem('user', JSON.stringify(existing))
  simulate.failNext = true

  render(
    <ToastProvider>
      <UserProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    </ToastProvider>
  )

  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
  const user = userEvent.setup()

  await user.clear(emailInput)
  await user.type(emailInput, 'new@example.com')
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /save/i }))
    await screen.findByText('Simulated failure')
  })

  // after failure, error shown and rollback
  expect(screen.getByText('Simulated failure')).toBeInTheDocument()
  expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe('test@example.com')

  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  expect(stored.email).toBe('test@example.com')
})

test('rate limit error rolls back optimistic update', async () => {
  const existing = { id: '1', email: 'test@example.com', name: 'Tester' }
  localStorage.setItem('user', JSON.stringify(existing))
  simulate.rateLimitPerId = 1

  render(
    <ToastProvider>
      <UserProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MemoryRouter>
      </UserProvider>
    </ToastProvider>
  )

  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
  const user = userEvent.setup()

  // first save should succeed
  await act(async () => {
    await user.clear(emailInput)
    await user.type(emailInput, 'first@example.com')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await screen.findByText('Profile updated')
  })
  expect(screen.getByText('Profile updated')).toBeInTheDocument()

  // second save should fail due to rate limit
  await act(async () => {
    await user.clear(emailInput)
    await user.type(emailInput, 'second@example.com')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await screen.findByText('Rate limit exceeded')
  })

  expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
  // rollback to previous saved email
  expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe('first@example.com')
})