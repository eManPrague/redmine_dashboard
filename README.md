# Redmine Dashboard Plugin (developed during Ruby Rampage 2016)

Plugin that enables dragging and dropping widgets. These widgets can be dynamic - this means being remotely and asynchronously updated.
In this project you will find examples how to create your own custom widgets. We also provide a simple API to temporarly block refresh mechanisms (explained below), few examples are included with `state persists methods` (like pagination and sorting).

Widgets are positioned in responsive grid system. Widgets can be added and removed. You can have same instances of the same widget with different sizes or settings.

Widgets are managed by Widget Manager and accessed via slide-out sidebar. It contains image-like previews of widgets based on given sizes. Furthermore, each widget can be customized via option (dropdown select) and settings.
Settings allow you to change certain widget specific customizations.

Positioning, settings and options are **persisted throughout page reloads** and bound to specific users.

## Screenshot

![Screenshot](https://cloud.githubusercontent.com/assets/1773690/19630453/c8613968-998a-11e6-8b14-a35f97514370.png)
(or [Link](https://github.com/rumblex/rubyrampage2016-emaniac/blob/master/plugins/redmine_dashboard/doc/screenshot.png))


## Used libraries

* [Redmine](http://www.redmine.org)
* [Gridstack.js](https://github.com/troolee/gridstack.js)
* [Lodash](https://lodash.com)
* [jQuery](https://jquery.com)
* [MomentJS](http://momentjs.com/)


## Used APIs

* [OpenWeatherMap.org](https://openweathermap.org)

## Creating custom widgets

The plugin needs several components in order to display your widget and to have it work correctly.

On Rails part, you must provide specific data structure and pass it as JSON to Widget Manager. This manager is written in Javascript and handles widgets in categories and enables them to be drag and dropped.

For each widget you must also create its counterpart as Javascript class.

## Server-side / Ruby

Each widget must extend parent widget class `RedmineDashboard::Widget` (see `RedmineDashboard::Widgets::Weather` for example).

`Widget` class provides basic functionality to define widget behaviour:

* `widget_name` - Name
* `category` - Category
* `url` - Url for refreshing widgets (returns pure HTML content)
* `size` - Size options
* `option` - Other options (like city for Weather widgets)

**It's highly recommended to require your widget in init or files required in init because render works with .subclasses method.**

Best thing that you can do is to look into our widget implementations.

## Client-side / Javascript

First you need to set your template right, use `app/views/dashboard/index.html.erb` as a good starting point.

Don't forget to add neccessary HTML so Widget Manager can display its data there (see div's with ids `dashboard-sidebar-slide1` and `dashboard-sidebar-slide2` in `index.html`).

You must create an instance of *Widget Manager*, use `widget_manager_settings` helper method to pass required data to it as JSON.
See section below on more information on the manager.

Good example of a widget that is dynamic (calls to server to fetch updated data periodically) is `IssueQueryWidget` widget.

The convention is to use same class names in Javascript that you use them to represent in Rails portion of the app.

Your widget must be wrapped in self-executing function that accepts two arguments:

1. Base widget class `Widget` (found in `assets/javascripts/widget.js`)
2. Utility class `WidgetUtil` (same file as above)

Apart from this you need to call `extend` from `WidgetUtil` class and set-up a constructor.

See `IssueQueryWidget` widget for good example:

```
var IssueQueryWidget = (function(superClass, WidgetUtil) {
  // Inheritance
  WidgetUtil.extend(IssueQueryWidget, superClass);

  // Constructor
  function IssueQueryWidget() {
    // Call parent
    IssueQueryWidget.__super__.constructor.apply(this, arguments);
  };

  // Code goes here

})(Widget, WidgetUtil);
```

There are three methods that you can prototype to give you greater power over behaviour of your widget.

`prototype.afterRender()` - executes immediately after widget is remotely updated / re-rendered, this is mostly used for binding content that was fetched

`prototype.afterAdd()` - launches after widget is dropped to grid and rendered

`prototype.afterRemove()` - clean-up and un-bind controls, you can also reset timeouts on instances of this widget

See base *Widget* class for all the stuff you can access:

`this.$container` - jQuery object representing widget in grid

`this.$content` - jQuery object representing content area that is dynamically re-rendered

`this.template` - HTML for static widgets

`this.refreshInterval` - amount of seconds dynamic widget is refreshed

`prototype.startLoading()` - show spinner

`prototype.stopLoading()` - hide spinner

### Static widgets

You might want to have a simple widget that does not get updated with data from server periodically (for example image gallery).
This can be implemented by setting `this.template` with HTML string. Widget will detect this and will only render the widget once.
See `assets/javascripts/clock_widget.js` to see how `ClockWidget` this works.

### Widget Manager

See source in `assets/javascripts/widget_manager.js`. Instance of manager must be available otherwise plugin will not work.

The manager has two roles:

1. Display widgets in categories and present them to the user in sliding sidebar.
2. Keep track of active widgets in grid via `this.widgets` array on instance of the manager.

The widgets are loaded into manager as a list of JSON objects via `registerWidgets()` method. See `index.html` that includes helper `register_widgets` to load necessary data into the manager.

## License

See `LICENSE` file. This project is under GNU GPL License version 3.0.
