import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import ProductPage from './pages/ProductPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import TokenizationPage from './pages/TokenizationPage'
import ApiKeysPage from './pages/ApiKeysPage'
import ApiDocsPage from './pages/ApiDocsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import IoTSimulator from './pages/IOTSimulator'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tokenization" element={<TokenizationPage />} />
        <Route path="/api-keys" element={<ApiKeysPage />} />
        <Route path="/docs" element={<ApiDocsPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/network" element={<ProductPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
                <Route path="/simulate" element={<IoTSimulator />} />
      </Routes>
    </Layout>
  )
}
