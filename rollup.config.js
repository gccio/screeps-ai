import clear from 'rollup-plugin-clear'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import html from 'rollup-plugin-html'
import screeps from 'rollup-plugin-screeps'

const config = require("./.secret.json")
export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    // 清除上次编译成果
    clear({ targets: ["dist"] }),
    // 编译 ts
    typescript({
      tsconfig: "./tsconfig.json",
      rollupCommonJSResolveHack: true,
    }),
    // 打包依赖
    resolve(),
    // 模块化依赖
    commonjs(),
    // 构建可能存在的 html 文件
    html({
			include: '**/*.html',
      htmlMinifierOptions: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        minifyCSS: true,
        removeComments: true
      }
		}),
    screeps({ config, dryRun: !config }),
  ]
};
