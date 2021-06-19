import * as esbuild from 'esbuild-wasm'
import { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from "react"
import { Fragment } from "react"
import { unpkgPathPlugin } from '../plugin'
import { fetchPlugin } from '../plugin/fetch-plugin'


const FormElements = () => {
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const ref = useRef<any>()


  useEffect(() => {
    startService()
  }, [])

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm'
    })
    
  }

  const handleClick = async () => {
    const {current} = ref

    if (!current) return

    const result = await current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(),
        fetchPlugin(input)
      ],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: 'window'
      }
    })

    // console.log(result)

    setCode(result.outputFiles[0].text)
    
  }

  return (
    <Fragment>
      <textarea value={input} onChange={e => setInput(e.target.value)} name="code" placeholder="Please type code here" cols={30} rows={10}></textarea>
      <div>
        <button onClick={handleClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </Fragment>
  )
}

export default FormElements
