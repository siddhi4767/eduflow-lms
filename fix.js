const fs = require('fs');
let f1 = 'app/enrollment/page.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/ gradient="[^"]*"/g, '');
fs.writeFileSync(f1, c1);

let f2 = 'app/students/[id]/page.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/ gradient="[^"]*"/g, '');
fs.writeFileSync(f2, c2);
