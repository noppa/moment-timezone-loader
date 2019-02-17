Webpack loader for [moment-timezone](https://github.com/moment/moment-timezone) that allows you to
pick and choose just the timezones you need, resulting in smaller bundle sizes.

# Installation and usage

```sh
# Install moment-timezone if you haven't already
npm i moment-timezone
# Install this library
npm i -D moment-timezone-loader
```

Make Webpack use this loader whenever moment-timezone is imported
```javascript
// webpack.config.js

module.exports = {
  // ...other stuff...
  module: {
    rules: [
      {
        test: /node_modules[\\/]moment-timezone[\\/]/,
        use: [{
          loader: 'moment-timezone-loader',
          options: {
            zones: [
              // List here all the timezones that you want included
              'Europe/Helsinki',
              'Europe/Stockholm',
            ]
          }
        }]
      }
    ]
  }
}
```
After that, you can import and use moment-timezone normally
```javascript
import moment from 'moment-timezone'

// This will work because the timezone was included in our config
moment().tz('Europe/Helsinki')
// This will work because Europe/Mariehamn is in the same timezone
// as Europe/Helsinki and included in moment-timezone's "links" list.
moment().tz('Europe/Mariehamn')
// This will work because Etc/UTC is always included automatically.
moment().tc('UTC')
// This won't work because timezone definition for America/New_York
// wasn't included in the loader options. moment-timezone will log
// an error to the console.
moment().tc('America/New_York')
```

The timezones are taken from [this json file](https://github.com/moment/moment-timezone/blob/d0bcdcad01acece5df6988603e8cec146d78bd12/data/packed/latest.json)
in the moment-timezone version you are using. Timezone Etc/UTC is always included and doesn't
need to be explicitly specified in the zones-option.
