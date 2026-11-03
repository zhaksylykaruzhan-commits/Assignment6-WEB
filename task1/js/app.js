/* ------------------------------------------------------------------
   Task 1 - wiring: case buttons, highlight, jump, result panel.
   ------------------------------------------------------------------ */

/* The found guests jump once: up and back down (animate, no queue clash). */
function jump($guests) {
  $guests.children('.card').animate({ top: -16 }, {
    duration: 170, queue: false,
    complete: function () { $(this).animate({ top: 0 }, { duration: 200, queue: false }); }
  });
}

function namesOf($set) {
  return $set.map(function () { return $(this).data('name'); }).get();
}

function showResult(c, $found) {
  const names = namesOf($found);
  const what = c.kind === 'rooms' ? (names.length === 1 ? 'room' : 'rooms')
                                  : (names.length === 1 ? 'guest' : 'guests');
  $('#result')
    .find('.result-case').text('Case ' + c.n).end()
    .find('.result-q').text(c.q).end()
    .find('.result-a').html('<strong>' + names.length + ' ' + what + ':</strong> ' + names.join(', '));
}

function runCase(n) {
  const c = CASES[n - 1];
  buildParty();                              // build the page again before every case
  const $found = c.run();                    // the one jQuery chain
  $found.addClass('found');                  // highlight what the case finds
  if (c.kind === 'guests') jump($found);     // found guests jump once
  showResult(c, $found);
  $('.case-btn').removeClass('active').filter('[data-case="' + n + '"]').addClass('active');
  return $found;
}

$(function () {
  buildParty();
  buildLegend();

  CASES.forEach(function (c) {
    $('<button type="button" class="case-btn">')
      .attr({ 'data-case': c.n, title: c.q })
      .append($('<b>').text(c.n)).append($('<span>').text(c.label))
      .appendTo('#cases');
  });

  $('#cases').on('click', '.case-btn', function () {
    runCase($(this).data('case'));
  });
});
