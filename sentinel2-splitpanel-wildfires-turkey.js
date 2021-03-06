// Demonstrates before/after imagery comparison with a variety of dates.

// These Sentinel-2 images track the wildfires in Turkey in July of 2021

var images = {
  '2021-07-22': getWeeklySentinelComposite('2021-07-22'),
  '2021-08-05': getWeeklySentinelComposite('2021-08-05'),
};

// Composite the Sentinel-2 surface reflectance ImageCollection for 7 days (inclusive) after the given date.

function getWeeklySentinelComposite(date) {
  var date = ee.Date(date);
  var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
                  .select(['B4', 'B3', 'B2'])
                  .filterDate(date, date.advance(1, 'week'))
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',50))
                  .median();
  return dataset.divide(10000).visualize({min: 0.0, max: 0.3});
}

/*
 * Set up the maps and control widgets
 */

// Create the left map, and have it display layer 0.
var leftMap = ui.Map();
leftMap.setControlVisibility(false);
var leftSelector = addLayerSelector(leftMap, 0, 'top-left');

// Create the right map, and have it display layer 1.
var rightMap = ui.Map();
rightMap.setControlVisibility(false);
var rightSelector = addLayerSelector(rightMap, 1, 'top-right');

// Adds a layer selection widget to the given map, to allow users to change
// which image is displayed in the associated map.
function addLayerSelector(mapToChange, defaultValue, position) {
  var label = ui.Label('Choose an image to visualize');

  // This function changes the given map to show the selected image.
  function updateMap(selection) {
    mapToChange.layers().set(0, ui.Map.Layer(images[selection]));
  }

  // Configure a selection dropdown to allow the user to choose between images,
  // and set the map to update when a user makes a selection.
  var select = ui.Select({items: Object.keys(images), onChange: updateMap});
  select.setValue(Object.keys(images)[defaultValue], true);

  var controlPanel =
      ui.Panel({widgets: [label, select], style: {position: position}});

  mapToChange.add(controlPanel);
}

/*
 * Tie everything together
 */

// Create a SplitPanel to hold the adjacent, linked maps.
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  wipe: true,
  style: {stretch: 'both'}
});

// Set the SplitPanel as the only thing in the UI root.
ui.root.widgets().reset([splitPanel]);
var linker = ui.Map.Linker([leftMap, rightMap]);
leftMap.setCenter(31.44257, 36.91216, 13);