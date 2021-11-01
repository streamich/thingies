import {TimedState} from '../TimedState';

test('can create queue', () => {
  const queue = new TimedState<{}, []>(() => ({}), (s, i) => s);
});

type CountRecord = Record<string, number>;

interface CounterState {
  [key: string]: CountRecord;
}

type CounterItem = [key: string, increments: CountRecord];

const createTimedState = (itemLimit: number = 100, timeLimit: number = 5_000) => {
  const state = new TimedState<CounterState, CounterItem>(() => ({}),
    (state, [key, increments]) => {
      let counts = state[key];
      if (!counts) counts = state[key] = {};
      for (const counter of Object.keys(increments)) {
        counts[counter] = (counts[counter] || 0) + increments[counter];
      }
      return state;
    });
  state.itemLimit = itemLimit;
  state.timeLimit = timeLimit;
  return state;
};

test('can add items', () => {
  const state = createTimedState();
  state.onFlush = jest.fn();
  state.push(['the-key', {foo: 123}]);
  state.flush();
  expect(state.onFlush).toHaveBeenCalledWith({'the-key': {foo: 123}});
});

test('reducer aggregates data', () => {
  const state = createTimedState();
  state.onFlush = jest.fn();
  state.push(['the-key', {foo: 123}]);
  state.push(['the-key', {foo: 2, bar: 3}]);
  state.flush();
  expect(state.onFlush).toHaveBeenCalledWith({'the-key': {
    foo: 125,
    bar: 3,
  }});
});

test('can flush state', () => {
  const state = createTimedState();
  state.onFlush = jest.fn();
  state.push(['the-key', {foo: 123}]);
  state.push(['the-key', {foo: 3}]);
  state.flush();
  expect(state.onFlush).toHaveBeenCalledWith({
    'the-key': {
      foo: 126,
    }
  });
  expect(state.onFlush).toHaveBeenCalledTimes(1);
  state.push(['the-key', {a: 1}]);
  state.push(['the-key', {a: 2}]);
  state.push(['the-key', {a: 3}]);
  state.flush();
  expect(state.onFlush).toHaveBeenCalledWith({
    'the-key': {
      a: 6,
    }
  });
  expect(state.onFlush).toHaveBeenCalledTimes(2);
});

test('flushes queue when item limit is reached, subsequent flush does not execute', () => {
  const state = createTimedState(5);
  state.onFlush = jest.fn();
  state.push(['a', {b: 0}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  state.push(['a', {b: 1}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  state.push(['a', {b: 2}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  state.push(['a', {b: 3}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  state.push(['a', {b: 4}]);
  expect(state.onFlush).toHaveBeenCalledTimes(1);
  expect(state.onFlush).toHaveBeenCalledWith({
    a: {
      b: 10,
    }
  });
  state.flush();
  expect(state.onFlush).toHaveBeenCalledTimes(1);
});

test('flushes queue multiple times', () => {
  const state = createTimedState(2);
  state.onFlush = jest.fn();
  state.push(['a', {b: 0}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  state.push(['a', {b: 1}]);
  expect(state.onFlush).toHaveBeenCalledTimes(1);
  state.push(['a', {b: 2}]);
  expect(state.onFlush).toHaveBeenCalledTimes(1);
  state.push(['a', {b: 3}]);
  expect(state.onFlush).toHaveBeenCalledTimes(2);
  expect(state.onFlush).toHaveBeenCalledWith({
    a: {
      b: 1,
    }
  });
  expect(state.onFlush).toHaveBeenCalledWith({
    a: {
      b: 5,
    }
  });
  state.push(['a', {b: 4}]);
  expect(state.onFlush).toHaveBeenCalledTimes(2);
  state.flush();
  expect(state.onFlush).toHaveBeenCalledWith({
    a: {
      b: 4,
    }
  });
});

test('flushes when timeout is reached', (done) => {
  const state = createTimedState(100, 100);
  state.onFlush = jest.fn();
  state.push(['a', {b: 1}]);
  state.push(['a', {b: 2}]);
  state.push(['a', {b: 3}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(state.onFlush).toHaveBeenCalledWith({
      a: {
        b: 6,
      }
    });
    expect(state.onFlush).toHaveBeenCalledTimes(1);
    done();
  }, 101);
});

test('flushes on timeout twice', (done) => {
  const state = createTimedState(20, 20);
  state.onFlush = jest.fn();
  state.push(['a', {b: 1}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(state.onFlush).toHaveBeenCalledWith({
      a: {
        b: 1,
      }
    });
    expect(state.onFlush).toHaveBeenCalledTimes(1);
    state.push(['a', {b: 2}]);
    expect(state.onFlush).toHaveBeenCalledTimes(1);
    setTimeout(() => {
      expect(state.onFlush).toHaveBeenCalledWith({
        a: {
          b: 2,
        }
      });
      expect(state.onFlush).toHaveBeenCalledTimes(2);
      done();
    }, 21);
  }, 21);
});

test('does not flush after timeout if queue is empty', (done) => {
  const state = createTimedState(20, 20);
  state.onFlush = jest.fn();
  state.push(['a', {b: 1}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(state.onFlush).toHaveBeenCalledWith({
      a: {
        b: 1,
      }
    });
    expect(state.onFlush).toHaveBeenCalledTimes(1);
    setTimeout(() => {
      expect(state.onFlush).toHaveBeenCalledTimes(1);
      done();
    }, 21);
  }, 21);
});

test('when flushed manually, does not flush after timeout', (done) => {
  const state = createTimedState(20, 20);
  state.onFlush = jest.fn();
  state.push(['a', {b: 1}]);
  expect(state.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(state.onFlush).toHaveBeenCalledWith({
      a: {
        b: 1,
      }
    });
    expect(state.onFlush).toHaveBeenCalledTimes(1);
    state.push(['a', {b: 3}]);
    state.flush();
    expect(state.onFlush).toHaveBeenCalledTimes(2);
    expect(state.onFlush).toHaveBeenCalledWith({
      a: {
        b: 3,
      }
    });
    setTimeout(() => {
      expect(state.onFlush).toHaveBeenCalledTimes(2);
      done();
    }, 21);
  }, 21);
});
