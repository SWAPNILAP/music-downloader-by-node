//* Import External Modules
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

//* Import Internal Modules
const YoutubeDownloader = require('./utils/youtube-downloader');
const ScdlDownloader = require('./utils/soundcloud-downloader');
const fs = require('fs');

//* Init Configs
require('dotenv').config({path: 'config/config.env'});
const keyboards = require('./utils/markups');
const connectDB = require('./config/db');
const { enDic, faDic } = require('./utils/dialogs');

//* DB
connectDB();
const { getStatus, createUser, setStatus, setLang, getLang, getQuality, setQuality } = require('./utils/user');

const bot = new Telegraf(process.env.BOT_TOKEN);

//* START CODING HERE

//? AUTH USER
bot.start(ctx => {
    ctx.reply(`Welcome ${ctx.chat.first_name}!\nPlease choose your language`, {
        reply_markup: keyboards.langKeyoard.reply_markup
    });
    createUser(ctx, { chatId: ctx.chat.id, firstName: ctx.chat.first_name, status: 'IN_LANG_MENU', lang: 'EN', quality: 128 });
});

bot.hears('En', async ctx => {
    if (await getStatus(ctx) === 'IN_LANG_MENU') {
        setLang(ctx, 'EN')
        setStatus(ctx, 'MAIN');
        ctx.reply(`Language set's to EN`, {
            reply_to_message_id: ctx.message.message_id
        });

        ctx.reply(enDic.dialogInMainMenu, {
            reply_markup: keyboards.mainKeyboard(enDic).reply_markup
        });
    }
});

bot.hears('Fa', async ctx => {
    if (await getStatus(ctx) === 'IN_LANG_MENU') {
        setLang(ctx, 'FA')
        setStatus(ctx, 'MAIN');
        ctx.reply('زبان به فارسی تغییر کرد', {
            reply_to_message_id: ctx.message.message_id,
            reply_markup: Markup.removeKeyboard().reply_markup
        });

        ctx.reply(faDic.dialogInMainMenu, {
            reply_markup: keyboards.mainKeyboard(faDic).reply_markup
        });
    }
});

//? EN
bot.hears(enDic.keyboardSearch, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        await setStatus(ctx, 'IN_SEARCHING');
        ctx.reply(enDic.dialogEnterMusicNameToSearch, {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
    }
});

bot.hears(enDic.keyboardSpotifyLink, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        ctx.reply(enDic.dialogForbinned);
    }
});

bot.hears(enDic.keyboardSoundcloudLink, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        await setStatus(ctx, 'IN_SOUNDCLOUD_LINK');
        await ctx.reply('- - - - - - - - - - - - - - - - -', {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
        ctx.reply(enDic.dialogEnterSCDLLink, {
            reply_markup: keyboards.backBtnKeyboard(enDic).reply_markup
        });
    }
});

bot.hears(enDic.keyboardYoutubeLink, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        await setStatus(ctx, 'IN_YOUTUBE_LINK');
        await ctx.reply('- - - - - - - - - - - - - - - - -', {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
        ctx.reply(enDic.dialogEnterYTLink, {
            reply_markup: keyboards.backBtnKeyboard(enDic).reply_markup
        });
    }
});

bot.hears(enDic.keyboardSettings, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        ctx.reply(enDic.dialogInSetting, {
            reply_markup: keyboards.settingsKeyboard(enDic).reply_markup
        });
    }
});

