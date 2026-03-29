# Kimaru - Make a Decision For Us!

## 💡 Inspiration
Hard decisions can come from anywhere. Whether you're trying to figure something out by yourself or stuck in "analysis paralysis" with a group of friends trying to decide on plans, things get complicated fast. We wanted a tool that helps weigh several different factors at once and actually finds viable options in real time.

## 🛠️ What it does
Kimaru uses Google Gemini AI to untangle your group's conflicting preferences. Users submit their problem and weigh various custom factors into a central room. Our system packages these up with specific instructions and returns ranked, viable options—complete with a radar chart showing the exact percent match of how well each option satisfies the group's factors, alongside an AI summary explaining the choice.

## 🏗️ How we built it
We built the web app using a modern, fast stack:
- **Backend:** Bun, MongoDB, Google Gemini SDK
- **Frontend:** React, Tailwind CSS, Ariakit, MUI x-charts
- **Hosting:** Deployed on Render

## ⚠️ Challenges we ran into
- Navigating AI API limits constraints and ensuring consistent JSON model outputs.
- Some teammates were learning new languages and technologies on the fly!
- Untangling some sticky endpoint routing issues and debugging Bun workspaces.
- Our first time setting up and querying MongoDB from scratch.

## 🏆 Accomplishments that we're proud of
The web app turned out much better than we originally imagined! The UI feels incredibly snappy and fun to use, and finally getting the Google Gemini call to return exactly the right JSON format to power our match-score charts was exhilarating.

## 🧠 What we learned
We learned a ton about designing robust API endpoints, practical experience prompting AI models for structured data, using the Bun runtime, wrangling complex TypeScript types, and working with document-based MongoDB.

## 🚀 What's next?
- Continuing to polish the UI/UX animations and mobile responsiveness.
- Adding better state-synchronization for realtime group updates (WebSockets).
- Scaling for larger deployment and safely proxying user AI API keys. 