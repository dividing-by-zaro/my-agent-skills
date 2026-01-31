---
name: researching-codebases
description: Orchestrate comprehensive codebase research focusing on identifying and explaining relevant code with precise file and line references. This skill should be used when the user asks to "research" code or a codebase.
---

# Researching Codebases

## Overview

This skill enables targeted research of the codebase to support upcoming or in-progress changes. Its primary goal is to help developers modify or extend the system by:

* finding all relevant locations in the code
* providing precise file:line references
* explaining those locations in clear language

The codebase is treated as the **single source of truth**.
Documentation may be outdated and should only be used as supplemental context.

---

## Critical Constraint

**THE PRIMARY JOB IS TO IDENTIFY AND EXPLAIN ALL RELEVANT CODE REQUIRED TO IMPLEMENT A CHANGE — WITH PRECISE LINE NUMBERS.**

Do **NOT**:

* suggest improvements unless explicitly requested
* perform root-cause analysis unless asked
* propose enhancements or optimizations
* critique implementation choices
* recommend refactoring or architectural changes

DO:

* treat the codebase as the ground truth
* locate every relevant definition, call site, and control path
* provide file:line references as first-class output
* explain code behavior in plain language
* map interactions and dependencies relevant to the change

---

## If the Research Question Is Missing

If the user invokes this skill without a clear research question or subject area, ask the user:

> Please provide your research question or area of interest in the codebase, and I will analyze it by locating and explaining the relevant implementation with file and line references.

Then continue with the normal workflow once provided.

---

## Subagent Orchestration

This skill may spawn parallel research subtasks.

Each subagent:

* focuses on a specific investigation area
* prioritizes identifying relevant code locations
* returns:

  * file paths
  * line numbers or ranges
  * brief explanations of what the referenced code does

Documentation and ADRs may be consulted, but **conflicts are resolved in favor of code**.

---

## Research Workflow

### Step 1 — Read Mentioned Files

Read any files explicitly referenced by the user in full before delegating work.
This establishes baseline context.

### Step 2 — Analyze and Decompose the Question

Identify:

* architectural patterns involved
* dependencies and related components
* important control paths
* possible sub-questions and investigation threads

Develop a research plan and then proceed to parallelization.

### Step 3 — Spawn Parallel Subagents

Spawn multiple subtasks when:

* different components must be located
* control flow spans multiple services/layers
* documentation and implementation both require verification
* multiple conceptual questions are embedded in one request

Each subagent focuses on a distinct research objective and returns:

* file paths
* line numbers
* concise explanations

### Step 4 — Await and Compile Results

Synthesize results such that:

* code findings are primary
* documentation is supplementary
* historical context informs understanding but does not override code

### Step 5 — Present Findings

Present structured results that:

* enumerate relevant code locations
* include exact file and line references
* explain what each region does
* show how referenced areas interact

For follow-up questions:

* extend results incrementally
* reuse previous findings when relevant

---

## Best Practices

### Parallel Execution

Use parallel subtasks when multiple components or layers must be explored simultaneously.

### Code References

Line numbers are **mandatory**.

Acceptable examples:

* `src/services/auth.ts:45`
* `src/routes/login.ts:18–64`

Avoid vague references like “the auth service”.

Expect:

* multiple locations per concern where appropriate
* both definitions and call sites

### Stay Factual

Prefer observable statements:

* "This function accepts two parameters."
* "This module is imported by five files."
* "Data flows controller → service → repository."

Avoid speculation or judgment unless requested.

### Scope Management

For broad questions:

1. architecture overview
2. component-level detail
3. implementation specifics

For narrow questions:

* go directly to the specific implementation with supporting references

### Documentation Context

When present and relevant, incorporate:

* ADRs
* design docs
* specifications

But code always takes precedence when there is disagreement.
