# Mystery Grid Game - Deployment Guide

This guide explains how to publish your game to the internet for free using **Render.com**.

## 1. Preparation
1. Create a GitHub account if you don't have one.
2. Create a **New Repository** on GitHub (e.g., `mystery-grid-game`).
3. Upload your project files to this repository.
   - If using Git command line:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/mystery-grid-game.git
     git push -u origin main
     ```
   - Alternatively, use GitHub Desktop or drag-and-drop on the website.

## 2. Deploy to Render.com
1. Sign up/Log in to [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `mystery-grid-game` repository.
4. Configure the service:
   - **Name**: `mystery-grid-game` (or unique name)
   - **Environment**: `Node`
   - **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `cd server && npm start`
5. Select **Free** plan.
6. Click **Create Web Service**.

## 3. Play!
Render will take a few minutes to build. Once done, it will give you a URL (e.g., `https://mystery-grid-game.onrender.com`).
Share this link with your friends to play!

## Troubleshooting
- **Build Fails?** Check the logs. Ensure `client/dist` is created during build.
- **Game doesn't load?** Ensure the Start Command is running the server (`node index.js`).
