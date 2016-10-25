module RedmineDashboard
  module Widgets
    # Issue queries
    class IssueQuery < ::RedmineDashboard::Widget
      # Name Issue query
      widget_name :issue_query

      # General category
      category :issues

      # Define 1x1 tile
      size :small,  width: 1, height: 1
      # Define 2x3 tile
      size :normal, width: 2, height: 2
      # Define 3x3 tile
      size :bigger, width: 3, height: 3

      url controller: 'issue_query_widgets', action: 'render_widget'

      # Values - all available queries
      values -> do
        # Get issue query for current user
        ::IssueQuery.visible.pluck(:id, :name).to_h
      end

      register_javascript 'issue_query_widget.js', plugin: :redmine_dashboard
    end
  end
end
