import CustomerRoutes from './routes/CustomerRoutes'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function CustomerApp() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-md flex-1 w-full">
        <CustomerRoutes />
      </div>
      <Footer />
    </div>
  );
}