import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '../components/SignIn/SignIn';

const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onCreateAccount: jest.fn(),
};

beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('SignIn', () => {

    describe('rendering', () => {

        it('should render the username and password fields', () => {
            render(<SignIn {...defaultProps} />);
            expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        });

        it('should render the Login and Create Account buttons', () => {
            render(<SignIn {...defaultProps} />);
            expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        });

    });

    describe('interactions', () => {

        it('should call onClose when the close button is clicked', () => {
            const onClose = jest.fn();
            render(<SignIn {...defaultProps} onClose={onClose} />);
            fireEvent.click(screen.getByRole('button', { name: /close/i }));
            expect(onClose).toHaveBeenCalled();
        });

        it('should call onCreateAccount when Create Account button is clicked', () => {
            const onCreateAccount = jest.fn();
            render(<SignIn {...defaultProps} onCreateAccount={onCreateAccount} />);
            fireEvent.click(screen.getByRole('button', { name: /create account/i }));
            expect(onCreateAccount).toHaveBeenCalled();
        });

    });

    describe('form submission', () => {

        it('should show error message when login fails', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Invalid credentials' }),
            });

            render(<SignIn {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
            fireEvent.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
            });
        });

        it('should show success message after a successful login', async () => {
            global.fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ success: true }),
                })
                .mockResolvedValueOnce({
                    json: () => Promise.resolve({ userId: 'user-1', username: 'testuser' }),
                });

            render(<SignIn {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText(/success/i)).toBeInTheDocument();
            });
        });

        it('should call onSuccess with user data after a successful login', async () => {
            const userData = { userId: 'user-1', username: 'testuser' };
            global.fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ success: true }),
                })
                .mockResolvedValueOnce({
                    json: () => Promise.resolve(userData),
                });
            const onSuccess = jest.fn();

            render(<SignIn {...defaultProps} onSuccess={onSuccess} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith(userData);
            });
        });

        it('should show a connection error when fetch throws', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            render(<SignIn {...defaultProps} />);
            fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
            });
        });

    });

});
