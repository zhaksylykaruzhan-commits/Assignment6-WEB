# Selector Detective - jQuery assignment #6

A birthday party in a dolls' house, a vanished cake and a lot of jQuery.
Astana IT University, Web Technologies. Student: Ravil Maratov, group IT2511.

## Run

Open `task1/index.html` or `task2/index.html` in a browser (double click). No server and no internet are needed:
jQuery 3.7.1 and the avatars are saved in the project.

## Structure

```
task1/                 Task 1 - the party and the 20 cases
  index.html
  css/style.css
  js/data.js           the PARTY array (rooms, guests) from the picture
  js/render.js         builds the page from the array with jQuery
  js/cases.js          20 cases, every case is ONE jQuery chain that searches the page
  js/app.js            case buttons, highlight, jump (animate), result panel
  lib/jquery-3.7.1.min.js
  avatars/*.svg        Open Peeps avatars (CC0), seed = guest name
task2/                 Task 2 - copy of task1 + effects
  js/effects.js        spotlight, guest card, move, sort by time
```

## How it works

* The page is built from the `PARTY` array. Each guest card stores its data as classes
  (`color-green`, `aitu`, `has-cup`, ...) and `data-*` attributes (`data-name`, `data-minutes`, `data-room`, ...).
* Every case button rebuilds the page, runs its jQuery chain on the page (never on the array), highlights the found
  elements, makes the found guests jump once with `animate()` and prints their number and names.
* Task 2 effects use only jQuery (`fadeTo`, `animate`, `stop`, `offset`, `clone`, `css`, `append`, `on`);
  there are no CSS transitions or animations.
  * Spotlight: found guests stay bright, others `fadeTo(300, 0.2)`; Clear brings everybody back.
  * Guest card: grows out of the avatar, closes with Esc or a click outside, only one card at a time.
  * Move: the card flies (a clone) to the end of another room; the old place closes, a new one opens; the array is changed too.
  * Sort by time: per room, FLIP technique with `offset()` and `animate()`; second click restores the picture order.
  * Fast clicks: `stop()` before every new animation, `queue: false` for slot animations, flags for leaving/arriving cards.
