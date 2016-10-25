module RedmineDashboard
  module Widgets
    # Define simple clock widget with 1x1 size
    # (template from https://cssanimation.rocks/clocks/)
    class Clock < ::RedmineDashboard::Widget
      # Name clock
      widget_name :clock

      # General category
      category :general

      # Define 1x1 tile
      size :small, width: 1, height: 1
      size :normal, width: 1, height: 2

      # Render
      static_template 'widgets/clock', true

      # Register javascripts with custom widget
      register_javascript 'clock_widget.js',  plugin: :redmine_dashboard
      register_stylesheet 'clock_widget.css', plugin: :redmine_dashboard
    end
  end
end
