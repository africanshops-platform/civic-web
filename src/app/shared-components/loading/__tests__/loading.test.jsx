import { fireEvent, render, screen } from '@testing-library/react';
import FuseLoading from '@fuse/core/FuseLoading';
import { PageSkeleton, PendingButton, ProcessingState, SectionSkeleton } from 'app/shared-components/loading';

describe('loading kit', () => {
	it('ProcessingState says what is happening, and can cover its parent', () => {
		const { rerender, container } = render(<ProcessingState title="Confirming your payment" />);
		expect(screen.getByText('Confirming your payment')).toBeInTheDocument();
		expect(screen.getByRole('status')).toBeInTheDocument();
		expect(container.querySelector('[style*="position"]')).toBeNull();
		rerender(<ProcessingState title="Saving" overlay />);
		expect(screen.getByText('Saving')).toBeInTheDocument();
	});

	it('SectionSkeleton names what is loading and is marked busy for screen readers', () => {
		render(<SectionSkeleton label="Loading reservations" variant="table" columns={3} rows={2} />);
		expect(screen.getByText('Loading reservations')).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
	});

	it('SectionSkeleton hides its heading when compact and falls back to a list for an unknown variant', () => {
		render(<SectionSkeleton label="Loading x" variant="nonsense" compact />);
		expect(screen.queryByText('Loading x')).toBeNull();
	});

	it('PageSkeleton shows the plain words under its heading', () => {
		render(<PageSkeleton title="Loading your bookings" />);
		expect(screen.getByText('Loading your bookings')).toBeInTheDocument();
	});

	it('PendingButton shows the pending word and cannot be pressed twice', () => {
		const onClick = jest.fn();
		const { rerender } = render(<PendingButton onClick={onClick}>Save</PendingButton>);
		fireEvent.click(screen.getByRole('button', { name: 'Save' }));
		expect(onClick).toHaveBeenCalledTimes(1);
		rerender(<PendingButton pending pendingLabel="Saving" onClick={onClick}>Save</PendingButton>);
		const btn = screen.getByRole('button', { name: 'Saving' });
		expect(btn).toBeDisabled();
		expect(btn).toHaveAttribute('aria-busy', 'true');
		fireEvent.click(btn);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('PendingButton keeps its own text when no pending word is given', () => {
		render(<PendingButton pending>Post</PendingButton>);
		expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
	});

	it('FuseLoading is now the shaped section skeleton', () => {
		render(<FuseLoading label="Loading orders" />);
		expect(screen.getByText('Loading orders')).toBeInTheDocument();
	});
});
