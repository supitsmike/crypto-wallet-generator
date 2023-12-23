import fs from 'fs';
import { parentPort } from 'worker_threads';
import { Web3 } from 'web3';
import { createTransport } from 'nodemailer';
import { SearchCriteria } from './search-criteria';

if (parentPort == null) {
    console.log('Failed to get parent port thread.');
    process.exit(0);
}

const web3 = new Web3(
    new Web3.providers.HttpProvider('https://eth.llamarpc.com') // This is only here to suppress a warning
);

function checkAddress(searchCriteria: SearchCriteria, address: string): boolean {
    if (searchCriteria == null) process.exit();

    if (searchCriteria.startWith && searchCriteria.startWith.strings) {
        if (searchCriteria.startWith.caseSensitive) {
            if (searchCriteria.startWith.strings.some(str => address.startsWith(str))) {
                return true;
            }
        } else {
            if (searchCriteria.startWith.strings.some(str => address.toLowerCase().startsWith(str.toLowerCase()))) {
                return true;
            }
        }
    }

    if (searchCriteria.endWith && searchCriteria.endWith.strings) {
        if (searchCriteria.endWith.caseSensitive) {
            if (searchCriteria.endWith.strings.some(str => address.endsWith(str))) {
                return true;
            }
        } else {
            if (searchCriteria.endWith.strings.some(str => address.toLowerCase().endsWith(str.toLowerCase()))) {
                return true;
            }
        }
    }

    if (searchCriteria.contain && searchCriteria.contain.strings) {
        if (searchCriteria.contain.caseSensitive) {
            if (searchCriteria.contain.strings.some(str => address.includes(str))) {
                return true;
            }
        } else {
            if (searchCriteria.contain.strings.some(str => address.toLowerCase().includes(str.toLowerCase()))) {
                return true;
            }
        }
    }

    if (searchCriteria.equal && searchCriteria.equal.strings) {
        if (searchCriteria.equal.caseSensitive) {
            if (searchCriteria.equal.strings.some(str => address == str)) {
                return true;
            }
        } else {
            if (searchCriteria.equal.strings.some(str => address.toLowerCase() == str.toLowerCase())) {
                return true;
            }
        }
    }

    if (searchCriteria.exactList && searchCriteria.exactList.lists) {
        if (searchCriteria.exactList.caseSensitive) {
            return searchCriteria.exactList.lists.some(exactList =>
                !exactList.some(exact =>
                    address.substring(exact.startOffset, exact.startOffset + exact.value.length) != exact.value
                )
            );
        } else {
            return searchCriteria.exactList.lists.some(exactList =>
                !exactList.some(exact =>
                    address.substring(exact.startOffset, exact.startOffset + exact.value.length).toLowerCase() != exact.value.toLowerCase()
                )
            );
        }
    }

    return false;
}

parentPort.on('message', (searchCriteria: SearchCriteria) => {
    while (true) {
        let account = web3.eth.accounts.create();
        if (checkAddress(searchCriteria, account.address)) {
            fs.writeFileSync(`wallets/${account.address}.json`, JSON.stringify(account));

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
                        subject: 'Generated a wallet address',
                        text: `The wallet address '${account.address}' was generated and saved.`
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
    };
});
