require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');

const DISBOARD_ID = '302050872383242240';
const DISCADIA_ID = '1222548162741538938';

// Add error checking at the start
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

async function bump(client, channelId, isDisboard) {
    const channel = await client.channels.fetch(channelId);
    
    try {
        const commandId = isDisboard ? DISBOARD_ID : DISCADIA_ID;
        await channel.sendSlash(commandId, 'bump');
        console.count(`Bumped with ${isDisboard ? 'Disboard' : 'Discadia'} using ${client.user.tag}!`);
    } catch (error) {
        console.error(`Error bumping with ${client.user.tag}: ${error.message}`);
    }
}

function startBumping(client, channelId, isDisboard) {
    const randomTime = isDisboard
        ? Math.floor(Math.random() * (15 * 60 * 1000)) + (2 * 60 * 60 * 1000) // 2 to 2 hours 15 minutes
        : Math.floor(Math.random() * (25 * 60 * 60 * 1000)) + (24 * 60 * 60 * 1000); // 24 to 25 hours

    bump(client, channelId, isDisboard);
    setTimeout(() => startBumping(client, channelId, isDisboard), randomTime);
}

// Modified main execution code
try {
    validateEnvironmentVariables();

    // Load tokens and channels from environment variables
    const tokens = [];
    for (let i = 1; i <= 5; i++) {
        const token = process.env[`DISCORD_TOKEN_${i}`];
        const bumpChannel = process.env[`BUMP_CHANNEL_${i}`];
        
        if (token && bumpChannel) {
            tokens.push({ token, bump_channel: bumpChannel });
        }
    }

    // Start clients for each token
    tokens.forEach(({ token, bump_channel }, index) => {
        const client = new Client();

        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
            
            const isDisboard = index % 2 === 0; // Alternate between Disboard and Discadia
            startBumping(client, bump_channel, isDisboard);
        });

        client.login(token).catch(err => {
            console.error(`Failed to login with token ${token.substring(0, 10)}....: ${err.message}`);
        });
    });

} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', error.message); // Red error text
    process.exit(1);
}
