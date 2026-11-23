import { render, screen, fireEvent } from '@testing-library/react';
import { isTwoFactorChallenge, cleanTwoFactorCode, twoFactorCodeProblem } from '../twoFactorLogin';
import TwoFactorLoginStep from '../components/TwoFactorLoginStep';
import { signInLandingUrl, markSignedIn } from '../signInLanding';

const mockMutate = jest.fn();
jest.mock('app/configs/data/server-calls/auth/admin-auth', () => ({
  useVerify2faLogin: () => ({ mutate: mockMutate, isLoading: false, error: null }),
}));


describe('the sign-in contract with the authenticator on', () => {
  it('recognises the server challenge, and only that', () => {
    expect(isTwoFactorChallenge({ requiresTwoFactor: true, tempToken: 't', userId: 'u' })).toBe(true);
    expect(isTwoFactorChallenge({ user: {}, userAccessToken: 'a' })).toBe(false);
    expect(isTwoFactorChallenge({ requiresTwoFactor: true })).toBe(false);
    expect(isTwoFactorChallenge(undefined)).toBe(false);
  });

  it('accepts a 6-digit code (with a space) or an 8-character backup code, nothing else', () => {
    expect(cleanTwoFactorCode('123 456')).toBe('123456');
    expect(twoFactorCodeProblem('123 456')).toBeNull();
    expect(twoFactorCodeProblem('AB12-CD34')).toBeNull();
    expect(twoFactorCodeProblem('12345')).not.toBeNull();
    expect(twoFactorCodeProblem('')).not.toBeNull();
    expect(twoFactorCodeProblem('1234567')).not.toBeNull();
  });
});

describe('the code step', () => {
  beforeEach(() => mockMutate.mockClear());

  it('sends the temp token and the cleaned code', () => {
    render(<TwoFactorLoginStep tempToken="temp-1" onBack={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Authenticator or backup code'), { target: { value: '123 456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify and sign in' }));
    expect(mockMutate).toHaveBeenCalledWith({ tempToken: 'temp-1', totpCode: '123456' });
  });

  it('sends nothing for a code that cannot be right', () => {
    render(<TwoFactorLoginStep tempToken="temp-1" onBack={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Authenticator or backup code'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify and sign in' }));
    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText(/6-digit code from your authenticator app, or/)).toBeTruthy();
  });

  it('Back returns to the password step', () => {
    const onBack = jest.fn();
    render(<TwoFactorLoginStep tempToken="temp-1" onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to sign in' }));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('landing after sign-in', () => {
  it('never reloads onto the sign-in page: it goes home, or to the page the person came from', () => {
    expect(signInLandingUrl(null, '/sign-in')).toBe('/');
    expect(signInLandingUrl('/youth-v2/tournaments/1', '/sign-in')).toBe('/youth-v2/tournaments/1');
    expect(signInLandingUrl(null, '/youth-v2')).toBeNull();
  });

  it('writes the flags the app gate reads before the reload', () => {
    localStorage.clear();
    markSignedIn();
    expect(localStorage.getItem('jwt_is_authStatus')).toBe('authenticated');
    expect(localStorage.getItem('fuseReactAuthProvider')).toBe('jwt');
  });
});
