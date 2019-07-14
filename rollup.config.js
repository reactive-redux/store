import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: `./dist/index.es.js`,
      format: 'es'
    },
    {
      file: `./dist/index.min.js`,
      format: 'cjs'
    }
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfig: 'tsconfig.build.json'
    }),
    terser({
      include: [/^.+\.min\.js$/],
      output: {
        comments: 'all'
      }
    })
  ],
  external: ['rxjs', 'ts-action']
};
