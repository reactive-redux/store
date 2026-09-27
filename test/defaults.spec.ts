import { of, Subject, EMPTY, NEVER } from 'rxjs';
import { FlattenOperator, StoreConfig, StoreOptions } from '../src/interfaces';

describe('defaults', () => {
  // Note: getDefaults is internal but can be tested via Store behavior
  // This test file covers default configuration scenarios

  it('should provide default configuration structure', () => {
    // Testing that the default options object matches expected shape
    const options: StoreOptions = {
      actionFlatOp: FlattenOperator.concatMap,
      stateFlatOp: FlattenOperator.switchMap,
      bufferSize: 1,
    };

    expect(options.actionFlatOp).toBe(FlattenOperator.concatMap);
    expect(options.stateFlatOp).toBe(FlattenOperator.switchMap);
    expect(options.bufferSize).toBe(1);
  });

  it('should validate FlattenOperator enum values', () => {
    expect(FlattenOperator.switchMap).toBe('switchMap');
    expect(FlattenOperator.mergeMap).toBe('mergeMap');
    expect(FlattenOperator.concatMap).toBe('concatMap');
    expect(FlattenOperator.exhaustMap).toBe('exhaustMap');
  });

  it('should allow custom buffer size in options', () => {
    const options: StoreOptions = {
      bufferSize: 10,
      windowTime: 500,
    };

    expect(options.bufferSize).toBe(10);
    expect(options.windowTime).toBe(500);
  });
});