# uw-pce-final

## Description

Matt Kenny final project for uw-pce course one. This is a simple dashboard
application allowing a user to visualize spatial and tabular data about
King County Metro real time busses, for a given route.

Website is viewable on github pages here: https://mattmakesmaps.com/uw-pce-final/

This website uses the OneBusAway (OBA) `trips-for-route` API endpoint:
- Documentation: https://developer.onebusaway.org/api/where/methods/trips-for-route
- Example Call: https://api.pugetsound.onebusaway.org/api/where/trips-for-route/1_100224.json?key=TEST

## Criteria for Completion 4 of 6
- One or more Classes (must use static methods and/or prototype methods)
- :white_check_mark: Write testable code, use Jasmine unit tests
  - Reference: [bus-mapper.spec.js](https://github.com/mattmakesmaps/uw-pce-final/blob/mattmakesmaps-development/bus-mapper.spec.js)
- :white_check_mark: One or more timing functions.
  - [Reference One](https://github.com/mattmakesmaps/uw-pce-final/blob/mattmakesmaps-development/bus-mapper.js#L146), [Reference Two](https://github.com/mattmakesmaps/uw-pce-final/blob/mattmakesmaps-development/bus-mapper.js#L192)
- :white_check_mark: One or more fetch requests to a 3rd party API
  - [Reference](https://github.com/mattmakesmaps/uw-pce-final/blob/mattmakesmaps-development/bus-mapper.js#L36)
- Sets, updates, or changes local storage
- :white_check_mark: Contains form fields, validates those fields
  - [Reference](https://github.com/mattmakesmaps/uw-pce-final/blob/mattmakesmaps-development/index.html#L32-L41)