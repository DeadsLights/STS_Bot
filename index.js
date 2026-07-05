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

} = require('discord.js');

const config = require('./config');
const dataStore = require('./dataStore');
const { buildPanelEmbed, buildPanelButtons } = require('./panelView');

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
                content: "> ❌ You don't have permission.",
                ephemeral: true
            });
        }
        const LOG_CHANNEL_ID= "1523249670812467352"
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
            description: `> 🛑 **${interaction.user.username}** a supprimé \`${deletedCount}\` dans <#${channel.id}>`,
            timestamp: new Date(),
            footer: {
                    text: `User ID: ${interaction.user.id}`
                }
            };

            await interaction.editReply(`> ✅ ${deletedCount} messages deleted.`);

            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

            if (logChannel) {
                await logChannel.send({
                    embeds: [embed_DL]
                });
            }

        } catch (error) {
            console.error(error);

            await interaction.editReply(
                "> ❌ Can't delete messages. They might be older than 14 days or missing permissions."
            );
        }

        return;
    }
});



const statuses = [
    'Bienvenue sur Stellwerksim!',
    'Besoin d\'aide? allez dans la section Aide.',
    'Vous aimez STS? Vous pouvez faire en don pour soutenir le projet!',
];

client.once('ready', () => {
    console.log(`🤖 Connecté en tant que ${client.user.tag}`);

    let index = 0;

    const updatePresence = () => {
        client.user.setPresence({
            activities: [
                {
                    name: statuses[index],
                    type: ActivityType.Streaming,
                    url: 'https://www.youtube.com/watch?v=Strcjv5G4OU&t=521s'
                }
            ],
            status: 'online'
        });

        console.log(`Status changed : ${statuses[index]}`);

        index = (index + 1) % statuses.length;
    };

    // Premier status instantané
    updatePresence();

    // Change toutes les 5 minutes
    setInterval(updatePresence, 1 * 60 * 1000);
});


function hasAllowedRole(member) {
  if (!member || !config.ALLOWED_ROLE_ID) return false;
  return member.roles.cache.has(config.ALLOWED_ROLE_ID);
}

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
      return message.reply({
        content: "> ❌ Tu n'as pas la permission d'utiliser cette commande.",
      }).catch(() => {});
    }

    // On envoie un premier message "placeholder" pour obtenir son ID,
    // car les customId des boutons ont besoin de connaître l'ID du message.
    const placeholderEmbed = buildPanelEmbed({ instance1: [], instance2: [] });
    const sentMessage = await message.channel.send({ embeds: [placeholderEmbed] });

    dataStore.createPanel(sentMessage.id, message.channel.id);

    const row = buildPanelButtons(sentMessage.id);
    await sentMessage.edit({ embeds: [placeholderEmbed], components: [row] });

    return;
  }

  // !fsm <@utilisateur | id> -> retire quelqu'un du panel du salon courant
  if (command === 'fsm') {
    if (!hasAllowedRole(message.member)) {
      return message.reply({
        content: "> <:cross:1523326615113961483> Tu n'as pas la permission d'utiliser cette commande.",
      }).catch(() => {});
    }

    const targetUser = message.mentions.users.first();
    const targetId = targetUser ? targetUser.id : args[0];

    if (!targetId) {
      return message.reply({
        content: '> 🔑 Utilisation : `!fsm @utilisateur` ou `!fsm <id>`',
      }).catch(() => {});
    }

    const panelId = dataStore.getLatestPanelIdForChannel(message.channel.id);
    if (!panelId) {
      return message.reply({
        content: "> <:cross:1523326615113961483> Aucun panel actif n'a été trouvé dans ce salon.",
      }).catch(() => {});
    }

    const removed = dataStore.removeUserFromPanel(panelId, targetId);
    if (!removed) {
      return message.reply({
        content: "> <:cross:1523326615113961483> Cet utilisateur n'était présent dans aucune instance du panel.",
      }).catch(() => {});
    }

    await refreshPanelMessage(message.guild, panelId);
    return message.reply({ content: '> <a:tick:1523325573680594966> Utilisateur retiré du panel.' }).catch(() => {});
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

      if (action === 'fs_button') {
        const panel = dataStore.getPanel(messageId);
        const LOG_CHANNEL_ID= "1523249670812467352" // LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
        if (!panel) {
          return interaction.reply({
            content: '> <:cross:1523326615113961483> Ce panel est introuvable ou a expiré.',
            ephemeral: true,
          });
        }

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        const removed = dataStore.removeUserFromPanel(messageId, interaction.user.id);
        if (!removed) {
          return interaction.reply({
            content: "> <:cross:1523326615113961483> Tu n'es actuellement dans aucune instance de ce panel.",
            ephemeral: true,
          });
        }


        const embed_fss_log = {
            color: 0xE91E63,
            title: "Fin de service",
            description: `> 🎮 **${interaction.user.username}** a quitté son poste. `,
            timestamp: new Date(),
            footer: {
                    text: `ID :${interaction.user.id}`
                }
            };

            if (logChannel) {
                await logChannel.send({
                    embeds: [embed_fss_log]
                });
            }


        await refreshPanelMessage(interaction.guild, messageId);
        return interaction.reply({
          content: '> <a:tick:1523325573680594966> Tu as été retiré du panel (fin de service).',
          ephemeral: true,
        });
      }

      return;
    }

    // --- Soumission du modal PS ---
    if (interaction.isModalSubmit()) {
      const [action, messageId] = interaction.customId.split(':');
      if (action !== 'ps_modal') return;

      const LOG_CHANNEL_ID= "1523249670812467352"
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
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);


      const instanceNumber = parseInt(instanceRaw, 10);
      const username = interaction.member?.displayName || interaction.user.username;

      const embed_ps_log = {
            color: 0xE91E63,
            title: "Prise de service",
            description: `> 🎮 **${interaction.user.username}** a pris \`${gare}\` \n > Instance : \`${instanceRaw}\` `,
            timestamp: new Date(),
            footer: {
                    text: `ID :${interaction.user.id}`
                }
            };

            if (logChannel) {
                await logChannel.send({
                    embeds: [embed_ps_log]
                });
            }

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
        content: "> <:cross:1523326615113961483> Une erreur est survenue, réessaie plus tard. \n Merci de bien vouloir DM DeadsLights pour qu'il s'occupe du problème.",
        ephemeral: true,
      }).catch(() => {});
    }
  }
});



client.login(config.TOKEN);