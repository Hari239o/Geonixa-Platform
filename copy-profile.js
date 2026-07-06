const fs = require('fs');
let code = fs.readFileSync('src/app/(frontend)/profile/page.tsx', 'utf8');

// Modifying the code
code = code.replace(/export default function ProfilePage\(\) \{/g, 'export default function CreatorPortfolioPage({ params }: { params: { id: string } }) {');
code = code.replace(/const res = await fetch\(\'\/api\/user\/complete-profile\'\);/g, 'const res = await fetch(`/api/creators/${params.id}`);');
code = code.replace(/data\.profile\./g, 'data.creator.');
code = code.replace(/data\.profile/g, 'data.creator');

// Remove the local storage loading logic
code = code.replace(/let localProfile = null;[\s\S]*?\/\/ 2\. Fetch fresh data from database/g, '// Fetch fresh data from database');

// Remove settings button
code = code.replace(/<button[^>]*onClick=\{\(\) => router\.push\('\/profile\/settings'\)\}[^>]*>[\s\S]*?<\/button>/g, '');

// Remove the portfolio image delete button
code = code.replace(/<button[^>]*onClick=\{async[^{]*\{[\s\S]*?\}[\s\S]*?<\/button>/g, '');

// Remove the image upload button (+ button at the bottom)
code = code.replace(/<div className=\"fixed bottom-\[100px\][\s\S]*?<\/div>/g, '');

// Remove Verify Modal JSX
code = code.replace(/\{showVerifyModal && \([\s\S]*?\}\)/g, '');

// Fix lucide-react imports that were failing earlier just in case, but this uses profile's lucide imports
// In profile/page.tsx: import { BadgeCheck, Send, Settings2, Plus } from 'lucide-react';
// So there are no Instagram/Twitter errors here.

// Remove unused state setters to avoid lint warnings, but whatever.

// Save it to brand portfolio
fs.writeFileSync('src/app/(frontend)/brand/portfolio/[id]/page.tsx', code);
console.log('Modified and copied!');
