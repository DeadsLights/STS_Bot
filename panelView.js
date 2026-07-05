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
    .setFooter({
      text: 'Besoin d\'aide? demandez à un administateur de vous guider!',
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
      .setLabel("🆘 J'ai besoin d'aide !")
      .setStyle(ButtonStyle.Link)
      .setURL(helpUrl),
  );

  return row;
}

module.exports = { buildPanelEmbed, buildPanelButtons, formatList };