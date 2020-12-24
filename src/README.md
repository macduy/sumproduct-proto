# Sumproduct

Mental arithmetics game.

## Tricky bits

- Preventing scrolling in Safari during interaction
  - Largely solved by `touch-action: none`
  - Some places recommend `width: 100%` and `height: 100%` on body
  - `overflow: hidden` and `position: relative` on body
    - Only this worked for the in-app browser in Facebook Messenger
    - PLUS manually handling touch events with `{ passive: false }` and
      `preventDefault` as well as `stopPropagation`

(Scroll broken on 0.38 again, fixed in 0.40)