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

  it("does not show helper text when error is present", () => {
    render(<Input error="Error message" helperText="Helper text" />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
  });

  it("applies normal styles when no error", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-gray-300");
    expect(input).not.toHaveClass("border-red-300");
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("uses provided id or generates one", () => {
    const { rerender } = render(<Input id="custom-id" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "custom-id");

    rerender(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id");
    expect(input.getAttribute("id")).toBeTruthy();
  });

  it("associates label with input using id", () => {
    render(<Input id="test-input" label="Test Label" />);
    const input = screen.getByRole("textbox");
    const label = screen.getByText("Test Label");
    expect(input).toHaveAttribute("id", "test-input");
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("passes through other props", () => {
    render(
      <Input placeholder="Enter text" type="email" data-testid="test-input" />
    );
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toHaveAttribute("type", "email");
  });

  it("has correct display name", () => {
    expect(Input.displayName).toBe("Input");
  });
});
