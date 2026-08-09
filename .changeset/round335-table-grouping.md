---
'mcp-agentgate': patch
---

The findings table collapses 4+ rows identical except for the source config file into one row ("…and N more file(s)"), keeping reports readable when the same server config is copied across many directories. JSON/SARIF output and the summary counts still list every finding.
