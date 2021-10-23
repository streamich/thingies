import normalizeEmail from '../normalizeEmail';

test('lower-cases email', () => {
  const res = normalizeEmail('LOL@Gmail.Com');
  expect(res).toBe('lol@gmail.com');
});

test('removes dots', () => {
  const res = normalizeEmail('a.b@test.com');
  expect(res).toBe('ab@test.com');
});

test('removes all dots', () => {
  const res = normalizeEmail('a.b.c@test.com');
  expect(res).toBe('abc@test.com');
});

test('removes part after "+"', () => {
  const res = normalizeEmail('myname+event@gmail.com');
  expect(res).toBe('myname@gmail.com');
});
