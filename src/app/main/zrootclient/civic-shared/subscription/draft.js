/** A draft kept on this device so a half-written report survives the subscription gate closing (and a page reload). Never throws. */
const PREFIX = 'as_civic_draft:';

export function loadDraft(key) {
	try {
		const raw = localStorage.getItem(PREFIX + key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function saveDraft(key, value) {
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		/* storage unavailable: the draft is simply not kept */
	}
}

export function clearDraft(key) {
	try {
		localStorage.removeItem(PREFIX + key);
	} catch {
		/* nothing to clear */
	}
}
