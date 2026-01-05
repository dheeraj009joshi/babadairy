import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import OrderTracking from './pages/OrderTracking'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminDashboard from './pages/admin/AdminDashboard'
import OrderManagement from './pages/admin/OrderManagement'
import ProductManagement from './pages/admin/ProductManagement'
import UserManagement from './pages/admin/UserManagement'
import UserDetail from './pages/admin/UserDetail'
import Reports from './pages/admin/Reports'
import Inventory from './pages/admin/Inventory'
import Settings from './pages/admin/Settings'

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <FavoritesProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#fff',
                                color: '#4A2C2A',
                                padding: '16px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10B981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#EF4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                    <Routes>
                        {/* Customer Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/orders" element={<OrderManagement />} />
                        <Route path="/admin/products" element={<ProductManagement />} />
                        <Route path="/admin/inventory" element={<Inventory />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/users/:userId" element={<UserDetail />} />
                        <Route path="/admin/reports" element={<Reports />} />
                        <Route path="/admin/settings" element={<Settings />} />
                    </Routes>
                    </FavoritesProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
