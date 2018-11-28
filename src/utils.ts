export const compose = <T>(fns: any[]): T =>
  fns.reduce((f, g) => (...args: any[]) => f(g(...args)));
