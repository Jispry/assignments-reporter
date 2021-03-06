const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const AssignmentsRepository = require('./src/app/assignments-repository.js');
const AssignmentsCommands = require('./src/app/assignments-commands.js');
//const dateUtils = require('./src/app/dateUtils_test.js');
const dateUtils = require('./src/app/dateUtils.js');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
const calendarId = 'aardwark.com_i7vev92e8auoo9rtg0a4b00hdc@group.calendar.google.com';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  authorize(JSON.parse(content), runApp);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new google.auth.OAuth2(
    clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function runApp(auth) {
  const calendar = google.calendar('v3');
  const repo = new AssignmentsRepository(calendar, auth, calendarId, dateUtils);
  const commands = new AssignmentsCommands(repo);

  const argv = require('yargs')
    .command(['period <start> <stop>', 'p <start> <end>'], 'the period command', () => {},
    (yargs) => {
      commands.writeAssignmentsForPeriod(yargs.start + "T00:00:00.000Z", yargs.stop + "T23:00:00.000Z");
      console.log('period command');
    })
    .command(['filter <name> <start> <stop>', 'f <name> <start> <end>'], 'the filter command', () => {},
    (yargs) => {
      const filterFcn = (assignement) => { return assignement.name === yargs.name; };
      commands.writeAssignmentsForPeriodFiltered(filterFcn, yargs.start + "T00:00:00.000Z", yargs.stop + "T23:00:00.000Z");
      console.log('filter command');
    })
    .command('*', 'the default command', () => { }, (yargs) => {
      commands.writeLastMonthAssignmentsToExcel();
      console.log('this command will be run by default');
    })
    .help()
    .argv;
}
