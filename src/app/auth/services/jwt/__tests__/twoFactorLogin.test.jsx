import { render, screen, fireEvent } from '@testing-library/react';
import { isTwoFactorChallenge, cleanTwoFactorCode, twoFactorCodeProblem, fillDigits } from '../twoFactorLogin';
import TwoFactorLoginStep from '../components/TwoFactorLoginStep';
import { signInLandingUrl, markSignedIn } from '../signInLanding';

const mockMutate = jest.fn();
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
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

describe('the code step (six boxes, like the customer app)', () => {
  beforeEach(() => mockMutate.mockClear());
  const firstBox = () => screen.getByLabelText('6-digit code, digit 1');

  it('a pasted or autofilled code fills every box and signs in with the temp token and the digits', () => {
    render(<TwoFactorLoginStep tempToken="temp-1" onBack={jest.fn()} />);
    fireEvent.change(firstBox(), { target: { value: '123456' } });
    expect(screen.getByLabelText('6-digit code, digit 6').value).toBe('6');
    fireEvent.click(screen.getByRole('button', { name: 'Verify and sign in' }));
    expect(mockMutate).toHaveBeenCalledWith({ tempToken: 'temp-1', totpCode: '123456' }, expect.any(Object));
  });

  it('typing one digit moves on, and the button stays off until all six are in', () => {
    render(<TwoFactorLoginStep tempToken="temp-1" onBack={jest.fn()} />);
    fireEvent.change(firstBox(), { target: { value: '1' } });
    expect(screen.getByRole('button', { name: 'Verify and sign in' }).disabled).toBe(true);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('a backup code goes in a plain field and is sent as typed (upper case)', () => {
    render(<TwoFactorLoginStep tempToken="temp-1" onBack={jest.fn()} />);
    fireEvent.click(screen.getByText('Lost your phone? Use a backup code'));
    fireEvent.change(screen.getByLabelText('Backup code'), { target: { value: 'ab12cd34' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify and sign in' }));
    expect(mockMutate).toHaveBeenCalledWith({ tempToken: 'temp-1', totpCode: 'AB12CD34' }, expect.any(Object));
  });

  it('Back returns to the password step', () => {
    const onBack = jest.fn();
    render(<TwoFactorLoginStep tempToken="temp-1" onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to sign in' }));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('fillDigits', () => {
  it('keeps digits only and never grows past six', () => {
    expect(fillDigits('', 0, '123456')).toBe('123456');
    expect(fillDigits('12', 2, '3')).toBe('123');
    expect(fillDigits('123456', 0, '9')).toBe('923456');
    expect(fillDigits('', 0, 'ab')).toBe('');
    expect(fillDigits('', 0, '1234567')).toBe('123456');
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
