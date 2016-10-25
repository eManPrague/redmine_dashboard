# Sets of helpers to render dahsboard widgets
module DashboardHelper
  # Method returns widget data for WidgetManager.
  #
  # === Attributes
  #
  # * +klass+ - Widget klass
  #
  # === Return
  #
  # * +Hash+ - Hash
  #
  def widget_info(klass)
    # Prepare hash with translations
    data = klass.to_json.merge({
      l_name: l("widget_#{klass.widget_name}"),
      l_category: l("widget_categories_#{klass.category}"),
      sizes: klass.sizes.values.map(&:to_json),
      url: widget_url(klass),
      values: klass.values.respond_to?(:call) ? klass.values.call : klass.values,
      template: widget_template(klass),
      available_settings: klass.option_list.map { |m| [ m, l("widget_#{klass.widget_name}_options_#{m}") ] }.to_h
    })

    # Return data
    data
  end


  # Widget template.
  #
  # === Attributes
  #
  # * +klass+ - Widget template
  #
  # === Return
  #
  # * +klass+ - Klass template
  #
  def widget_template(klass)
    template = klass.static_template_path_or_string

    # No template
    return unless template

    if klass.static_template_render
      render(partial: template)
    else
      template
    end
  end

  # Determine proper widget url from klass.
  #
  # === Attributes
  #
  # * +klass+ - Widget klass
  #
  # === Return
  #
  # * *string* - Refresh path
  #
  def widget_url(klass)
    url = klass.url

    if url.is_a?(Symbol) # ..._path (auto generated)
      send(url)
    elsif url.is_a?(Hash) # { controller: ...} (for url_for)
      url_for(url)
    else # Otherwise (string, nil)
      url
    end
  end

  # Return all widget manager settings.
  #
  # === Return
  #
  # * +hash+ - Settings object
  #
  def widget_manager_settings
    {
      step1: '#dashboard-sidebar-slide1',
      step2: '#dashboard-sidebar-slide2',
      savePath: save_dashboard_path,
      loadPath: load_dashboard_path
    }.to_json.html_safe
  end

  # Return all available widgets.
  #
  # === Return
  #
  # * +Array+ - Array of Widget subclasses
  #
  def available_widgets
    RedmineDashboard::Widget.subclasses
  end

  # Includes widget javascripts and stylesheets.
  def include_widget_stylesheets
    available_asset_widgets do |name, options|
      concat(stylesheet_link_tag(name, options))
    end
  end

  # Include all widget javascripts
  def include_widget_javascripts
    available_asset_widgets(:javascripts) do |name, options|
      concat(javascript_include_tag(name, options))
    end
  end

  # Generate javascript code to widgets.
  def register_widgets
    widgets_options = available_widgets.map do |widget|
      widget_info(widget)
    end
    # Render widget options
    javascript_tag("widgetManager.registerWidgets(#{widgets_options.to_json.html_safe})")
  end

  # Javascript locales.
  #
  # === Return
  #
  # * +Hash+ - Locales
  #
  def javascript_locales
    I18n.t('javascript').to_json.html_safe
  end

  private

  # Yields available widget styles / javascripts.
  #
  # === Attributes
  #
  # * +type+ - Stylesheets or javascripts (default: :stylesheets)
  #
  def available_asset_widgets(type = :stylesheets)
    available_widgets.each do |widget|
      widget.send(type).each do |name, options|
        # Yield with css/js name and options
        # Don't remove dup, cause stylesheet_link and javascript_include_tag
        # work with options
        yield(name, options.dup)
      end
    end
  end
end
