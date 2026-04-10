import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyJobs from '../pages/MyJobs/MyJobs';

// Mock the global fetch
global.fetch = jest.fn();

const mockUser = {
  userId: 'user-123',
};

const mockJobs = [
  {
    jobId: 'job-1',
    title: 'Developer',
    company: 'Test Co',
  },
];

const mockApplications = [
  {
    _id: 'app-1',
    jobId: { title: 'Developer' },
    userId: { userId: 'user-456', username: 'applicant1', email: 'app1@test.com' },
    status: 'pending',
  },
];

describe('MyJobs Component - Accept/Reject Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders correctly and fetches jobs', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([ mockJobs[0] ]),
    });

    render(
      <BrowserRouter>
        <MyJobs user={mockUser} setUser={() => {}} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Developer/i)).toBeInTheDocument();
    });
  });

  it('fetches applications, expands job, and can accept an application', async () => {
    // 1st fetch: jobs
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([ mockJobs[0] ]),
    });

    render(
      <BrowserRouter>
        <MyJobs user={mockUser} setUser={() => {}} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Developer/i)).toBeInTheDocument();
    });

    // 2nd fetch: applications
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockApplications }),
    });

    const viewAppsBtn = await screen.findByText('View Apps');
    fireEvent.click(viewAppsBtn);

    await waitFor(() => {
      expect(screen.getByText('applicant1')).toBeInTheDocument();
      // Should show 'Accept' and 'Reject' buttons for 'pending' state
      expect(screen.getByText('Accept')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    // 3rd fetch: update status to accepted
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { status: 'accepted' }, message: 'Status updated' }),
    });

    const acceptBtn = screen.getByText('Accept');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      // Upon clicking Accept, it should update locally and just show Undo
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('accepted')).toBeInTheDocument();
    });
  });

  it('can reject an application', async () => {
    // 1st fetch: jobs
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([ mockJobs[0] ]),
    });

    render(
      <BrowserRouter>
        <MyJobs user={mockUser} setUser={() => {}} />
      </BrowserRouter>
    );

    // ...Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Developer/i)).toBeInTheDocument();
    });

    // 2nd fetch: applications
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockApplications }),
    });

    const viewAppsBtn = await screen.findByText('View Apps');
    fireEvent.click(viewAppsBtn);

    await waitFor(() => {
      expect(screen.getByText('applicant1')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    // 3rd fetch: update status to rejected
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { status: 'rejected' }, message: 'Status updated' }),
    });

    const rejectBtn = screen.getByText('Reject');
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('rejected')).toBeInTheDocument();
    });
  });
});