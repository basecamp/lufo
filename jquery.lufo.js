/*
Lufo for jQuery
Tracks the most recent options chosen on a `<select>` element and displays them at the top of the list
by @gblakeman / @n8 for Highrise, http://highrisehq.com

Version 1.0
Full source at https://github.com/highrise/lufo
Copyright (c) 2016 Highrise, http://highrisehq.com

MIT License, https://github.com/highrise/lufo/blob/master/LICENSE.md
*/

;(function($, window, document, undefined) {
  
// set name
var lufo = "lufo", dataKey = "plugin_" + lufo;

// ------------------------------------------------------------- Storage Management
// check if localStorage is available
var localStorageEnabled = function() {
  var item;
  item = 'tryLufo';
  try {
    localStorage.setItem(item, item);
    localStorage.removeItem(item);
    return true;
  } catch (_error) {
    e = _error;
    return false;
  }
};

// grabs existing item by name; returns null if not found
var getStoredItem = function(name) {
  if (localStorageEnabled()) {
    return localStorage.getItem(name)
  } else {
    var cookie = document.cookie.match(new RegExp('(^|;)\\s*' + escape(name) + '=([^;\\s]*)'));
    return (cookie ? unescape(cookie[2]) : null);
  }
};

// sets new item; expects name, value of item (+ days to expiration (integer) if cookie)
var setStoredItem = function(name, value, daysToExpire) {
  if (localStorageEnabled()) {
    return localStorage.setItem(name,value);
  } else {
    var attrs = '; path=/';
    if (daysToExpire != undefined) {
      var d = new Date();
      d.setTime(d.getTime() + (86400000 * parseFloat(daysToExpire)));
      attrs += '; expires=' + d.toGMTString();
    };
    return (document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value || '') + attrs);
  }
};

// removes item by name
var removeStoredItem = function(name) {
  if (localStorageEnabled()) {
    return localStorage.removeItem(name);
  } else {
    var cookie = getStoredItem(name) || true;
    setStoredItem(name, '', -1);
    return cookie;
  }
};

// ------------------------------------------------------------- <select> Management
// modify the <select> menu to show most recent selections (loaded from StoredItem)
var setSelect = function($selectControl, options){
  var savedValues = JSON.parse(getStoredItem(options.listStoreName));

  if (savedValues === null) {
    return
  } else {
    // check value of first option; if it's blank, assume the option is a placeholder
    var placeholderMainHtml;
    if ((options.checkInitialValue) && (($selectControl.find('option:first').val() === '')) || ($selectControl.find('option:first').val() === undefined)) {
      placeholderMainHtml = $selectControl.find('option:first').clone();
    } else {
      placeholderMainHtml = null;
    };

    // set up optgroup or normal list header/footer
    var placeholderTopHtml;
    if (options.groupList) {
      placeholderTopHtml = '<optgroup label="'+options.recentsListTitle+'"></optgroup>';
    } else {
      placeholderTopHtml = '<option disabled="true">'+options.recentsListTitle+'</option>';
    }
    var placeholderBottomHtml = '<option disabled="true">'+options.dividerText+'</option>';

    // footer
    if (placeholderMainHtml != null) {
      $selectControl.find('option:first').remove();
    };
    if (options.dividerEnabled) {
      $selectControl.prepend(placeholderBottomHtml);
    };

    // save optgroup
    if (options.groupList) {
      $selectControl.prepend(placeholderTopHtml);
    };

    // loop through saved values
    var i, quantity, savedValue;
    for (i = 0, quantity = savedValues.length; i < quantity; i++) {
      savedValue = decodeURIComponent(savedValues[i]);

      var optionHtml, optionLoop;
      for (optionLoop = 0; optionLoop < $selectControl[0].options.length; optionLoop++) {
        if ($selectControl[0].options[optionLoop].value == savedValue) {
          optionHtml = jQuery($selectControl[0].options[optionLoop]).clone();
          break;
        }
      };

      if (optionHtml != null) {
        if (options.stripSelected) {
          optionHtml.removeAttr('selected');
        };
        if (options.groupList) {
          $selectControl.find('optgroup:first').prepend(optionHtml);
        } else {
          $selectControl.prepend(optionHtml);
        };
      };
    };

    // header
    if (options.recentsListTitleEnabled && !options.groupList) {
      $selectControl.prepend(placeholderTopHtml);
    };
    if (placeholderMainHtml != null) {
      $selectControl.prepend(placeholderMainHtml);
    };
  };
};

// watch changes on the <select> menu; update (or create) the stored item based on changes
var watchSelectChanges = function($selectControl, options){
  $selectControl.on("change", function(){
    var savedValues = JSON.parse(getStoredItem(options.listStoreName));
    if (savedValues === null) {
      savedValues = [];
    };

    // newly-selected value
    var newValue = encodeURIComponent($selectControl.val());

    if ((newValue != null) && (jQuery.inArray(newValue,options.ignoredValues) === -1)) { // if blank or contained in `ignoredValues`, do nothing
      // remove existing match (so it does not get duplicated in the list)
      savedValues = jQuery.grep(savedValues, function(savedValues) {
        return savedValues != newValue;
      });
      // remove last item if we've hit our limit
      if (savedValues.length > (options.recentsListLength - 1)) {
        savedValues.splice(0,1);
      }
      // add the most recently selected value
      savedValues.push(newValue);
      // remove old stored item; set new stored item
      var newStoredItemValue = JSON.stringify(savedValues);
      removeStoredItem(options.listStoreName);
      setStoredItem(options.listStoreName, newStoredItemValue, options.cookieAge);
    } else {
      return
    };
  });
};

var Lufo = function(element, options) {
  this.element = element;

  // jQuery('select').lufo();
  // defaults; override any of this options locally when invoking the plugin
  this.options = {
    checkInitialValue: true,                 // check if initial option is a valueless placeholder and keep it at top
    stripSelected: false,                    // leave `selected="selected"` intact when copying `<option>`
    recentsListTitleEnabled: true,           // use placeholder title at the top of the recent items list
    recentsListTitle: 'Recently selected:',  // text for placeholder title
    dividerEnabled: true,                    // use placeholder divider between recents items and full list
    dividerText: '––––––––––––––––––––––––', // text for placeholder divider
    recentsListLength: 5,                    // number of remembered items
    listMinimumLength: 5,                    // number of items needed in the original list to activate Lufo
    groupList: false,                        // builds the recent items list as an `optgroup`
    ignoredValues: [],                       // list (array) of option values that won't be included: ['One', 'Two', 'Four']
    listStoreName: 'recentOptionValues',     // name of storage item (if used for multiple lists on a site, pick different names)
    cookieAge: 30,                           // number of days before remembered items are cleared (if a cookie is used)
  };

  if ((this.element.length) && (this.element.is('select'))) {
    this.init(options);
  } else {
    return
  };
};

Lufo.prototype = {
  init: function(options) {
    $.extend(this.options, options);
    if (this.element.find('option').length > (this.options.listMinimumLength - 1)) {
      setSelect(this.element,this.options);
      watchSelectChanges(this.element,this.options);
    } else {
      return
    }
  }
};

$.fn[lufo] = function(options) {
  var plugin = this.data(dataKey);

  if (plugin instanceof Lufo) {
    if (typeof options !== 'undefined') {
        plugin.init(options);
    };
  } else {
    plugin = new Lufo(this, options);
    this.data(dataKey, plugin);
  };

  return plugin;
};

}(jQuery, window, document));
