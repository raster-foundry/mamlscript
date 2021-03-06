import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import uglify from 'rollup-plugin-uglify';
import builtins from 'rollup-plugin-node-builtins';

const pkg = require('./package.json')

const libraryName = 'mamlscript'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd' },
    { file: pkg.module, format: 'es' },
  ],
  sourcemap: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  globals: {
    mathjs: 'math'
  },
  plugins: [
    // Compile TypeScript files
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    builtins(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      browser: true
    }),
    // Uglify
    uglify(),
    // Resolve source maps to the original source
    sourceMaps(),
  ],
}
