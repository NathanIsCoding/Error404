import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

function renderNavbar(props = {}) {
    return render(
        <MemoryRouter>
            <Navbar {...props} />
        </MemoryRouter>
    );
}

beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('Navbar', () => {

    describe('rendering', () => {

        it('should render the site logo', () => {
            renderNavbar();
            expect(screen.getByText('JobSite')).toBeInTheDocument();
        });

        it('should show Sign In button when no user is logged in', () => {
            renderNavbar({ user: null, setUser: jest.fn(), onSignIn: jest.fn() });
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });

        it('should show the username when a user is logged in', () => {
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            renderNavbar({ user, setUser: jest.fn(), onSignIn: jest.fn() });
            expect(screen.getByText('testuser')).toBeInTheDocument();
        });

        it('should not show Sign In button when a user is logged in', () => {
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            renderNavbar({ user, setUser: jest.fn(), onSignIn: jest.fn() });
            expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
        });

        it('should show Admin Dashboard link for admin users', () => {
            const admin = { userId: 'admin-1', username: 'admin', isAdmin: true };
            renderNavbar({ user: admin, setUser: jest.fn(), onSignIn: jest.fn() });
            expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
        });

        it('should not show Admin Dashboard link for regular users', () => {
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            renderNavbar({ user, setUser: jest.fn(), onSignIn: jest.fn() });
            expect(screen.queryByRole('button', { name: /dashboard/i })).not.toBeInTheDocument();
        });

    });

    describe('interactions', () => {

        it('should call onSignIn when Sign In button is clicked', () => {
            const onSignIn = jest.fn();
            renderNavbar({ user: null, setUser: jest.fn(), onSignIn });
            fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
            expect(onSignIn).toHaveBeenCalled();
        });

        it('should show dropdown menu when hovering over user button', () => {
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            renderNavbar({ user, setUser: jest.fn(), onSignIn: jest.fn() });

            const dropdown = screen.getByText('testuser').closest('.user-dropdown');
            fireEvent.mouseEnter(dropdown);

            expect(screen.getByRole('button', { name: /view profile/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /my jobs/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /my applications/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
        });

        it('should hide dropdown menu after mouse leaves', () => {
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            renderNavbar({ user, setUser: jest.fn(), onSignIn: jest.fn() });

            const dropdown = screen.getByText('testuser').closest('.user-dropdown');
            fireEvent.mouseEnter(dropdown);
            fireEvent.mouseLeave(dropdown);

            expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
        });

        it('should call setUser(null) and POST logout when signing out', async () => {
            global.fetch.mockResolvedValueOnce({ ok: true });
            const setUser = jest.fn();
            const user = { userId: 'user-1', username: 'testuser', isAdmin: false };
            renderNavbar({ user, setUser, onSignIn: jest.fn() });

            const dropdown = screen.getByText('testuser').closest('.user-dropdown');
            fireEvent.mouseEnter(dropdown);
            fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/accounts/logout',
                    expect.objectContaining({ method: 'POST' })
                );
                expect(setUser).toHaveBeenCalledWith(null);
            });
        });

    });

});
