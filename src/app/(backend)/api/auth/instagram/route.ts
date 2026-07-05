import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
 try {
 const { code } = await request.json();

 if (!code) {
 return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
 }

 if (code.startsWith('mock_')) {
 // Handle the simulated OAuth flow to bypass Meta's locked-down API
 const simulatedFollowers = (Math.floor(Math.random() * 90) + 10) + '.' + Math.floor(Math.random() * 9) + 'k';
 
 // Artificial delay to simulate network request
 await new Promise(resolve => setTimeout(resolve, 800));

 return NextResponse.json({
 success: true,
 data: {
 instagram_id: '123456789',
 username: 'karthik_creator',
 simulated_followers: simulatedFollowers
 }
 });
 }

 // 1. Exchange the code for an Access Token
 const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
 client_id: process.env.INSTAGRAM_APP_ID,
 client_secret: process.env.INSTAGRAM_APP_SECRET,
 grant_type: 'authorization_code',
 redirect_uri: process.env.REDIRECT_URI,
 code: code
 }, {
 headers: {
 'Content-Type': 'application/x-www-form-urlencoded'
 }
 });

 const { access_token, user_id } = tokenResponse.data;

 // 2. Fetch basic profile info (username)
 let username = 'Instagram User';
 try {
 const profileResponse = await axios.get(`https://graph.instagram.com/${user_id}?fields=id,username&access_token=${access_token}`);
 if (profileResponse.data && profileResponse.data.username) {
 username = profileResponse.data.username;
 }
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 } catch (profileError: any) {
 console.error('Error fetching profile data:', profileError.response ? profileError.response.data : profileError.message);
 }

 // 3. Generate a simulated follower count
 const simulatedFollowers = (Math.floor(Math.random() * 90) + 10) + '.' + Math.floor(Math.random() * 9) + 'k';

 return NextResponse.json({
 success: true,
 data: {
 instagram_id: user_id,
 username: username,
 simulated_followers: simulatedFollowers
 }
 });

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 } catch (error: any) {
 console.error('Instagram OAuth Error:', error.response ? error.response.data : error.message);
 return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
 }
}
