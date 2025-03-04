# Autobumpr-v2

A Discord selfbot that automatically bumps your server using Disboard. Supports multiple accounts for frequent bumping.

## Import & Deploy on Zerops


https://github.com/user-attachments/assets/f7821a15-5fad-4561-8bcf-0d7f190f0e97


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
    envSecrets:
      DISCORD_TOKEN_1: MTI5NDQwMzgwODMwMjIwMjg5MAjfwhkfe214kj2
      BUMP_CHANNEL_1: 837841234981489
      USE_DISCADIA_1: TRUE
      DISCORD_TOKEN_2: MTI5NDQwMzgwODMwMjIwMjg5MAjfwhkfe214kj2
      BUMP_CHANNEL_2: 837841234981489
      # Add more pairs as needed (above envs are just examples)

  - hostname: redis
    type: valkey@7.2
    mode: NON_HA
    priority: 10
```

> Note: Make sure to add your tokens and channel ids in the envs section.

Import autobumpr-v2 on Zerops with a single click and configure environment variables directly in the Zerops dashboard.

### Cost Estimate
- Pay $10 to deploy and run for 2+ years
- You get up to $65 in free credits:
  - $15 signup bonus
  - $50 when you add $10 to your account

### Alternative Payment
If you don't have a credit card, you can:
1. Join our [Discord server](https://discord.gg/cq5R2fF8sZ)
2. Pay $10 via PayPal
3. We'll help you set up your deployment


> [!NOTE]
> If you create multiple zerops accounts and exploit them, you will be banned from Zerops.


### Adding ENVs (Token and Channel ID)

https://github.com/user-attachments/assets/ebaa888d-5e22-4fc0-8407-1256848056de

------

## Features

- Automatic bumping with Disboard (2h intervals)
- Support for up to 5 different Discord accounts
- Random delays to avoid detection
- Environment-based configuration
- Error handling and validation

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/krishnassh/autobumper-zerops.git
cd autobumper-zerops
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
- Join our [Discord server](https://discord.gg/cq5R2fF8sZ).
