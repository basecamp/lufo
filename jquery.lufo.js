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

  // ------------------------------------------------------------- Cookie Management
  // grabs existing cookie by name; returns null if not found
  var getCookie = function(name) {
    var cookie = document.cookie.match(new RegExp('(^|;)\\s*' + escape(name) + '=([^;\\s]*)'));
    return (cookie ? unescape(cookie[2]) : null);
  };
  
  // sets new cookie; expects name, value of cookie, days to expiration (integer)
  var setCookie = function(name, value, daysToExpire) {
    var attrs = '; path=/';
    if (daysToExpire != undefined) {
      var d = new Date();
      d.setTime(d.getTime() + (86400000 * parseFloat(daysToExpire)));
      attrs += '; expires=' + d.toGMTString();
    };
    return (document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value || '') + attrs);
  };
  
  // removes cookie by name
  var removeCookie = function(name) {
    var cookie = getCookie(name) || true;
    setCookie(name, '', -1);
    return cookie;
  };

  // ------------------------------------------------------------- <select> Management
  // modify the <select> menu to show most recent selections (loaded from cookie)
  var setSelect = function($selectControl, options){
    var savedValues = JSON.parse(getCookie(options.cookieName));

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

        var escapedSavedValue = savedValue.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1'); // escape special characters in the saved value, just in case
        var optionHtml = $selectControl.find('option[value="'+escapedSavedValue+'"]').clone();
        if (options.groupList) {
          $selectControl.find('optgroup:first').prepend(optionHtml);
        } else {
          $selectControl.prepend(optionHtml);
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

  // watch changes on the <select> menu; update (or create) the cookie based on changes
  var watchSelectChanges = function($selectControl, options){
    $selectControl.on("change", function(){
      var savedValues = JSON.parse(getCookie(options.cookieName));
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
        // remove old cookie; set new cookie
        var newCookieValue = JSON.stringify(savedValues);
        removeCookie(options.cookieName);
        setCookie(options.cookieName, newCookieValue, options.cookieAge);
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
      recentsListTitleEnabled: true,           // use placeholder title at the top of the recent items list
      recentsListTitle: 'Recently selected:',  // text for placeholder title
      dividerEnabled: true,                    // use placeholder divider between recents items and full list
      dividerText: '––––––––––––––––––––––––', // text for placeholder divider
      recentsListLength: 5,                    // number of remembered items
      listMinimumLength: 5,                    // number of items needed in the original list to activate Lufo
      groupList: false,                        // builds the recent items list as an `optgroup`
      ignoredValues: [],                       // list (array) of option values that won't be included: ['One', 'Two', 'Four']
      cookieName: 'recentOptionValues',        // name of storage cookie (if used for multiple lists on a site, pick different names)
      cookieAge: 30,                           // number of days before remembered items are cleared
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
