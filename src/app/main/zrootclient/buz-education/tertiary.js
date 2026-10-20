/** Helpers for the tertiary admission screens (civic-65). */
export const MAX_FILE_BYTES = 6 * 1024 * 1024;

export const flattenProgrammes = (tree) =>
  (tree?.faculties ?? []).flatMap((f) =>
    f.departments.flatMap((d) => d.programmes.map((p) => ({ ...p, faculty: f.name, department: d.name })))
  );

/** Why a chosen file cannot be uploaded, or null when it can. */
export function fileProblem(file) {
  if (!file) return 'Choose a file';
  if (file.size > MAX_FILE_BYTES) return 'That file is too large. Use one under 6 MB.';
  if (!/^(image\/|application\/pdf)/.test(file.type || '')) return 'Use a photo or a PDF';
  return null;
}

export function applyReady({ name, programmeId, start }) {
  return Boolean(name.trim() && programmeId && start && !Number.isNaN(new Date(start).getTime()));
}

export const STATUS_WORDS = {
  PENDING: 'With the registrar',
  WAITLISTED: 'On the waiting list',
  APPROVED: 'Admitted',
  REJECTED: 'Not admitted',
  WITHDRAWN: 'Withdrawn',
};
