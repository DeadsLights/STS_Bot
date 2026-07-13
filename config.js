require('dotenv').config();

module.exports = {
  TOKEN: process.env.DISCORD_TOKEN,
  PREFIX: process.env.PREFIX || '!',
  ALLOWED_ROLE_ID: process.env.ALLOWED_ROLE_ID,
  HELP_CHANNEL_ID: process.env.HELP_CHANNEL_ID,
  GUILD_ID: process.env.GUILD_ID,
  THUMBNAIL_URL: process.env.THUMBNAIL_URL || 'https://media.discordapp.net/attachments/1523085823363383367/1524452303149465731/image.png?ex=6a531818&is=6a51c698&hm=432c7f552f8c9024625fb5e74fd1db8cf198ab0e60d10922b6e9e0dc7e8b6e92&=&format=webp&quality=lossless&width=960&height=960',
  FOOTER_ICON_URL: process.env.FOOTER_ICON_URL || process.env.THUMBNAIL_URL || 'https://media.discordapp.net/attachments/1523042543670005940/1523052123066208286/n2oos4Rmb9iedzFT8fqI8VxSb_UCgaq4RL8q2Rh-JLXSCU8se5ZvjFw0zT41fWvRVqCfdEFDRgs600-c-k-c0x00ffffff-no-rj-rp-mo.png?ex=6a4ab453&is=6a4962d3&hm=d6b168601f5741a42c590ec9a8a2e3a42396f791009966a0f3377a1d90c92fcd&=&format=webp&quality=lossless',
};
