const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content.replace(/"\.\.\/\.\.\/\.\.\/lib\/utils\.ts"/g, '"../../../../lib/utils.ts"');
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Fixed ' + fullPath);
      }
    }
  }
}

walk('src/components/admin');
