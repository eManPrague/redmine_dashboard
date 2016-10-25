// Clock widget container, extends
// from Widget class.
var ClockWidget = (function(superClass, WidgetUtil) {
  // Extends
  WidgetUtil.extend(ClockWidget, superClass);

  // constructor
  function ClockWidget() {
    // Call parent
    ClockWidget.__super__.constructor.apply(this, arguments);
  };

  // After add callback
  ClockWidget.prototype.afterAdd = function() {
    // Get the local time using JS
    var date = new Date;
    var seconds = date.getSeconds();
    var minutes = date.getMinutes();
    var hours = date.getHours();

    // Create an object with each hand and it's angle in degrees
    var hands = {
      'hours-hand': (hours * 30) + (minutes / 2),
      'minutes': (minutes * 6),
      'seconds': (seconds * 6)
    };

    // Loop arround hands
    _.each(hands, function(angle, key) {
      $('.' + key, this.$container).each(function() {
        var $item = $(this);
        $item.css({
          'webkitTransform' :  'rotateZ(' +  angle + 'deg)',
          'transform' : 'rotateZ(' + angle + 'deg)'
        });

        if (key == 'minutes') {
          $(this).parent().attr('data-second-angle', hands.seconds);
        }
      });
    }.bind(this));

    // Resize widget
    this.$clock = $('.clock', this.$content);
    this.resize();
    $(window).resize(this.resize.bind(this));
  };

  ClockWidget.prototype.resize = function() {
    var containerWidth = this.$content.width();
    var containerHeight = this.$content.height();

    if (containerHeight > containerWidth) {
      this.$clock.width(containerWidth).height(containerWidth);
    } else {
      this.$clock.width(containerHeight).height(containerHeight);
    }
  };

  return ClockWidget;
})(Widget, WidgetUtil);
