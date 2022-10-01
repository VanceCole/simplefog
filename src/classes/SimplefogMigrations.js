/*
 * Provides for the ability to check and run migration code for changes to data
 */
/* eslint-disable max-len */
import { simplefogLog } from '../js/helpers.js';

export default class SimplefogMigrations {
  static check() {
    if (!game.user.isGM) return;
    simplefogLog('Checking migrations');
    const ver = game.settings.get('simplefog', 'migrationVersion');
    if (ver < 1) SimplefogMigrations.migration1();
  }

  /*
   * Tidys up some messy data storage from early versions
   * - Converts string based shape names to integers
   * - Rounds any decimal x / y / height / width values
   * - Deletes any unnecessary visible & alpha props
   */
  static migration1() {
    simplefogLog('Performing migration #1', true);
    game.scenes.forEach(async (s) => {
      // Check if scene has simplefog history
      if (s.data.flags?.simplefog?.history?.events) {
        const { history } = s.data.flags.simplefog;
        // Loop through all events to check for old data
        for (let i = 0; i < history.events.length; i += 1) {
          for (let j = 0; j < history.events[i].length; j += 1) {
            // Update shape props to use integers instead of strings
            switch (history.events[i][j].shape) {
              case 'ellipse':
                history.events[i][j].shape = 0;
                break;
              case 'box':
                history.events[i][j].shape = 1;
                break;
              case 'shape':
                history.events[i][j].shape = 3;
                break;
              case 'polygon':
                history.events[i][j].shape = 3;
                break;
              default:
                break;
            }
            // Round decimal values
            if (history.events[i][j].x) history.events[i][j].x = Math.round(history.events[i][j].x);
            if (history.events[i][j].x) history.events[i][j].y = Math.round(history.events[i][j].y);
            if (history.events[i][j].height) history.events[i][j].height = Math.round(history.events[i][j].height);
            if (history.events[i][j].width) history.events[i][j].width = Math.round(history.events[i][j].width);
            // Remove unnecessary visible & alpha props
            if (history.events[i][j].visible) delete history.events[i][j].visible;
            if (history.events[i][j].alpha) delete history.events[i][j].alpha;
          }
        }
        await s.unsetFlag('simplefog', 'history');
        s.setFlag('simplefog', 'history', history);
        game.settings.set('simplefog', 'migrationVersion', 1);
      }
    });
  }
}
