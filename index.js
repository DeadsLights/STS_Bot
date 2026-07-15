const {
  Client,
  GatewayIntentBits,
  Partials,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ActivityType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  REST,
  Routes,
  ChannelType,
  StatusDisplayType,

} = require('discord.js');

const config = require('./config');
const dataStore = require('./dataStore');
const { buildPanelEmbed, buildPanelButtons } = require('./panelView');
const memberCounter = require("./memberCounter");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

module = require('./events')(client);

// ---------- Utilitaires ----------

const commands = [
new SlashCommandBuilder() // DELETE ADTER DELETE AFTER DELETE AFTER DELETE AFTER DELETE AFTER DELETE AFTER DELETE 
        .setName('delete_after')
        .setDescription('delete all messages after a specific message')
        .addStringOption(option =>
            option
                .setName('message_id')
                .setDescription('ID of the reference message')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
];


const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🚀 Enregistrement des commandes slash...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Commandes enregistrées !');
    } catch (err) {
        console.error(err);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
// ------------------------------------------------ /warn -------------------------------------------------------
if (interaction.commandName === 'delete_after') {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "> <:cross:1523326615113961483> You don't have permission.",
                ephemeral: true
            });
        }
        const LOG_CHANNEL_ID= "1523085823363383367"
        const messageId = interaction.options.getString('message_id');
        const channel = interaction.channel;

        await interaction.deferReply({ ephemeral: true });

        try {
            let deletedCount = 0;
            let lastId = messageId;

            while (true) {
                const messages = await channel.messages.fetch({
                    limit: 100,
                    after: lastId
                });

                if (messages.size === 0) break;

                const deletable = messages.filter(m => !m.pinned);

                const deleted = await channel.bulkDelete(deletable, true);
                deletedCount += deleted.size;

                lastId = messages.last().id;
            }


            const embed_DL = {
            color: 0xE91E63,
            title: "/Delete_after commande exécutée",
            description: `> 🛑 **${interaction.user}** a supprimé \`${deletedCount}\` messages dans <#${channel.id}>`,
            timestamp: new Date(),
            footer: {
                    text: `User ID: ${interaction.user.id}`
                }
            };

            await interaction.editReply(`> <a:tick:1523325573680594966> ${deletedCount} messages deleted.`);

            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

            if (logChannel) {
                await logChannel.send({
                    embeds: [embed_DL]
                });
            }

        } catch (error) {
            console.error(error);

            await interaction.editReply(
                "> <:cross:1523326615113961483> Can't delete messages. They might be older than 14 days or missing permissions."
            );
        }

        return;
    }
});



const statuses = [
    '👋 Bienvenue sur Stellwerksim!',
    '❔ Besoin d\'aide? allez dans la section Tuto.',
    '💖 Vous aimez STS? Vous pouvez faire en don pour soutenir le projet!',
    '🎮 Avez-vous testé le nouveau système de PS & FS?',
];
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);
    memberCounter.start(client, "1523759963070009365");
    let index = 0;

    const updatePresence = () => {
        client.user.setPresence({
            activities: [
                {
                    name: statuses[index],
                    type: ActivityType.Custom,
                    url: 'https://www.youtube.com/watch?v=Strcjv5G4OU&t=521s'
                }
            ],
            status: 'dnd'
        });

        console.log(`Status changed : ${statuses[index]}`);

        index = (index + 1) % statuses.length;
    };

    // Premier status instantané
    updatePresence();

    // Change toutes les 5 minutes
    setInterval(updatePresence, 1 * 60 * 1000);
});


// ---------- Utilitaires ----------
 
function hasAllowedRole(member) {
  if (!member || !config.ALLOWED_ROLE_ID) return false;
  return member.roles.cache.has(config.ALLOWED_ROLE_ID);
}
 
// Durée avant auto-suppression des réponses "ephemeral-like" (en ms)
const EPHEMERAL_DELETE_MS = 6000;
 
