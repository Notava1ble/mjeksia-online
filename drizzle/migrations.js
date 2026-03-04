// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_huge_la_nuit.sql';
import m0001 from './0001_fluffy_nekra.sql';
import m0002 from './0002_funny_masked_marvel.sql';
import m0003 from './0003_mighty_veda.sql';
import m0004 from './0004_petite_white_tiger.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004
    }
  }
  