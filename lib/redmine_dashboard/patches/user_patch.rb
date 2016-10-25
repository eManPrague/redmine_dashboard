module RedmineDashboard
  module Patches
    # Dashboard user patch to add serialize dashboard settings
    # to user model.
    module UserPatch
      def self.included(base)
        base.class_eval do
          serialize :dashboard_settings
        end
      end
    end
  end
end
