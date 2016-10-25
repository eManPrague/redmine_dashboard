module RedmineDashboard
  module Patches
    # Dashboard project patch to add serialize dashboard settings
    # to project model.
    module ProjectPatch
      def self.included(base)
        base.class_eval do
          serialize :dashboard_settings
        end
      end
    end
  end
end
