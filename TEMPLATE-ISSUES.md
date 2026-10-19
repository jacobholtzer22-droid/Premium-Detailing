# Template issues found on this build

Bugs in AA-Template that showed up here. Fix them upstream, then pull the fix
down; do not patch them from a client site.

- verify check 18 flags the literal string "of." and a space before punctuation
  as a blank interpolation; both occur in verbatim customer quotes (Anthony D.
  "taken care of.", Tara E. "happy !"). Fix the regex in AA-Template so it
  matches only a blank where a value should be, then pull it down and publish
  Anthony D. untouched.
