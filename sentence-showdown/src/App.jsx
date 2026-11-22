import { Routes, Route } from 'react-router-dom'
import LandingView from './views/LandingView'
import HostView from './views/HostView'
import PlayerView from './views/PlayerView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingView />} />
      <Route path="/host" element={<HostView />} />
      <Route path="/play" element={<PlayerView />} />
    </Routes>
  )
}

export default App
