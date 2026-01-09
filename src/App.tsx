import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { UserProvider } from './context/UserContext'
import { ToastProvider } from './context/ToastContext'
import NavBar from './components/NavBar'
import DevTools from './components/DevTools'

export default function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route
              path="/"
              element={
                <div className="app-container">
                  <h1>Sign in</h1>
                  <Login />
                </div>
              }
            />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {import.meta.env.DEV && <Route path="/__dev__" element={<DevTools />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ToastProvider>
  )
} 
