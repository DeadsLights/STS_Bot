require('dotenv').config();

module.exports = {
  TOKEN: process.env.DISCORD_TOKEN,
  PREFIX: process.env.PREFIX || '!',
  ALLOWED_ROLE_ID: process.env.ALLOWED_ROLE_ID,
  HELP_CHANNEL_ID: process.env.HELP_CHANNEL_ID,
  GUILD_ID: process.env.GUILD_ID,
  BLACKLIST_ROLE_ID: process.env.BLACKLIST_ROLE_ID,
  BL_COMMAND_ROLE_ID: process.env.BL_COMMAND_ROLE_ID,
  THUMBNAIL_URL: process.env.THUMBNAIL_URL || 'https://media.discordapp.net/attachments/1523087973632053268/1524448134539903158/89F71DCF-15D4-4B2D-A548-5D2347937120.jpg?ex=6a585a36&is=6a5708b6&hm=1ae7fc50b68648494676e110b84e14809e1d13e2e8ed3f137e8476f19c4e97ad&=&format=webp&width=960&height=960',
  FOOTER_ICON_URL: process.env.FOOTER_ICON_URL || process.env.THUMBNAIL_URL || 'https://media.discordapp.net/attachments/1523042543670005940/1523052123066208286/n2oos4Rmb9iedzFT8fqI8VxSb_UCgaq4RL8q2Rh-JLXSCU8se5ZvjFw0zT41fWvRVqCfdEFDRgs600-c-k-c0x00ffffff-no-rj-rp-mo.png?ex=6a4ab453&is=6a4962d3&hm=d6b168601f5741a42c590ec9a8a2e3a42396f791009966a0f3377a1d90c92fcd&=&format=webp&quality=lossless',
};
