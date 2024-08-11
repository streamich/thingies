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
const limits = [100];
const inserts = [10, 100, 1000, 10000];
const reads = [false, true];

for (const limit of limits) {
  for (const insert of inserts) {
    for (const read of reads) {
      console.log('');
      console.log('limit:', limit, 'insert:', insert, 'read:', read);
      const suite = new Benchmark.Suite();
      for (const {create, name} of caches) {
        suite.add(`${name}`, () => {
          let val: any;
          const cache = create(limit);
          for (let i = 0; i < insert; i++) {
            const key = 'foo-' + i;
            cache.set(key, i);
            if (read) cache.get(key);
          }
          return val;
        });
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
