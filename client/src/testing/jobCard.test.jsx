import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobCard from '../components/JobCard/JobCard';

const mockJob = {
    _id: 'job-1',
    title: 'Software Engineer',
    company: 'Acme Corp',
    salary: 80000,
    description: 'Build cool things.',
};

beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('JobCard', () => {

    describe('rendering', () => {

        it('should display the job title and company', () => {
            render(<JobCard job={mockJob} />);
            expect(screen.getByText('Acme Corp - Software Engineer')).toBeInTheDocument();
        });

        it('should display salary formatted as CAD currency', () => {
            render(<JobCard job={mockJob} />);
            expect(screen.getByText(/\$80,000/)).toBeInTheDocument();
        });

        it('should not show the description by default', () => {
            render(<JobCard job={mockJob} />);
            expect(screen.queryByText('Build cool things.')).not.toBeInTheDocument();
        });

    });

    describe('expand / collapse', () => {

        it('should show description when card is expanded', () => {
            render(<JobCard job={mockJob} />);
            fireEvent.click(screen.getByRole('button', { name: 'keyboard_arrow_down' }));
            expect(screen.getByText('Build cool things.')).toBeInTheDocument();
        });

        it('should hide description after collapsing', () => {
            render(<JobCard job={mockJob} />);
            fireEvent.click(screen.getByRole('button', { name: 'keyboard_arrow_down' }));
            fireEvent.click(screen.getByRole('button', { name: 'keyboard_arrow_up' }));
            expect(screen.queryByText('Build cool things.')).not.toBeInTheDocument();
        });

    });

    describe('apply / retract', () => {

        it('should show "Sign in to apply" error when unauthenticated user clicks apply', async () => {
            render(<JobCard job={mockJob} user={null} />);
            fireEvent.click(screen.getByRole('button', { name: 'add' }));
            await waitFor(() => {
                expect(screen.getByText('Sign in to apply')).toBeInTheDocument();
            });
        });

        it('should call POST /api/applications when authenticated user applies', async () => {
            global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };

            render(<JobCard job={mockJob} user={user} />);
            fireEvent.click(screen.getByRole('button', { name: 'add' }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/applications',
                    expect.objectContaining({ method: 'POST' })
                );
            });
        });

        it('should call onApplied callback after a successful application', async () => {
            global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            const onApplied = jest.fn();

            render(<JobCard job={mockJob} user={user} onApplied={onApplied} />);
            fireEvent.click(screen.getByRole('button', { name: 'add' }));

            await waitFor(() => {
                expect(onApplied).toHaveBeenCalledWith(mockJob._id);
            });
        });

        it('should show apply error message when fetch fails', async () => {
            global.fetch.mockResolvedValueOnce({ ok: false });
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };

            render(<JobCard job={mockJob} user={user} />);
            fireEvent.click(screen.getByRole('button', { name: 'add' }));

            await waitFor(() => {
                expect(screen.getByText('Failed to apply')).toBeInTheDocument();
            });
        });

        it('should show retract button when isApplied is true', () => {
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            render(<JobCard job={mockJob} user={user} isApplied={true} />);
            expect(screen.getByRole('button', { name: 'close' })).toBeInTheDocument();
        });

        it('should call DELETE /api/applications when retracting', async () => {
            global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };

            render(<JobCard job={mockJob} user={user} isApplied={true} />);
            fireEvent.click(screen.getByRole('button', { name: 'close' }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    `/api/applications/${mockJob._id}`,
                    expect.objectContaining({ method: 'DELETE' })
                );
            });
        });

        it('should call onRetracted callback after successfully retracting', async () => {
            global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            const onRetracted = jest.fn();

            render(<JobCard job={mockJob} user={user} isApplied={true} onRetracted={onRetracted} />);
            fireEvent.click(screen.getByRole('button', { name: 'close' }));

            await waitFor(() => {
                expect(onRetracted).toHaveBeenCalledWith(mockJob._id);
            });
        });

    });

    describe('admin controls', () => {

        it('should show edit button for admin users', () => {
            const admin = { userId: 'admin-1', username: 'admin', isAdmin: true };
            render(<JobCard job={mockJob} user={admin} />);
            expect(screen.getByRole('button', { name: 'edit' })).toBeInTheDocument();
        });

        it('should not show edit button for regular users', () => {
            const user = { userId: 'user-1', username: 'user', isAdmin: false };
            render(<JobCard job={mockJob} user={user} />);
            expect(screen.queryByRole('button', { name: 'edit' })).not.toBeInTheDocument();
        });

        it('should call onEdit with the job when edit button is clicked', () => {
            const admin = { userId: 'admin-1', username: 'admin', isAdmin: true };
            const onEdit = jest.fn();
            render(<JobCard job={mockJob} user={admin} onEdit={onEdit} />);
            fireEvent.click(screen.getByRole('button', { name: 'edit' }));
            expect(onEdit).toHaveBeenCalledWith(mockJob);
        });

    });

});
