import authService from './AuthService'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MeshButton from './MeshButton'

const Login = () => {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const [showLogin, setShowLogin] = useState(false)

  const handleLogin = () => {
    authService.login()
  }

  useEffect(() => {
    if (clientId) {
      authService.setClientId(clientId)
    }
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
  }, [clientId, navigate])

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
