import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './Login'
import Info from './Info'
import Callback from './Callback'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" Component={Login} />
          <Route path="/info" Component={Info} />
          <Route path="/callback" Component={Callback} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
