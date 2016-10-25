class AddDashboardSettingsToProject < ActiveRecord::Migration
  def change
    add_column :projects, :dashboard_settings, :text
  end
end
