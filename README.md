# Autobumpr-v2

A Discord selfbot that automatically bumps your server using Disboard and Discadia. Supports multiple accounts with alternating bump services.

## Import & Deploy on Zerops

### Option 1: One-Click Deploy
```yaml
project:
  name: discord-bots
  tags:
    - krishnassh

services:
  - hostname: autobumpr
    type: nodejs@20
    buildFromGit: https://github.com/krishnassh/autobumpr-zerops
```

Import autobumpr-v2 on Zerops with a single click and configure environment variables directly in the Zerops dashboard.

### Cost Estimate
- Pay $10 to deploy and run for 2+ years
- You get up to $65 in free credits:
  - $15 signup bonus
  - $50 when you add $10 to your account

### Alternative Payment
If you don't have a credit card, you can:
1. Join our [Discord server](https://discord.gg/FC45ymTanp)
2. Pay $10 via PayPal
3. We'll help you set up your deployment


> [!NOTE]
> If you create multiple zerops accounts and exploit them, you will be banned from Zerops.


------

## Features

- Automatic bumping with Disboard (2h intervals) and Discadia (24h intervals)
- Support for up to 5 different Discord accounts
- Random delays to avoid detection
- Environment-based configuration
- Error handling and validation

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/yourusername/autobumpr-v2.git
cd autobumpr-v2
```

2. Install dependencies
```bash
npm install
# or using pnpm
pnpm install
```

3. Configure environment variables
- Copy `.env.example` to `.env`
- Edit `.env` with your Discord tokens and channel IDs:
```env
DISCORD_TOKEN_1=your_token_here
BUMP_CHANNEL_1=channel_id_here
# Add up to 5 pairs as needed
```

4. Start the bot
```bash
npm start
# or using pnpm
pnpm start
```

## Credits

This is a fork of [KrishnaSSH/autobumpr-v2](https://github.com/krishnaSSH/autobumpr-v2) with additional features and improvements.

## Important Notes

- Using selfbots is against Discord's Terms of Service
- Use this bot at your own risk
- We recommend using alternate accounts, not your main account

## Support

For support, feature requests, or issues:
- Open an issue on GitHub
- Join our [Discord server](https://discord.gg/FC45ymTanp).
