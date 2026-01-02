import { Routes, Route } from 'react-router-dom'
import Networks from '../pages/Networks'
import Packages from '../pages/Packages'
import Checkout from '../pages/Checkout'
import Orders from '../pages/Orders'
import Contact from '../pages/Contact'

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Networks />} />
      <Route path="/network/:networkId" element={<Packages />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}