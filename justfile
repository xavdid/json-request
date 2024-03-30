# make installed binaries available at the top level
export PATH := "./node_modules/.bin:" + env_var('PATH')

@_default:
    just --list

# run syle checks
[no-exit-message]
@lint:
    eslint src
    prettier --check src
    tsd

# do both style and structural checks
[no-exit-message]
@ci: test lint

# do a production build
[no-exit-message]
@build:
    tsc

[no-exit-message]
@test:
    jest

# version: a bump level
[no-exit-message]
[confirm("Bump version and release to npm?")]
@release version: ci build
    npm version {{version}}
    npm publish
    git push
    git push --tags

@clean:
    rm -rf lib
