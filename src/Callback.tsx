import authService from './AuthService'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Callback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    authService.onLoginSuccess = () => navigate('/info')
    authService.onLoginFailed = () => navigate('/')
    const checkLogin = async () => {
      await authService.processCallback()
    }

    checkLogin()
  }, [navigate])

  return <div></div>
}

export default Callback
