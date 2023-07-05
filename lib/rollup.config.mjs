import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import image from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';

const isProduction = process.env.prod === '1';

const ts = typescript({
  useTsconfigDeclarationDir: true,
  sourceMap: false,
});

console.info('PRODUCTION', isProduction);

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/es/index.js',
        format: 'es',
        sourcemap: !isProduction,
      },
      {
        file: './dist/index.js',
        format: 'umd',
        name: 'firjs',
        sourcemap: !isProduction,
      }
    ],
    cache: false,
    plugins: [ts, image(), copy({
      targets: [
        { src: "./../README.md", dest: "./dist/" },
        { src: "./../LICENSE", dest: "./dist/" },
        { src: "./package.json", dest: "./dist/" },
        { src: "./styles", dest: "./dist/" }
      ]
    })],
  },
  {
    input: './build/index.d.ts',
    output: [
      {
        file: './dist/index.d.ts',
        format: 'es'
      }
    ],
    cache: false,
    plugins: [dts()],
  },
]