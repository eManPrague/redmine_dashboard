# Issue Query controller for widgets.
class IssueQueryWidgetsController < ApplicationController
  skip_before_action :verify_authenticity_token

  helper :queries
  include QueriesHelper
  helper :sort
  include SortHelper
  helper :issues

  PAGE_LIMIT = 5

  def render_widget
    @query = IssueQuery.visible.find(params[:value_id])
    sort_init(@query.sort_criteria.empty? ? [['id', 'desc']] : @query.sort_criteria)
    sort_update(@query.sortable_columns)
    @query.sort_criteria = sort_criteria.to_a
    @issue_count_by_group = @query.issue_count_by_group

    # Default limit
    @limit = PAGE_LIMIT

    @issue_count = @query.issue_count
    @issue_pages = Paginator.new @issue_count, @limit, params[:page]
    @offset ||= @issue_pages.offset
    @issues = @query.issues(include: [:assigned_to, :tracker, :priority, :category, :fixed_version],
                            order: sort_clause,
                            offset: @offset,
                            limit: @limit)

    respond_to do |format|
      format.html { render text: template_by_size(params[:size]) }
    end
  end

  def refresh_widget
    flash.clear
    render json: { refresh: true }
  end

  private

  def template_by_size(size)
    case size.to_sym
    when :normal
      render_to_string(partial: 'normal_size_widget')
    when :bigger
      render_to_string(partial: 'bigger_size_widget')
    when :small
      render_to_string(partial: 'small_size_widget')
    end
  end
end
