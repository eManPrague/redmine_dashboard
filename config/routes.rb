# Plugin's routes
controller :dashboard do
  get 'index', as: :dashboard
  post 'save', as: :save_dashboard
  get 'load', as: :load_dashboard
end

controller :general_widgets do
  post 'news'
  post 'timelog'
  post 'my_issues'
  post 'watched_issues'
  post 'reported_issues'
  post 'weather'
end

post '/issue_query_widget' => 'issue_query_widgets#render_widget'
get '/issue_query_widget'  => 'issue_query_widgets#refresh_widget'
