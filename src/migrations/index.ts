import * as migration_20261012_140035_initial from './20261012_140035_initial';

export const migrations = [
  {
    up: migration_20261012_140035_initial.up,
    down: migration_20261012_140035_initial.down,
    name: '20261012_140035_initial'
  },
];
