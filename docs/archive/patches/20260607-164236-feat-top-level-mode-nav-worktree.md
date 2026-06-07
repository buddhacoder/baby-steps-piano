# Archived Patch: feat/top-level-mode-nav worktree

- Date: 2026-06-07
- Source worktree: `.claude/worktrees/keen-snyder`
- Source branch: `feat/top-level-mode-nav`
- Source base commit: `f222efabb677dd7268fe1b45be5b2a7f3ac2f8e6`
- Reason: The branch tip was already merged into `main`, but the hidden worktree contained uncommitted experimental edits. This archive preserves those edits before removing the worktree/branch.

## Contents

- `20260607-164236-feat-top-level-mode-nav-worktree.patch` - tracked file edits from the dirty worktree.
- `20260607-164236-feat-top-level-mode-nav-claude-local.tgz` - untracked `.claude/` files from the dirty worktree.

## Recovery

This patch was generated against the old source base `f222efa`, not current `main`. To inspect it safely:

```bash
git switch -c scratch/recover-top-level-mode-nav f222efa
git apply docs/archive/patches/20260607-164236-feat-top-level-mode-nav-worktree.patch
```

To try porting it onto current `main`, use a throwaway branch and expect manual conflict resolution:

```bash
git switch -c scratch/port-top-level-mode-nav main
git apply --3way docs/archive/patches/20260607-164236-feat-top-level-mode-nav-worktree.patch
```
