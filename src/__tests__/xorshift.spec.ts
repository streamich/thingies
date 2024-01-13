import {xorShift32} from '../xorshift';

test('generates random integers', () => {
  const numbers: number[] = [];
  for (let i = 0; i < 100; i++) {
    const num = xorShift32();
    numbers.push(num);
    expect(Math.floor(num)).toBe(num);
  }
  const set = new Set(numbers);
  expect(set.size).toBe(100);
});
