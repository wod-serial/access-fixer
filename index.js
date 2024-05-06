const fs = require('fs');
const readline = require('readline');


function fixerFunc(match, capture) {
    if (capture.length > 200
        || match.includes('"')
        || match.includes("'")
        || match.includes('/*')
        || match.includes('*/')
    ) {
        console.log('VERY STRANGE CAPTURE, not replacing:');
        console.log(capture);
        return match;
    }
    const fixed = capture
        .split(',')
        .map(el => el.trim())
        .filter(el => el)
        .map((el) => {
            if (!el.includes('Usergroup')) {
                return `Usergroup:${el}`;
            }
            return el;
        }).join(',')
    const fix = `<accesscontrol>${fixed}</accesscontrol>`;
    if (fix !== match) {
        console.log(`replaced(${match} with ${fix})`);
        return fix;
    }
    return match;
}

async function processLineByLine() {
    const fileStream = fs.createReadStream('backup.sql');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let writer = fs.createWriteStream("backup-fixed.sql");
    writer.on("finish", function () {
        console.log("fix finished");
        process.exit(0);
    });

    writer.on("error", function (err) {
        console.log(err);
    });

    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        let fix = line.replace(/<accesscontrol>(.*?)<\/accesscontrol>/gi, fixerFunc);
        writer.write(fix + '\n');
    }

    writer.end();
}

processLineByLine();
