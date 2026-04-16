---
"jobnest": patch
"@jobnest/ui": patch
---

Feature: add application source to the tracked application form and show select labels correctly

- Add the "How this role came in" field to the tracked application form.
- Fix shared select rendering so closed triggers show the selected item label instead of the stored value.
- Derive form enum validation from shared option lists to reduce duplication and drift risk.
