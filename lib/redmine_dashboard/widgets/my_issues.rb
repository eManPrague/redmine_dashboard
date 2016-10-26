module RedmineDashboard
  module Widgets
    # Define issues assigned to me widget with 2x1 size
    class MyIssues < ::RedmineDashboard::Widget
      # Name Issues assigned to me
      widget_name :my_issues

      # General category
      category :issues

      # Define 2x2 tile
      size :normal, width: 2, height: 2, description: "Issues assigned to me"

      # Url
      url controller: 'general_widgets', action: 'my_issues'
    end
  end
end
