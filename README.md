# thingies

Useful TypeScript utilities.


## Menu

- `base64` &mdash; Base64 encoding end decoding functions for Node.js.

---

- `Cache` &mdash; implementation of local memory cache for database records. Can cache
  retrieved database records for few dozen seconds and has garbage collection logic
  which clears the memory of old items after some time.

---

- `Defer` &mdash; an inverted `Promise`, an object which allows you to imperatively
  control the behavior of a `Promise`.

---

- `hash` &mdash; a fast and simple utility, which hashes a string to an integer. Useful
  for generating a shard index of a record based on its ID.

---

- `LruMap` &mdash; tiny and fast *Least Recently Used Cache* implemented on top of the `Map` class.

---

- `LruTtlMap` &mdash; tiny and fast *Least Recently Used Cache* with expiration timestamp
  stored for each entry implemented on top of the `LruMap` class.

---

- `normalizeEmail` &mdash; normalizes email by stripping out `.` and `+` characters and
  removing everything after the `+` character and lower-casing the e-mail. Useful for
  getting an e-mail into a common form when throttling requests by e-mail.

---

- `of` &mdash; returns result of a `Promise` as a 3-tuple `[value, error, isError]`.

---

- `promiseMap` &mdash; maps a list of values to an async function and waits until
  all results complete execution.

---

- `randomStr` &mdash; generates a random string of given size. Alphabet for character
  picking can be provided. Useful for generating random database record IDs.

---

- `TimedQueue` &mdash; a queue which can be flushed manually, or which flushes
  automatically when the number of queued items reaches a threshold or when a timeout
  expires since the first item was added to the queue. Useful for batching multiple
  messages or requests for bulk processing.

---

- `TimedState` &mdash; works similar to `TimedQueue`, but instead of keeping track of
  all items pushed, it invokes a reducer to update the state with the information from
  the last pushed item.

---

- `tick` &mdash; returns a `Promise` which resolves after a given number of milliseconds,
  useful for releasing the event loop for a short period of time, `await tick(5)`.

---

- `until` &mdash; waits for some condition to become true `await until(() => condition)`,
  useful when waiting for some asynchronous task to happen in a test.


## License

[MIT ?? Vadim Dalecky](LICENSE).
