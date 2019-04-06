import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      name: '@reactive-redux/store',
      format: 'umd'
    },
    {
      file: `${pkg.main}.es.js`,
      format: 'es'
    }
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfig: 'tsconfig.build.json'
    })
  ]
};
