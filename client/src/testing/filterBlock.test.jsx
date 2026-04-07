import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterBlock from '../components/FilterBlock/FilterBlock';

const defaultProps = {
    jobType: '',
    industry: '',
    salary: 0,
    sort: 'date-desc',
    onJobTypeChange: jest.fn(),
    onIndustryChange: jest.fn(),
    onSalaryChange: jest.fn(),
    onSortChange: jest.fn(),
    onDataReceived: jest.fn(),
};

beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('FilterBlock', () => {

    describe('rendering', () => {

        it('should render the search input', () => {
            render(<FilterBlock {...defaultProps} />);
            expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        });

        it('should render job type options', () => {
            render(<FilterBlock {...defaultProps} />);
            expect(screen.getByRole('option', { name: 'Full-time' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Part-time' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Contract' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Internship' })).toBeInTheDocument();
        });

        it('should render industry options', () => {
            render(<FilterBlock {...defaultProps} />);
            expect(screen.getByRole('option', { name: 'Information Technology' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Healthcare' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Engineering' })).toBeInTheDocument();
        });

        it('should render the salary slider', () => {
            render(<FilterBlock {...defaultProps} />);
            expect(screen.getByRole('slider')).toBeInTheDocument();
        });

        it('should display the current salary value in the label', () => {
            render(<FilterBlock {...defaultProps} salary={50000} />);
            expect(screen.getByText(/Minimum Salary: \$50000/)).toBeInTheDocument();
        });

    });

    describe('interactions', () => {

        it('should call onSortChange when sort is changed', () => {
            const onSortChange = jest.fn();
            render(<FilterBlock {...defaultProps} onSortChange={onSortChange} />);
            const selects = screen.getAllByRole('combobox');
            fireEvent.change(selects[0], { target: { value: 'title-asc' } });
            expect(onSortChange).toHaveBeenCalled();
        });

        it('should call onJobTypeChange when job type is changed', () => {
            const onJobTypeChange = jest.fn();
            render(<FilterBlock {...defaultProps} onJobTypeChange={onJobTypeChange} />);
            const selects = screen.getAllByRole('combobox');
            fireEvent.change(selects[1], { target: { value: 'full-time' } });
            expect(onJobTypeChange).toHaveBeenCalled();
        });

        it('should call onIndustryChange when industry is changed', () => {
            const onIndustryChange = jest.fn();
            render(<FilterBlock {...defaultProps} onIndustryChange={onIndustryChange} />);
            const selects = screen.getAllByRole('combobox');
            fireEvent.change(selects[2], { target: { value: 'Engineering' } });
            expect(onIndustryChange).toHaveBeenCalled();
        });

        it('should call onSalaryChange when salary slider is changed', () => {
            const onSalaryChange = jest.fn();
            render(<FilterBlock {...defaultProps} onSalaryChange={onSalaryChange} />);
            fireEvent.change(screen.getByRole('slider'), { target: { value: '50000' } });
            expect(onSalaryChange).toHaveBeenCalled();
        });

    });

    describe('search submission', () => {

        it('should call fetch with the search query on submit', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

            render(<FilterBlock {...defaultProps} />);
            fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Engineer' } });
            fireEvent.click(screen.getByRole('button', { name: /submit/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('q=Engineer'),
                    expect.any(Object)
                );
            });
        });

        it('should call onDataReceived with results after a successful search', async () => {
            const jobs = [{ _id: 'job-1', title: 'Engineer' }];
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(jobs),
            });
            const onDataReceived = jest.fn();

            render(<FilterBlock {...defaultProps} onDataReceived={onDataReceived} />);
            fireEvent.click(screen.getByRole('button', { name: /submit/i }));

            await waitFor(() => {
                expect(onDataReceived).toHaveBeenCalledWith(jobs, expect.any(String));
            });
        });

        it('should call onDataReceived with an empty array when fetch fails', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            const onDataReceived = jest.fn();

            render(<FilterBlock {...defaultProps} onDataReceived={onDataReceived} />);
            fireEvent.click(screen.getByRole('button', { name: /submit/i }));

            await waitFor(() => {
                expect(onDataReceived).toHaveBeenCalledWith([], expect.stringContaining('Error'));
            });
        });

        it('should include jobType filter in the fetch URL when provided', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
            });

            render(<FilterBlock {...defaultProps} jobType="full-time" />);
            fireEvent.click(screen.getByRole('button', { name: /submit/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('jobType=full-time'),
                    expect.any(Object)
                );
            });
        });

    });

});
