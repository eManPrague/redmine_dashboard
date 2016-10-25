# Parent namespace for all Redmine Dashboard functions.
module RedmineDashboard
  # Require all widgets in widgets directory.
  Dir[File.dirname(__FILE__) + '/redmine_dashboard/widgets/*.rb'].each do |file|
    require file
  end
end

Rails.configuration.to_prepare do
  require_dependency 'user'
  require_dependency 'project'

  unless User.included_modules.include? RedmineDashboard::Patches::UserPatch
    User.send(:include, RedmineDashboard::Patches::UserPatch)
  end

  unless Project.included_modules.include? RedmineDashboard::Patches::UserPatch
    Project.send(:include, RedmineDashboard::Patches::ProjectPatch)
  end
end
