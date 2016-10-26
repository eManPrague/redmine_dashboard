module RedmineDashboard
  module Widgets
    # Define issues assigned to me widget with 2x1 size
    class WatchedIssues < ::RedmineDashboard::Widget
      # Name Watched issues
      widget_name :watched_issues

      # General category
      category :issues

      # Define 2x1 tile
      size :normal, width: 2, height: 1

      # Define timeout value for autoRefresh
      timeout 20 * 60 # = 20 minutes

      # Url
      url controller: 'general_widgets', action: 'watched_issues'
    end
  end
end
