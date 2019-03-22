# Hunger Game: One click categorizer for Open Food Facts

## Requirements:

- [Node](https://nodejs.org)

## Setup:

- yarn install
- yarn start

To test the ingredients parts, add `?type=ingredients` to the url

## Libraries:

- React
- Foundation 5 (CSS, same as on OFF main site)
- axios (http calls)

## APIs:

OFF APIs and [Robotoff](https://github.com/openfoodfacts/robotoff)

## Build

- yarn build

Use a [simple webpack config](https://github.com/facebook/create-react-app/issues/3365#issuecomment-376546407) to bundle in a single file (build/bundle.min.js) and facilitate integration in OFF main site

## Countries list

- yarn countries

Statically generated via from static.openfoodfacts.org
