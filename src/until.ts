import {tick} from './tick';

export const until = async (check: () => boolean, pollInterval: number = 1) => {
  do {
    if (check()) return;
    await tick(pollInterval);
  } while (true);
};
