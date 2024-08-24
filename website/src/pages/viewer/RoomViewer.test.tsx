// RoomViewer.test.tsx
import {render} from "@testing-library/react";
import {screen} from "@testing-library/dom";
import {expect, vi} from "vitest";
import RoomViewer from "./RoomViewer";

describe("RoomViewer component", () => {
  it("should render Viewer component", () => {
    render(<RoomViewer />);

    const viewerDiv = screen.getByTestId("viewer-container"); // Thay thế bằng data-testid nếu cần
    expect(viewerDiv).toHaveClass("relative");
    expect(viewerDiv).toHaveClass("h-full");
    expect(viewerDiv).toHaveClass("flex-1");
  });
});
