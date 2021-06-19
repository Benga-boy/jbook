import * as esbuild from 'esbuild-wasm'
import localforage from 'localforage';
import axios from 'axios';

const fileCache = localforage.createInstance({
  name: 'filecache'
});

export const fetchPlugin = (input: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({filter: /(^index\.js$)/}, () => {
        return {
          loader: 'jsx',
          contents: input,
        }
      })

      build.onLoad({filter: /.css$/}, async(args: any) => {
        // check to see if we have already fetched this file
      // if it is in the cache
      const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path)

      // if it is, return it immediately
      if (cachedResult) {
        return cachedResult
      }

      const {data, request} = await axios.get(args.path)

      const escaped = data.replace(/\n/g, '').replace(/"/g, '\\"').replace(/'/g, "\\'")

      const contents = `const style = document.createElement('style'); style.innerText = '${escaped}';
      document.head.appendChild(style)
      `

      const result: esbuild.OnLoadResult =  {
        loader: 'jsx',
        contents,
        resolveDir: new URL('./', request.responseURL).pathname
      }

      // store the response in cache
      await fileCache.setItem(args.path, result)

      return result
      })

    build.onLoad({ filter: /.*/ }, async (args: any) => {



      // check to see if we have already fetched this file
      // if it is in the cache
      // const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path)

      // // if it is, return it immediately
      // if (cachedResult) {
      //   return cachedResult
      // }

      const {data, request} = await axios.get(args.path)
      
      const fileType = args.path.match(/.css$/) ? 'css' : 'jsx'

      const escaped = data.replace(/\n/g, '').replace(/"/g, '\\"').replace(/'/g, "\\'")

      const contents = fileType === 'css' ? `const style = document.createElement('style'); style.innerText = '${escaped}';
      document.head.appendChild(style)
      ` : data

      const result: esbuild.OnLoadResult =  {
        loader: 'jsx',
        contents,
        resolveDir: new URL('./', request.responseURL).pathname
      }

      // store the response in cache
      await fileCache.setItem(args.path, result)

      return result
    })
    }
  }
}