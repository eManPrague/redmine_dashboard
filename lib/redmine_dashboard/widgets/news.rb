module RedmineDashboard
  module Widgets
    # Define issues assigned to me widget with 2x1 size
    class News < ::RedmineDashboard::Widget
      # Name News
      widget_name :news

      # General category
      category :general

      # Define 2x2 tile
      size :normal, width: 2, height: 2

      # Url
      url controller: 'general_widgets', action: 'news'
    end
  end
end
