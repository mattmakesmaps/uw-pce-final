# uw-pce-final
matt kenny final project for uw-pce

Use the `trips-for-route` endpoint: https://api.pugetsound.onebusaway.org/api/where/trips-for-route/1_100224.json?key=TEST

- Allow a user to input a route id via the user interface
- take route id and generate URL at trips-for-route endpoint.

Parse and display the following from endpoint:
- location of current busses
- stops for current route.

  maybe add other relevant info to UI outside of map.

## Criteria for Completion 4 of 6
- One or more Classes (must use static methods and/or prototype methods)
- **TODO:** Write testable code, use Jasmine unit tests
- :white_check_mark: One or more timing functions.
  - Write a timing function to re-execute the query
    at a given interval (e.g 1 minute).
- :white_check_mark: One or more fetch requests to a 3rd party API
- Sets, updates, or changes local storage
- :white_check_mark: Contains form fields, validates those fields

## TODO

- Wire up user facing refresh timer.
- Tests.