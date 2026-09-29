import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AuthApi } from 'app/configs/data/client/RepositoryAuthClient';

export const KYC_STATUS_KEY = ['kyc-status'];

// ─── raw API calls ────────────────────────────────────────────────────────────
const api = {
  getStatus:           ()  => AuthApi().get('/auth-user/kyc/status'),
  giveConsent:         (b) => AuthApi().post('/auth-user/kyc/consent', b ?? {}),
  submitFace:          (b) => AuthApi().post('/auth-user/kyc/face', b),
  submitDocument:      (b) => AuthApi().post('/auth-user/kyc/document', b),
  verifyFace:          (b) => AuthApi().post('/auth-user/kyc/face/verify', b),
  webauthnRegOptions:  ()  => AuthApi().get('/auth-user/kyc/webauthn/register/options'),
  webauthnRegVerify:   (b) => AuthApi().post('/auth-user/kyc/webauthn/register/verify', b),
  webauthnAuthOptions: (b) => AuthApi().post('/auth-user/kyc/webauthn/auth/options', b),
  webauthnAuthVerify:  (b) => AuthApi().post('/auth-user/kyc/webauthn/auth/verify', b),
};

// ─── hooks ────────────────────────────────────────────────────────────────────

// `options` lets a caller override react-query options (e.g. `enabled`, to
// skip the call entirely for an anonymous visitor — added for
// OpportunityDetailScreen.jsx, which needs KYC status only once a user is
// logged in). Every existing call site passes no arguments, so this stays
// fully backward-compatible.
export function useGetKycStatus(options = {}) {
  return useQuery(KYC_STATUS_KEY, api.getStatus, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    // Don't hammer the backend on server errors — one retry is enough
    retry: (failureCount, error) => {
      if (error?.response?.status >= 500) return false;
      return failureCount < 1;
    },
    select: (res) => res.data,
    ...options,
  });
}

function useKycMutation(fn) {
  const qc = useQueryClient();
  return useMutation(fn, {
    onSuccess: () => qc.invalidateQueries(KYC_STATUS_KEY),
  });
}

// NDPA-required consent, must succeed before any face/document/WebAuthn
// capture call — auth-service's requireConsent() (kyc.service.ts) hard-403s
// every one of those otherwise. Discovered 2026-09-25: nothing anywhere in
// this app (or civic-mobile) ever called this endpoint, so every real
// submission attempt has been failing with 403 until this fix.
export const useGiveConsent           = () => useKycMutation(api.giveConsent);

export const useSubmitFace            = () => useKycMutation(api.submitFace);
export const useSubmitDocument        = () => useKycMutation(api.submitDocument);
export const useVerifyWebAuthnReg     = () => useKycMutation(api.webauthnRegVerify);

export const useVerifyFace            = () => useMutation(api.verifyFace);
export const useGetWebAuthnRegOptions = () => useMutation(api.webauthnRegOptions);
export const useGetWebAuthnAuthOptions= () => useMutation(api.webauthnAuthOptions);
export const useVerifyWebAuthnAuth    = () => useMutation(api.webauthnAuthVerify);

// ─── Identity-KYC document upload (relayed through the backend, 2026-09-27) ──
// Distinct from uploadDocumentImage below, which FinanceKycContent.jsx still
// uses for the separate wallet-KYC flow (fintech-service) -- CLAUDE.md keeps
// identity KYC and wallet KYC architecturally independent, so this fix stays
// scoped to identity KYC only, not applied to that other, unrelated upload.
// Relays through the same gateway endpoint civic-mobile already uses,
// uploaded server-side as Cloudinary type:"authenticated" (never a
// permanently-public URL) instead of this app's old direct-to-Cloudinary
// unsigned-preset upload. Returns { url, publicId } -- url is not directly
// viewable (signing happens server-side on admin review), publicId is what
// actually gets submitted alongside documentImageUrl.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadIdentityDocumentImage(file) {
  const base64 = await fileToBase64(file);
  const res = await AuthApi().post('/auth-user/kyc/document/upload-attachment', { base64 });
  return { url: res.data.url, publicId: res.data.publicId };
}

// ─── Cloudinary document image upload (wallet-KYC only — see above) ──────────
export async function uploadDocumentImage(file) {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and ' +
      'VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Document image upload failed. Please try again.');
  }
  return data.secure_url;
}
