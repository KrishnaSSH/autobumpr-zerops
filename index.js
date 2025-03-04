require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const Redis = require('ioredis');

// Redis configuration
const redis = new Redis('redis://redis:6379');

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

redis.on('connect', () => {
    console.log('Connected to Redis successfully');
});

// Bot IDs for bump commands
const DISBOARD_ID = '302050872383242240';
const DISCADIA_ID = '1222548162741538938';

// Maximum number of bots to run
const MAX_BOTS = 25;

// Bump intervals in milliseconds
const DISBOARD_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const DISCADIA_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const DATA_RETENTION_PERIOD = 2 * 24 * 60 * 60 * 1000; // 2 days

async function getLastBumpTime(botIndex, service) {
    const key = `lastBump:${botIndex}:${service}`;
    const time = await redis.get(key);
    return time ? parseInt(time) : 0;
}

async function setLastBumpTime(botIndex, service) {
    const key = `lastBump:${botIndex}:${service}`;
    await redis.set(key, Date.now(), 'EX', Math.floor(DATA_RETENTION_PERIOD / 1000));
}

async function cleanupOldData() {
    const keys = await redis.keys('lastBump:*');
    const now = Date.now();
    
    for (const key of keys) {
        const time = parseInt(await redis.get(key));
        if (now - time > DATA_RETENTION_PERIOD) {
            await redis.del(key);
        }
    }
}

async function bumpServer(client, channelId, botId, botName, botIndex) {
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.sendSlash(botId, 'bump');
        await setLastBumpTime(botIndex, botName);
        console.log(`[Bot ${botIndex}] Bumped with ${botName} successfully`);
    } catch (error) {
        console.error(`[Bot ${botIndex}] Error bumping with ${botName}: ${error.message}`);
    } finally {
        // Always destroy the client after bumping
        client.destroy();
    }
}

async function performBump(token, channelId, index, botId, botName) {
    const client = new Client({
        checkUpdate: false,
        autoRedeemNitro: false,
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
        await bumpServer(client, channelId, botId, botName, index);
    } catch (error) {
        console.error(`[Bot ${index}] Error during bump attempt: ${error.message}`);
        client.destroy();
    }
}

async function checkAndBump(pair) {
    const { token, channelId, index, useDiscadia } = pair;
    const now = Date.now();

    // Check Disboard
    const lastDisboardBump = await getLastBumpTime(index, 'Disboard');
    if (lastDisboardBump === 0) {
        // No previous bump record, bump immediately
        console.log(`[Bot ${index}] No previous Disboard bump found, bumping now...`);
        await performBump(token, channelId, index, DISBOARD_ID, 'Disboard');
    } else {
        const timeUntilNextBump = DISBOARD_INTERVAL - (now - lastDisboardBump);
        if (timeUntilNextBump <= 0) {
            console.log(`[Bot ${index}] Time for Disboard bump (${Math.abs(Math.floor(timeUntilNextBump/60000))} minutes overdue)`);
            await performBump(token, channelId, index, DISBOARD_ID, 'Disboard');
        } else {
            console.log(`[Bot ${index}] Next Disboard bump in ${Math.floor(timeUntilNextBump/60000)} minutes`);
        }
    }

    // Check Discadia if enabled
    if (useDiscadia) {
        const lastDiscadiaBump = await getLastBumpTime(index, 'Discadia');
        if (lastDiscadiaBump === 0) {
            // No previous bump record, bump immediately
            console.log(`[Bot ${index}] No previous Discadia bump found, bumping now...`);
            await performBump(token, channelId, index, DISCADIA_ID, 'Discadia');
        } else {
            const timeUntilNextBump = DISCADIA_INTERVAL - (now - lastDiscadiaBump);
            if (timeUntilNextBump <= 0) {
                console.log(`[Bot ${index}] Time for Discadia bump (${Math.abs(Math.floor(timeUntilNextBump/60000))} minutes overdue)`);
                await performBump(token, channelId, index, DISCADIA_ID, 'Discadia');
            } else {
                console.log(`[Bot ${index}] Next Discadia bump in ${Math.floor(timeUntilNextBump/60000)} minutes`);
            }
        }
    }
}

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

    for (let i = 1; i <= MAX_BOTS; i++) {
        const token = process.env[`DISCORD_TOKEN_${i}`];
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

async function displayRedisState() {
    console.log('\nChecking Redis for existing bump records...');
    const keys = await redis.keys('lastBump:*');
    
    if (keys.length === 0) {
        console.log('No existing bump records found in Redis');
        return;
    }

    const now = Date.now();
    const records = await Promise.all(keys.map(async (key) => {
        const time = parseInt(await redis.get(key));
        const isDisboard = key.includes('Disboard');
        const interval = isDisboard ? DISBOARD_INTERVAL : DISCADIA_INTERVAL;
        const timeUntilNext = interval - (now - time);
        const status = timeUntilNext <= 0 
            ? `READY TO BUMP (${Math.abs(Math.floor(timeUntilNext/60000))} minutes overdue)`
            : `Next bump in ${Math.floor(timeUntilNext/60000)} minutes`;
        return { 
            key, 
            lastBump: new Date(time).toISOString(),
            status
        };
    }));

    console.log('\nExisting bump records:');
    records.sort((a, b) => a.key.localeCompare(b.key)).forEach(({ key, lastBump, status }) => {
        console.log(`${key}:\n  Last bump: ${lastBump}\n  Status: ${status}`);
    });
    console.log('');
}

async function main() {
    try {
        console.log('\n=== Server Boost Bot Starting ===\n');
        const pairs = validateEnvironmentVariables();
        console.log(`\nInitializing bump checker for ${pairs.length} bots...\n`);

        // Display Redis state before cleanup
        await displayRedisState();

        // Clean up old data on startup
        await cleanupOldData();
        
        // Perform initial checks with a small delay between each bot
        console.log('Performing initial bump checks...');
        for (const pair of pairs) {
            await checkAndBump(pair);
            // Add a 2-second delay between checks to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Check for bumps every minute
        setInterval(async () => {
            await Promise.all(pairs.map(pair => checkAndBump(pair)));
        }, 60000);

        // Clean up old data every 12 hours
        setInterval(async () => {
            await cleanupOldData();
        }, 12 * 60 * 60 * 1000);
        
        console.log('\nBump checker initialized and running!\n');
        
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', error.message);
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await redis.quit();
    process.exit(0);
});

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
