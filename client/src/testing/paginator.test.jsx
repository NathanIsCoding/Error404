import { render, screen, fireEvent } from '@testing-library/react';
import Paginator from '../components/Paginator/Paginator';

describe('Paginator', () => {

    describe('rendering', () => {

        it('should display the current page number (1-indexed)', () => {
            render(<Paginator currentPage={0} totalPages={5} onPageChange={jest.fn()} />);
            expect(screen.getByRole('spinbutton')).toHaveValue(1);
        });

        it('should display the total page count', () => {
            render(<Paginator currentPage={0} totalPages={5} onPageChange={jest.fn()} />);
            expect(screen.getByText('/ 5')).toBeInTheDocument();
        });

        it('should disable the previous button on the first page', () => {
            render(<Paginator currentPage={0} totalPages={5} onPageChange={jest.fn()} />);
            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).toBeDisabled();
        });

        it('should disable the next button on the last page', () => {
            render(<Paginator currentPage={4} totalPages={5} onPageChange={jest.fn()} />);
            const buttons = screen.getAllByRole('button');
            expect(buttons[1]).toBeDisabled();
        });

        it('should enable both buttons on a middle page', () => {
            render(<Paginator currentPage={2} totalPages={5} onPageChange={jest.fn()} />);
            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).not.toBeDisabled();
            expect(buttons[1]).not.toBeDisabled();
        });

    });

    describe('navigation', () => {

        it('should call onPageChange with the next page when next button is clicked', () => {
            const onPageChange = jest.fn();
            render(<Paginator currentPage={2} totalPages={5} onPageChange={onPageChange} />);
            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[1]);
            expect(onPageChange).toHaveBeenCalledWith(3);
        });

        it('should call onPageChange with the previous page when prev button is clicked', () => {
            const onPageChange = jest.fn();
            render(<Paginator currentPage={2} totalPages={5} onPageChange={onPageChange} />);
            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);
            expect(onPageChange).toHaveBeenCalledWith(1);
        });

        it('should call onPageChange with the entered page number on blur', () => {
            const onPageChange = jest.fn();
            render(<Paginator currentPage={0} totalPages={5} onPageChange={onPageChange} />);
            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '3' } });
            fireEvent.blur(input);
            expect(onPageChange).toHaveBeenCalledWith(2);
        });

        it('should call onPageChange when Enter is pressed in the input', () => {
            const onPageChange = jest.fn();
            render(<Paginator currentPage={0} totalPages={5} onPageChange={onPageChange} />);
            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '4' } });
            fireEvent.keyDown(input, { key: 'Enter' });
            expect(onPageChange).toHaveBeenCalledWith(3);
        });

        it('should reset input to current page when an invalid value is committed', () => {
            const onPageChange = jest.fn();
            render(<Paginator currentPage={1} totalPages={5} onPageChange={onPageChange} />);
            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '99' } });
            fireEvent.blur(input);
            expect(onPageChange).not.toHaveBeenCalled();
            expect(input).toHaveValue(2);
        });

    });

});
