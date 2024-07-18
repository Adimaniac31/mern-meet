const express = require('express');
const { google } = require('googleapis');
const Meeting = require('../models/Meeting');
const router = express.Router();
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  const credentials = JSON.parse(content);

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Set tokens from environment variables
  oAuth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  // Define the route to create a Google Meet
  router.post('/create', async (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const event = {
      summary: 'Google Meet',
      description: 'A Google Meet event',
      start: { dateTime: new Date(), timeZone: 'America/Los_Angeles' },
      end: { dateTime: new Date(new Date().getTime() + 60 * 60 * 1000), timeZone: 'America/Los_Angeles' },
      conferenceData: { createRequest: { requestId: '7qxalsvy0e' } },
    };

    try {
      const { data } = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      const meeting = new Meeting({ meetingId: data.id, meetLink: data.hangoutLink });
      await meeting.save();

      res.status(200).json(meeting);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Define the route to list all Google Meets
  router.get('/', async (req, res) => {
    const meetings = await Meeting.find();
    res.status(200).json(meetings);
  });
});

module.exports = router;


