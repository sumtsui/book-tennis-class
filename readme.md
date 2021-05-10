### Run the webdriverio script

```bash
npm i
```

```bash
npm start -- <classStartTime> <phoneNumber> <password>
```

### launchd commands

```bash
# let plist run for current user
cp ./book-tennis-class.plist ~/Library/LaunchAgents

# load job
launchctl load ~/Library/LaunchAgents/book-tennis-class.plist

# remove job
launchctl remove local.book-tennis-class

# start job
launchctl start local.book-tennis-class

# list jobs
launchctl list | grep local
```

### launchd tutorial

https://betterprogramming.pub/schedule-node-js-scripts-on-your-mac-with-launchd-a7fca82fbf02