/**
 * Envoie une réponse à une commande préfixe, puis la supprime automatiquement
 * après un délai (avec le message de commande d'origine), pour simuler un
 * comportement "ephemeral" (impossible nativement hors interactions Discord).
 */
async function replyEphemeralLike(message, content) {
  const reply = await message.reply({ content }).catch(() => null);
 
  setTimeout(() => {
    if (reply) reply.delete().catch(() => {});
    message.delete().catch(() => {});
  }, EPHEMERAL_DELETE_MS);
 
  return reply;
}
 
// ---------- Salon vocal "Aiguilleurs en ligne : X" ----------

 
async function refreshPanelMessage(guild, messageId) {
  const panel = dataStore.getPanel(messageId);
  if (!panel) return null;
 
  const channel = await guild.channels.fetch(panel.channelId).catch(() => null);
  if (!channel) return null;
 
  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) return null;
 
  const embed = buildPanelEmbed(panel);
  const row = buildPanelButtons(messageId);
 
  await message.edit({ embeds: [embed], components: [row] });
  return message;
}
 
// ---------- Commandes texte ----------
 
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(config.PREFIX)) return;
 
  const args = message.content.slice(config.PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();
 
  // !embed -> poste le panel dans le salon courant
  if (command === 'embed') {
    if (!hasAllowedRole(message.member)) {
      return replyEphemeralLike(
        message,
        "> <:cross:1523326615113961483> Tu n'as pas la permission d'utiliser cette commande.",
      );
    }
 
    // On envoie un premier message "placeholder" pour obtenir son ID,
    // car les customId des boutons ont besoin de connaître l'ID du message.
    const placeholderEmbed = buildPanelEmbed({ instance1: [], instance2: [] });
    const sentMessage = await message.channel.send({ embeds: [placeholderEmbed] });
 
    dataStore.createPanel(sentMessage.id, message.channel.id);
 
    const row = buildPanelButtons(sentMessage.id);
    await sentMessage.edit({ embeds: [placeholderEmbed], components: [row] });
 
    // Rien à cacher ici (l'embed est public), on nettoie juste la commande
    message.delete().catch(() => {});
    return;
  }
 
  // !fsm <@utilisateur | id> -> retire quelqu'un du panel du salon courant
  if (command === 'fsm') {
    if (!hasAllowedRole(message.member)) {
      return replyEphemeralLike(
        message,
        "> <:cross:1523326615113961483> Tu n'as pas la permission d'utiliser cette commande.",
      );
    }
 
    const targetUser = message.mentions.users.first();
    const targetId = targetUser ? targetUser.id : args[0];
 
    if (!targetId) {
      return replyEphemeralLike(
        message,
        '> 🔑 Utilisation : `!fsm @utilisateur` ou `!fsm <id>`',
      );
    }
 
    const panelId = dataStore.getLatestPanelIdForChannel(message.channel.id);
    if (!panelId) {
      return replyEphemeralLike(
        message,
        "> <:cross:1523326615113961483> Aucun panel actif n'a été trouvé dans ce salon.",
      );
    }
 
    const removed = dataStore.removeUserFromPanel(panelId, targetId);
    if (!removed) {
      return replyEphemeralLike(
        message,
        "> <:cross:1523326615113961483> Cet utilisateur n'était présent dans aucune instance du panel.",
      );
    }
 
    await refreshPanelMessage(message.guild, panelId);
    return replyEphemeralLike(message, '> <a:tick:1523325573680594966> Utilisateur retiré du panel.');
  }
});
 
// ---------- Interactions (boutons + modal) ----------
 
