// We are much happier with inheritance
// than callbacks, and we want to provide it.
var WidgetUtil = function() {
  // Empty..
};

// Some weird but stil cool function
WidgetUtil.prototype.hasProp = {}.hasOwnProperty;

// Extends method (aka CoffeeScript)
WidgetUtil.extend = function(child, parent) {
  for (var key in parent) {
    if (this.hasProp.call(parent, key)) child[key] = parent[key];
  }

  function ctor() {
    this.constructor = child;
  }

  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  return child;
};

// Widget class
function Widget(manager, container, args) {
  this.$container = $(container);

  // Get content
  this.$content = $('.content', this.$container);

  // Get title bar name
  this.$title = $('.title-bar .name', this.$container);

  // Edit options
  this.$editPanel = $('.edit-block', this.$container);

  // Name displayed on top of widget
  this.title = args.title;
  this.uuid = args.uuid;

  // Manager
  this.manager = manager;

  // Save arguments
  this.args = args;

  // Template
  this.template = args.template;

  // continuously render widget
  this.refresh = true;

  this.refreshInterval = 30;

  // secs to continuously render
  this.refreshCount = this.refreshInterval;

  // Get options
  this.setOptions();

  // Bind Buttons
  this.bindButtons();
};

/**
 * Set title
 */
Widget.prototype.setTitle = function(title) {
  this.$title.text(title);
};

/**
 * Bind edit, remove buttons.
 */
Widget.prototype.bindButtons = function() {
  $('.delete-icon', this.$container).click(function() {
    // remove from Widget Manager
    this.manager.removeWidget(this);
  }.bind(this));

  $('.edit-icon', this.$container).click(function() {
    this.$editPanel.show();
    $('input[name=title]', this.$editPanel).val(this.title);
    this.refresh = false;
  }.bind(this));

  $('.cancel-icon', this.$editPanel).click(function() {
    this.$editPanel.hide();
    this.refresh = true;
  }.bind(this));

  $('.ok-icon', this.$editPanel).click(function() {
    $('form input', this.$editPanel).each(function(index, input) {
      var $input = $(input);
      this.options[$input.attr('name')] = $input.val();

      if ($input.attr('name') == 'title') {
        this.title = $input.val();
      }
    }.bind(this));

    this.setTitle(this.title);
    this.manager.$grid.trigger('change');
    this.$editPanel.hide();
    this.refresh = true;
    this.refreshCount = 0;
  }.bind(this))
}

/**
 * Create default options object.
 */
Widget.prototype.setOptions = function() {
  this.options = {
    value_id: (this.args.value_id || this.args.value),
    size: (this.args.size_name || this.args.size)
  };

  if (this.args.copyKeys) {
    _.each(this.args.copyKeys, function(key) {
      this.options[key] = this.args[key];
    }.bind(this));
  }
};

/**
 * Call after render (but only once).
 */
Widget.prototype.callAfterAdd = function() {
  // Guard
  if (this.afterRenderCalled) {
    return;
  }

  if (_.isFunction(this.afterAdd)) {
    this.afterAdd();
  }

  this.afterRenderCalled = true;
};

/**
 * Render widget.
 */
Widget.prototype.render = function() {
  if (this.template && this.template.length > 0) {
    this.refresh = false;

    // Get Promise
    var promise = this.$content.html(this.template).promise();

    // Call after add
    promise.done(this.callAfterAdd.bind(this));

    if (_.isFunction(this.afterRender)) {
      promise.done(this.afterRender.bind(this));
    }
  } else {
    this.callAfterAdd();
    this.fetchView();
  }
};

/**
 * Return settings data for save methods().
 *
 * @return [Object] Data
 */
Widget.prototype.settingsData = function() {
  // Get node directly from container
  var node = this.$container.data('_gridstack_node');

  return {
    position: { // Serialize position data
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    },
    widget: this.args.name,
    options: this.options // All options data
  };
}

/**
 * Fetch data for content (call Ajax refresh).
 */
Widget.prototype.fetchView = function() {
  this.refresh = false;
  this.startLoading();

  $.ajax({
    method: 'POST',
    url: this.args.url,
    data: this.options,
    success: function(data) {
      // Set content in proper container and call after render
      var promise = this.$content.html(data).promise();

      if (_.isFunction(this.afterRender)) {
        promise.done(this.afterRender.bind(this));
      }

      this.stopLoading();
      this.resetCount();
      this.refresh = true;
    }.bind(this),
    error: function(xhr, err, msg) {
      this.stopLoading();
      this.$content.html('<h3 class="warning">' + msg + '</h3>');
    }.bind(this)
  });
};

/**
 * Help method to start loading.
 */
Widget.prototype.startLoading = function() {
  this.$container.addClass('loading');
};

/**
 * Help method to stop loading.
 */
Widget.prototype.stopLoading = function() {
  this.$container.removeClass('loading');
};

/**
 * Decrement counter
 */
Widget.prototype.updateCount = function() {
  if (this.refreshCount == 0) {
    this.resetCount();
  } else {
    this.refreshCount--;
  }
};

/**
 * Reset count.
 */
Widget.prototype.resetCount = function() {
  this.refreshCount = this.refreshInterval;
};
