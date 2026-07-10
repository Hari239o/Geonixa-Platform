const { google } = require('googleapis');
const fs = require('fs');

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './kalinq-f996a-firebase-adminsdk-fbsvc-257abe11f7.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const url = 'https://firebase.googleapis.com/v1beta1/projects/kalinq-f996a/webApps';
    
    const res = await client.request({ url });
    console.log('Web Apps:', JSON.stringify(res.data, null, 2));

    let appId;
    if (res.data.apps && res.data.apps.length > 0) {
      appId = res.data.apps[0].appId;
    } else {
      console.log('No web apps found. Creating one...');
      const createRes = await client.request({
        url: url,
        method: 'POST',
        data: { displayName: 'Kalinq Web App' }
      });
      console.log('Created App:', createRes.data);
      // It returns an operation, wait a bit
      await new Promise(r => setTimeout(r, 3000));
      const res2 = await client.request({ url });
      if (res2.data.apps && res2.data.apps.length > 0) {
        appId = res2.data.apps[0].appId;
      }
    }

    if (appId) {
      console.log('App ID:', appId);
      const configUrl = `https://firebase.googleapis.com/v1beta1/projects/kalinq-f996a/webApps/${appId}/config`;
      const configRes = await client.request({ url: configUrl });
      console.log('Firebase Config:');
      console.log(JSON.stringify(configRes.data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
