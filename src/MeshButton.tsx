import { useState } from 'react'

const MeshButton = ({ onClick }: { onClick: () => void }) => {
  const [hover, setHover] = useState<boolean>(false)
  return (
    <button
      className="mesh-button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <img src={hover ? '/hush-mesh-white.svg' : '/hush-mesh-blue-gray.svg'} alt="Mesh Logo" />
      <span>mesh in to &lt;brand name&gt;</span>
    </button>
  )
}

export default MeshButton
