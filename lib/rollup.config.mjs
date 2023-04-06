import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import image from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';

const ts = typescript({
  useTsconfigDeclarationDir: true,
  sourceMap: true,
});

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/es/index.js',
        format: 'es',
      },
      {
        file: './dist/index.js',
        format: 'umd',
        name: 'firjs',
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