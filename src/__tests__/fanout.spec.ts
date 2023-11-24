import {FanOut} from '../fanout';

test('can receive events', () => {
  const fanout = new FanOut<string>();
  const events: unknown[] = [];
  const listener = (data: unknown) => {
    events.push(data);
  };
  expect(events).toEqual([]);
  fanout.listen(listener);
  expect(events).toEqual([]);
  fanout.emit('foo');
  expect(events).toEqual(['foo']);
  fanout.emit('bar');
  expect(events).toEqual(['foo', 'bar']);
});

test('does not receive events when unsubscribed', () => {
  const fanout = new FanOut<string>();
  const events: unknown[] = [];
  const listener = (data: unknown) => {
    events.push(data);
  };
  expect(events).toEqual([]);
  const unsubscribe = fanout.listen(listener);
  expect(events).toEqual([]);
  fanout.emit('foo');
  expect(events).toEqual(['foo']);
  unsubscribe();
  fanout.emit('bar');
  expect(events).toEqual(['foo']);
  unsubscribe();
  fanout.emit('bar');
  expect(events).toEqual(['foo']);
  unsubscribe();
});

test('can have multiple listeners', () => {
  const fanout = new FanOut<any>();
  const events1: unknown[] = [];
  const events2: unknown[] = [];
  const events3: unknown[] = [];
  const listener1 = (data: unknown) => {
    events1.push(data);
  };
  const listener2 = (data: unknown) => {
    events2.push(data);
  };
  const listener3 = (data: unknown) => {
    events3.push(data);
  };
  expect(events1).toEqual([]);
  expect(events2).toEqual([]);
  expect(events3).toEqual([]);
  const unsubscribe1 = fanout.listen(listener1);
  const unsubscribe3 = fanout.listen(listener3);
  expect(events1).toEqual([]);
  expect(events2).toEqual([]);
  expect(events3).toEqual([]);
  fanout.emit([123]);
  expect(events1).toEqual([[123]]);
  expect(events2).toEqual([]);
  expect(events3).toEqual([[123]]);
  const unsubscribe2 = fanout.listen(listener2);
  fanout.emit([456]);
  expect(events1).toEqual([[123], [456]]);
  expect(events2).toEqual([[456]]);
  expect(events3).toEqual([[123], [456]]);
  unsubscribe3();
  fanout.emit([789]);
  expect(events1).toEqual([[123], [456], [789]]);
  expect(events2).toEqual([[456], [789]]);
  expect(events3).toEqual([[123], [456]]);
  unsubscribe1();
  unsubscribe1();
  unsubscribe2();
  unsubscribe3();
  unsubscribe3();
  expect(events1).toEqual([[123], [456], [789]]);
  expect(events2).toEqual([[456], [789]]);
  expect(events3).toEqual([[123], [456]]);
  fanout.emit([101112]);
  expect(events1).toEqual([[123], [456], [789]]);
  expect(events2).toEqual([[456], [789]]);
  expect(events3).toEqual([[123], [456]]);
});
