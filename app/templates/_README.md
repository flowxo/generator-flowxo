# Flow XO <%= name %> Service

This is a <%= name %> service module for the [Flow XO](https://flowxo.com) platform. For more details on how to develop and test this service, please refer to the [Flow XO SDK](http://github.com/flowxo/flowxo-sdk).

## Usage

Steps to run the service from the command line using the Flow XO SDK
``` bash
# Clone the repo
git clone https://github.com/flowxo/<%= module %>
cd <%= module %>

# Install the dependencies
npm install
grunt init

<% if(auth.type.indexOf('oauth') === 0) { %>
# Create a .env file with the following content (no hashes):
<% if(auth.type.indexOf('oauth')===0) { %><%= slugUpperCased %><% if(auth.type === 'oauth1') { %>_KEY=<YOUR_APP_KEY><% } else { %>_ID=<YOUR_APP_ID><% } %>
<%= slugUpperCased %>_SECRET=<YOUR_APP_SECRET><% } %><% } %>

# Create an authentication
grunt auth

# Run methods
grunt run
```

## Contributing

``` bash
# Clone the repo
git clone https://github.com/flowxo/<%= module %>

# Install the dependencies
npm install -g yo grunt-cli
npm install
grunt init

# Generate a new method
yo flowxo:method

# Watch files for changes and running style checks on change
grunt

# Create/renew an authentication file
grunt auth

# Run integration tests, using authentication
grunt run [--record --replay --name=<name>]

```
