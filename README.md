# Crypto Wallet Generator
This repository contains a project that will allow you to generate specific crypto wallet addresses.

## Disclaimer

The odds of generating an exact crypto address is 2^256... Thats a 1 in 115792089237316195423570985008687907853269984665640564039457584007913129639936 chance so don't think you will just be able to generate someone elses wallet address.

## Quick start

The first things you need to do is clone this repository and installing its dependencies:

```sh
git clone https://github.com/supitsmike/crypto-wallet-generator.git
cd crypto-wallet-generator
npm install
```

Once installed, you should now create an `appsettings.json` file from the `appsettings.json.sample` and edit it to your liking. 

If you want to be emailed when you generate a wallet address you are searching for make sure to set `sendEmail` to `true`, specify the `emailAddress` you want to receive the emails to, and set the `account` you want it to send emails from:

```json
"emailSettings": {
    "sendEmail": true,
    "emailAddress": "personal@example.com",
    "account": {
        "emailAddress": "email@example.com",
        "emailPassword": "Password1!"
    }
}
```

Finally, we can run the app with the launch params of `max`, `half`, or a the amount of theads you want this to run on:

```sh
npm start max

or

npm start half

or

npm start 12
```

## Settings

- All the settings have a `caseSensitive` bool that will tell it to either check for the exact string you are searching for or conver the address and search string to lowercase and try to find a match.

- The `startWith`, `endWith`, `contain`, and `equal` settings all have a `strings` array where you just put a the string you want the wallet address to either start with, end with, conaint anywhere in the address, or equal completely 

- The `exactList` settings has a `lists` option where you put an array of things you want a single address to have, like the start offset of the address value you want there. In the `appsettings.json.sample` I am searching for an address that starts with 0x12345 and ends with 54321, so an address like this would match: `0x1234500D8EF3C81f4366CAeB89f869EffDD54321`

## Troubleshooting

- If you are using a Gmail account and getting the error `Invalid login: 535-5.7.8 Username and Password not accepted.` You will want to follow this guide for using [Google App Passwords](https://support.google.com/mail/answer/185833?hl=en&ref_topic=3394217&sjid=8545916151730396874-NA) and then use the app password instead of the real account password.
