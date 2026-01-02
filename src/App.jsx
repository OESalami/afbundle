import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CustomerApp from './customer/customerApp'
import AdminApp from './admin/adminApp'
import AgentApp from './Agent/agentApp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/a/*" element={<AgentApp />} />
        <Route path="/*" element={<CustomerApp />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
