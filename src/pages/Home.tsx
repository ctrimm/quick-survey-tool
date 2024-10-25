import { Button } from '@/components/ui/button'
import { CONFIG } from '@/constants/config'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="space-y-4">
      <img src={CONFIG.logoUrl} alt="Logo" className="h-12 mb-8" />
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
