import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import TechStack from './components/TechStack'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <TechStack />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App