# tl-user-event-mod

- All `userEvent` calls will be async
- The `allAtOnce` option in type will be replaced by `userEvent.paste`
- The imports will need to be updated (React Testing Library will re-export `userEvent`)
- Removes `@testing-library/user-event` from package.json

## Usage

```bash
npx tl-user-event-mod
npx tl-user-event-mod ./project/__tests__/*.spec.js
```
