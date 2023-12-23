import fs from 'fs';
import os from 'os';
import promptSync  from 'prompt-sync';
import { createTransport } from 'nodemailer';
import { Worker, isMainThread } from 'worker_threads';
import { SearchCriteria } from './search-criteria';

function getSearchCriteria(): SearchCriteria {
    if (!fs.existsSync('appsettings.json')) {
        console.log('Failed to find "appsettings.json"');
        process.exit();
    }

    const settings = fs.readFileSync('appsettings.json').toString();
    return JSON.parse(settings);
}

const prompt = promptSync({ sigint: true });
function getThreadCount() {
    let threadCount: number;
    const maxThreads = os.cpus().length;

    if (process.argv[2] == null) {
        while (true) {
            let input = prompt('Enter the amount of threads you would like to run, or "max", or "half": ');
            if (!input) continue;

            if (input.toLowerCase() === "max") return maxThreads;
            if (input.toLowerCase() === "half") return maxThreads / 2;

            threadCount = parseInt(input);
            if (!isNaN(threadCount)) {
                if (threadCount > 0 && threadCount <= maxThreads) return threadCount;
                console.log(`Thread count must be grater than 0 and less than ${maxThreads}.`);
            }
        }
    }

    if (process.argv[2].toLowerCase() === "max") return maxThreads;
    if (process.argv[2].toLowerCase() === "half") return maxThreads / 2;

    threadCount = parseInt(process.argv[2]);
    if (!isNaN(threadCount)) {
        if (threadCount > 0 && threadCount <= maxThreads) return threadCount;
        console.log(`Thread count must be grater than 0 and less than ${maxThreads}.`);
        process.exit(0);
    } else {
        console.log('Pass a valid thread count, or "max", or "half" as a launch arg.');
    }

    return null;
}

const searchCriteria = getSearchCriteria();
if (searchCriteria == null) {
    console.log('Failed to parse search criteria.');
    process.exit(0);
}

const threadCount = getThreadCount();
if (threadCount == null) {
    console.log('Failed to get thread count.');
    process.exit(0);
}

if (!fs.existsSync('wallets')) {
    fs.mkdirSync('wallets');
}

if (isMainThread) {
    for (let i = 0; i < threadCount; i++) {
        new Worker('./build/worker.js').postMessage(searchCriteria);
    }
    
    if (searchCriteria.emailSettings.sendEmail) {
        try {
            var transporter = createTransport({
                service: 'gmail',
                auth: {
                    user: searchCriteria.emailSettings.account.emailAddress,
                    pass: searchCriteria.emailSettings.account.emailPassword
                }
            });
    
            var mailOptions = {
                from: searchCriteria.emailSettings.account.emailAddress,
                to: searchCriteria.emailSettings.emailAddress,
                subject: 'Started generating wallet addresses',
                text: `Started ${threadCount} thread${threadCount > 1 ? 's' : ''} to generate wallets.`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
}