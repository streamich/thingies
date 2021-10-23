import {hash} from '../hash';

test('positive numbers', () => {
  for (let i = 0; i < 100; i++) {
    const res = hash('asdf-' + i);
    expect(typeof res).toBe('number');
    expect(res > 0).toBe(true);
  }
});

test('hashes same values to same number', () => {
  for (let i = 0; i < 100; i++) {
    expect(hash('asdf-' + i)).toBe(hash('asdf-' + i));
  }
});

test('returns different hashes', () => {
  const map: Record<number, 1> = {};
  for (let i = 0; i < 100; i++) {
    const res = hash('asdf-' + i);
    expect(map[res]).toBe(undefined);
    map[res] = 1;
  }
});
