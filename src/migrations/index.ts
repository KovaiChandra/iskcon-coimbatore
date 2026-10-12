import * as migration_20261012_140035_initial from './20261012_140035_initial';
import * as migration_20261012_161819_blob_object_key from './20261012_161819_blob_object_key';

export const migrations = [
  {
    up: migration_20261012_140035_initial.up,
    down: migration_20261012_140035_initial.down,
    name: '20261012_140035_initial',
  },
  {
    up: migration_20261012_161819_blob_object_key.up,
    down: migration_20261012_161819_blob_object_key.down,
    name: '20261012_161819_blob_object_key'
  },
];
