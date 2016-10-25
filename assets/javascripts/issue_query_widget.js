// Clock widget container, extends
// from Widget class.
var IssueQueryWidget = (function(superClass, WidgetUtil) {
  // Extends
  WidgetUtil.extend(IssueQueryWidget, superClass);

  // constructor
  function IssueQueryWidget() {
    // Call parent
    IssueQueryWidget.__super__.constructor.apply(this, arguments);
  };

  function parseQuery(qstr) {
    var query = {};
    var a = qstr.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
      var b = a[i].split('=');
      query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
  }

  // After render callback
  IssueQueryWidget.prototype.afterRender = function() {
    // Bind pages in Paginator
    $(this.$container[0]).find('.pages .page > a').click(function(e) {
      e.preventDefault();
      var page_from_href = e.target.href.split('?page=').pop();
      // Send data
      this.options.page = page_from_href;
      this.render();
    }.bind(this));
    // Bind sorting headers
    $(this.$container[0]).find('.list thead th > a').click(function(e) {
      e.preventDefault();
      var params = {};
      var params_from_href = e.target.href.split('&amp').pop();
      var url_params = parseQuery(params_from_href);
      // Send data
      this.options.sort = url_params['sort'];
      this.render();
    }.bind(this));
  };

  return IssueQueryWidget;
})(Widget, WidgetUtil);



