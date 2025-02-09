require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

// Bot ID for Disboard bump command
const DISBOARD_ID = '302050872383242240';

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

    // Keep checking for tokens until we find one that doesn't exist
    while (true) {
        const token = process.env[`DISCORD_TOKEN_${i}`];
        const channelId = process.env[`BUMP_CHANNEL_${i}`];

        if (!token && !channelId) {
            break; // Stop when we don't find any more pairs
        }

        if (token && channelId) {
            pairs.push({ token, channelId, index: i });
        } else {
            console.warn(`Warning: Incomplete pair for index ${i}`);
        }

        i++;
    }

    return pairs;
}

async function bumpWithClient(token, channelId, index) {
    const client = new Client();
    
    try {
        await client.login(token);
        console.log(`[Bot ${index}] Logged in as ${client.user.tag}`);
        
        const channel = await client.channels.fetch(channelId);
        await channel.sendSlash(DISBOARD_ID, 'bump');
        console.log(`[Bot ${index}] Bumped successfully with ${client.user.tag}`);
    } catch (error) {
        console.error(`[Bot ${index}] Error with token ${token.slice(0, 10)}...: ${error.message}`);
    } finally {
        client.destroy();
    }
}

async function startBumpLoop() {
    try {
        const pairs = validateEnvironmentVariables();

        while (true) {
            console.log(`Starting bump cycle with ${pairs.length} bots concurrently...`);
            
            // Process all accounts concurrently
            await Promise.all(pairs.map(({ token, channelId, index }) => 
                bumpWithClient(token, channelId, index)
            ));

            // Wait 2 hours and 15 minutes before next cycle
            console.log('Bump cycle complete. Waiting 2h15m before next cycle...');
            await new Promise(resolve => setTimeout(resolve, 8100000));
        }
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', error.message);
        process.exit(1);
    }
}

// Start the bump loop
startBumpLoop().catch(error => {
    console.error('Fatal error in bump loop:', error);
    process.exit(1);
});
