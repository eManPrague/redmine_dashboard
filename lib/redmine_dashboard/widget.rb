# Redmine Dashboard Widget DSL (domain specific language)
# will help to define new widget modules from other plugins.
module RedmineDashboard
  # == Widget
  #
  # Provides functionallity to define functions for all descendants.
  #
  class Widget
    # Define default options for widget size
    DEFAULT_WIDGET_SIZE = {
      width: 1,
      height: 1
    }.freeze

    # Widget size container.
    class WidgetSize
      # Attributes name and options
      attr_accessor :name, :options

      def initialize(name, options) #:nodoc:
        @name = name
        @options = options
      end

      # Return json representation of size.
      #
      # ===  Return
      #
      # * +Hash+ - Hash with size data.
      #
      def to_json
        options.merge(name: name)
      end

      # Forward method to options data. It provides
      # functionallity like `.width` `.height` for
      # tiles.
      def method_missing(m, _, _)
        m = m.to_sym

        if options.key?(m)
          options[m]
        else
          # Fail with no method error..
          super
        end
      end
    end

    # Define class methods
    class << self
      # Return json representation for WidgetManager.
      #
      # === Return
      #
      # * +Hash+ - Return serializable hash object.
      #
      def to_json
        {
          name: widget_name,
          klass_name: "#{widget_name.to_s.classify}Widget",
          category: category,
          sizes: sizes.values.map(&:to_json)
        }
      end

      # Define new name for widget, if name is not provide
      # return current name. Name is used for translation
      # in 'redmine-like' conventions:
      #
      #   name: 'clock'
      #   en.yml: widget_clock: 'Current time'
      #
      # === Attributes
      #
      # * +val+ - New name (default nil)
      #
      # === Return
      #
      # * +string+ - Current / New name
      #
      def widget_name(val = nil)
        @widget_name = val if val
        @widget_name
      end

      # Define new category for widget, if category is not provide
      # return current category. category is used for translation
      # in 'redmine-like' conventions:
      #
      #   category: 'general'
      #   en.yml: widget_categories_clock: 'General widgets'
      #
      # === Attributes
      #
      # * +val+ - New category (default nil)
      #
      # === Return
      #
      # * +string+ - Current / New category name
      #
      def category(val = nil)
        @category = val if val
        @category
      end

      # Define refresh url.
      #
      # === Attributes
      #
      # * +url+ - URL can be string (with URL), symbol (path helper) or
      #           hash (`url_for` attributes)
      #
      # === Examples
      #
      #   # External URL
      #   url 'http:///google.com..../'
      #
      #   # Helper path method
      #   url :clock_widget_path
      #
      #   # Hash - url_for attributes
      #   url controller: :widget_clock, action: :refresh_clock
      #
      #
      def url(val = nil)
        @url = val if val
        @url
      end

      # Register single options with configuration.
      #
      # === Attributes
      #
      # * +name+ - Options name (will be localized)
      # * +options+ - Option configurations
      #
      def option(name, opts = {})
        option_list << name
      end

      # Return options array with all of currently added options.
      #
      # === Return
      #
      # * +array+ - Array of options
      #
      def option_list
        @option_list ||= []
      end

      # Declare sizes for widgets, first arg is name.
      # This name will be used for translation in
      # 'redmine-like' conventions:
      #
      #    name: 'small'
      #    en.yml: widget_clock_small: 'Digit clock'
      #
      # === Attributes
      #
      # * +name+ - Name for size
      # * +options+ - Options
      #
      # === Options
      #
      # * +:width+ - Widget width in `number of tiles` (default: 1)
      # * +:height+ - Widget height `number of tiles` (default: 1)
      #
      def size(name, options = {})
        # Coeerce to sym
        name = name.to_sym

        # Size name is unique
        raise "Widget size name: '#{name}' already exists!" if sizes[name]

        # Set default options
        options = DEFAULT_WIDGET_SIZE.merge(options)

        # Append to sizes array
        sizes[name] = WidgetSize.new(name, options)
      end

      # Returns current array of declared sizes.
      #
      # === Return
      #
      # * +hash+ - Current sizes
      #
      def sizes
        @sizes ||= {}
      end

      # Values options (especially for top query).
      #
      # === Attributes
      #
      # * +val+ - Value options (it can be Lambda or Hash)
      #
      # === Return
      #
      # * +val+ - Current values.
      #
      def values(val = nil)
        @values = val if val
        @values
      end

      # Register stylesheets.
      #
      # === Attributes
      #
      # * +name+ - Stylesheet name
      # * +options+ - Options
      #
      # === Options
      #
      # * +:plugin+ - Plugin name
      #
      def register_stylesheet(name, options = {})
        stylesheets << [name, options]
      end

      # Registered stylesheets.
      #
      # === Return
      #
      # * +array+ - Current stylesheets
      #
      def stylesheets
        @stylesheets ||= []
      end

      # Register javascripts.
      #
      # === Attributes
      #
      # * +name+ - Stylesheet name
      # * +options+ - Options
      #
      # === Options
      #
      # * +:plugin+ - Plugin name
      #
      def register_javascript(name, options = {})
        javascripts << [name, options]
      end

      # Registered stylesheets.
      #
      # === Return
      #
      # * +array+ - Current javascripts
      #
      def javascripts
        @javascripts ||= []
      end

      # Define static template, widget won't be updated
      # expecting to this widget has own javascript widget
      # class to take care of it..
      #
      # === Attributes
      #
      # * +template+ - This will be string
      # * +render+ - True if provided template is partial path, otherwise string content
      #              will be written directly in DOM (default: false)
      #
      def static_template(template, render = false)
        @static_template = template
        @static_template_render = render
      end

      # Return static template.
      #
      # === Return
      #
      # * +string/nil+ - When template is present
      #
      def static_template_path_or_string
        @static_template
      end

      # Return boolean (if render partial or not).
      #
      # === Return
      #
      # * +boolean/nil+ - Render or not
      #
      attr_reader :static_template_render
    end
  end
end
