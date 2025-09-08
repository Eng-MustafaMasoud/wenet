import { render, screen, fireEvent } from "@testing-library/react";
import Input from "@/components/ui/Input";

describe("Input Component", () => {
  it("renders with label", () => {
    render(<Input label="Test Label" />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("handles input changes", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test value" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("test value");
  });

  it("shows error message", () => {
    render(<Input error="This is an error" />);
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });

  it("shows helper text", () => {
    render(<Input helperText="This is helper text" />);
    expect(screen.getByText("This is helper text")).toBeInTheDocument();
  });

  it("applies full width class when fullWidth is true", () => {
    render(<Input fullWidth />);
    expect(screen.getByRole("textbox").parentElement).toHaveClass("w-full");
  });

  it("applies error classes when error is present", () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-300");
  });
});