//? EN Setting's
bot.hears(enDic.keyboardChangeLang, async ctx => {
    if (await getStatus(ctx) === 'MAIN'){
        await setStatus(ctx, 'IN_LANG_MENU');
        await ctx.reply('- - - - - - - - - - - - - - - - -', {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
        ctx.reply(`${enDic.keyboardChangeLang}\n${enDic.dialogCurrent} ${enDic.lang}`, {
            reply_markup: keyboards.langKeyoard.reply_markup
        });
    }
});

bot.hears(enDic.keyboardChangeQuality, async ctx => {
    if (await getStatus(ctx) === 'MAIN'){
        await setStatus(ctx, 'IN_QUALITY_SETTING');
        await ctx.reply('- - - - - - - - - - - - - - - - -', {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
        const current = await getQuality(ctx);
        ctx.reply(`${enDic.keyboardChangeQuality}\n${enDic.dialogCurrent} ${current}`, {
            reply_markup: keyboards.qualitySelectKeyboard(enDic).reply_markup
        });
    }
});

//? EN OPT
bot.hears(enDic.inlineKeyBack, async ctx => {
    await setStatus(ctx, 'MAIN');
    ctx.reply(enDic.dialogInMainMenu, {
        reply_markup: keyboards.mainKeyboard(enDic).reply_markup
    });
});

bot.action(enDic.inlineKeyBack, async ctx => {
    if (await getStatus(ctx) !== 'MAIN') {
        await setStatus(ctx, 'MAIN');
        ctx.reply(enDic.dialogInMainMenu, {
            reply_markup: keyboards.mainKeyboard(enDic).reply_markup
        });
    }
});

//? FA
bot.hears(faDic.keyboardSearch, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        if (await getStatus(ctx) === 'MAIN') {
            await setStatus(ctx, 'IN_SEARCHING');
            ctx.reply(faDic.dialogEnterMusicNameToSearch);
        }
    }
});

bot.hears(faDic.keyboardSpotifyLink, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        ctx.reply(enDic.dialogForbinned);
    }
});

bot.hears(faDic.keyboardSoundcloudLink, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        await setStatus(ctx, 'IN_SOUNDCLOUD_LINK');
        await ctx.reply('- - - - - - - - - - - - - - - - -', {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
        ctx.reply(faDic.dialogEnterSCDLLink, {
            reply_markup: keyboards.backBtnKeyboard(faDic).reply_markup
        });
    }
});

bot.hears(faDic.keyboardYoutubeLink, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        if (await getStatus(ctx) === 'MAIN') {
            await setStatus(ctx, 'IN_YOUTUBE_LINK');
            await ctx.reply('- - - - - - - - - - - - - - - - -', {
                reply_markup: Markup.removeKeyboard().reply_markup
            });
            ctx.reply(faDic.dialogEnterYTLink, {
                reply_markup: keyboards.backBtnKeyboard(faDic).reply_markup
            });
        }
    }
});

bot.hears(faDic.keyboardSettings, async ctx => {
    if (await getStatus(ctx) === 'MAIN') {
        ctx.reply(faDic.dialogInSetting, {
            reply_markup: keyboards.settingsKeyboard(faDic).reply_markup
        });
    }
});

