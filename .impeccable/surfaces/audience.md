# Content audience selection

Request: use existing categories, education_stages and countries reference tables for activities and courses. One category, multiple stages, optional countries; IP country suggested by default, Arab countries first for Arab visitors.

This is an Operate refinement of the existing forms, not a dashboard redesign. Preserve Asasera blue, established typography, shared dropdown tokens and bilingual interaction. Use clear field labels, searchable options and removable selection chips. Empty countries means any country. Reference records, not frontend constants, supply option names and IDs.

Scope includes activity creation/editing, course creation/editing, and new-course fields in lesson creation. Saving and published/forked metadata are implemented in the backend. Existing legacy drafts remain readable. User changes and saved metadata must never be overwritten by a late country suggestion.
