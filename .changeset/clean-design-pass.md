---
"jobnest": patch
---

Improve application list design and performance with grid layout and backend sorting.

UI improvements:
- Applications now display in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- Reduced card padding and improved whitespace for better readability
- Added color-coded status badges for visual hierarchy (offer: green, interview: amber, applied: purple, saved: blue, rejected: red)
- Better typography hierarchy with truncated titles and condensed secondary information
- Improved hover states with subtle border and shadow effects

Performance improvements:
- Moved application sorting from client-side JavaScript to backend database query
- Backend now sorts by status priority (offer → interview → applied → saved → rejected) with updated_at as tiebreaker
- Removed unnecessary client-side sorting logic
