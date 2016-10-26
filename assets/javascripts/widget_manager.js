/**
 * Widget manager for redmine.
 *
 * (c) 2016 eMan s.r.o.
 */

(function(window, $, _) {
  "use strict";

  // General class definition
  var WidgetManager = function(opts) {
    // Associate self
    var self = this;

    // Define default options
    this.defaults = {
      gridClass: '.dashboard-grid',
      savePath: '/my/dashboard/save',
      loadPath: '/my/dashboard/load',
      gridOptions: {
        cellHeight: 200,
        verticalMargin: 10,
        alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        resizable: false,
        width: 4,
        float: false,
        handle: '.title-bar',
        acceptWidgets: '.grid-stack-item',
        disableResize: true,
        draggable: {
          cursor: 'move'
        },
        dropCallback: this.dropWidget.bind(this)
      }
    };

    // Merge options from opts and defaults
    this.options = $.extend(true, this.defaults, opts);

    // Initialize grid
    this.$grid = $(this.options.gridClass)
      .gridstack(this.options.gridOptions);

    // Gridstack instance
    this.$gridStack = this.$grid.data('gridstack');

    // Bind on change event to saveWidgets
    this.$grid.change(this.saveSettings.bind(this));

    // Prepare height
    this.$main = $('#main');
    this.windowResize();
    $(window).resize(this.windowResize.bind(this));

    // First and second step for form to add
    // widgets.
    this.$step1 = $(opts.step1);
    this.$step2 = $(opts.step2);

    // Categories
    this.categories = {};
    this.localisedCategories = {};

    // List of all active widgets
    this.widgets = [];

    // Saving data
    this.savingData = false;

    // Bind context menu redirects
    this.bindContextMenus();

    // Start refreshing available widgets
    this.watchInterval = setInterval(function() {
      this.watchReload()
    }.bind(this), 1000);

    // Load all data
    if (this.options.loadPath) {
      // Not neccessary just user data, but project data too.
      this.loadData();
    }
  };

  WidgetManager.prototype.bindContextMenus = function() {
    // Remove default click rails actions
    $('body').off('click.rails', '#context-menu a');

    // Bind context menu redirects
    $('body').on('click', '#context-menu a', function(evt) {
      var $a = $(this);

      if ($a.data('remote')) {
        // Call default rails operations for remote links
        return;
      }

      // Don't call
      evt.preventDefault();

      // Call ajax manually
      $.ajax({
        method: $a.data('method') || 'GET',
        url: $a.attr('href'),
        sucess: function(data, status, xhr) {
          // Test for redirects
          debugger;
        }
      });
    });
  };

  /**
   * Load widgets from server, and render them.
   */
  WidgetManager.prototype.loadData = function() {
    $.ajax({
      url: this.options.loadPath,
      dataType: 'json',
      success: function(data) {
        // Stop saving function
        this.dontSave = true;

        // Wait until everything is loaded
        var promises = _.map(data, function(item) {
          // Load widget
          // Cause we love Javascript and BIND and CALL...
          this.loadWidget.call(this, item);
        }.bind(this));

        // Loader
        var loader = $('#full-screen-loader');

        Promise.all(promises).then(function() {
          // Allow to save
          this.dontSave = false;
          loader.remove();
        }.bind(this), function() {
          this.dontSave = false;
          loader.remove();
        }.bind(this));

      }.bind(this)
    });
  };

  /**
   * Find settings by name.
   */
  WidgetManager.prototype.findSettings = function(name) {
    var widgets = _.flatMap(this.categories, function(item, key) {
      return item.widgets;
    });

    return _.find(widgets, function(widget) {
      return widget.name == name;
    });
  };

  // Create widget instance
  WidgetManager.prototype.loadWidget = function(item) {
    // Find widget options from register widgets
    var settings = this.findSettings(item.widget);

    // Log warn
    if (!settings) {
      console.warn('Settings with type: ' + item.widget + ' does not exists. Ignored!');
      return;
    }

    // Prepare options
    var options = item.options;
    options.copyKeys = _.keys(item.options);
    options.uuid = this.generateUUID();
    options.node = position;
    $.extend(true, options, settings);

    // Get position
    var position = item.position;
    var template = this.generateWidget(position.width, position.height, item.options.size, options);

    // Create parent class
    var widgetClass = this.getWidgetClass(settings.klass_name);

    // Add widget
    var node = this.$gridStack.addWidget(
      template,
      position.x,
      position.y,
      position.width,
      position.height
    );

    // Create widget class
    var widget = new widgetClass(this, template, options);

    // Set title from API?
    if (!_.isEmpty(options.title)) {
      widget.setTitle(options.title);
    }

    // Push into array
    this.widgets.push(widget);

    // Render widget
    widget.render();
  };

  /**
   * Window resize trigger
   */
  WidgetManager.prototype.windowResize = function() {
    // Get current height
    var windowHeight = $(window).height();

    // Set heights
    this.$main.css('min-height', windowHeight - 90);
    this.$grid.css('min-height', windowHeight - 120);
  };

  /**
   * Drop callback from GridStack
   */
  WidgetManager.prototype.dropWidget = function(node, $newEl, $oldEl) {
    // Create widget instance
    this.addWidget(node, $newEl, $oldEl);

    // Remove parent node (available size)
    // $oldEl.parent().remove();
  };

  /**
   * Save widget settings.
   */
  WidgetManager.prototype.saveSettings = function() {
    // Probably loading data
    if (this.dontSave) {
      return true;
    }

    // Serialize widgets
    var widgetData = _.map(this.widgets, function(widget) {
      return widget.settingsData();
    });

    // Call save
    $.ajax({
      type: 'POST',
      url: this.options.savePath,
      data: JSON.stringify({ widgets: widgetData }),
      contentType: 'application/json',
      dataType: 'json',
      success: function() {
        // Allow to save settings
      }.bind(this)
    });
  };

  /**
   * Generate unique ID's for widget DOM elements
   *
   * @return [Integer] Unique ID
   */
  WidgetManager.prototype.generateUUID = function () {
    function generator() {
      return _.random(0, 1000);
    }

    var newUuid = generator();

    // Generate random UUID for all widgets
    while (_.includes(_.map(this.widgets, 'uuid'), newUuid)) {
      newUuid = generator();
    }
    return newUuid;
  };

  /**
   * Widget definitions
   */

  /**
   * Register widgets data for managers.
   */
  WidgetManager.prototype.registerWidgets = function (widgets) {
    _.forEach(widgets, function (widget) {
      this.registerWidget(widget);
    }.bind(this));

    this.render();
  };

  /**
   * Register single widget definition
   */
  WidgetManager.prototype.registerWidget = function (widget) {
    // Check if category has some widgets defined
    if (_.isEmpty(this.categories[widget.category])) {
      this.categories[widget.category] = [];
    }

    this.categories[widget.category].push(widget);
    this.localisedCategories[widget.category] = widget.l_category;
  };

  // Render first page of sidebar
  WidgetManager.prototype.render = function () {
    var $mainUL = $('<ul/>'); // Base wrapper UL

    // Extract localized categories names for sorting
    var categoriesName = _.map(this.categories, function(value, key) {
        return {name: key, l_name: value[0].l_category };
    });
    categoriesName = _.sortBy(categoriesName, function(c) {c.l_name});
    this.categories = _.map(categoriesName, function(cat){
       return {
         name: cat.name,
         l_name: cat.l_name,
         widgets: this.categories[cat.name]
       };
    }.bind(this));

    // Iterate over categories received from JSON
    _.forEach(this.categories, function (category) {
      // Category
      var $category = $('<li/>').addClass('accordion')
        .text(category.l_name);
      this.bindCategoriesControl($category);

      // Category wrapper
      var $panel = $('<ul>').addClass('panel');

      // Extract widgets from category
      var sorted = _.sortBy(category.widgets, function(w) {return w.l_name});
      _.forEach(sorted, function (widget) {
        var $li = $('<li>'); // Widget name
        var $link = $('<a>').text(widget.l_name); // Link to bind
        $link.on('click', {widget: widget}, this.renderStep2.bind(this));
        // Append block to category
        $category.append($panel.append($li.append($link)));
      }.bind(this));

      // Append to wrapper
      $mainUL.append($category);
    }.bind(this));

    // Append to sidebar
    $('.categories-list', this.$step1).html($mainUL);
  };

  // Bind open/hide categories w/ widgets
  WidgetManager.prototype.bindCategoriesControl = function ($category) {
    $category.on('click', function (e) {
      // Prevent on nested elements
      if ($(e.target).is('a')) {
        return false;
      }
      $(this).toggleClass('active');
      $(this).children().first().toggleClass('show');
    });
  };

  // Bind clicking on widget
  WidgetManager.prototype.renderStep2 = function (e) {
    var $mainUL = $('<ul>'); // Base wrapper UL
    var widget = e.data.widget;

    // Create values option
    if (widget.values && _.size(widget.values) > 0) {
      var options = _.map(widget.values, function (value, key) {
        var $opt = $('<option>');
        $opt.val(key).text(value);
        return $opt;
      });
      var $selectContainer = $('<li>');
      var $select = $('<select>');
      _.forEach(options, function ($opt) {
        $select.append($opt);
      });
      $selectContainer.append($select);
      $mainUL.append($selectContainer);
    }

    // Generate sizes previews
    var currentOneHeight = $('.content', this.$step1).width() / 3;

    var $sizes = _.map(widget.sizes, function (size) {

      var sizeName = $('<div>')
        .addClass('size-name')
        .text(I18n.widget[widget.name + "_" + size.name] + ' - ' + size.height + 'x' + size.width);

      var description = $('<div>')
        .addClass('size-description')
        .text(size.description);

      var preview = this.generateWidget(size.width, size.height, size.name, widget);

      // Calculate current height
      preview.height(size.height * currentOneHeight);

      // Bind drag & drop to dashboard
      this.bindDraggable(preview);

      // return <li> with content
      return $('<li>').append(sizeName, description, preview);
    }.bind(this));

    $mainUL.append($sizes);

    $('.widget-detail', this.$step2).html($mainUL);
    goForward();
  };

  WidgetManager.prototype.bindDraggable = function($preview) {
    $preview.draggable({
      helper: 'clone',
      revert: 'invalid',
      handle: '.widget',
      scroll: false,
      appendTo: 'body',
    });
  };

  /**
   * Generate preview div's for sizes.
   */
  WidgetManager.prototype.generateWidget = function (width, height, size_name, widget) {
    var settings = '<div class="edit-block">' +
                     '<div class="edit-header">' +
                        I18n.widget_settings.label +
                        '<div class="edit-icons">' +
                            '<span class="widget-icon cancel-icon light"></span>' +
                            '<span class="widget-icon ok-icon light"></span>' +
                        '</div>' +
                      '</div>' +
                      '<div class="edit-content">' +
                        '<form class="settings">' +
                        '<label for="name">' + I18n.widget_settings.name + '</label>' +
                        '<input name="title" type="text" value="' + (widget.title || widget.l_name) + '">';

    if (widget.available_settings) {
      _.each(widget.available_settings, function(name, key) {
        var value = "";

        if (_.has(widget, key)) {
          value = widget[key];
        }

        settings += '<label for="' + key + '">' + name + '</label>';
        settings += '<input name="' + key + '" type="text" value="' + value + '" />';
      });
    }

    settings += '</form></div></div>';

    var base = '<div class="grid-stack-item" data-gs-width=' + '"' + width + '" ' +
               'data-gs-height=' + '"' + height + '">' +
               '<div class="widget shadow"><div class="title-bar">' +
               '<span class="drag-icon widget-icon small"></span>' +
               '<span class="name">' + (widget.title || widget.l_name) + '</span>' +
               '<div class="modify-icons"><span class="edit-icon widget-icon small"></span>' +
               '<span class="delete-icon widget-icon small"></span></div></div>' +
               '<div class="content"></div>';
    if (!(widget.template && widget.template.length > 0)) {
      base += '<div class="footer"><div class="loader"></div></div>'
    }
    base += settings + '</div></div>';

    var $item = $(base).data({widget: widget, size_name: size_name, title: (widget.title || widget.l_name)});
    var $handle = $('<div/>').addClass('grid-stack-body').height(50);
    $item.append($handle);

    return $item;
  };

  /**
   * Return valid widget klass.
   */
  WidgetManager.prototype.getWidgetClass = function(widgetClassName) {
    if (_.isFunction(window[widgetClassName])) {
      return window[widgetClassName];
    } else {
      return Widget;
    }
  };

  // Create widget instance
  WidgetManager.prototype.addWidget = function(node, $newEl, $oldEl) {
    // value from select
    var value = $('select', this.$step2).val();

    // options to create widget
    var options = {
      node: node,
      value: value,
      uuid: this.generateUUID(),
      size_name: $oldEl.data('size_name'),
        title: $oldEl.data('title')
    };
    $.extend(true, options, $oldEl.data('widget'));

    // check if class exists
    var _widget = this.getWidgetClass(options.klass_name);
    var widget = new _widget(this, $newEl, options);
    this.widgets.push(widget);
    widget.render();
  };

  // Remove widget from widget array
  WidgetManager.prototype.removeWidget = function(widget) {
    // Remove widget from array
    _.remove(this.widgets, widget);

    // Remove widget from gridstack
    this.$gridStack.removeWidget(widget.$container);
  };


  // Watch current widgets and reload them
  WidgetManager.prototype.watchReload = function() {
    _.forEach(this.widgets, function(widget) {
      if (widget.refresh) {
        if (widget.refreshCount == 0) {
          widget.render();
        }
        widget.updateCount();
      }
    }.bind(this));
  };

  window.WidgetManager = WidgetManager;
}(window, jQuery, _));


$(document).ready(function() {
  // Remove default loader
  $('#ajax-indicator').remove();
});
