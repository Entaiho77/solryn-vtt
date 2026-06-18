import { useRef } from 'react'
import './Toolbar.css'

const TOKEN_COLORS = ['#5b8cff', '#ff5b6e', '#4cd97b', '#ffc24c', '#c45bff']

export default function Toolbar({ onLoadMap, onAddToken }) {
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => onLoadMap(img)
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  return (
    <div className="toolbar">
      <button onClick={() => fileInputRef.current.click()}>Load map</button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />
      <button
        onClick={() =>
          onAddToken(TOKEN_COLORS[Math.floor(Math.random() * TOKEN_COLORS.length)])
        }
      >
        Add token
      </button>
    </div>
  )
}
