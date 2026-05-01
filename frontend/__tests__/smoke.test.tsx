import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}));

describe("Home", () => {
  it("renders the planner shell", () => {
    render(<Home />);
    expect(screen.getByText("AI Study Planner")).toBeInTheDocument();
    expect(screen.getByText("Onboarding")).toBeInTheDocument();
    expect(screen.getByText("Sandbox")).toBeInTheDocument();
  });
});
