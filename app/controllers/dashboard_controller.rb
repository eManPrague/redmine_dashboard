# My Dashboard base controller.
class DashboardController < ApplicationController
  unloadable
  before_filter :require_login

  # Dashboard index
  def index
  end

  # Return current user settings!
  def load
    # Return json data
    render json: (User.current.dashboard_settings || {})
  end

  # Save current status for user. Expecting something like:
  #
  #   params[:widgets] = [{
  #     x: 0,
  #     y: 3,
  #     width: 5,
  #     height: 5,
  #     options: {
  #       name: 'Custom name',
  #       .. other options
  #     }
  #   }]
  #
  def save
    # Get widget data
    User.current.update_attributes(dashboard_settings: params[:widgets])

    # Return 200 OK
    head :ok
  end
end
