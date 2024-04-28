# [2.1.0](https://github.com/streamich/thingies/compare/v2.0.0...v2.1.0) (2024-04-28)


### Features

* 🎸 implement timeout() utility ([05c5339](https://github.com/streamich/thingies/commit/05c53395ba2ff11ce818683a0e9a54daa32028ae))

# [2.0.0](https://github.com/streamich/thingies/compare/v1.21.0...v2.0.0) (2024-04-27)


### Features

* 🎸 release a single es2020 target ([87a9fb1](https://github.com/streamich/thingies/commit/87a9fb137e589bd28947aeb29b934aba865e90c1))


### BREAKING CHANGES

* 🧨 Produce only es2020 release artifacts

# [1.21.0](https://github.com/streamich/thingies/compare/v1.20.0...v1.21.0) (2024-04-26)


### Features

* 🎸 add hasKeys() utility ([570ea5c](https://github.com/streamich/thingies/commit/570ea5cfcfa684dc4a451b192e4e8f8216bef93e))

# [1.20.0](https://github.com/streamich/thingies/compare/v1.19.3...v1.20.0) (2024-04-01)


### Features

* 🎸 add Locks implementation ([fc8c1d6](https://github.com/streamich/thingies/commit/fc8c1d643259e518dc2ab0a116ea5a69fc09ee0d))
* 🎸 improve locking interface ([171797b](https://github.com/streamich/thingies/commit/171797bb49c6a5751a26c93d80ad83a19d50c89f))

## [1.19.3](https://github.com/streamich/thingies/compare/v1.19.2...v1.19.3) (2024-03-30)


### Bug Fixes

* 🐛 allow different return type per racer ([ffc3b89](https://github.com/streamich/thingies/commit/ffc3b89af7179a48cd4bf333359fe05d1af7c429))

## [1.19.2](https://github.com/streamich/thingies/compare/v1.19.1...v1.19.2) (2024-03-19)


### Bug Fixes

* 🐛 limit mutex scope to a single class instance ([c994280](https://github.com/streamich/thingies/commit/c9942801490a62c547b34a881829e8c65322ffa8))
* 🐛 make concurrency() decorator apply per class instance ([839c898](https://github.com/streamich/thingies/commit/839c898dfe324fd47deac1c65d5c33fd73357048))


### Performance Improvements

* ⚡️ improve once() decorator ([c50e19f](https://github.com/streamich/thingies/commit/c50e19f37bc3cd4359b8eecc95a8bdb0ede479ad))

## [1.19.1](https://github.com/streamich/thingies/compare/v1.19.0...v1.19.1) (2024-03-14)


### Bug Fixes

* 🐛 correctly store execution results in once decorator ([9c6d49d](https://github.com/streamich/thingies/commit/9c6d49d603305ef2a3cd3b693838d07ccf25e215))

# [1.19.0](https://github.com/streamich/thingies/compare/v1.18.0...v1.19.0) (2024-03-14)


### Features

* 🎸 implement "once" class method decorator ([d1434ae](https://github.com/streamich/thingies/commit/d1434ae30f9b901ad1a48319ee0eb548ffbf7a38))

# [1.18.0](https://github.com/streamich/thingies/compare/v1.17.0...v1.18.0) (2024-03-11)


### Features

* 🎸 implement concurrency() class method decorator ([1e00c9e](https://github.com/streamich/thingies/commit/1e00c9e8b4d1b15230f34c26e140b1d3362eff6a))

# [1.17.0](https://github.com/streamich/thingies/compare/v1.16.0...v1.17.0) (2024-03-09)


### Features

* 🎸 add support for arguments in mutex decorator ([7095e93](https://github.com/streamich/thingies/commit/7095e938c81b1abf7a61c26c0f715004054bca36))

# [1.16.0](https://github.com/streamich/thingies/compare/v1.15.0...v1.16.0) (2024-01-13)


### Features

* 🎸 add xosrshift implementation ([e32a638](https://github.com/streamich/thingies/commit/e32a6387a7f67de5585c4305bba5d297892e48f1))

# [1.15.0](https://github.com/streamich/thingies/compare/v1.14.2...v1.15.0) (2023-12-04)


### Features

* 🎸 add createRace() utility ([c835bb2](https://github.com/streamich/thingies/commit/c835bb27d3afb2542ba49f88234bf3ece1520f0e))

## [1.14.2](https://github.com/streamich/thingies/compare/v1.14.1...v1.14.2) (2023-11-25)


### Bug Fixes

* 🐛 make FanOut listeners public ([4a7e546](https://github.com/streamich/thingies/commit/4a7e5460362fe929dc8ccb1ac35cc5f3d22a6469))

## [1.14.1](https://github.com/streamich/thingies/compare/v1.14.0...v1.14.1) (2023-11-24)


### Bug Fixes

* 🐛 make .listeners protected ([16aed9a](https://github.com/streamich/thingies/commit/16aed9a2c0bafc457b8fdb0204a084e1e8e728ae))

# [1.14.0](https://github.com/streamich/thingies/compare/v1.13.1...v1.14.0) (2023-11-24)


### Features

* 🎸 add FanOut implementation ([018bfb0](https://github.com/streamich/thingies/commit/018bfb09b150c31f7ca51c3fb96d61a465dfcfcc))

## [1.13.1](https://github.com/streamich/thingies/compare/v1.13.0...v1.13.1) (2023-11-21)


### Bug Fixes

* 🐛 produce build artifacts in release ([11a3e77](https://github.com/streamich/thingies/commit/11a3e776a7980c7b34f45caf454a14f127ebdad9))

# [1.13.0](https://github.com/streamich/thingies/compare/v1.12.0...v1.13.0) (2023-11-20)


### Features

* 🎸 add dataUri() utility ([d2784ae](https://github.com/streamich/thingies/commit/d2784ae766da67cedf1d0ca08d2994c0cd4ae4d1))

# [1.12.0](https://github.com/streamich/thingies/compare/v1.11.1...v1.12.0) (2023-07-02)


### Features

* 🎸 add loadCss() method ([e44534d](https://github.com/streamich/thingies/commit/e44534de862094f361123552f9fb6abeeb4a29b2))

## [1.10.1](https://github.com/streamich/thingies/compare/v1.10.0...v1.10.1) (2023-04-07)


### Bug Fixes

* 🐛 do not remove comments ([201fb98](https://github.com/streamich/thingies/commit/201fb9895923b12848dc9027cc478c2e2070a86e))

# [1.10.0](https://github.com/streamich/thingies/compare/v1.9.0...v1.10.0) (2023-04-07)


### Features

* 🎸 add [@mutex](https://github.com/mutex) decorator ([309e3de](https://github.com/streamich/thingies/commit/309e3de8d296c2fccee6e3f58f40e1e803fa2603))
* 🎸 export [@mutex](https://github.com/mutex) ([0aa12e9](https://github.com/streamich/thingies/commit/0aa12e9d5ebffcb440bd9b1bd3bb27819388674c))

# [1.9.0](https://github.com/streamich/thingies/compare/v1.8.0...v1.9.0) (2023-04-07)


### Features

* 🎸 improve codeMutex() interface ([cb85955](https://github.com/streamich/thingies/commit/cb8595551ef51d66e94090a86dde1211b9c0835d))

# [1.8.0](https://github.com/streamich/thingies/compare/v1.7.0...v1.8.0) (2023-04-07)


### Features

* 🎸 add codeMutex() ([4dccf86](https://github.com/streamich/thingies/commit/4dccf862ac3ebed4c6cdb07ebae0db7bdf9cbd8a))

# [1.7.0](https://github.com/streamich/thingies/compare/v1.6.0...v1.7.0) (2023-04-05)


### Features

* 🎸 imrprove internal queue type ([770ef26](https://github.com/streamich/thingies/commit/770ef26c1c97f9bc579190e73c0558efb044af70))
* 🎸 use Set as a FIFO queue ([2b82a06](https://github.com/streamich/thingies/commit/2b82a06ae367bdeb227ea0bf1c7d68a6c29b694f))

# [1.6.0](https://github.com/streamich/thingies/compare/v1.5.0...v1.6.0) (2023-04-05)


### Features

* 🎸 expose concurrency() from index ([6a2450f](https://github.com/streamich/thingies/commit/6a2450f680d56c2becc4652e7b2c1ddf47995baf))

# [1.5.0](https://github.com/streamich/thingies/compare/v1.4.0...v1.5.0) (2023-04-05)


### Features

* 🎸 add concurrency() implementation ([c195a31](https://github.com/streamich/thingies/commit/c195a318d4736f074d98b3baa265de894cb349dd))

# [1.4.0](https://github.com/streamich/thingies/compare/v1.3.1...v1.4.0) (2022-11-02)


### Features

* 🎸 allow async check function in until() ([a545be9](https://github.com/streamich/thingies/commit/a545be94085b4c223b64ecd143569bc7c0b80529))

## [1.3.1](https://github.com/streamich/thingies/compare/v1.3.0...v1.3.1) (2022-07-02)


### Bug Fixes

* 🐛 make Cache timers unreffed ([0073ac0](https://github.com/streamich/thingies/commit/0073ac0d80488841ecf520a3f0a03a46ff01c6c1))

# [1.3.0](https://github.com/streamich/thingies/compare/v1.2.0...v1.3.0) (2022-04-07)


### Features

* 🎸 add index file ([2e135f8](https://github.com/streamich/thingies/commit/2e135f874a1cf3c7404e2e6cecfacbc5b38858b6))
* 🎸 add tick() and until() methods ([caeb0b0](https://github.com/streamich/thingies/commit/caeb0b0ba1f0b659499e394e43f499e69f53f2bb))

# [1.2.0](https://github.com/streamich/thingies/compare/v1.1.0...v1.2.0) (2021-11-01)


### Features

* 🎸 implement TimeState utility class ([7423a93](https://github.com/streamich/thingies/commit/7423a93412570a983ff1f4ef4cca202ca6401540))

# [1.1.0](https://github.com/streamich/thingies/compare/v1.0.0...v1.1.0) (2021-10-23)


### Features

* 🎸 place LruMap and LruTtlMap into separate files ([36c4ba1](https://github.com/streamich/thingies/commit/36c4ba15d13234bde8f2b4aa62b19fc3ebfab0bb))

# 1.0.0 (2021-10-23)


### Features

* 🎸 add batch of utitlities ([6fbb893](https://github.com/streamich/thingies/commit/6fbb8933b97e9c11a4ca8c36df91ac994eb0f95f))
* 🎸 add normalizeEmail() function ([7403b9d](https://github.com/streamich/thingies/commit/7403b9d72e8536d035c0d75a05220f29743d9054))
* 🎸 add of() method ([f236dd4](https://github.com/streamich/thingies/commit/f236dd4854c2425a91eaa54e77706be6be3834b7))
* 🎸 add promiseMap() method ([ce0dc45](https://github.com/streamich/thingies/commit/ce0dc45bd3e866d0c3fbdd4234c0c4a50d915b75))
* 🎸 add randomStr() function ([299d85b](https://github.com/streamich/thingies/commit/299d85b4291400eff3e1f978aa90964494d468a2))
* 🎸 add TimedQueue utility ([484da32](https://github.com/streamich/thingies/commit/484da32b2822f168f792354e9df9a291875d6300))
