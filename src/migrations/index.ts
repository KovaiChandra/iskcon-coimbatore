import * as migration_20261012_140035_initial from './20261012_140035_initial';
import * as migration_20261012_161819_blob_object_key from './20261012_161819_blob_object_key';
import * as migration_20261031_123559_site_photos from './20261031_123559_site_photos';
import * as migration_20261031_150609_payment_gateway from './20261031_150609_payment_gateway';
import * as migration_20261101_193721_enquiries from './20261101_193721_enquiries';

export const migrations = [
  {
    up: migration_20261012_140035_initial.up,
    down: migration_20261012_140035_initial.down,
    name: '20261012_140035_initial',
  },
  {
    up: migration_20261012_161819_blob_object_key.up,
    down: migration_20261012_161819_blob_object_key.down,
    name: '20261012_161819_blob_object_key',
  },
  {
    up: migration_20261031_123559_site_photos.up,
    down: migration_20261031_123559_site_photos.down,
    name: '20261031_123559_site_photos',
  },
  {
    up: migration_20261031_150609_payment_gateway.up,
    down: migration_20261031_150609_payment_gateway.down,
    name: '20261031_150609_payment_gateway',
  },
  {
    up: migration_20261101_193721_enquiries.up,
    down: migration_20261101_193721_enquiries.down,
    name: '20261101_193721_enquiries'
  },
];
