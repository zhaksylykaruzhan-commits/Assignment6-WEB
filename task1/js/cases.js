/* ------------------------------------------------------------------
   The 20 cases. Every case is ONE jQuery chain that searches the PAGE
   (not the array) and returns the found guests (or rooms).
   ------------------------------------------------------------------ */
const CASES = [
  { n: 1, label: 'Who is in the hall?', kind: 'guests',
    q: 'Who is in the hall?',
    run: () => $('#hall .guest') },

  { n: 2, label: 'Yellow or purple clothes', kind: 'guests',
    q: 'Who is dressed in yellow or purple?',
    run: () => $('.guest[data-color="yellow"], .guest[data-color="purple"]') },

  { n: 3, label: 'AITU students upstairs', kind: 'guests',
    q: 'Which AITU students are upstairs?',
    run: () => $('.floor[data-floor="2"] .guest.aitu') },

  { n: 4, label: 'Glasses or a bag', kind: 'guests',
    q: 'Who has glasses or a bag?',
    run: () => $('.guest.has-glasses, .guest.has-bag') },

  { n: 5, label: 'Came with nothing', kind: 'guests',
    q: 'Who came with nothing at all?',
    run: () => $('.guest:not(.has-phone, .has-glasses, .has-bag, .has-cup, .has-crumbs)') },

  { n: 6, label: 'Phone but no bag', kind: 'guests',
    q: 'Who has a phone but no bag?',
    run: () => $('.guest.has-phone:not(.has-bag)') },

  { n: 7, label: 'Arrived 20:30 – 21:00', kind: 'guests',
    q: 'Who arrived between 20:30 and 21:00, both times included?',
    run: () => $('.guest').filter(function () {
      const m = $(this).data('minutes');
      return m >= 20 * 60 + 30 && m <= 21 * 60;
    }) },

  { n: 8, label: 'After 21:00, not AITU', kind: 'guests',
    q: 'Who arrived after 21:00 and is not an AITU student?',
    run: () => $('.guest.not-aitu').filter(function () {
      return $(this).data('minutes') > 21 * 60;
    }) },

  { n: 9, label: 'Right next to Askar', kind: 'guests',
    q: 'Who stands right next to Askar?',
    run: () => $('.guest[data-name="Askar"]').prev().add('.guest[data-name="Askar"] + .guest') },

  { n: 10, label: 'Last in each room', kind: 'guests',
    q: 'Who stands last in each room?',
    run: () => $('.guest:last-child') },

  { n: 11, label: 'Third in each room', kind: 'guests',
    q: 'Who stands third in each room?',
    run: () => $('.guest:nth-child(3)') },

  { n: 12, label: 'After Timur', kind: 'guests',
    q: 'Who stands after Timur in his room?',
    run: () => $('.guest[data-name="Timur"]').nextAll() },

  { n: 13, label: 'Right before someone in black', kind: 'guests',
    q: 'Who stands right before someone in black?',
    run: () => $('.guest.color-black').prev() },

  { n: 14, label: 'Aruzhan\u2019s room', kind: 'rooms',
    q: 'In which room is Aruzhan?',
    run: () => $('.guest[data-name="Aruzhan"]').closest('.room') },

  { n: 15, label: 'Rooms with < 6 guests', kind: 'rooms',
    q: 'Which rooms have fewer than 6 guests?',
    run: () => $('.room').filter(function () {
      return $(this).find('.guest').length < 6;
    }) },

  { n: 16, label: 'Cup but no glasses', kind: 'rooms',
    q: 'In which rooms does somebody have a cup, but nobody wears glasses?',
    run: () => $('.room:has(.has-cup):not(:has(.has-glasses))') },

  { n: 17, label: 'First to arrive in each room', kind: 'guests',
    q: 'Who came first to each room?',
    run: () => $('.guests').map(function () {
      return $(this).children('.guest').toArray().sort(function (a, b) {
        return $(a).data('minutes') - $(b).data('minutes');
      })[0];
    }) },

  { n: 18, label: 'Miras joins the party', kind: 'guests', changes: true,
    q: 'Miras, an AITU student in blue, comes at 21:20 with his phone and joins Askar and Inkar, standing between them. Let him appear smoothly.',
    run: () => buildGuest(MIRAS, LIVING_ROOM).hide()
      .insertAfter('.guest[data-name="Askar"]').fadeIn(900) },

  { n: 19, label: 'Natasha goes home', kind: 'guests', changes: true,
    q: 'Natasha says goodbye and goes home. Her card fades away and disappears from the page.',
    run: () => $('.guest[data-name="Natasha"]').fadeOut(900, function () { $(this).remove(); }) },

  { n: 20, label: 'Who took the cake?', kind: 'guests',
    q: 'Who took the cake? The thief was downstairs, came after 21:00 but before the cake disappeared, has crumbs but no cup, and stood right next to an AITU student.',
    run: () => $('.floor[data-floor="1"] .guest.has-crumbs:not(.has-cup)')
      .filter(function () {
        const m = $(this).data('minutes');
        return m > 21 * 60 && m < 21 * 60 + 30;
      })
      .filter(function () {
        return $(this).prev().add($(this).next()).is('.aitu');
      }) }
];
