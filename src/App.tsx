import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/login'
import { ProductsPage } from '@/pages/products'
import { RegisterPage } from '@/pages/register'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  )
}
