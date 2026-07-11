const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(/#EF4823/gi, '#EF4423').replace(/#FF4D2D/gi, '#EF4423');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
    }
});

let globalCss = fs.readFileSync('./src/app/globals.css', 'utf8');
let newGlobalCss = globalCss.replace(/#EF4823/gi, '#EF4423').replace(/#FF4D2D/gi, '#EF4423');
if (globalCss !== newGlobalCss) {
    fs.writeFileSync('./src/app/globals.css', newGlobalCss, 'utf8');
}

console.log("Modified " + changedCount + " files.");
