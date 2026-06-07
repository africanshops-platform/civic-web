import { render, screen } from '@testing-library/react';
import SeverityBadge from '../components/SeverityBadge';

describe('SeverityBadge', () => {
  it('renders "Low" label for low severity', () => {
    render(<SeverityBadge severity="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders "Critical" label for critical severity', () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders in small size', () => {
    const { container } = render(<SeverityBadge severity="high" size="sm" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders in large size', () => {
    const { container } = render(<SeverityBadge severity="medium" size="lg" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('defaults to low config for unknown severity', () => {
    render(<SeverityBadge severity="unknown" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
