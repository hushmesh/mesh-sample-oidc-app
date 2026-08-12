import authService, { DEFAULT_SCOPE } from './AuthService'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MeshButton from './MeshButton'

const Login = () => {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const [showLogin, setShowLogin] = useState(false)
  const [scope, setScope] = useState(authService.getScope())

  const handleLogin = () => {
    authService.setScope(scope)
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
      {showLogin && (
        <div className="container">
          <label className="scope-input" htmlFor="scope">
            <span>Scopes</span>
            <input
              id="scope"
              type="text"
              value={scope}
              placeholder={DEFAULT_SCOPE}
              onChange={(e) => setScope(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </label>
          <p className="scope-hint">Space separated, sent as the scope parameter on the authorize call.</p>
        </div>
      )}
    </div>
  )
}

export default Login
