import { useState } from 'react'
import ImageCompressor from "./components/ImageCompressor"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ImageCompressor></ImageCompressor>
    </>
  )
}

export default App
