/*
SPDX-License-Identifier: AGPL-3.0-only
Copyright (c) 2025 itsjustnickdev
Author: itsjustnickdev <nick@drops-it.com>
Contact: nick@drops-it.com
*/
'use strict';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const PING_MESSAGE = process.env.PING_MESSAGE || ""; 

// Constants
const CONTEST_URL = 'https://dashboard.honeygain.com/api/v1/contest_winnings';
const EARNINGS_URL = 'https://dashboard.honeygain.com/api/v1/earnings/jt';

function getAuthHeaders() {
  const token = process.env.HONEYGAIN_TOKEN;
  return {
    'Authorization': `Bearer ${token || ''}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function claimDailyReward() {
  const headers = getAuthHeaders();
  const resp = await fetch(CONTEST_URL, { method: 'POST', headers });
  return resp;
}

async function fetchTotals() {
  const headers = getAuthHeaders();
  const resp = await fetch(EARNINGS_URL, { method: 'GET', headers });
  if (!resp.ok) return null;
  try {
    const json = await resp.json();
    return json?.data || null;
  } catch (_) {
    return null;
  }
}

async function sendDiscordEmbed(embed) {
  if (!DISCORD_WEBHOOK_URL) return false;
  try {
    const resp = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    return resp.ok;
  } catch (err) {
    return false;
  }
}

async function sendDiscordPing() {
  if (!DISCORD_WEBHOOK_URL || !PING_MESSAGE) return false;
  try {
    const resp = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: PING_MESSAGE })
    });
    return resp.ok;
  } catch (err) {
    return false;
  }
}

function formatUsdCents(cents) {
  if (typeof cents !== 'number') return '-';
  return `$${(cents / 100).toFixed(2)}`;
}

async function main() {
  const token = process.env.HONEYGAIN_TOKEN;
  if (!token) {
    console.error('HONEYGAIN_TOKEN is not set. Please set the environment variable.');
    return process.exit(1);
  }

  let resp;
  try {
    resp = await claimDailyReward();
  } catch (err) {
    const embed = {
      title: 'Honeygain Daily Reward Failed',
      description: 'Request error while claiming the daily reward.',
      color: 16007990,
      timestamp: new Date().toISOString(),
      fields: [
        { name: 'Endpoint', value: CONTEST_URL, inline: false },
        { name: 'Error', value: String(err).slice(0, 1000), inline: false }
      ],
      footer: { text: 'Honeygain Auto Claim' }
    };
    await sendDiscordEmbed(embed);
    await sendDiscordPing();
    console.error('Claim request error:', err);
    return process.exit(1);
  }

  if (resp.ok) {
    let data;
    try { data = await resp.json(); } catch (_) { data = null; }
    const credits = String(data?.data?.credits ?? '');
    const message = `Successfully earned ${credits} credits from the honeygain daily reward!`;

    // Wait 5 seconds for totals to update, then fetch
    await sleep(5000);
    const totals = await fetchTotals();

    const embed = {
      title: 'Honeygain Daily Reward Claimed',
      description: message,
      url: 'https://dashboard.honeygain.com/',
      color: 16766720,
      timestamp: new Date().toISOString(),
      fields: [
        { name: 'Credits', value: credits, inline: true },
        { name: 'UTC Time', value: new Date().toISOString().replace('T', ' ').replace('Z', ''), inline: true },
        { name: 'Endpoint', value: CONTEST_URL, inline: false },
        { name: 'Status', value: String(resp.status), inline: true }
      ],
      footer: { text: 'Honeygain Auto Claim' }
    };

    if (totals) {
      embed.fields.push(
        { name: 'Total Credits', value: String(totals.total_credits), inline: true },
        { name: 'Bonus Credits', value: String(totals.bonus_credits), inline: true },
        { name: 'Total USD', value: formatUsdCents(totals.total_usd_cents), inline: true },
        { name: 'Bonus USD', value: formatUsdCents(totals.bonus_usd_cents), inline: true }
      );
    }

    if (!DISCORD_WEBHOOK_URL) {
      console.log(message);
    } else {
      await sendDiscordEmbed(embed);
      await sendDiscordPing();
    }
  } else {
    const text = await (async () => { try { return await resp.text(); } catch (_) { return ''; } })();
    const totals = await fetchTotals();
    const embed = {
      title: 'Honeygain Daily Reward Failed',
      description: `Daily reward failed with status ${resp.status}`,
      color: 16007990,
      timestamp: new Date().toISOString(),
      fields: [
        { name: 'Endpoint', value: CONTEST_URL, inline: false },
        { name: 'Status', value: String(resp.status), inline: true },
        { name: 'Response', value: (text ? text.slice(0, 1000) : '(empty)'), inline: false }
      ],
      footer: { text: 'Honeygain Auto Claim' }
    };
    if (totals) {
      embed.fields.push(
        { name: 'Total Credits', value: String(totals.total_credits), inline: true },
        { name: 'Bonus Credits', value: String(totals.bonus_credits), inline: true },
        { name: 'Total USD', value: formatUsdCents(totals.total_usd_cents), inline: true },
        { name: 'Bonus USD', value: formatUsdCents(totals.bonus_usd_cents), inline: true }
      );
    }

    if (!DISCORD_WEBHOOK_URL) {
      console.error(`Daily reward failed with status ${resp.status}`);
    } else {
      await sendDiscordEmbed(embed);
      await sendDiscordPing();
    }
  }
}

(async () => {
  try {
    if (typeof fetch === 'undefined') {
      console.error('This script requires Node.js v18+ (global fetch).');
      process.exit(1);
    }
    await main();
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();


