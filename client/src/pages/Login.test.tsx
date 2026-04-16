import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login page", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("shows validation error when fields are empty", async () => {
    render(
      <MemoryRouter>
        <Login setIsLoggedIn={() => {}} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
  });

  it("navigates to forgot password", () => {
    render(
      <MemoryRouter>
        <Login setIsLoggedIn={() => {}} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/forgot password\?/i));
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });
});
