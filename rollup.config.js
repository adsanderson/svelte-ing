// rollup.config.js
import * as fs from 'fs'
import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'insta-widget/main.js',
  dest: 'public/instaRoll.js',
  format: 'iife',
  moduleName: 'instaRoll',
  plugins: [
    svelte({
      // By default, all .html and .svelte files are compiled
      //extensions: [ '.my-custom-extension' ],

      // You can restrict which files are compiled
      // using `include` and `exclude`
      include: 'insta-widget/components/*.html',

      // By default, the client-side compiler is used. You
      // can also use the server-side rendering compiler
    //   generate: 'ssr',

      // Extract CSS into a separate file (recommended).
      // See note below
    //   css: function ( css ) {
    //     fs.writeFileSync( 'public/main.css', css );
    //   }
    }),
    resolve({
        jsnext: true
    }),
    commonjs(),
    globals(),
    builtins(),
    babel({
      exclude: ['node_modules/**']
    })
  ]
}