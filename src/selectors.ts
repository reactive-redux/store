import { Observable, OperatorFunction } from 'rxjs';
import { pluck, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { Action } from './interfaces';

// ngrx selectors with overloading and memoization

export type Selector<T, V> = (state: T) => V;

export type SelectorWithProps<State, Props, Result> = (
  state: State,
  props: Props
) => Result;

export type AnyFn = (...args: any[]) => any;

export type MemoizedProjection = { memoized: AnyFn; reset: () => void };

export type MemoizeFn = (t: AnyFn) => MemoizedProjection;

export type ComparatorFn = (a: any, b: any) => boolean;

export interface MemoizedSelector<State, Result>
  extends Selector<State, Result> {
  release(): void;
  projector: AnyFn;
}

export interface MemoizedSelectorWithProps<State, Props, Result>
  extends SelectorWithProps<State, Props, Result> {
  release(): void;
  projector: AnyFn;
}

export function isEqualCheck(a: any, b: any): boolean {
  return a === b;
}

function isArgumentsChanged(
  args: IArguments,
  lastArguments: IArguments,
  comparator: ComparatorFn
) {
  for (let i = 0; i < args.length; i++) {
    if (!comparator(args[i], lastArguments[i])) {
      return true;
    }
  }
  return false;
}

export function resultMemoize(
  projectionFn: AnyFn,
  isResultEqual: ComparatorFn
) {
  return defaultMemoize(projectionFn, isEqualCheck, isResultEqual);
}

export function defaultMemoize(
  projectionFn: AnyFn,
  isArgumentsEqual = isEqualCheck,
  isResultEqual = isEqualCheck
): MemoizedProjection {
  let lastArguments: null | IArguments = null;
  // tslint:disable-next-line:no-any anything could be the result.
  let lastResult: any = null;

  function reset() {
    lastArguments = null;
    lastResult = null;
  }

  // tslint:disable-next-line:no-any anything could be the result.
  function memoized(): any {
    if (!lastArguments) {
      lastResult = projectionFn.apply(null, <any>arguments);
      lastArguments = arguments;
      return lastResult;
    }

    if (!isArgumentsChanged(arguments, lastArguments, isArgumentsEqual)) {
      return lastResult;
    }

    lastArguments = arguments;

    const newResult = projectionFn.apply(null, <any>arguments);
    if (isResultEqual(lastResult, newResult)) {
      return lastResult;
    }

    lastResult = newResult;

    return newResult;
  }

  return { memoized, reset };
}

export function createSelector<State, S1, Result>(
  s1: Selector<State, S1>,
  projector: (s1: S1) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, Result>(
  s1: SelectorWithProps<State, Props, S1>,
  projector: (s1: S1, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<State, S1, Result>(
  selectors: [Selector<State, S1>],
  projector: (s1: S1) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, Result>(
  selectors: [SelectorWithProps<State, Props, S1>],
  projector: (s1: S1, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<State, S1, S2, Result>(
  s1: Selector<State, S1>,
  s2: Selector<State, S2>,
  projector: (s1: S1, s2: S2) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, Result>(
  s1: SelectorWithProps<State, Props, S1>,
  s2: SelectorWithProps<State, Props, S2>,
  projector: (s1: S1, s2: S2, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<State, S1, S2, Result>(
  selectors: [Selector<State, S1>, Selector<State, S2>],
  projector: (s1: S1, s2: S2) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, Result>(
  selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>
  ],
  projector: (s1: S1, s2: S2, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<State, S1, S2, S3, Result>(
  s1: Selector<State, S1>,
  s2: Selector<State, S2>,
  s3: Selector<State, S3>,
  projector: (s1: S1, s2: S2, s3: S3) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, S3, Result>(
  s1: SelectorWithProps<State, Props, S1>,
  s2: SelectorWithProps<State, Props, S2>,
  s3: SelectorWithProps<State, Props, S3>,
  projector: (s1: S1, s2: S2, s3: S3, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<State, S1, S2, S3, Result>(
  selectors: [
    Selector<State, S1>,
    Selector<State, S2>,
    Selector<State, S3>
  ],
  projector: (s1: S1, s2: S2, s3: S3) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, S3, Result>(
  selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>
  ],
  projector: (s1: S1, s2: S2, s3: S3, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<State, S1, S2, S3, S4, Result>(
  s1: Selector<State, S1>,
  s2: Selector<State, S2>,
  s3: Selector<State, S3>,
  s4: Selector<State, S4>,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, S3, S4, Result>(
  s1: SelectorWithProps<State, Props, S1>,
  s2: SelectorWithProps<State, Props, S2>,
  s3: SelectorWithProps<State, Props, S3>,
  s4: SelectorWithProps<State, Props, S4>,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<State, S1, S2, S3, S4, Result>(
  selectors: [
    Selector<State, S1>,
    Selector<State, S2>,
    Selector<State, S3>,
    Selector<State, S4>
  ],
  projector: (s1: S1, s2: S2, s3: S3, s4: S4) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, S3, S4, Result>(
  selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>
  ],
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, props: Props) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<State, S1, S2, S3, S4, S5, Result>(
  s1: Selector<State, S1>,
  s2: Selector<State, S2>,
  s3: Selector<State, S3>,
  s4: Selector<State, S4>,
  s5: Selector<State, S5>,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, S3, S4, S5, Result>(
  s1: SelectorWithProps<State, Props, S1>,
  s2: SelectorWithProps<State, Props, S2>,
  s3: SelectorWithProps<State, Props, S3>,
  s4: SelectorWithProps<State, Props, S4>,
  s5: SelectorWithProps<State, Props, S5>,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<State, S1, S2, S3, S4, S5, Result>(
  selectors: [
    Selector<State, S1>,
    Selector<State, S2>,
    Selector<State, S3>,
    Selector<State, S4>,
    Selector<State, S5>
  ],
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => Result
): MemoizedSelector<State, Result>;
export function createSelector<State, Props, S1, S2, S3, S4, S5, Result>(
  selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>
  ],
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<State, S1, S2, S3, S4, S5, S6, Result>(
  s1: Selector<State, S1>,
  s2: Selector<State, S2>,
  s3: Selector<State, S3>,
  s4: Selector<State, S4>,
  s5: Selector<State, S5>,
  s6: Selector<State, S6>,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => Result
): MemoizedSelector<State, Result>;
export function createSelector<
  State,
  Props,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  Result
>(
  s1: SelectorWithProps<State, Props, S1>,
  s2: SelectorWithProps<State, Props, S2>,
  s3: SelectorWithProps<State, Props, S3>,
  s4: SelectorWithProps<State, Props, S4>,
  s5: SelectorWithProps<State, Props, S5>,
  s6: SelectorWithProps<State, Props, S6>,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<State, S1, S2, S3, S4, S5, S6, Result>(
  selectors: [
    Selector<State, S1>,
    Selector<State, S2>,
    Selector<State, S3>,
    Selector<State, S4>,
    Selector<State, S5>,
    Selector<State, S6>
  ],
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => Result
): MemoizedSelector<State, Result>;
export function createSelector<
  State,
  Props,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  Result
>(
  selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>,
    SelectorWithProps<State, Props, S6>
  ],
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<State, S1, S2, S3, S4, S5, S6, S7, Result>(
  s1: Selector<State, S1>,
  s2: Selector<State, S2>,
  s3: Selector<State, S3>,
  s4: Selector<State, S4>,
  s5: Selector<State, S5>,
  s6: Selector<State, S6>,
  s7: Selector<State, S7>,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7
  ) => Result
): MemoizedSelector<State, Result>;
export function createSelector<
  State,
  Props,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  Result
>(
  s1: SelectorWithProps<State, Props, S1>,
  s2: SelectorWithProps<State, Props, S2>,
  s3: SelectorWithProps<State, Props, S3>,
  s4: SelectorWithProps<State, Props, S4>,
  s5: SelectorWithProps<State, Props, S5>,
  s6: SelectorWithProps<State, Props, S6>,
  s7: SelectorWithProps<State, Props, S7>,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<State, S1, S2, S3, S4, S5, S6, S7, Result>(
  selectors: [
    Selector<State, S1>,
    Selector<State, S2>,
    Selector<State, S3>,
    Selector<State, S4>,
    Selector<State, S5>,
    Selector<State, S6>,
    Selector<State, S7>
  ],
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7
  ) => Result
): MemoizedSelector<State, Result>;
export function createSelector<
  State,
  Props,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  Result
>(
  selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>,
    SelectorWithProps<State, Props, S6>,
    SelectorWithProps<State, Props, S7>
  ],
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<
  State,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  Result
>(
  s1: Selector<State, S1>,
  s2: Selector<State, S2>,
  s3: Selector<State, S3>,
  s4: Selector<State, S4>,
  s5: Selector<State, S5>,
  s6: Selector<State, S6>,
  s7: Selector<State, S7>,
  s8: Selector<State, S8>,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    s8: S8
  ) => Result
): MemoizedSelector<State, Result>;
export function createSelector<
  State,
  Props,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  Result
>(
  s1: SelectorWithProps<State, Props, S1>,
  s2: SelectorWithProps<State, Props, S2>,
  s3: SelectorWithProps<State, Props, S3>,
  s4: SelectorWithProps<State, Props, S4>,
  s5: SelectorWithProps<State, Props, S5>,
  s6: SelectorWithProps<State, Props, S6>,
  s7: SelectorWithProps<State, Props, S7>,
  s8: SelectorWithProps<State, Props, S8>,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    s8: S8,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;
export function createSelector<
  State,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  Result
>(
  selectors: [
    Selector<State, S1>,
    Selector<State, S2>,
    Selector<State, S3>,
    Selector<State, S4>,
    Selector<State, S5>,
    Selector<State, S6>,
    Selector<State, S7>,
    Selector<State, S8>
  ],
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    s8: S8
  ) => Result
): MemoizedSelector<State, Result>;
export function createSelector<
  State,
  Props,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  Result
>(
  selectors: [
    SelectorWithProps<State, Props, S1>,
    SelectorWithProps<State, Props, S2>,
    SelectorWithProps<State, Props, S3>,
    SelectorWithProps<State, Props, S4>,
    SelectorWithProps<State, Props, S5>,
    SelectorWithProps<State, Props, S6>,
    SelectorWithProps<State, Props, S7>,
    SelectorWithProps<State, Props, S8>
  ],
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    s8: S8,
    props: Props
  ) => Result
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector<State, Props, Result>(
  projector: SelectorWithProps<State, Props, Result>
): MemoizedSelectorWithProps<State, Props, Result>;

export function createSelector(
  ...input: any[]
): Selector<any, any> | SelectorWithProps<any, any, any> {
  return createSelectorFactory(defaultMemoize)(...input);
}

export function defaultStateFn(
  state: any,
  selectors: Selector<any, any>[] | SelectorWithProps<any, any, any>[],
  props: any,
  memoizedProjector: MemoizedProjection
): any {
  if (props === undefined) {
    const args = (<Selector<any, any>[]>selectors).map(fn => fn(state));
    return memoizedProjector.memoized.apply(null, args);
  }

  const args = (<SelectorWithProps<any, any, any>[]>selectors).map(fn =>
    fn(state, props)
  );
  return memoizedProjector.memoized.apply(null, [...args, props]);
}

export type SelectorFactoryConfig<T = any, V = any> = {
  stateFn: (
    state: T,
    props: any,
    selectors: Selector<any, any>[],
    memoizedProjector: MemoizedProjection
  ) => V;
};

export function createSelectorFactory<T = any, V = any>(
  memoize: MemoizeFn
): (...input: any[]) => Selector<T, V>;
export function createSelectorFactory<T = any, V = any>(
  memoize: MemoizeFn,
  options: SelectorFactoryConfig<T, V>
): (...input: any[]) => Selector<T, V>;
export function createSelectorFactory<T = any, Props = any, V = any>(
  memoize: MemoizeFn
): (...input: any[]) => SelectorWithProps<T, Props, V>;
export function createSelectorFactory<T = any, Props = any, V = any>(
  memoize: MemoizeFn,
  options: SelectorFactoryConfig<T, V>
): (...input: any[]) => SelectorWithProps<T, Props, V>;
export function createSelectorFactory(
  memoize: MemoizeFn,
  options: SelectorFactoryConfig<any, any> = {
    stateFn: defaultStateFn
  }
) {
  return function(
    ...input: any[]
  ): Selector<any, any> | SelectorWithProps<any, any, any> {
    let args = input;
    if (Array.isArray(args[0])) {
      const [head, ...tail] = args;
      args = [...head, ...tail];
    }

    const selectors = args.slice(0, args.length - 1);
    const projector = args[args.length - 1];
    const memoizedSelectors = selectors.filter(
      (selector: any) =>
        selector.release && typeof selector.release === 'function'
    );

    const memoizedProjector = memoize(function(...selectors: any[]) {
      return projector.apply(null, selectors);
    });

    const memoizedState = defaultMemoize(function(state: any, props: any) {
      // createSelector works directly on state
      // e.g. createSelector((state, props) => ...)
      if (selectors.length === 0 && props !== undefined) {
        return projector.apply(null, [state, props]);
      }

      return options.stateFn.apply(null, [
        state,
        selectors,
        props,
        memoizedProjector
      ]);
    });

    function release() {
      memoizedState.reset();
      memoizedProjector.reset();

      memoizedSelectors.forEach(selector => selector.release());
    }

    return Object.assign(memoizedState.memoized, {
      release,
      projector: memoizedProjector.memoized
    });
  };
}

export function select<T, Props, K>(
  mapFn: (state: T, props: Props) => K,
  props?: Props
): (source$: Observable<T>) => Observable<K>;
export function select<T, a extends keyof T>(
  key: a,
  props: null
): (source$: Observable<T>) => Observable<T[a]>;
export function select<T, a extends keyof T, b extends keyof T[a]>(
  key1: a,
  key2: b
): (source$: Observable<T>) => Observable<T[a][b]>;
export function select<
  T,
  a extends keyof T,
  b extends keyof T[a],
  c extends keyof T[a][b]
>(
  key1: a,
  key2: b,
  key3: c
): (source$: Observable<T>) => Observable<T[a][b][c]>;
export function select<
  T,
  a extends keyof T,
  b extends keyof T[a],
  c extends keyof T[a][b],
  d extends keyof T[a][b][c]
>(
  key1: a,
  key2: b,
  key3: c,
  key4: d
): (source$: Observable<T>) => Observable<T[a][b][c][d]>;
export function select<
  T,
  a extends keyof T,
  b extends keyof T[a],
  c extends keyof T[a][b],
  d extends keyof T[a][b][c],
  e extends keyof T[a][b][c][d]
>(
  key1: a,
  key2: b,
  key3: c,
  key4: d,
  key5: e
): (source$: Observable<T>) => Observable<T[a][b][c][d][e]>;
export function select<
  T,
  a extends keyof T,
  b extends keyof T[a],
  c extends keyof T[a][b],
  d extends keyof T[a][b][c],
  e extends keyof T[a][b][c][d],
  f extends keyof T[a][b][c][d][e]
>(
  key1: a,
  key2: b,
  key3: c,
  key4: d,
  key5: e,
  key6: f
): (source$: Observable<T>) => Observable<T[a][b][c][d][e][f]>;

export function select<T, Props = any, K = any>(
  propsOrPath: Props,
  ...paths: string[]
): (source$: Observable<T>) => Observable<K>;
export function select<T, Props, K>(
  pathOrMapFn: ((state: T, props?: Props) => any) | string,
  propsOrPath: Props | string,
  ...paths: string[]
) {
  return function selectOperator(source$: Observable<T>): Observable<K> {
    let mapped$: Observable<any>;

    if (typeof pathOrMapFn === 'string') {
      const pathSlices = [<string>propsOrPath, ...paths].filter(Boolean);
      mapped$ = source$.pipe(pluck(pathOrMapFn, ...pathSlices));
    } else if (typeof pathOrMapFn === 'function') {
      mapped$ = source$.pipe(
        map(source => pathOrMapFn(source, <Props>propsOrPath))
      );
    } else {
      throw new TypeError(
        `Unexpected type '${typeof pathOrMapFn}' in select operator,` +
          ` expected 'string' or 'function'`
      );
    }

    return mapped$.pipe(distinctUntilChanged());
  };
}

export function ofType<T extends Action>(
  ...allowedTypes: string[]
): OperatorFunction<Action, T> {
  return filter(
    (action: Action): action is T =>
      allowedTypes.some(type => type === action.type)
  );
}
