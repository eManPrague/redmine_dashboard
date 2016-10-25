class AddDashboardSettingsToUser < ActiveRecord::Migration
  def change
    add_column :users, :dashboard_settings, :text
  end
end
