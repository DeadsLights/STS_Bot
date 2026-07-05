require('dotenv').config();

module.exports = {
  TOKEN: process.env.DISCORD_TOKEN,
  PREFIX: process.env.PREFIX || '!',
  ALLOWED_ROLE_ID: process.env.ALLOWED_ROLE_ID,
  HELP_CHANNEL_ID: process.env.HELP_CHANNEL_ID,
  GUILD_ID: process.env.GUILD_ID,
  THUMBNAIL_URL: process.env.THUMBNAIL_URL || 'https://media.discordapp.net/attachments/1523042543670005940/1523052123066208286/n2oos4Rmb9iedzFT8fqI8VxSb_UCgaq4RL8q2Rh-JLXSCU8se5ZvjFw0zT41fWvRVqCfdEFDRgs600-c-k-c0x00ffffff-no-rj-rp-mo.png?ex=6a4ab453&is=6a4962d3&hm=d6b168601f5741a42c590ec9a8a2e3a42396f791009966a0f3377a1d90c92fcd&=&format=webp&quality=lossless',
  FOOTER_ICON_URL: process.env.FOOTER_ICON_URL || process.env.THUMBNAIL_URL || 'https://media.discordapp.net/attachments/1523042543670005940/1523052123066208286/n2oos4Rmb9iedzFT8fqI8VxSb_UCgaq4RL8q2Rh-JLXSCU8se5ZvjFw0zT41fWvRVqCfdEFDRgs600-c-k-c0x00ffffff-no-rj-rp-mo.png?ex=6a4ab453&is=6a4962d3&hm=d6b168601f5741a42c590ec9a8a2e3a42396f791009966a0f3377a1d90c92fcd&=&format=webp&quality=lossless',
};
