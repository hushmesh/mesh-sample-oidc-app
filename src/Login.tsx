import authService from './AuthService'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MeshButton from './MeshButton'

const Login = () => {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)

  const handleLogin = () => {
    authService.login()
  }

  useEffect(() => {
    const checkLogin = async () => {
      await authService.loadConfig()
      const tokens = authService.getTokens()
      if (tokens) {
        navigate('/info')
      } else {
        setShowLogin(true)
      }
    }
    checkLogin()
  }, [navigate])

  return (
    <div>
      <div className="header">
        <p>Mesh User Info</p>
        {showLogin && <MeshButton onClick={handleLogin} />}
      </div>
    </div>
  )
}

export default Login
