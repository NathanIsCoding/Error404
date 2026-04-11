import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateAccount from '../components/CreateAccount/CreateAccount';

const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
};

beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('CreateAccount', () => {

    describe('rendering', () => {

        it('should render all required form fields', () => {
            render(<CreateAccount {...defaultProps} />);
            expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/verify password/i)).toBeInTheDocument();
        });

        it('should render the Create Account submit button', () => {
            render(<CreateAccount {...defaultProps} />);
            expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        });

    });

    describe('password validation', () => {

        it('should show an error when passwords do not match', () => {
            render(<CreateAccount {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123!' } });
            fireEvent.change(screen.getByLabelText(/verify password/i), { target: { value: 'Password321!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
        });

        it('should not show a password error when passwords match', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ message: 'Account created' }),
            }).mockResolvedValueOnce({
                json: () => Promise.resolve({ userId: 'user-1' }),
            });

            render(<CreateAccount {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password:/i), { target: { value: 'Password123!' } });
            fireEvent.change(screen.getByLabelText(/verify password:?/i), { target: { value: 'Password123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.queryByText(/invalid password/i)).not.toBeInTheDocument();
            });
        });

        it('should not show a password error when passwords match', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ message: 'Account created' }),
            }).mockResolvedValueOnce({
                json: () => Promise.resolve({ userId: 'user-1' }),
            });

            render(<CreateAccount {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123!' } });
            fireEvent.change(screen.getByLabelText(/verify password/i), { target: { value: 'Password123!' } });
            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.queryByText(/invalid password/i)).not.toBeInTheDocument();
            });
        });

    });

    describe('form submission', () => {

        it('should not call fetch when passwords do not match', () => {
            render(<CreateAccount {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'abc' } });
            fireEvent.change(screen.getByLabelText(/verify password/i), { target: { value: 'xyz' } });
            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should call POST /api/accounts with form data on valid submission', async () => {
            render(<CreateAccount {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123!' } });
            fireEvent.change(screen.getByLabelText(/verify password/i), { target: { value: 'Password123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/accounts',
                    expect.objectContaining({ method: 'POST' })
                );
            });
        });

        it('should show an error message when account creation fails', async () => {
            // First mock the fetch failure
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Username already taken' })
            });

            render(<CreateAccount {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'takenuser' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'takenuser@example.com' } });
            fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123!' } });
            fireEvent.change(screen.getByLabelText(/verify password/i), { target: { value: 'Password123!' } });

            fireEvent.click(screen.getByRole('button', { name: /create account/i }));

            await waitFor(() => {
                expect(screen.getByText(/username already taken/i)).toBeInTheDocument();
            });
        });

    });

});
