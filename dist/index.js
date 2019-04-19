(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/operators'), require('rxjs')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rxjs/operators', 'rxjs'], factory) :
  (global = global || self, factory(global['@reactive-redux/store'] = {}, global.operators, global.rxjs));
}(this, function (exports, operators, rxjs) { 'use strict';

  (function (FlattenOperator) {
      FlattenOperator["switchMap"] = "switchMap";
      FlattenOperator["mergeMap"] = "mergeMap";
      FlattenOperator["concatMap"] = "concatMap";
      FlattenOperator["exhaustMap"] = "exhaustMap";
  })(exports.FlattenOperator || (exports.FlattenOperator = {}));

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }

  function __spread() {
      for (var ar = [], i = 0; i < arguments.length; i++)
          ar = ar.concat(__read(arguments[i]));
      return ar;
  }

  function isEqualCheck(a, b) {
      return a === b;
  }
  function isArgumentsChanged(args, lastArguments, comparator) {
      for (var i = 0; i < args.length; i++) {
          if (!comparator(args[i], lastArguments[i])) {
              return true;
          }
      }
      return false;
  }
  function defaultMemoize(projectionFn, isArgumentsEqual, isResultEqual) {
      if (isArgumentsEqual === void 0) { isArgumentsEqual = isEqualCheck; }
      if (isResultEqual === void 0) { isResultEqual = isEqualCheck; }
      var lastArguments = null;
      // tslint:disable-next-line:no-any anything could be the result.
      var lastResult = null;
      function reset() {
          lastArguments = null;
          lastResult = null;
      }
      // tslint:disable-next-line:no-any anything could be the result.
      function memoized() {
          if (!lastArguments) {
              lastResult = projectionFn.apply(null, arguments);
              lastArguments = arguments;
              return lastResult;
          }
          if (!isArgumentsChanged(arguments, lastArguments, isArgumentsEqual)) {
              return lastResult;
          }
          lastArguments = arguments;
          var newResult = projectionFn.apply(null, arguments);
          if (isResultEqual(lastResult, newResult)) {
              return lastResult;
          }
          lastResult = newResult;
          return newResult;
      }
      return { memoized: memoized, reset: reset };
  }
  function createSelector() {
      var input = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          input[_i] = arguments[_i];
      }
      return createSelectorFactory(defaultMemoize).apply(void 0, __spread(input));
  }
  function defaultStateFn(state, selectors, props, memoizedProjector) {
      if (props === undefined) {
          var args_1 = selectors.map(function (fn) { return fn(state); });
          return memoizedProjector.memoized.apply(null, args_1);
      }
      var args = selectors.map(function (fn) {
          return fn(state, props);
      });
      return memoizedProjector.memoized.apply(null, __spread(args, [props]));
  }
  function createSelectorFactory(memoize, options) {
      if (options === void 0) { options = {
          stateFn: defaultStateFn
      }; }
      return function () {
          var input = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              input[_i] = arguments[_i];
          }
          var args = input;
          if (Array.isArray(args[0])) {
              var _a = __read(args), head = _a[0], tail = _a.slice(1);
              args = __spread(head, tail);
          }
          var selectors = args.slice(0, args.length - 1);
          var projector = args[args.length - 1];
          var memoizedSelectors = selectors.filter(function (selector) { return selector.release && typeof selector.release === 'function'; });
          var memoizedProjector = memoize(function () {
              var selectors = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  selectors[_i] = arguments[_i];
              }
              return projector.apply(null, selectors);
          });
          var memoizedState = defaultMemoize(function (state, props) {
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
              memoizedSelectors.forEach(function (selector) { return selector.release(); });
          }
          return Object.assign(memoizedState.memoized, {
              release: release,
              projector: memoizedProjector.memoized
          });
      };
  }
  function select(pathOrMapFn, propsOrPath) {
      var paths = [];
      for (var _i = 2; _i < arguments.length; _i++) {
          paths[_i - 2] = arguments[_i];
      }
      return function selectOperator(source$) {
          var mapped$;
          if (typeof pathOrMapFn === 'string') {
              var pathSlices = __spread([propsOrPath], paths).filter(Boolean);
              mapped$ = source$.pipe(operators.pluck.apply(void 0, __spread([pathOrMapFn], pathSlices)));
          }
          else if (typeof pathOrMapFn === 'function') {
              mapped$ = source$.pipe(operators.map(function (source) { return pathOrMapFn(source, propsOrPath); }));
          }
          else {
              throw new TypeError("Unexpected type '" + typeof pathOrMapFn + "' in select operator," +
                  " expected 'string' or 'function'");
          }
          return mapped$.pipe(operators.distinctUntilChanged());
      };
  }

  var isObject = function (value) { return value !== null && typeof value === 'object'; };
  var hasType = function (action) { return typeof action.type === 'string'; };
  var isValidAction = function (action, map) {
      return hasType(action) &&
          map.hasOwnProperty(action.type) &&
          typeof map[action.type] === 'function';
  };
  var _pipe = function (fns) {
      return fns.reduce(function (f, g) { return function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return f(g.apply(void 0, __spread(args)));
      }; });
  };
  var catchErr = rxjs.pipe(operators.catchError(function (e) { return rxjs.of(e); }));
  var flattenObservable = function (o) { return o.pipe(catchErr); };
  var mapToObservable = function (value) {
      if (rxjs.isObservable(value))
          return value;
      if (value instanceof Promise)
          return rxjs.from(value);
      return rxjs.of(value);
  };
  function ofType() {
      var allowedTypes = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          allowedTypes[_i] = arguments[_i];
      }
      return operators.filter(function (action) { return allowedTypes.some(function (type) { return type === action.type; }); });
  }
  var createActions = function (actions) {
      return actions.reduce(function (acc, curr) {
          var _a, _b;
          if (typeof curr !== 'function')
              return acc;
          return {
              actions: __assign({}, acc.actions, (_a = {}, _a[curr.name + "Action"] = function (payload) { return ({ type: curr.name, payload: payload }); }, _a)),
              actionMap$: __assign({}, acc.actionMap$, (_b = {}, _b[curr.name] = curr, _b))
          };
      }, { actionMap$: {}, actions: {} });
  };

  function reducerFactory$(_a) {
      var _b = __read(_a, 3), actionMap = _b[0], transducers = _b[1], initialState = _b[2];
      function reducer(state, action) {
          if (!isValidAction(action, actionMap))
              return state;
          var actionReducer = actionMap[action.type];
          return transducers.length > 0
              ? _pipe(transducers)(actionReducer)(state, action)
              : actionReducer(state, action);
      }
      return operators.scan(reducer, initialState);
  }

  var fop = {
      switchMap: operators.switchMap,
      mergeMap: operators.mergeMap,
      concatMap: operators.concatMap,
      exhaustMap: operators.exhaustMap
  };
  function getDefaults(config, options) {
      if (config === void 0) { config = {}; }
      if (options === void 0) { options = {}; }
      var createdActions = (config &&
          config.reducers$ &&
          config.reducers$.pipe(operators.filter(function (r) { return isObject(r) || Array.isArray(r); }), operators.map(function (r) { return (Array.isArray(r) ? createActions(r) : r); }), catchErr, operators.share())) ||
          rxjs.of({});
      var actionMap$ = createdActions.pipe(operators.filter(function (a) { return a.actionMap$; }), operators.map(function (a) { return a.actionMap$; }));
      var actionFactory$ = createdActions.pipe(operators.filter(function (a) { return a.actions; }), operators.map(function (a) { return a.actions; }));
      var actionStream$ = (config && config.actionStream$ && config.actionStream$.pipe(catchErr)) || rxjs.EMPTY;
      var initialState$ = (config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
          rxjs.of({});
      var transducers$ = (config &&
          config.transducers$ &&
          config.transducers$.pipe(catchErr)) ||
          rxjs.of([]);
      var destroy$ = (config && config.destroy$ && config.destroy$.pipe(catchErr)) || rxjs.NEVER;
      var actionFlatten = fop[(options && options.actionFop) || exports.FlattenOperator.concatMap];
      var stateFlatten = fop[(options && options.stateFop) || exports.FlattenOperator.switchMap];
      var flattenState$ = function (source) {
          return source.pipe(stateFlatten(flattenObservable), operators.map(mapToObservable), stateFlatten(flattenObservable));
      };
      var bufferSize = (options && options.bufferSize) || 1;
      var windowTime = options && options.windowTime;
      var shareReplayConfig = {
          refCount: false,
          bufferSize: bufferSize,
          windowTime: windowTime
      };
      return {
          actionMap$: actionMap$,
          actionStream$: actionStream$,
          actionFactory$: actionFactory$,
          initialState$: initialState$,
          transducers$: transducers$,
          destroy$: destroy$,
          actionFlatten: actionFlatten,
          flattenState$: flattenState$,
          shareReplayConfig: shareReplayConfig
      };
  }

  /**
   * Reactive state container based on RxJS (https://rxjs.dev/)
   *
   * @class AsyncStore<State, ActionsUnion>
   *
   * @type State - application state interface
   * @type ActionsUnion - type union of all the actions
   */
  var Store = /** @class */ (function () {
      /**
       * Default configuration
       *
       * @param {Object} config
       *  {
       *     reducers$: of([]),
       *     actionStream$: EMPTY, // if not defined, no actions will be dispatched in the store
       *     initialState$: of({}),
       *     transducers$: of({}),
       *     destroy$: NEVER // if not defined, the state subscription will live forever
       *  }
       *
       * @param {Object} options
       *  {
       *     actionFop: FlattenOps.concatMap, // actions are executed in order of propagation
       *     stateFop: FlattenOps.switchMap // will update to the latest received state, without waiting for previous async operations to finish
       *     windowTime: undefined
       *     bufferSize: 1
       *  }
       */
      function Store(config, options) {
          var _this = this;
          this.config = config;
          this.options = options;
          this._actions$ = new rxjs.Subject();
          var _a = getDefaults(this.config, this.options), actionMap$ = _a.actionMap$, actionStream$ = _a.actionStream$, actionFactory$ = _a.actionFactory$, transducers$ = _a.transducers$, actionFlatten = _a.actionFlatten, initialState$ = _a.initialState$, flattenState$ = _a.flattenState$, destroy$ = _a.destroy$, shareReplayConfig = _a.shareReplayConfig;
          this.state$ = rxjs.combineLatest(actionMap$, transducers$, initialState$).pipe(operators.map(reducerFactory$), operators.concatMap(function (reducer$) {
              return actionStream$.pipe(operators.filter(isObject), operators.map(mapToObservable), actionFlatten(flattenObservable), operators.tap(_this._actions$), reducer$, operators.map(mapToObservable));
          }), operators.startWith(initialState$), flattenState$, operators.takeUntil(destroy$), operators.shareReplay(shareReplayConfig));
          this.state$.subscribe();
          this.actionFactory$ = actionFactory$;
          this.actions$ = this._actions$.asObservable();
      }
      return Store;
  }());
  function createStore(config, opts) {
      if (config === void 0) { config = {}; }
      if (opts === void 0) { opts = {}; }
      return new Store(config, opts);
  }

  /**
   *
   * @param mapFn - a function to map a state with
   * @returns {TransducerFn} TransducerFn<State>
   *
   * PS - previous state
   * NS - next state
   */
  var mapPS = function (mapFn) { return function (reducer) { return function (state, action) { return reducer(mapFn(state), action); }; }; };
  var mapNS = function (mapFn) { return function (reducer) { return function (state, action) { return mapFn(reducer(state, action)); }; }; };
  /**
   *
   * @param mapFn - a function to map an action with
   * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
   */
  var mapA = function (mapFn) { return function (reducer) { return function (state, action) { return reducer(state, mapFn(action)); }; }; };
  /**
   *
   * @param filterFn - a function to filter a state with
   * @returns {TransducerFn} TransducerFn<State>
   *
   * PS - previous state
   * NS - next state
   */
  var filterPS = function (filterFn) { return function (reducer) { return function (state, action) {
      return filterFn(state) ? reducer(state, action) : state;
  }; }; };
  var filterNS = function (filterFn) { return function (reducer) { return function (state, action) {
      var nextState = reducer(state, action);
      return filterFn(nextState) ? nextState : state;
  }; }; };
  /**
   *
   * @param filterFn - a function to filter an action with
   * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
   */
  var filterA = function (filterFn) { return function (reducer) { return function (state, action) {
      return filterFn(action) ? reducer(state, action) : state;
  }; }; };
  /**
   * Reduce into state
   * @param reduceFn - a function to reduce the state and action together
   * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
   *
   * PS - previous state
   * NS - next state
   */
  var reducePS = function (reducerFn) { return function (reducer) { return function (state, action) {
      return reducer(reducerFn(state, action), action);
  }; }; };
  var reduceNS = function (reducerFn) { return function (reducer) { return function (state, action) {
      return reducerFn(reducer(state, action), action);
  }; }; };
  /**
   *
   * Reduce into action
   * @param reduceFn - a function to reduce the state and action together
   * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
   */
  var reduceA = function (reducerFn) { return function (reducer) { return function (state, action) {
      return reducer(state, reducerFn(state, action));
  }; }; };

  var Action = /** @class */ (function () {
      function Action(payload) {
          this.payload = payload;
      }
      Object.defineProperty(Action.prototype, "type", {
          get: function () {
              return this.constructor.name.toLowerCase();
          },
          enumerable: true,
          configurable: true
      });
      return Action;
  }());

  exports.createSelector = createSelector;
  exports.select = select;
  exports.Store = Store;
  exports.createStore = createStore;
  exports.mapToObservable = mapToObservable;
  exports.ofType = ofType;
  exports.catchErr = catchErr;
  exports.createActions = createActions;
  exports.Action = Action;
  exports.mapPS = mapPS;
  exports.mapNS = mapNS;
  exports.mapA = mapA;
  exports.filterPS = filterPS;
  exports.filterNS = filterNS;
  exports.filterA = filterA;
  exports.reducePS = reducePS;
  exports.reduceNS = reduceNS;
  exports.reduceA = reduceA;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
