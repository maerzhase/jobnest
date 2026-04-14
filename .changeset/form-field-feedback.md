---
"@jobnest/ui": patch
"jobnest": patch
---

Add visual feedback and validation indicators to form fields.

- Add `required` prop to Field component to display asterisk (\*) on required fields
- Add `invalid` prop to Input and SelectTriggerButton components for error state styling
- Apply red border and ring colors to invalid inputs for clear visual feedback
- Update application form to mark required fields and pass invalid state to inputs
- Export `cn` utility from UI package for conditional styling support
