const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'panels.json');

/**
 * Structure des données persistées :
 * {
 *   panels: {
 *     [messageId]: {
 *       channelId: string,
 *       instance1: [{ userId, username, gare }],
 *       instance2: [{ userId, username, gare }]
 *     }
 *   },
 *   channelToLatestPanel: {
 *     [channelId]: messageId
 *   }
 * }
 */

function loadData() {
  if (!fs.existsSync(FILE_PATH)) {
    return { panels: {}, channelToLatestPanel: {} };
  }
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      panels: parsed.panels || {},
      channelToLatestPanel: parsed.channelToLatestPanel || {},
    };
  } catch (err) {
    console.error('Erreur de lecture de panels.json, réinitialisation :', err);
    return { panels: {}, channelToLatestPanel: {} };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur d\'écriture de panels.json :', err);
  }
}

// État en mémoire, chargé au démarrage
const state = loadData();

function getPanel(messageId) {
  return state.panels[messageId] || null;
}

function createPanel(messageId, channelId) {
  state.panels[messageId] = { channelId, instance1: [], instance2: [] };
  state.channelToLatestPanel[channelId] = messageId;
  saveData(state);
  return state.panels[messageId];
}

function getLatestPanelIdForChannel(channelId) {
  return state.channelToLatestPanel[channelId] || null;
}

/**
 * Retire un utilisateur de toutes les instances d'un panel donné.
 */
function removeUserFromPanel(messageId, userId) {
  const panel = state.panels[messageId];
  if (!panel) return false;
  const before1 = panel.instance1.length;
  const before2 = panel.instance2.length;
  panel.instance1 = panel.instance1.filter((e) => e.userId !== userId);
  panel.instance2 = panel.instance2.filter((e) => e.userId !== userId);
  const changed = panel.instance1.length !== before1 || panel.instance2.length !== before2;
  if (changed) saveData(state);
  return changed;
}

/**
 * Ajoute/replace un utilisateur dans l'instance choisie (1 ou 2) d'un panel.
 * Retire d'abord toute entrée existante de cet utilisateur (peu importe l'instance).
 */
function setUserInPanel(messageId, instanceNumber, userId, username, gare) {
  const panel = state.panels[messageId];
  if (!panel) return null;

  panel.instance1 = panel.instance1.filter((e) => e.userId !== userId);
  panel.instance2 = panel.instance2.filter((e) => e.userId !== userId);

  const entry = { userId, username, gare };
  if (instanceNumber === 1) {
    panel.instance1.push(entry);
  } else {
    panel.instance2.push(entry);
  }
  saveData(state);
  return panel;
}

module.exports = {
  getPanel,
  createPanel,
  getLatestPanelIdForChannel,
  removeUserFromPanel,
  setUserInPanel,
};
