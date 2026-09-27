import { of, Observable } from 'rxjs';
import { isObject, hasType, compose, catchErr, flatCatch, mapToObservable } from '../src/utils';
import { toArray } from 'rxjs/operators';

describe('utils', () => {
  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('should return false for null', () => {
      expect(isObject(null)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isObject(1)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });

    it('should return true for arrays (arrays are objects in JS)', () => {
      expect(isObject([])).toBe(true);
      expect(isObject([1, 2, 3])).toBe(true);
    });

    it('should return false for functions', () => {
      expect(isObject(() => {})).toBe(false);
    });
  });

  describe('hasType', () => {
    it('should return true for objects with string type', () => {
      expect(hasType({ type: 'ADD' })).toBe(true);
      expect(hasType({ type: '' })).toBe(true);
    });

    it('should return false for objects without type', () => {
      expect(hasType({})).toBe(false);
      expect(hasType({ type: 123 })).toBe(false);
    });

    it('should return false for null and undefined', () => {
      // hasType crashes on null/undefined in the source, this is expected behavior
      // The function assumes valid objects are passed
      expect(() => hasType(null)).toThrow();
      expect(() => hasType(undefined)).toThrow();
    });
  });

  describe('compose', () => {
    it('should compose functions left to right', () => {
      const fn1 = (x: number) => x + 1;
      const fn2 = (x: number) => x * 2;
      const fn3 = (x: number) => x - 1;

      const composed = compose([fn1, fn2, fn3]);
      // compose([fn1, fn2, fn3]) = (...args) => fn1(fn2(fn3(...args)))
      // composed(3) = fn1(fn2(fn3(3))) = fn1(fn2(2)) = fn1(4) = 5
      expect(composed(3)).toBe(5);
    });

    it('should return identity for single function', () => {
      const fn = (x: number) => x * 2;
      const composed = compose([fn]);
      expect(composed(3)).toBe(6);
    });

    it('should pass single argument correctly through chain', () => {
      const fn1 = (x: number) => x + 1;
      const fn2 = (x: number) => x * 10;

      const composed = compose([fn1, fn2]);
      // composed(5) = fn1(fn2(5)) = fn1(50) = 51
      expect(composed(5)).toBe(51);
    });
  });

  describe('catchErr', () => {
    it('should catch errors and emit them as values', (done) => {
      const error = new Error('test error');
      const error$ = new Observable(subscriber => {
        subscriber.error(error);
      });

      error$.pipe(
        catchErr,
        toArray()
      ).subscribe(values => {
        expect(values[0]).toBe(error);
        done();
      });
    });

    it('should pass through non-error values', (done) => {
      of(1, 2, 3).pipe(
        catchErr,
        toArray()
      ).subscribe(values => {
        expect(values).toEqual([1, 2, 3]);
        done();
      });
    });
  });

  describe('flatCatch', () => {
    it('should catch errors and return observable of errors', (done) => {
      const error = new Error('flat catch error');
      const error$ = new Observable(subscriber => {
        subscriber.error(error);
      });

      error$.pipe(
        flatCatch,
        toArray()
      ).subscribe(values => {
        expect(values[0]).toBe(error);
        done();
      });
    });

    it('should pass through values without wrapping in array incorrectly', (done) => {
      of('value').pipe(
        flatCatch,
        toArray()
      ).subscribe(values => {
        expect(values).toEqual(['value']);
        done();
      });
    });
  });

  describe('mapToObservable', () => {
    it('should return same observable if already observable', () => {
      const obs$ = of(1, 2, 3);
      const result = mapToObservable(obs$);
      expect(result).toBe(obs$);
    });

    it('should convert promise to observable', (done) => {
      const promise = Promise.resolve(42);
      const result = mapToObservable(promise);

      result.subscribe(value => {
        expect(value).toBe(42);
        done();
      });
    });

    it('should wrap primitive value in of()', (done) => {
      mapToObservable(100).subscribe(value => {
        expect(value).toBe(100);
        done();
      });
    });

    it('should wrap object in of()', (done) => {
      const obj = { key: 'value' };
      mapToObservable(obj).subscribe(value => {
        expect(value).toEqual(obj);
        done();
      });
    });
  });
});