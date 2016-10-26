module RedmineDashboard
  module Widgets
    # Define simple clock widget with 1x1 size
    # (template from https://cssanimation.rocks/clocks/)
    class Weather < ::RedmineDashboard::Widget
      # Name clock
      widget_name :weather

      # General category
      category :general

      # Define 1x1 tile
      size :small, width: 1, height: 1, description: "Dynamic weather forecast in selected city"

      # Url
      url controller: 'general_widgets', action: 'weather'

      # Options
      option :city

      # Register javascripts with custom widget
      register_stylesheet 'weather_widget.css', plugin: :redmine_dashboard
    end
  end
end
