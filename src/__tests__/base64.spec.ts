import {decode64, encode64} from '../base64';

test('encodes in base64', () => {
  expect(encode64('test')).toMatchInlineSnapshot(`"dGVzdA=="`);
});

test('decodes encoded string', () => {
  const res = decode64(encode64('foo'));
  expect(res).toBe('foo');
});
