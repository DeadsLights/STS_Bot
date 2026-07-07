module.exports = (client) => {
  // Utiliser UN SEUL listener et router les réponses
  client.on('messageCreate', async (message) => {
    try {
      if (message.author?.bot) return;

      // contenu normalisé pour les checks
      const content = String(message.content).toLowerCase().trim();

      // Réponses simples (exemples)
                            if (content === 'cemo') {
        return message.channel.send("> Il me sequestre tous les jours (au secours <:skullcry:1522949351612219402>)");
      }

                            if (content === 'deadslights') {
        return message.channel.send(">  Ce mec est un génie <:cerveauenorme:1522955860177981520>");
      }

                                  if (content === 'gare du nord') {
        return message.channel.send("> Selon le *Roi DeadsLights*, Paris Gare du Nord est la meilleur gare terminus dans la zone de Paris. Tout ceux qui s'opposent à cette affirmation se retrouveront **ban** <:pascontent:1522958491080200322>.");
      }


      // autres handlers...
    } catch (err) {
      console.error('Erreur dans messageCreate handler:', err);
    }
  });
};