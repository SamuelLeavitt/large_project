import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./Home";

describe("Home page", () => {
  it("renders the main sections", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/recent workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/my workout plans/i)).toBeInTheDocument();
  });
});
