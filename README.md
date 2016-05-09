### Lufo for jQuery

**A jQuery plugin to track the most recent options chosen on a `<select>` element and display them at the top of the list**

-----------

**"Stop being regionally biased"**

That's the subject of an email I received recently at [**Highrise**](https://highrisehq.com/). 

Well that got my intention. What are we doing wrong?

The message explained: 

> Your current drop down menu for country locations is not very Asia friendly - all those listed at the top of the list are in North America, Europe + Japan. My most frequent country selections are Hong Kong, Singapore, Indonesia, Vietnam, China, etc...

They were right. Our menu is 200 countries long, and we highlight a few, but it's clearly biased towards that few. 

But that got us thinking... this isn't just a problem for Countries, we have this problem all over our app. We have a bunch of menus, many with more than a few choices, where it's hard to repeatedly pick things that aren't at the top of the list. 

Sure, browsers try and give you the ability to type some letters to find things faster in the menu, but they fail at anything but rudimentary searches. 

What we really need is a solution to have HTML select menus remember what the user last picked and make those easier to pick next time. 

Something like: 

**L**ast
**U**sed
**F**irst
**O**ut

LUFO!!!

----------------------

Long `<select>` menus with many options can be a pain. States/territories, countries, currency lists, etc. have so many options it's cumbersome to scroll through them to find the ones you use often. 

Lufo tracks the most recent selections on a long `<select>` menu and stores them in a browser’s `localStorage` (it falls back to a tracking cookie if the browser doesn’t support `localStorage`). When someone revisits a page with that same long menu, their most-recently selected options will be copied to the top of the list for their convenience. No bias on your part. Super-convenient for the people using your site.

You can add Lufo to just about any `<select>` form control, choose to group the recent selects, customize (or hide) the labels and divider text, and even enable/disable Lufo based on how many options are in a dynamically-generated `<select>`.

<img src="https://github.com/highrisehq/lufo/blob/master/demo.gif?raw=true" width=500 />

## Usage

1. Include [jQuery](http://jquery.com) in your project
2. Include the Lufo plugin code:

  ```html
  <script src="jquery.lufo.js"></script>
  ```

3. Call the Lufo plugin on a `<select>` element:

  ```javascript
  $('select').lufo();
  ```
  
  If you are using the plugin with multiple, _different_, `<select>` menus, you will want to specify a unique storage name for each menu:
  
  ```javascript
  $('select.some-select').lufo({
    listStoreName: 'someSelectValues'
  });
  ```
  
  [More on Storage & Tracking Cookie Preferences.](#storage-tracking-cookie-preferences) See below for other available options.

## Options

Unless otherwise noted, all option examples below are Lufo defaults.

#### Check for Initial Placeholder Values
If your `<select>` menu has a built-in placeholder (for example: “Select a country…”) that resides at the top of the list and has no value, Lufo will check for it, and if found, move it to the very top of the list _after_ adding in the most-recently selected options.

```javascript
checkInitialValue: true
```

Set to `false` to turn off this check.

#### Strip “selected” from Cloned Values
If a recent option has the selected attribute set (`selected="selected"`) it will remain when that `<option>` is copied to the top of the list.

```javascript
stripSelected: false
```

Set `stripSelected` to `true` if you want the selected attribute removed from the copy.

#### A Title for the Recently Selected List
By default, Lufo will place a disabled `<option>` at the beginning of the most-recently selected options list with the text: “Recently selected:”.

```javascript
recentsListTitleEnabled: true,
recentsListTitle: 'Recently selected:'
```

Turn the title off by setting `recentsListTitleEnabled` to `false` or change the title text by setting `recentsListTitle` to something else.

#### List Divider
Lufo will place a disabled `<option>` at the end of the most-recently selected options list to use as a divider.

```javascript
dividerEnabled: true
dividerText: '––––––––––––––––––––––––'
```

You may disable the divider by setting `dividerEnabled` to `false` or modify the divider by setting `dividerText` to something else.

#### Recently Selected List Memory
By default, Lufo will remember the `5` most-recently selected items in a `<select>` menu.

```javascript
recentsListLength: 5
```

You may change this number to any positive integer.

#### Conditionally Enabling Lufo
A `<select>` list must have at least `5` items in it to enable the tracking and display of recently selected items. This is especially useful for dynamic lists in an app that may need to grow over time before it becomes useful to track recent selects.

```javascript
listMinimumLength: 5
```

You may change this number to any positive integer to enable Lufo sooner, or to wait until a list grows beyond five options.

#### Using `<optgroup>`
By default, Lufo adds the list of recent selects to the top-level of a `<select>` menu.

```javascript
groupList: false
```

If you wish to group the options into an `<optgroup>` set `groupList` to `true`.

#### Ignoring Certain Values
Lufo will track clicks on _all_ available `<option>` in a `<select>`.

If you wish to ignore a few options in the list, you may create an array of the _values_ (`value=`) that you do not want Lufo to track.

**Example:**

```javascript
ignoredValues: ['dog', 'cat', 'cow']
```

Setting the above option would not track clicks on any options in a `<select>` that contain the values of `dog`, `cat`, or `cow`.

#### Storage & Tracking Cookie Preferences
If you will be using Lufo on a single `<select>` menu on your site, you don’t need to change any of the storage preferences. Lufo will use a browser’s `localStorage` (or if that isn’t available, set a tracking cookie) to remember the most recent selections.

**Default:**

```javascript
listStoreName: 'recentOptionValues',
cookieAge: 30 // only relevante for browsers without `localStorage`
```

However, if you are using Lufo on multiple menus with different values, you need to set a unique storage item name for each of the menus.

**Example:**

```javascript
$('select.some-select').lufo({
  listStoreName: 'someSelectValues'
});

$('select.other-select').lufo({
  listStoreName: 'otherSelectValues'
});
```

You may also increase or decrease the amount of time the tracking cookie persists on your site (for browsers without `localStorage`). The default cookie age is `30` days. You may change it by setting `cookieAge` to another positive integer to represent a number of _days_.

**Example:**

```javascript
cookieAge: 90
```

The example above would remember the recently selected options for `90` days instead of the default `30`.

## Examples

#### Example #1
Set Lufo to track a `<select>` with the class name `countries` and set a unique storage item name based on that class name.

```javascript
$('select.countries').lufo({
  listStoreName: 'countriesSelectValues'
});
```

#### Example #2
Set Lufo to track a `<select>` with the ID `author_id`, and a unique storage item name. Only enable Lufo if the list grows to `10` items. Only show `3` of the most recently selected items. Ignore a value of `none`. Finally, turn off the divider, shorten the recent list title, and move the recent selects into an `<optgroup`>.

```javascript
$('#author_id').lufo({
  groupList: true,
  recentsListTitle: 'Recent',
  dividerEnabled: false,
  recentsListLength: 3,
  listMinimumLength: 10,
  ignoredValues: ['none'],
  listStoreName: 'authorIdSelectValues'
});
```

## Contributing

We would love to see your contributions to Lufo! Check [CONTRIBUTING.md](https://github.com/highrisehq/lufo/blob/master/CONTRIBUTING.md) for more information.

## License

[MIT License](https://github.com/highrisehq/lufo/blob/master/LICENSE.md)

## Credit

A ton of thanks to [Grant Blakeman](https://twitter.com/gblakeman) doing the vast majority of the work putting this together.

## P.S.

[You should follow us on Twitter: **here**](https://twitter.com/highrise), or see how we can help you with contact management using [**Highrise**](https://highrisehq.com)  —  a handy tool to help you remove anxiety around tracking who to follow up with and what to do next.
