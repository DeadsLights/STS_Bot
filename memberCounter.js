const { ChannelType } = require("discord.js");

module.exports = {
    name: "memberCounter",

    async start(client, channelId) {

        async function updateCounter() {
            try {
                const channel = await client.channels.fetch(channelId);

                if (!channel) {
                    return console.log("[MemberCounter] Salon introuvable.");
                }

                if (channel.type !== ChannelType.GuildVoice) {
                    return console.log("[MemberCounter] Ce n'est pas un salon vocal.");
                }

                const guild = channel.guild;

                await guild.members.fetch();
                const memberCount = guild.memberCount;

                const newName = `👥・Membres : ${memberCount}`;

                if (channel.name !== newName) {
                    await channel.setName(newName);
                    console.log(`[MemberCounter] Nom mis à jour : ${newName}`);
                }

            } catch (err) {
                console.error("[MemberCounter]", err);
            }
        }

        updateCounter();

        setInterval(updateCounter, 10 * 60 * 1000);
    }
};
