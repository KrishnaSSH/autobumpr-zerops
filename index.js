require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

// Bot IDs for bump commands
const DISBOARD_ID = '302050872383242240';
const DISCADIA_ID = '1222548162741538938';

function validateEnvironmentVariables() {
    const pairs = getAllConfigPairs();
    
    if (pairs.length === 0) {
        throw new Error('No valid token and channel pairs found in .env file');
    }

    console.log(`Found ${pairs.length} valid token/channel pairs`);
    return pairs;
}

function getAllConfigPairs() {
    const pairs = [];
    let i = 1;

    while (true) {
        const token = process.env[`DISCORD_TOKEN_${i}`];
        const channelId = process.env[`BUMP_CHANNEL_${i}`];

        if (!token && !channelId) break;

        if (token && channelId) {
            pairs.push({ token, channelId, index: i });
        }

        i++;
    }

    return pairs;
}

async function bumpServer(client, channelId, botId, botName) {
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.sendSlash(botId, 'bump');
        console.log(`[${client.user.tag}] Bumped with ${botName} successfully`);
    } catch (error) {
        console.error(`[${client.user.tag}] Error bumping with ${botName}: ${error.message}`);
    }
}

async function startBumpLoop(token, channelId, index) {
    const client = new Client();
    
    try {
        await client.login(token);
        console.log(`[Bot ${index}] Logged in as ${client.user.tag}`);

        // Initial bumps
        await bumpServer(client, channelId, DISBOARD_ID, 'Disboard');
        await bumpServer(client, channelId, DISCADIA_ID, 'Discadia');

        // Set up recurring bumps
        setInterval(async () => {
            await bumpServer(client, channelId, DISBOARD_ID, 'Disboard');
        }, 2 * 60 * 60 * 1000 + Math.random() * 15 * 60 * 1000); // 2h + random 15min

        setInterval(async () => {
            await bumpServer(client, channelId, DISCADIA_ID, 'Discadia');
        }, 24 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000); // 24h + random 1h

    } catch (error) {
        console.error(`[Bot ${index}] Error: ${error.message}`);
        client.destroy();
    }
}

async function main() {
    try {
        const pairs = validateEnvironmentVariables();
        
        // Start all bots concurrently
        const promises = pairs.map(({ token, channelId, index }) => 
            startBumpLoop(token, channelId, index)
        );

        await Promise.all(promises);
        
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', error.message);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
