require 'redmine'
require 'redmine_dashboard'

Redmine::Plugin.register :redmine_dashboard do
  name 'Redmine Dashboard plugin'
  author 'Comatory, Lebedant, Strnadj'
  description 'Redmine dashboard for portal and project page'
  version '0.0.1'
  url 'https://eman.cz/redmine/'
  author_url 'http://eman.cz/'

  # Remove useless top menus
  delete_menu_item :top_menu, :home
  delete_menu_item :top_menu, :my_page

  # Add dashboard menu
  menu(
    :top_menu,
    :dashboard,
    { controller: 'dashboard', action: 'index' },
    if: proc { User.current.logged? },
    first: true,
    caption: :dashboard_title
  )
end
