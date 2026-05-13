# Workspace Rules

- Before opening a pull request into a repository or remote that is not owned by `aaryanporwal`, ask the user for explicit confirmation. Pushing to `aaryanporwal` remotes is allowed when requested, but creating PRs against upstream or third-party repositories requires approval first.

<!-- >>> smfs:agent_memory:begin >>> -->
<!-- managed by `smfs mount`; auto-removed on `smfs unmount` -->
The directory `/Users/aaryan/agent_memory/` is a Supermemory mount with semantic search.
When searching inside this directory, use:

    smfs grep "<natural language query>" /Users/aaryan/agent_memory/

instead of grep, rg, find, or your built-in search tool. It returns
semantically relevant excerpts via a vector index. For a quick high-
level overview before searching, read `/Users/aaryan/agent_memory/profile.md` -- it's
a reserved virtual file at the mount root with a summary of what
this container holds. Files outside this directory behave normally --
this rule is scoped to that path only.
<!-- <<< smfs:agent_memory:end <<< -->
