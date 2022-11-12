/*
 * Provides a mechanism to send whisper to GM when new version installed.
 */
import { dmToGM } from '../js/helpers.js';

export default class SimplefogNotification {
  constructor() {
  }
  static checkVersion() {
    if (game.user.isGM && game.user.getFlag('simplefog', 'versionNotification') !== game.modules.get('simplefog').data.version) {
      // GM has never seen current version message

      dmToGM(game.i18n.localize('SIMPLEFOG.versionNotification'), undefined)

      // Update the saved version
      game.user.setFlag('simplefog', 'versionNotification', game.modules.get('simplefog').data.version)
    }
  }
}
