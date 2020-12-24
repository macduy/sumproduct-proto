# Sumproduct

Mental arithmetics game.

## Tricky bits

- Preventing scrolling in Safari during interaction
  - Largely solved by `touch-action: none`
  - Some places recommend `width: 100%` and `height: 100%` on body
  - `overflow: hidden` and `position: relative` on either body or the target element also recommended

  - None of these worked for the in-app browser in Facebook Messenger