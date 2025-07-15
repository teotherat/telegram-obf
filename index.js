const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');


const botToken = 'your_token'; // bot token


const bot = new Telegraf(botToken);


//@start

bot.on('document', async (ctx) => {
    const file = ctx.message.document;
    const fileName = file.file_name;

    if (!fileName.endsWith('.js')) return;
    const fileId = file.file_id;
    const storageDir = path.join(__dirname, 'storage');
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir);
    }

    const tempInput = path.join(storageDir, 'teotemp.js'); // ubah kalau mau diubah
    const tempOutput = path.join(storageDir, '@teoxor.js'); // ini juga

    try {
        const link = await ctx.telegram.getFileLink(fileId);
        const res = await fetch(link.href);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(tempInput, Buffer.from(buffer));

        const inputPath = `"${tempInput}"`;
        const outputPath = `"${tempOutput}"`;

        const command = `javascript-obfuscator ${inputPath} --output ${outputPath} \
--compact true \
--control-flow-flattening true \
--control-flow-flattening-threshold 1 \
--dead-code-injection true \
--dead-code-injection-threshold 1 \
--debug-protection true \
--debug-protection-interval 4000 \
--identifier-names-generator mangled \
--rename-globals true \
--self-defending true \
--simplify true \
--split-strings true \
--split-strings-chunk-length 3 \
--string-array true \
--string-array-encoding rc4 \
--string-array-index-shift true \
--string-array-threshold 1 \
--unicode-escape-sequence true`;
        exec(command, async (err) => {
            if (err) {
                console.error('❌ Obfuscation failed:', err);
                return ctx.reply('❌ Gagal mengenkripsi file.');
            }

            await ctx.replyWithDocument({ source: tempOutput, filename: 'encrypt.js' });
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        });
    } catch (err) {
        console.error('❌ Error:', err);
        ctx.reply('⚠️ Terjadi kesalahan saat memproses file.');
    }
});

//@start the bot
bot.launch();
console.clear()
console.log("✅ Bot berhasil dijalankan.");
