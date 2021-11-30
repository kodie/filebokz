import { babel } from '@rollup/plugin-babel'

const config = {
  input: 'src/filebokz.js',
  output: {
    dir: 'dist',
    format: 'umd',
    name: 'filebokz',
    sourcemap: true
  },
  plugins: [
    babel({ babelHelpers: 'bundled' })
  ]
}

export default config