//? FA Setting's
bot.hears(faDic.keyboardChangeLang, async ctx => {
    if (await getStatus(ctx) === 'MAIN'){
        await setStatus(ctx, 'IN_LANG_MENU');
        await ctx.reply('- - - - - - - - - - - - - - - - -', {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
        ctx.reply(`${faDic.keyboardChangeLang}\n${faDic.dialogCurrent} ${faDic.lang}`, {
            reply_markup: keyboards.langKeyoard.reply_markup
        });
    }
});

bot.hears(faDic.keyboardChangeQuality, async ctx => {
    if (await getStatus(ctx) === 'MAIN'){
        await setStatus(ctx, 'IN_QUALITY_SETTING');
        await ctx.reply('- - - - - - - - - - - - - - - - -', {
            reply_markup: Markup.removeKeyboard().reply_markup
        });
        const current = await getQuality(ctx);
        ctx.reply(`${faDic.keyboardChangeQuality}\n${faDic.dialogCurrent} ${current}`, {
            reply_markup: keyboards.qualitySelectKeyboard(faDic).reply_markup
        });
    }
});

//? FA OPT
bot.action(faDic.inlineKeyBack, async ctx => {
    if (await getStatus(ctx) !== 'MAIN') {
        await setStatus(ctx, 'MAIN');
        ctx.reply(faDic.dialogInMainMenu, {
            reply_markup: keyboards.mainKeyboard(faDic).reply_markup
        });
    }
});

//? EVENT'S
bot.on('message', async ctx => {
    const status = await getStatus(ctx);
    const dic = await getLang(ctx) === 'EN' ? enDic : faDic;
    const bitrate = await getQuality(ctx);

    if (status === 'IN_SEARCHING') {
        try {
            const res = await axios.get(`https://api.spotify.com/v1/search?q=${ctx.message.text}&type=track&include_external=audio`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SPOTIFY_TOKEN}`
                }
            });

            //! NOT COMPLETED
            await setStatus(ctx, 'MAIN');
            ctx.reply(`Answer from spotify:\n${res}`);
        } catch (err) {

            if (err.code === 'ERR_BAD_REQUEST') {
                await setStatus(ctx, 'MAIN');
                return ctx.reply(dic.dialogForbinned, {
                    reply_markup: keyboards.mainKeyboard(dic).reply_markup
                });
            }
            await setStatus(ctx, 'MAIN');
            console.log(err);
        }
    } else if (status === 'IN_YOUTUBE_LINK') {
        const msg = await ctx.reply(dic.dialogDownloadStarting, {
            reply_markup: Markup.removeKeyboard().reply_markup
        });

        const link = `https://www.youtube.com/watch?v=${ctx.message.text.substring(ctx.message.text.lastIndexOf('/')+1)}`;
        const downloader = new YoutubeDownloader({
            link: link,
            quality: 'highestaudio',
            bitrate
        });

        downloader.on('error', err => {
            if (err.message === 'BAD_LINK') {
                ctx.reply(dic.dialogBadLink, {
                    reply_to_message_id: ctx.message.message_id,
                    reply_markup: keyboards.mainKeyboard(dic).reply_markup
                });
            }else {
                setStatus(ctx, 'MAIN');
                ctx.reply(dic.dialogDownloadFailed, {
                    reply_to_message_id: ctx.message.message_id,
                    reply_markup: keyboards.mainKeyboard(dic).reply_markup
                });
                console.log(err);
            }
        });

        downloader.on('progress', progress => {
            //bot.telegram.editMessageText(ctx.from.id, msg.message_id, undefined, `${dic.dialogDownloading} (${progress.progress}%)`);
            ctx.reply(`${dic.dialogDownloading} (${parseInt(progress.progress)}%)`);
            if (progress.progress === 100) ctx.reply(dic.dialogYTUploading);
        });

        downloader.on('finished', async data => {
            await ctx.replyWithAudio({source: data.path}, {
                caption: `Downloaded by @bestMusicDownloaderBot`,
                reply_markup: keyboards.mainKeyboard(dic).reply_markup
            });
            fs.unlink(data.path, err => {
                if (err) throw err;
                setStatus(ctx, 'MAIN');
            });
        });

        downloader.startDownload();
    } else if (status === 'IN_SOUNDCLOUD_LINK') {
        const downloader = new ScdlDownloader(ctx.message.text, bitrate);

        downloader.on('error', err => {
            setStatus(ctx, 'MAIN');
                ctx.reply(dic.dialogDownloadFailed, {
                    reply_to_message_id: ctx.message.message_id,
                    reply_markup: keyboards.mainKeyboard(dic).reply_markup
                });
                console.log(err);
        });

        downloader.on('download-started', () => {
            ctx.reply(dic.dialogDownloading);
        });

        downloader.on('finished', async data => {
            ctx.reply(dic.dialogYTUploading);
            await ctx.replyWithAudio({source: data.path}, {
                caption: `Downloaded by @bestMusicDownloaderBot`,
                reply_markup: keyboards.mainKeyboard(dic).reply_markup
            });
            fs.unlink(data.path, err => {
                if (err) throw err;
                setStatus(ctx, 'MAIN');
            });
        });

        ctx.reply(dic.dialogWaitingForSCDL);

        downloader.startDownload();
    }else if (status === 'IN_QUALITY_SETTING') {
        const dic = await getLang(ctx) === 'EN' ? enDic : faDic;
        switch (ctx.message.text) {
            case '⚪ 128':
                await setQuality(ctx, 128);
                await setStatus(ctx, 'MAIN');
                await ctx.reply(`${dic.dialogQualityChanged} 128`);
                ctx.reply(dic.dialogInMainMenu, {
                    reply_markup: keyboards.mainKeyboard(dic).reply_markup
                });
                break;
            
            case '🟢 320':
                await setQuality(ctx, 320);
                await setStatus(ctx, 'MAIN');
                await ctx.reply(`${dic.dialogQualityChanged} 320`);
                ctx.reply(dic.dialogInMainMenu, {
                    reply_markup: keyboards.mainKeyboard(dic).reply_markup
                });
                break;
        
            default:
                break;
        }
    }
});

//* END CODING HERE

const start = async () => {
    try {
        await bot.launch();
        console.log('Bot is online!')
    } catch (err) {
        console.log(err);
    }
}

start();