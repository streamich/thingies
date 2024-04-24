import {hasKeys} from '../hasKeys';

describe('hasKeys', () => {
  it('should return true if object has keys', () => {
    expect(hasKeys({a: 1})).toBe(true);
  });

  it('should return false if object has no keys', () => {
    expect(hasKeys({})).toBe(false);
  });
});
