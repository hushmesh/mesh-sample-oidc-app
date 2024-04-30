import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService, { UserProfile } from './AuthService'

const Info = () => {
  const [data, setData] = useState<UserProfile | null>(null)
  const [jwtHeader, setJwtHeader] = useState<string | null>(null)
  const [jwtPayload, setJwtPayload] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (data == null) {
          const data = await authService.fetchUserProfile()
          setData(data)
          let tokens = authService.getTokens()
          var parts = tokens!.idToken.split('.')
          console.log(parts)
          if (parts.length === 3) {
            var header = JSON.stringify(JSON.parse(atob(parts[0])), null, 2)
            var payload = JSON.stringify(JSON.parse(atob(parts[1])), null, 2)
            setJwtPayload(payload)
            setJwtHeader(header)
          }
        }
      } catch (error) {
        console.log('Failed to fetch info:', error)
        authService.logout()
        navigate('/')
      }
    }

    fetchData()
  }, [data, navigate])

  if (data == null) {
    return (
      <div className="header">
        <p>Mesh User Info</p>
        <div className="spinner"></div>
      </div>
    )
  }
  return (
    <div>
      <div className="header">
        <p>Mesh User Info</p>
        <button className="mesh-button" onClick={handleLogout}>
          mesh out
        </button>
      </div>
      <div className="container">
        <div className="user-info">
          <p>Sub</p>
          <p>{data.sub}</p>
        </div>
        <div className="user-info">
          <p>Name</p>
          <p>{data.name}</p>
        </div>
        <div className="user-info">
          <p>Email</p>
          <p>{data.email}</p>
        </div>
        <div className="user-info">
          <p>JWT Header</p>
          <p>
            <pre>{jwtHeader}</pre>
          </p>
        </div>
        <div className="user-info">
          <p>JWT Payload</p>
          <p>
            <pre>{jwtPayload}</pre>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Info
