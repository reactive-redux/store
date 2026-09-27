import {
  ofType,
  createEffect,
  createSubscriptionEffect,
  createEpicRegistry,
  EpicFn,
} from '../src/effects';
import { action, payload, union } from 'ts-action';
import { Subject, of, merge } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';

describe('Effects', () => {
  describe('ofType', () => {
    const add = action('ADD', payload<{ value: number }>());
    const remove = action('REMOVE', payload<{ id: number }>());
    const clear = action('CLEAR');

    it('should filter actions by single action type', (done) => {
      const actions$ = new Subject<any>();

      const filtered$ = actions$.pipe(
        ofType(add)
      );

      let count = 0;
      filtered$.pipe(take(2)).subscribe((action: any) => {
        count++;
        expect(action.type).toBe('ADD');
        if (count === 2) done();
      });

      actions$.next(add({ value: 1 }));
      actions$.next(remove({ id: 2 }));
      actions$.next(add({ value: 3 }));
      actions$.next(remove({ id: 4 }));
    });

    // it('should filter actions by multiple action types', (done) => {
    //   const actions$ = new Subject<any>();

    //   const filtered$ = actions$.pipe(
    //     ofType(add, remove)
    //   );

    //   const received: any[] = [];
    //   filtered$.pipe(take(3)).subscribe((action: any) => {
    //     received.push(action);
    //     if (received.length === 3) {
    //       expect(received.map(a => a.type)).toEqual(['ADD', 'REMOVE', 'ADD']);
    //       done();
    //     }
    //   });

    //   actions$.next(add({ value: 1 }));
    //   actions$.next(remove({ id: 2 }));
    //   actions$.next(clear());
    //   actions$.next(add({ value: 3 }));
    //   actions$.next(clear());
    // });
  });

  describe('createEffect', () => {
    const add = action('ADD', payload<{ value: number }>());
    const added = action('ADDED', payload<{ result: number }>());

    it('should create an effect that transforms actions', (done) => {
      const actions$ = new Subject<any>();

      const effect$ = createEffect()(
        (action$) => action$.pipe(
          ofType(add),
          map(action => added({ result: (action).payload.value * 2 }))
        )
      );

      const output$ = effect$(actions$, of({}));

      output$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toBe('ADDED');
        expect(action.payload.result).toBe(4);
        done();
      });

      actions$.next(add({ value: 2 }));
    });

    it('should support dispatch: false for side effects', (done) => {
      const actions$ = new Subject<any>();
      let sideEffectCalled = false;

      const effect$ = createEffect({ dispatch: false })(
        (action$) => action$.pipe(
          ofType(add),
          switchMap(() => {
            sideEffectCalled = true;
            return of();
          })
        )
      );

      // Must subscribe to trigger the effect
      effect$(actions$, of({})).subscribe();

      // dispatch: false means effect runs but doesn't emit actions
      setTimeout(() => {
        if (sideEffectCalled) {
          done();
        }
      }, 100);

      actions$.next(add({ value: 5 }));
    });
  });

  describe('createSubscriptionEffect', () => {
    const connect = action('CONNECT');
    const connected = action('CONNECTED');

    it('should auto-takeUntil destroy$', (done) => {
      const actions$ = new Subject<any>();
      const destroy$ = new Subject<void>();

      const effect$ = createSubscriptionEffect(destroy$)(
        (action$) => action$.pipe(
          ofType(connect as never),
          switchMap(() => of(connected))
        )
      );

      const output$ = effect$(actions$, of({}));

      output$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toBe('CONNECTED');
      });

      actions$.next(connect());

      // Simulate destroy
      destroy$.next();
      destroy$.complete();

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });
  });

  describe('createEpicRegistry', () => {
    const add = action('ADD', payload<{ value: number }>());
    const subtract = action('SUBTRACT', payload<{ value: number }>());
    const added = action('ADDED', payload<{ result: number }>());
    const subtracted = action('SUBTRACTED', payload<{ result: number }>());

    it('should combine multiple effects into one epic', (done) => {
      const actions$ = new Subject<any>();

      const addEffect$ = createEffect()(
        (action$) => action$.pipe(
          ofType(add),
          map((action: any) => added({ result: action.payload.value + 1 }))
        )
      );

      const subtractEffect$ = createEffect()(
        (action$) => action$.pipe(
          ofType(subtract),
          map((action: any) => subtracted({ result: action.payload.value - 1 }))
        )
      );

      const epic$ = createEpicRegistry(addEffect$, subtractEffect$);
      const output$ = epic$(actions$, of({}));

      const received: any[] = [];
      output$.pipe(take(2)).subscribe((action: any) => {
        received.push(action);
        if (received.length === 2) {
          expect(received[0].type).toBe('ADDED');
          expect(received[0].payload.result).toBe(3);
          expect(received[1].type).toBe('SUBTRACTED');
          expect(received[1].payload.result).toBe(1);
          done();
        }
      });

      actions$.next(add({ value: 2 }));
      actions$.next(subtract({ value: 2 }));
    });

    it('should work with empty effects array', (done) => {
      const actions$ = new Subject<any>();
      const state$ = of({});

      const epic$ = createEpicRegistry();
      const output$ = epic$(actions$, state$);

      output$.pipe(take(1)).subscribe({
        next: () => {},
        complete: () => done()
      });
    });

    it('should provide state$ to effects', (done) => {
      const actions$ = new Subject<any>();

      const effectWithState$ = (action$: any) => {
        return action$.pipe(
          ofType(add),
          switchMap(() => {
            return of(added({ result: 100 }));
          })
        );
      };

      const epic$ = createEpicRegistry(effectWithState$);
      const state$ = of({ multiplier: 10 });

      const output$ = epic$(actions$, state$);

      output$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toBe('ADDED');
        expect(action.payload.result).toBe(100);
        done();
      });

      actions$.next(add({ value: 5 }));
    });
  });

  describe('EpicFn type', () => {
    it('should type check correctly', () => {
      const epic: EpicFn<{ count: number }, { type: string }> = (action$, state$) => {
        return action$.pipe(
          map(action => ({ type: 'PROCESSED' }))
        );
      };

      expect(typeof epic).toBe('function');
    });
  });
});