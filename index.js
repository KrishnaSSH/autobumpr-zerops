require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

// Bot IDs for bump commands
const DISBOARD_ID = '302050872383242240';
const DISCADIA_ID = '1222548162741538938';

// Maximum number of bots to run (matching your .env file)
const MAX_BOTS = 25;

function validateEnvironmentVariables() {
    const pairs = getAllConfigPairs();
    
    if (pairs.length === 0) {
        throw new Error('No valid token and channel pairs found in .env file');
    }

    console.log(`Found ${pairs.length} valid token/channel pairs`);
    pairs.forEach(({ index }) => {
        console.log(`✓ Bot ${index} configuration validated`);
    });
    return pairs;
}

function getAllConfigPairs() {
    const pairs = [];

    // Check all possible pairs up to MAX_BOTS
    for (let i = 1; i <= MAX_BOTS; i++) {
        const token = process.env[`TOKEN_${i}`];
        const channelId = process.env[`BUMP_CHANNEL_${i}`];
        const useDiscadia = process.env[`USE_DISCADIA_${i}`] === 'TRUE';

        if (token && channelId) {
            pairs.push({ 
                token, 
                channelId, 
                index: i,
                useDiscadia 
            });
            if (useDiscadia) {
                console.log(`Bot ${i} has Discadia enabled`);
            }
        } else if (token || channelId) {
            console.warn(`⚠️ Bot ${i} has incomplete configuration - missing ${!token ? 'token' : 'channel ID'}`);
        }
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

async function startBumpLoop(token, channelId, index, useDiscadia) {
    const client = new Client({
        checkUpdate: false,
        autoRedeemNitro: false,
        intents: [
            'GUILDS',
            'GUILD_MESSAGES',
            'GUILD_MESSAGE_REACTIONS',
            'DIRECT_MESSAGES'
        ],
        ws: {
            properties: {
                browser: 'Discord Client',
                os: 'Windows',
                device: 'Discord Client'
            }
        }
    });
    
    try {
        await client.login(token);
        console.log(`[Bot ${index}] Logged in as ${client.user.tag}`);

        // Add small random delay before initial bumps to prevent rate limiting
        const initialDelay = Math.random() * 30 * 1000; // Random delay up to 30 seconds
        await new Promise(resolve => setTimeout(resolve, initialDelay));

        // Initial Disboard bump
        await bumpServer(client, channelId, DISBOARD_ID, 'Disboard');
        
        // Initial Discadia bump if enabled
        if (useDiscadia) {
            await bumpServer(client, channelId, DISCADIA_ID, 'Discadia');
        }

        // Set up recurring Disboard bumps with random offset
        const disboardInterval = 2 * 60 * 60 * 1000; // 2 hours
        const disboardOffset = Math.random() * 15 * 60 * 1000; // Random 15min offset

        setInterval(async () => {
            await bumpServer(client, channelId, DISBOARD_ID, 'Disboard');
        }, disboardInterval + disboardOffset);

        // Set up recurring Discadia bumps if enabled
        if (useDiscadia) {
            const discadiaInterval = 24 * 60 * 60 * 1000; // 24 hours
            const discadiaOffset = Math.random() * 60 * 60 * 1000; // Random 1h offset

            setInterval(async () => {
                await bumpServer(client, channelId, DISCADIA_ID, 'Discadia');
            }, discadiaInterval + discadiaOffset);
        }

    } catch (error) {
        console.error(`[Bot ${index}] Error: ${error.message}`);
        // Attempt to reconnect after delay if login fails
        setTimeout(() => {
            console.log(`[Bot ${index}] Attempting to reconnect...`);
            startBumpLoop(token, channelId, index, useDiscadia);
        }, 5 * 60 * 1000); // Wait 5 minutes before retry
        client.destroy();
    }
}

async function main() {
    try {
        console.log('\n=== Server Boost Bot Starting ===\n');
        const pairs = validateEnvironmentVariables();
        console.log(`\nStarting ${pairs.length} bots...\n`);
        
        // Start all bots concurrently with small delays between each
        for (const { token, channelId, index, useDiscadia } of pairs) {
            // Add small delay between starting each bot to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            startBumpLoop(token, channelId, index, useDiscadia)
                .catch(error => console.error(`Failed to start Bot ${index}:`, error));
        }
        
        console.log('\nAll bots initialized!\n');
        
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', error.message);
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down bots...');
    process.exit(0);
});

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
