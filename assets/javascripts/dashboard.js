// Dashboard slideBar
function closeNav(el) {
  var $el = $(el);
  var $content = $('.content', $el);
  $content.css('opacity', 1.0);

  $content.animate({
    'opacity': 0.0
  }, 100, function() {
    $el.animate({
      'width': '0px'
    }, 200)
  });
}

function openNav(el) {
  var $el = $(el);
  var $content = $('.content', $el);
  $content.css('opacity', 0.0);

  $el.animate({
    'width': '320px'
  }, 200, function() {
    $content.animate({
      'opacity': 1.0
    }, 100);
  });
}

function openStep1() {
  openNav('.sidenav.step1');
}

function closeStep1() {
  closeNav('.sidenav.step1');
}

function openStep2() {
  openNav('.sidenav.step2');
}

function closeStep2() {
  closeNav('.sidenav.step2');
}

function goForward() {
  closeStep1();
  setTimeout(openStep2, 400);
}

function goBack() {
  closeStep2();
  setTimeout(openStep1, 300);
}

$(document).ready(function() {
  // Trigger handlers here
  $('span.add-widget').click(function(e) {
    e.preventDefault();
    openStep1();
  });

  // Sidebar controls binding (dashboard.js specifies the functions)
  $('.cancel-icon', this.$step1).click(closeStep1);
  $('.back-icon', this.$step2).click(goBack);
  $('.cancel-icon', this.$step2).click(closeStep2);

  // Capture ESC
  $(document).keydown(function(e) {
      if (e.which === 27) {
        closeStep1();
        closeStep2();
      }
  });
});

