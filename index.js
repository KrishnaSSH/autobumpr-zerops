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

async function bump(client, channelId) {
    const channel = await client.channels.fetch(channelId);
    
    try {
        await channel.sendSlash(DISBOARD_ID, 'bump');
        console.count(`Bumped with Disboard using ${client.user.tag}!`);
    } catch (error) {
        console.error(`Error bumping with ${client.user.tag}: ${error.message}`);
    }
}

function startBumping(client, channelId) {
    // Random delay between bumps: 2h to 2h15m
    const randomTime = Math.floor(Math.random() * (15 * 60 * 1000)) + (2 * 60 * 60 * 1000);

    bump(client, channelId);
    setTimeout(() => startBumping(client, channelId), randomTime);
}

try {
    validateEnvironmentVariables();

    // Initialize tokens array from environment variables
    const tokens = [];
    for (let i = 1; i <= 5; i++) {
        const token = process.env[`DISCORD_TOKEN_${i}`];
        const bumpChannel = process.env[`BUMP_CHANNEL_${i}`];
        
        if (token && bumpChannel) {
            tokens.push({ token, bump_channel: bumpChannel });
        }
    }

    // Start a client for each token
    tokens.forEach(({ token, bump_channel }) => {
        const client = new Client();

        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
            startBumping(client, bump_channel);
        });

        client.login(token).catch(err => {
            console.error(`Failed to login with token ${token.substring(0, 10)}....: ${err.message}`);
        });
    });

} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', error.message);
    process.exit(1);
}
