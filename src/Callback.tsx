import authService from './AuthService'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Callback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Read the /c/:clientId route up front: a failed login clears the stored client id, so the
    // path has to be captured before the failure handler runs.
    const loginPath = authService.getLoginPath()
    authService.onLoginSuccess = () => navigate('/info')
    authService.onLoginFailed = () => navigate(loginPath)
    const checkLogin = async () => {
      await authService.processCallback()
    }

    checkLogin()
  }, [navigate])

  return <div></div>
}

export default Callback
