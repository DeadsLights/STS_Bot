module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    try {
      if (message.author?.bot) return;


      const content = String(message.content).toLowerCase().trim();

                            if (content === 'deadslights') {
        return message.channel.send(">  Ce mec est un génie (vraiment) <:cerveauenorme:1522955860177981520>");
      }


                                  if (content === 'gare du nord') {
        return message.channel.send("> Selon le *Roi DeadsLights*, Paris Gare du Nord est la meilleur gare terminus dans la zone de Paris. Tout ceux qui s'opposent à cette affirmation se retrouveront **ban** <:pascontent:1522958491080200322>.");
      }
    } catch (err) {
      console.error('Erreur dans messageCreate handler:', err);
    }
  });
};
