# Flow XO <%= name %> Service

This is a <%= name %> service module for the [Flow XO](https://flowxo.com) platform. For more details on how to develop and test this service, please refer to the [Flow XO SDK](http://github.com/flowxo/flowxo-sdk).

## Contributing

``` bash
# Clone the repo
git clone https://bitbucket.org/flowxo/<%= serviceName %>

# Install the dependencies
npm install -g yo grunt-cli
npm install

# Generate a new method
yo flowxo:method

# Watch files for changes, running style checks and unit tests on change
grunt

# Run unit tests
grunt test

# Create/renew an authentication file
grunt auth

# Run integration tests, using authentication
grunt run [--record --replay --name=<name>]

```
