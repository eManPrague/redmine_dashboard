require 'open_weather'

# General standart my-page widgets.
class GeneralWidgetsController < ApplicationController
  skip_before_action :verify_authenticity_token
  helper :my
  include MyHelper

  def my_issues
    render partial: 'my/blocks/issuesassignedtome'
  end

  def watched_issues
    render partial: 'my/blocks/issueswatched'
  end

  def reported_issues
    render partial: 'my/blocks/issuesreportedbyme'
  end

  def timelog
    @user = User.current
    render partial: 'my/blocks/timelog'
  end

  def news
    @news = news_items
    render partial: 'my/blocks/news'
  end

  def weather
    # Load wether
    @weather = load_weather unless params[:city].blank?

    # Render partial
    render partial: 'widgets/weather'
  end

  private

  def load_weather
    options = {
      units: 'metric',
      # TODO: Move to configuration
      APPID: 'f210cd40988162daf519396d383dc4ac'
    }

    # Call Weather api
    ret = OpenWeather::Current.city(params[:city], options)

    if ret['cod'].to_i == 200
      ret
    else
      nil
    end
  end
end
