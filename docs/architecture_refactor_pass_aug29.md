# Plan of execution for Aug 29, 2026

## 1. Audit existing $projectId.tsx structure

**Audit everything currently coupled to `$projectId.tsx`:**

- route logic
- section state
- project sidebar
- file viewer
- tasks
- timeline
- settings
- dialogs
- hooks
- shared types
- permission checks
- any project-specific layout helpers

---

## 2. Move the current project-detail implementation:

Move all of the project-detail implementation to a clearly marked temporary archive folder to preserve for future Admin Project-Management surface instead of deleting it.

---

## 3. Create the new route skeleton:

- developer **Project Workspace**
- Admin Dashboard
- admin **Project Management / Project Detail

---

## 4. Add route-level permission boundaries

- Add route-level permission boundaries so regular devs enter the workspace, while administrative project-management routes require the appropriate admin role.

---

## 5. Map both interfaces before filling them in:

- workspace shell regions and tool panels
- admin dashboard / project-management structure

---

## 6. Inventory reusable building blocks:

- Layout templates
- Project-Context helpers
- Permission helpers
- Workspace-State helpers
- Shared project metadata components
- Shadcn primitives we can leverage

---

## 7. Use the audit to identify coupling we can remove

- Components that currently know about:
- Router search state
- Permissions
- File Loading
- Layout

The decoupling goal should be especially useful here. Ideally, after the refactor, route files mostly compose things rather than owning business/UI logic.

Something closer to:
```plaintext
routes/
  projects/
    $projectId.tsx          → ProjectWorkspace shell
  admin/
    index.tsx               → AdminDashboard
    projects/
      $projectId.tsx        → AdminProjectDetail

features/
  workspace/
    components/
    hooks/
    layouts/
  project-management/
    components/
    hooks/
    layouts/
  project-files/
  project-tasks/
  project-timeline/
  project-members/
```


# Audit Results

`$projectId.tsx` is currently doing too much, and the refactor is justified.

**Main Coupling Points:**

- route protection + project loading
- state validation: section / search
- permission filtering
- redirect logic
- layout shell
- project sidebar
- section navigation
- task / timeline data loading
- section composition
- file-view routing via `fileId`


`FileViewerPanel.tsx` same issue as `$projectId` at a smaller scale:

- owns file loading
- text editing state
- save state
- keyboard shortcuts
- navigation
- PDF setup
- PDF sizing
- image rendering
- unsupported-file handling
- confirmation dialogs


### Result
```text
CURRENT
$projectId.tsx
├── route
├── auth
├── loader
├── permissions
├── navigation
├── sidebar
├── project shell
├── task queries
├── timeline queries
├── files routing
└── section rendering
```

# The first thing to extract

Separate the current page into a self-contained legacy feature boundary so we can move it later without breaking imports.

A reasonable target:
```text
components/
  projects/
    legacy-detail/
      ProjectDetailPage.tsx
      ProjectDetailPanel.tsx
      ProjectSidebar.tsx
      sections/
        OverviewSection.tsx
        FilesSection.tsx
        FileViewerPanel.tsx
        TasksSection.tsx
        TimelineSection.tsx
        SettingsSection.tsx
```

Then `$projectId.tsx` becomes:
```typescript
export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: requireAuth,
  loader: projectLoader,
  validateSearch: validateProjectDetailSearch,
  component: ProjectDetailPage,
});
```

Two more pieces that are likely reusable in the new architecture:
```text
useProjectTasks
useProjectEvents
useProjectFile*
```
*feature data hooks not project-detail UI

`getFileViewerKind`

should remain shared because the new workspace will still need to decide:

```text
text → editor
pdf → PDF viewer
image → image viewer
blocked → blocked state
```

### Strongest decoupling opportunities
```text
ProjectSidebar
```
should not live inside the route file

```text
SECTIONS / ProjectSection
```

should belong with the legacy project-detail feature and
```text
navigateBackToFiles()
```
inside FileViewerPanel is UI coupled directly to TanStack Router.

In the future, a reusable file pane should receive callbacks such as:
```typescript
onClose()
onSave()
```
rather than knowing `/projects/$projectId` exists.

The new structure can then diverge cleanly:
```text
features/
  project-workspace/
    ProjectWorkspace.tsx
    ProjectWorkspaceShell.tsx
    workspace-tools/

  project-management/
    AdminProjectPage.tsx
    overview/
    tasks/
    timeline/
    members/
    settings/

  project-files/
    FileTree.tsx
    CodeEditor.tsx
    PdfViewer.tsx
    ImageViewer.tsx

  project-tasks/
  project-timeline/
```

The current admin-only Settings logic is another clue that the page is mixing two product surfaces:
```typescript
const isWorksapceAdmin = workspace?.role === "admin";
```
followed by hidding Settings.


### detail/sections/ directory classifications:

```
client/src/components/projects/detail/sections/
├── CodeViewer.tsx                 → reusable file/editor concern
├── files/
│   └── getFileIcon.ts             → reusable file concern
├── FilesSection.tsx               → legacy/admin project-management UI
├── FileViewerPanel.tsx            → reusable behavior, but should be split
├── index.ts                       → legacy section barrel
├── OverviewSection.tsx            → admin/project-management candidate
├── settings/
│   └── ProjectSettingRow.tsx      → admin/project-management concern
├── SettingsSection.tsx            → admin/project-management concern
├── TasksSection.tsx               → shared project feature / admin candidate
├── timeline/
│   └── formatTimelineEvents.ts    → reusable timeline helper
└── TimelineSection.tsx            → shared project feature / admin candidate
```

Sections feature contains 4 different domains:
```
projects/detail/sections
│
├── Project information
│   └── OverviewSection
│
├── Files
│   ├── FilesSection
│   ├── FileViewerPanel
│   ├── CodeViewer
│   └── files/getFileIcon
│
├── Tasks
│   └── TasksSection
│
├── Timeline
│   ├── TimelineSection
│   └── timeline/formatTimelineEvents
│
└── Project administration
    ├── SettingsSection
    └── settings/ProjectSettingRow
```
