/* ------------------------------------------------------------------
   Task 2 - the party in motion.
   1. Spotlight   2. Guest card   3. Move   4. Sort by time
   All animations are jQuery (fadeTo / animate). stop() keeps fast clicks clean.
   ------------------------------------------------------------------ */
const POPUP_W = 300;
const flights = [];          // running flight animations (so a rebuild can stop them)
let popup = null;            // { $box, $guest, closing }
let pendingGuest = null;     // guest to open after the current card has closed

/* ============ 1. Spotlight ============ */
function spotlight($found, kind) {
  const $cards = $('.guest .card');
  // cases that find rooms keep the guests of those rooms bright
  const $bright = (kind === 'rooms' ? $found.find('.guest') : $found).children('.card');
  $cards.not($bright).stop('fx', true).fadeTo(300, 0.2);
  $bright.stop('fx', true).fadeTo(300, 1);
}

function clearSpotlight() {
  $('.guest .card').stop('fx', true).fadeTo(300, 1);
  $('.found').removeClass('found');
}

/* ============ 2. Guest card ============ */
function describeGuest($g) {
  const words = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };
  const list = ($g.attr('data-things') || '').split(' ').filter(Boolean).map(function (t) { return words[t]; });
  let has = 'Came with nothing';
  if (list.length === 1) has = 'Has ' + list[0];
  if (list.length > 1) has = 'Has ' + list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  const room = $g.closest('.room');
  return [
    'Came at ' + $g.attr('data-time'),
    $g.is('.aitu') ? 'AITU student' : 'Not an AITU student',
    has,
    'Wears ' + $g.attr('data-color'),
    'Stands in the ' + room.attr('data-name').toLowerCase() + ', floor ' + room.attr('data-floor')
  ];
}

function openPopup($guest) {
  const name = $guest.attr('data-name');
  const ring = getComputedStyle($guest[0]).getPropertyValue('--ring');
  const $av = $guest.find('.avatar');
  const a = $av.offset(), aw = $av.outerWidth();

  const $facts = $('<ul class="facts">');
  describeGuest($guest).forEach(function (t) { $facts.append($('<li>').text(t)); });

  const $inner = $('<div class="popup-inner">')
    .append($('<div class="popup-head">')
      .append($('<img class="popup-avatar" alt="">').attr('src', 'avatars/' + name + '.svg').css('border-color', ring))
      .append($('<div>').append($('<h4>').text(name))))
    .append($facts);

  // only guests from the array can move (the array is changed after a move)
  const inArray = PARTY.some(function (r) { return r.guests.some(function (g) { return g.name === name; }); });
  if (inArray) {
    const $moves = $('<div class="moves">');
    PARTY.forEach(function (r) {
      if (r.id !== $guest.attr('data-room')) {
        $('<button type="button" class="move-btn">').attr('data-to', r.id)
          .text('Move to the ' + r.name.toLowerCase()).appendTo($moves);
      }
    });
    $inner.append($moves);
  }

  const $photo = $('<img class="popup-photo" alt="">').attr('src', 'avatars/' + name + '.svg');
  const $box = $('<div class="guest-popup" role="dialog">').css('border-color', ring)
    .append($inner).append($photo)
    .css({ left: -9999, top: 0, width: POPUP_W, height: 'auto', visibility: 'hidden' }).appendTo('body');

  // final size and position (kept inside the visible window)
  const H = $box.outerHeight(), $w = $(window);
  const fx = Math.max($w.scrollLeft() + 8, Math.min(a.left + aw / 2 - POPUP_W / 2, $w.scrollLeft() + $w.width() - POPUP_W - 8));
  const fy = Math.max($w.scrollTop() + 8, Math.min(a.top - 12, $w.scrollTop() + $w.height() - H - 8));

  // start small, exactly on the guest's photo
  $box.css({ visibility: 'visible', left: a.left, top: a.top, width: aw, height: aw, borderRadius: aw / 2 });
  $inner.css('opacity', 0);
  $photo.css('opacity', 1);

  popup = { $box: $box, $guest: $guest, closing: false };
  $box.animate({ left: fx, top: fy, width: POPUP_W, height: H, borderRadius: 18 }, 340, 'swing');
  $photo.animate({ opacity: 0 }, 300);
  $inner.delay(140).animate({ opacity: 1 }, 220);
}

function closePopup(instant) {
  if (!popup || popup.closing) return;
  const p = popup;
  if (instant) { p.$box.stop(true).remove(); popup = null; pendingGuest = null; return; }

  p.closing = true;
  const $av = p.$guest.find('.avatar'), a = $av.offset(), aw = $av.outerWidth();
  p.$box.stop(true);                                       // stop the growth if it is still running
  p.$box.find('.popup-inner').stop(true).animate({ opacity: 0 }, 120);
  p.$box.find('.popup-photo').stop(true).animate({ opacity: 1 }, 200);
  // shrink back into the photo
  p.$box.animate({ left: a.left, top: a.top, width: aw, height: aw, borderRadius: aw / 2 }, 300, 'swing', function () {
    p.$box.remove();
    if (popup === p) popup = null;
    if (pendingGuest) {
      const g = pendingGuest; pendingGuest = null;
      if ($.contains(document.documentElement, g[0])) openPopup(g);
    }
  });
}

