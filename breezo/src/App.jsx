import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import NetworkPage from './pages/NetworkPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/network"   element={<NetworkPage />} />
        <Route path="/about"     element={<AboutPage />} />
      </Routes>
    </Layout>
  )
}
