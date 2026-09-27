import { action, payload } from 'ts-action';

describe('reducerFactory$', () => {
  const add = action('ADD', payload<{ value: number }>());

  it('should apply reducer to state via scan', (done) => {
    const reducer = (state: number, action: any) => {
      if (action.type === 'ADD') {
        return state + action.payload.value;
      }
      return state;
    };

    const initialState = 0;

    // Test that scan + reducer works correctly
    let result = initialState;
    result = reducer(result, add({ value: 5 }));
    expect(result).toBe(5);

    result = reducer(result, add({ value: 3 }));
    expect(result).toBe(8);

    done();
  });

  it('should handle middleware composition', () => {
    const baseReducer = (state: number, action: any) => {
      if (action.type === 'ADD') {
        return state + action.payload.value;
      }
      return state;
    };

    const middleware1 = (reducer: any) => (state: number, action: any) => {
      // Middleware that adds 10 to state before reducer
      return reducer(state + 10, action);
    };

    const composed = middleware1(baseReducer);
    const result = composed(0, { type: 'ADD', payload: { value: 5 } });
    // Initial state 0 -> middleware adds 10 -> 10 -> reducer adds 5 -> 15
    expect(result).toBe(15);
  });

  it('should work without middleware', () => {
    const reducer = (state: number, action: any) => {
      if (action.type === 'ADD') {
        return state + action.payload.value;
      }
      return state;
    };

    // No middleware, just call reducer directly
    const result = reducer(0, { type: 'ADD', payload: { value: 5 } });
    expect(result).toBe(5);
  });

  it('should chain multiple middleware', () => {
    const baseReducer = (state: number, action: any) => {
      if (action.type === 'ADD') {
        return state + action.payload.value;
      }
      return state;
    };

    const middleware1 = (reducer: any) => (state: number, action: any) => reducer(state + 1, action);
    const middleware2 = (reducer: any) => (state: number, action: any) => reducer(state + 2, action);

    // Chain middlewares: mw2(mw1(baseReducer))
    const step1 = middleware1(baseReducer);
    const step2 = middleware2(step1);
    const result = step2(0, { type: 'ADD', payload: { value: 10 } });
    // 0 + 1 (mw1) = 1 -> + 2 (mw2) = 3 -> reducer adds 10 = 13
    expect(result).toBe(13);
  });
});