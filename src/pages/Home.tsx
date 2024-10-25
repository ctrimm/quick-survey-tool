import { Button } from '@/components/ui/button'
import { CONFIG } from '@/constants/config'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="space-y-4 text-center">
      <img src={CONFIG.logoUrl} alt="Logo" className="h-12 mx-auto mb-8" />
      <h1 className="text-3xl font-bold">Welcome to Quick Survey Tool</h1>
      <p className="text-lg text-gray-600 mb-8">
        Create and share surveys with ease without having to host outside of GitHub.<br/><br/>Collect responses and analyze results in a simple and efficient way.
      </p>
      <div className="space-x-4">
        <Link to="/admin">
          <Button>Admin Login</Button>
        </Link>
        <Link to="/survey">
          <Button>Take a Survey</Button>
        </Link>
      </div>
    </div>
  )
}