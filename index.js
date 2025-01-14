require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

// Bot ID for Disboard bump command
const DISBOARD_ID = '302050872383242240';

function validateEnvironmentVariables() {
    let hasValidConfig = false;
    const errors = [];

    for (let i = 1; i <= 5; i++) {
        const token = process.env[`DISCORD_TOKEN_${i}`];
        const bumpChannel = process.env[`BUMP_CHANNEL_${i}`];
        
        if (token && !bumpChannel) {
            errors.push(`BUMP_CHANNEL_${i} is missing for DISCORD_TOKEN_${i}`);
        } else if (!token && bumpChannel) {
            errors.push(`DISCORD_TOKEN_${i} is missing for BUMP_CHANNEL_${i}`);
        } else if (token && bumpChannel) {
            hasValidConfig = true;
        }
    }

    if (!hasValidConfig) {
        errors.unshift('No valid token and channel pairs found in .env file');
        throw new Error('Environment Configuration Error:\n' + errors.join('\n'));
    }

    if (errors.length > 0) {
        console.warn('Warning: Some configuration issues found:\n' + errors.join('\n'));
    }
}

async function bumpWithClient(token, channelId) {
    const client = new Client();
    
    try {
        await client.login(token);
        console.log(`Logged in as ${client.user.tag}`);
        
        const channel = await client.channels.fetch(channelId);
        await channel.sendSlash(DISBOARD_ID, 'bump');
        console.log(`Bumped successfully with ${client.user.tag}`);
    } catch (error) {
        console.error(`Error with token ${token.slice(0, 10)}...: ${error.message}`);
    } finally {
        // Always destroy the client to clean up
        client.destroy();
    }
}

async function startBumpLoop() {
    try {
        validateEnvironmentVariables();

        // Get valid token/channel pairs
        const pairs = [];
        for (let i = 1; i <= 5; i++) {
            const token = process.env[`DISCORD_TOKEN_${i}`];
            const channelId = process.env[`BUMP_CHANNEL_${i}`];
            if (token && channelId) {
                pairs.push({ token, channelId });
            }
        }

        while (true) {
            console.log('Starting bump cycle...');
            
            // Process each account sequentially
            for (const pair of pairs) {
                await bumpWithClient(pair.token, pair.channelId);
                // Wait 5 seconds between accounts
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

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
