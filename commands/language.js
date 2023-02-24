const db = require("../mongoDB");
module.exports = {
  name: "language",
  description: "It allows you to set the language of the bot.",
  permissions: "0x0000000000000020",
  options: [],
  voiceChannel: false,
  run: async (client, interaction) => {
    let lang = await db?.musicbot?.findOne({ guildID: interaction?.guild?.id })
    lang = lang?.language || client.language
    lang = require(`../languages/${lang}.js`);
    try {
      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Türkçe")
          .setCustomId('tr')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🇹🇷'), 
        new ButtonBuilder()
          .setLabel("English")
          .setCustomId('en')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🇬🇧'),
      )

      let embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle("Select a language")
        .setTimestamp()
        .setFooter({ text: `DcBell 🤖` })
      interaction?.reply({ embeds: [embed], components: [buttons, buttons2] }).then(async Message => {

        const filter = i => i.user.id === interaction?.user?.id
        let col = await Message.createMessageComponentCollector({ filter, time: 30000 });

        col.on('collect', async (button) => {
          if (button.user.id !== interaction?.user?.id) return
          switch (button.customId) {
            case 'tr':
              await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                $set: {
                  language: 'tr'
                }
              }, { upsert: true }).catch(e => { })
              await interaction?.editReply({ content: `Botun dili başarıyla türkçe oldu. :flag_tr:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button?.deferUpdate().catch(e => { })
              await col?.stop()
              break
              
            case 'en':
              await db?.musicbot?.updateOne({ guildID: interaction?.guild?.id }, {
                $set: {
                  language: 'en'
                }
              }, { upsert: true }).catch(e => { })
              await interaction?.editReply({ content: `Bot language successfully changed to english. :flag_gb:`, embeds: [], components: [], ephemeral: true }).catch(e => { })
              await button?.deferUpdate().catch(e => { })
              await col?.stop()
              break
          }
        })

        col.on('end', async (button, reason) => {
          if (reason === 'time') {
            buttons = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(lang.msg45)
                .setCustomId("timeend")
                .setDisabled(true))

            embed = new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setTitle("Time ended, please try again.")
              .setTimestamp()
              .setFooter({ text: `DcBell 🤖` })

            await interaction?.editReply({ embeds: [embed], components: [buttons] }).catch(e => { })
          }
        })
      }).catch(e => { })

    } catch (e) {
      const errorNotifer = require("../functions.js")
     errorNotifer(client, interaction, e, lang)
      }
  },
}
