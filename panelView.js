const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const config = require('./config');

function formatList(entries) {
  if (!entries || entries.length === 0) {
    return '*<:sncf:1523065343952818206> Aucun aiguilleurs en service*';
  }
  return entries.map((e) => `• ${e.username} \`${e.gare}\``).join('\n');
}

function buildPanelEmbed(panel) {
  return new EmbedBuilder()
    .setColor(0xE91E63)
    .setTitle('Stellwerksim - Panel de prise de service & fin de service')
    .setAuthor({
      name: 'Stellwerksim',
      iconURL: config.AUTHOR_ID,
      url: 'https://stellwerksim.de/',
    })
    .setDescription('> ***Veuillez lire les règles avant d\'utiliser le panel!*** \n > __Tout non-respect sera sanctionné.__')
    .setFooter({
      text: 'N\'oubliez pas de FS lorsque vous quittez votre poste!',
      iconURL: config.FOOTER_ICON_URL || config.THUMBNAIL_URL,
    })
    .addFields(
      { name: 'Instance 1', value: formatList(panel.instance1), inline: false },
      { name: 'Instance 2', value: formatList(panel.instance2), inline: false },
    )
    .setThumbnail(config.THUMBNAIL_URL);
}

function buildPanelButtons(messageId) {
  const helpUrl = config.GUILD_ID && config.HELP_CHANNEL_ID
    ? `https://discord.com/channels/${config.GUILD_ID}/${config.HELP_CHANNEL_ID}`
    : 'https://discord.com';

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ps_button:${messageId}`)
      .setLabel('PS')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`fs_button:${messageId}`)
      .setLabel('FS')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`help_button:${messageId}`)
      .setLabel("📜 Règles")
      .setStyle(ButtonStyle.Primary),
  );

  return row;
}

module.exports = { buildPanelEmbed, buildPanelButtons, formatList };