client.on('interactionCreate', async (interaction) => {
  try {
    // --- Clic sur un bouton ---
    if (interaction.isButton()) {
      const [action, messageId] = interaction.customId.split(':');
 
      if (action === 'ps_button') {
        const modal = new ModalBuilder()
          .setCustomId(`ps_modal:${messageId}`)
          .setTitle('Prise de service');
 
        const gareInput = new TextInputBuilder()
          .setCustomId('gare_input')
          .setLabel('Gare')
          .setPlaceholder('Ex : Gare du Nord')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100);
 
        const instanceInput = new TextInputBuilder()
          .setCustomId('instance_input')
          .setLabel('Instance (1 ou 2)')
          .setPlaceholder('1 ou 2')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(1);
 
        modal.addComponents(
          new ActionRowBuilder().addComponents(gareInput),
          new ActionRowBuilder().addComponents(instanceInput),
        );
 
        await interaction.showModal(modal);
        return;
      }
 
      if (action === 'fs_button') { // FIN DE SERVICE 
        const panel = dataStore.getPanel(messageId);
        const LOG_CHANNEL_ID = "1523085823363383367";
        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!panel) {
          return interaction.reply({
            content: '> <:cross:1523326615113961483> Ce panel est introuvable ou a expiré.',
            ephemeral: true,
          });
        }
 
        const removed = dataStore.removeUserFromPanel(messageId, interaction.user.id);
        if (!removed) {
          return interaction.reply({
            content: "> <:cross:1523326615113961483> Tu n'es actuellement dans aucune instance de ce panel.",
            ephemeral: true,
          });
        }

        const embed_fs = {
            color: 0xE91E63,
            title: "Fin de Service",
            description: `> 🎮 **${interaction.user}** a quitté son poste.`,
            timestamp: new Date(),
            footer: {
                    text: `User ID: ${interaction.user.id}`
                }
            }

        if (logChannel) {
                await logChannel.send({
                    embeds: [embed_fs]
                });
            }
 
        await refreshPanelMessage(interaction.guild, messageId);
        return interaction.reply({
          content: '<a:tick:1523325573680594966> Tu as été retiré du panel (fin de service).',
          ephemeral: true,
        });
      }
 
      return;
    }
 
    // --- Soumission du modal PS ---
    if (interaction.isModalSubmit()) {
      const [action, messageId] = interaction.customId.split(':');
      if (action !== 'ps_modal') return;
 const LOG_CHANNEL_ID = "1523749413820825651";

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      const gare = interaction.fields.getTextInputValue('gare_input').trim();
      const instanceRaw = interaction.fields.getTextInputValue('instance_input').trim();
 
      if (instanceRaw !== '1' && instanceRaw !== '2') {
        return interaction.reply({
          content: '> 🔢 L\'instance doit être `1` ou `2`. Réessaie via le bouton PS.',
          ephemeral: true,
        });
      }
 
      const panel = dataStore.getPanel(messageId);
      if (!panel) {
        return interaction.reply({
          content: '> <:cross:1523326615113961483> Ce panel est introuvable ou a expiré.',
          ephemeral: true,
        });
      }
 

      const embed_ps = {
            color: 0xE91E63,
            title: "Prise de Service",
            description: `> 🎮 **${interaction.user}** a pris \`${gare}\` \n > Instance: \`${instanceRaw}\``,
            timestamp: new Date(),
            footer: {
                    text: `User ID: ${interaction.user.id}`
                }
            };


            if (logChannel) {
                await logChannel.send({
                    embeds: [embed_ps]
                });
            }
    

      const instanceNumber = parseInt(instanceRaw, 10);
      const username = interaction.member?.displayName || interaction.user.username;
 
      dataStore.setUserInPanel(messageId, instanceNumber, interaction.user.id, username, gare);
      await refreshPanelMessage(interaction.guild, messageId);
 
      return interaction.reply({
        content: `> <a:tick:1523325573680594966> Prise de service enregistrée : **${gare}** (Instance ${instanceNumber}).`,
        ephemeral: true,
      });
    }
  } catch (err) {
    console.error('Erreur interaction :', err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      interaction.reply({
        content: "> <:cross:1523326615113961483> Une erreur est survenue, réessaie plus tard.",
        ephemeral: true,
      }).catch(() => {});
    }
  }
});
 



client.login(config.TOKEN);