/* ============ 3. Move ============ */
function moveGuest($old, toId) {
  if ($old.is('.leaving, .arriving')) return;
  const name = $old.attr('data-name');
  const fromRoom = PARTY.find(function (r) { return r.id === $old.attr('data-room'); });
  const toRoom = PARTY.find(function (r) { return r.id === toId; });
  if (!fromRoom || !toRoom || fromRoom === toRoom) return;
  const idx = fromRoom.guests.findIndex(function (g) { return g.name === name; });
  if (idx < 0) return;

  // 1) change the array, so the cases find the guest in the new room
  const guest = fromRoom.guests.splice(idx, 1)[0];
  toRoom.guests.push(guest);

  // 2) the card that flies: a clone placed exactly over the old card
  const $oldCard = $old.children('.card');
  const from = $oldCard.offset();
  const $fly = $oldCard.clone().removeAttr('tabindex').addClass('flying color-' + guest.color)
    .css({ position: 'absolute', left: from.left, top: from.top, margin: 0, zIndex: 2500 }).appendTo('body');

  // 3) old room: the empty place closes slowly
  $oldCard.css('visibility', 'hidden');
  $old.addClass('leaving').animate({ width: 0, marginLeft: 0, marginRight: 0 }, {
    duration: 700, queue: false,
    complete: function () { $(this).remove(); updateCounts(); }
  });

  // 4) new room: the card is added at the end, a place opens slowly
  const $new = buildGuest(guest, toRoom).addClass('arriving');
  const $newCard = $new.children('.card').css({ visibility: 'hidden', opacity: $oldCard.css('opacity') });
  if ($old.is('.found')) $new.addClass('found');
  $new.css({ width: 0, marginLeft: 0, marginRight: 0 }).appendTo('#' + toId + ' .guests')
    .animate({ width: 80, marginLeft: 2, marginRight: 2 }, { duration: 700, queue: false });

  // the target room is no longer in "sorted" state (the guest stands at the end)
  SORTED[toId] = false;
  $('#' + toId + ' .sort-btn').removeClass('active').attr('aria-pressed', 'false');
  updateCounts();

  // 5) the flight: the clone moves smoothly to wherever the new card stands now
  const prog = $({ p: 0 });
  flights.push(prog);
  prog.animate({ p: 1 }, {
    duration: 950, easing: 'swing',
    step: function (now) {
      const t = $newCard.offset();
      $fly.css({
        left: from.left + (t.left - from.left) * now,
        top: from.top + (t.top - from.top) * now - Math.sin(now * Math.PI) * 50   // a small arc
      });
    },
    complete: function () {
      $fly.remove();
      $newCard.css('visibility', 'visible');
      $new.removeClass('arriving');
      flights.splice(flights.indexOf(prog), 1);
    }
  });
}

/* ============ 4. Sort by time ============ */
function toggleSort(roomId) {
  const room = PARTY.find(function (r) { return r.id === roomId; });
  const $list = $('#' + roomId + ' .guests');
  SORTED[roomId] = !SORTED[roomId];
  $('#' + roomId + ' .sort-btn').toggleClass('active', SORTED[roomId]).attr('aria-pressed', String(!!SORTED[roomId]));

  const $items = $list.children('.guest').not('.leaving');
  $items.stop('fx', true);                                   // no queue of old animations
  const els = $items.toArray();
  const before = els.map(function (el) { return $(el).offset(); });   // where the cards are right now

  // wanted order: by time, or the order of the picture (= the array)
  const byName = {};
  els.forEach(function (el) { byName[el.getAttribute('data-name')] = el; });
  let source = room.guests.slice();
  if (SORTED[roomId]) source.sort(function (x, y) { return toMinutes(x.time) - toMinutes(y.time); });
  const order = source.map(function (g) { return byName[g.name]; }).filter(Boolean);
  els.forEach(function (el) { if (order.indexOf(el) < 0) order.push(el); });   // e.g. Miras (not in the array)

  $items.css({ left: 0, top: 0 });
  order.forEach(function (el) { $list.append(el); });         // the new order in the DOM
  const after = els.map(function (el) { return $(el).offset(); });

  // FLIP: put every card back where it was, then slide it to its new place
  els.forEach(function (el, i) {
    const dx = before[i].left - after[i].left, dy = before[i].top - after[i].top;
    if (dx || dy) $(el).css({ left: dx, top: dy }).animate({ left: 0, top: 0 }, 650, 'swing');
  });
}

/* Stops every effect (before the page is rebuilt). */
function cancelEffects() {
  closePopup(true);
  flights.forEach(function (p) { p.stop(true); });
  flights.length = 0;
  $('.flying').remove();
}

/* ============ event handlers ============ */
$(function () {
  // click a guest -> open the card; click outside -> close it
  $(document).on('click', function (e) {
    const $t = $(e.target);
    if ($t.closest('.guest-popup').length) return;
    const $g = $t.closest('.guest');
    if ($g.length && !$g.is('.leaving, .arriving')) {
      if (popup && !popup.closing && popup.$guest[0] === $g[0]) { closePopup(); return; }
      if (popup) { pendingGuest = $g; closePopup(); return; }   // only one card at a time
      openPopup($g);
    } else {
      pendingGuest = null;
      closePopup();
    }
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') { pendingGuest = null; closePopup(); }
  });
  $('#floors').on('keydown', '.card', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(this).trigger('click'); }
  });

  // "Move to the ..." buttons inside the card
  $(document).on('click', '.move-btn', function () {
    if (!popup || popup.closing) return;
    const $g = popup.$guest, to = $(this).attr('data-to');
    closePopup();
    moveGuest($g, to);
  });

  $('#floors').on('click', '.sort-btn', function () {
    toggleSort($(this).attr('data-room'));
  });
});
