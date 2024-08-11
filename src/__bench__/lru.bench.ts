// npx ts-node src/__bench__/lru.bench.ts

/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import {LruMap} from '../LruMap';
import {LruCache} from '../LruCache';

const lru = require('./vendor/lru');

interface Cache {
  name: string;
  create: (limit: number) => {set: (key: string, value: any) => void; get: (key: string) => any};
}

const caches: Cache[] = [
  {
    name: 'LruMap',
    create: (limit: number) => new LruMap(limit),
  },
  {
    name: 'LruCache',
    create: (limit: number) => new LruCache(limit),
  },
  {
    name: 'lru',
    create: (limit: number) => lru(limit),
  },
];
const limits = [10, 100, 1000, 10000];
// const iterations = [10, 100, 1000, 10000];
const iterations = [1000000];
// const reads = [true, false];
const reads = [true];

for (const limit of limits) {
  for (const iteration of iterations) {
    for (const read of reads) {
      console.log('');
      console.log('limit:', limit, 'iterations:', iteration, 'read:', read);
      const suite = new Benchmark.Suite();
      for (const {create, name} of caches) {
        if (reads) {
          suite.add(`${name}`, () => {
            let val: any;
            const cache = create(limit);
            for (let j = 0; j < 3; j++) {
              for (let i = 0; i < limit; i++) {
                const key = 'foo-' + i;
                cache.set(key, i);
              }
            }
            for (let i = 0; i < iteration; i++) {
              const key = 'foo-' + (i % limit);
              val = cache.get(key);
            }
            return val;
          });
        } else {
          suite.add(`${name}`, () => {
            const cache = create(limit);
            for (let i = 0; i < iteration; i++) {
              const key = 'foo-' + i;
              cache.set(key, i);
            }
          });
        }
      }
      suite
        .on('cycle', (event: any) => {
          console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
        })
        .on('complete', () => {
          console.log('Fastest is ' + suite.filter('fastest').map('name'));
        })
        .run();
    }
  }
}
