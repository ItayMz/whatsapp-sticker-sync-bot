const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log("Scan the QR code to authenticate:");
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is connected and ready!');
});

const groupNames = ["C1", "C2", "C3", "C4"];
let groupChats = {};

client.on('message', async msg => {
    const chat = await msg.getChat();

    if (msg.type === 'sticker') {
        console.log(`Sticker received in group: ${chat.name}`);

        if (groupNames.includes(chat.name)) {
            console.log(`Group ${chat.name} is in the list, forwarding to other groups...`);

            if (Object.keys(groupChats).length === 0) {
                const chats = await client.getChats();
                groupNames.forEach(name => {
                    const g = chats.find(c => c.name === name);
                    if (g) groupChats[name] = g;
                });
            }

            for (const [name, gchat] of Object.entries(groupChats)) {
                if (name !== chat.name) {
                    console.log(`Forwarding sticker to group: ${name}`);
                    const media = await msg.downloadMedia();
                    if (media) {
                        gchat.sendMessage(media, { sendMediaAsSticker: true });
                    } else {
                        console.log("Failed to download the sticker.");
                    }
                }
            }
        }
    }
});
client.initialize();