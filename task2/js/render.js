/* ------------------------------------------------------------------
   Rendering: the page is built from the PARTY array with jQuery.
   Guest data is stored on the card as classes and data-* attributes.
   ------------------------------------------------------------------ */
const SVG = (body) =>
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';

const ICONS = {
  phone:   SVG('<rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M10.5 18.5h3"/>'),
  glasses: SVG('<circle cx="6.5" cy="14.5" r="3.5"/><circle cx="17.5" cy="14.5" r="3.5"/><path d="M10 14.5h4M3.2 13.5 5 8M20.8 13.5 19 8"/>'),
  bag:     SVG('<path d="M5 8h14l-1 12.5H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
  cup:     SVG('<path d="M5 9.5h11v4.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9.5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5v2.5M12 3.5v2.5"/>'),
  crumbs:  SVG('<path d="M3 17l9-7 9 4v3.5H3V17z"/><path d="M15 5.5h.01M19 7.5h.01M12 4h.01M20.5 11h.01"/>'),
  cap:     SVG('<path d="M2 9.5 12 4.5l10 5-10 5-10-5z"/><path d="M6 12.5v4c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8v-4"/>'),
  clock:   SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')
};
const THING_LABEL = { phone: 'Phone', glasses: 'Glasses', bag: 'Bag', cup: 'Cup', crumbs: 'Cake crumbs' };

function toMinutes(t) {
  const p = t.split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}

/* Sort state per room (true = sorted by time). Reset on every rebuild. */
const SORTED = {};

/* One guest card. Everything the cases need is stored as classes + data-*. */
function buildGuest(g, room) {
  const classes = ['guest', 'color-' + g.color, g.aitu ? 'aitu' : 'not-aitu']
    .concat(g.things.map(function (t) { return 'has-' + t; }));

  const $guest = $('<div>').addClass(classes.join(' ')).attr({
    'data-name': g.name,
    'data-color': g.color,
    'data-time': g.time,
    'data-minutes': toMinutes(g.time),
    'data-aitu': g.aitu,
    'data-things': g.things.join(' '),
    'data-room': room.id,
    'data-floor': room.floor
  });

  const $avatar = $('<div class="avatar">')
    .append($('<img>').attr({ src: 'avatars/' + g.name + '.svg', alt: g.name, width: 56, height: 56 }));
  if (g.aitu) $avatar.append($('<span class="badge" title="AITU student">').html(ICONS.cap));

  const $things = $('<div class="things">');
  g.things.forEach(function (t) {
    $things.append($('<span class="thing">').attr('title', THING_LABEL[t]).html(ICONS[t]));
  });

  $('<div class="card">').attr({ tabindex: 0, role: 'button', 'aria-label': g.name })
    .append($avatar)
    .append($('<div class="name">').text(g.name))
    .append($('<div class="time">').html(ICONS.clock + '<span>' + g.time + '</span>'))
    .append($things)
    .appendTo($guest);

  return $guest;
}

/* Builds (or rebuilds) the whole party inside #floors. */
function buildParty() {
  const $floors = $('#floors');
  $floors.find('*').stop(true);          // no animation survives a rebuild
  $floors.empty();
  Object.keys(SORTED).forEach(function (k) { delete SORTED[k]; });

  [2, 1].forEach(function (floor) {
    const $floor = $('<div class="floor">').attr('data-floor', floor)
      .append($('<div class="floor-label">').text('Floor ' + floor));
    const $rooms = $('<div class="rooms">').appendTo($floor);

    PARTY.filter(function (r) { return r.floor === floor; }).forEach(function (room) {
      const $room = $('<section class="room">').attr({
        id: room.id, 'data-name': room.name, 'data-room': room.id, 'data-floor': floor
      });
      $('<header class="room-head">')
        .append($('<h3>').text(room.name))
        .append($('<span class="count">'))
        .append($('<button type="button" class="sort-btn" aria-pressed="false">').attr('data-room', room.id).text('Sort by time'))
        .appendTo($room);
      const $list = $('<div class="guests">').appendTo($room);
      room.guests.forEach(function (g) { $list.append(buildGuest(g, room)); });
      $rooms.append($room);
    });
    $floors.append($floor);
  });
  updateCounts();
}

function updateCounts() {
  $('.room').each(function () {
    const n = $(this).find('.guest').not('.leaving').length;
    $(this).find('.count').text(n + (n === 1 ? ' guest' : ' guests'));
  });
}

/* Fills the legend under the house. */
function buildLegend() {
  const $l = $('#legend').empty();
  const colors = $('<span class="legend-group">');
  ['red', 'blue', 'green', 'black', 'yellow', 'purple'].forEach(function (c) {
    colors.append($('<i class="dot">').addClass('color-' + c));
  });
  colors.append(' Clothing color');
  $l.append(colors);
  const items = $('<span class="legend-group">');
  Object.keys(THING_LABEL).forEach(function (k) {
    items.append($('<span class="legend-item">').html('<span class="thing">' + ICONS[k] + '</span> ' + THING_LABEL[k]));
  });
  $l.append(items);
  $l.append($('<span class="legend-group">').html('<span class="legend-item">' + ICONS.clock + ' Arrival time</span>' +
    '<span class="legend-item"><span class="badge static">' + ICONS.cap + '</span> AITU student</span>'));
}
