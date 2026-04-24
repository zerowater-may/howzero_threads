# Layout Gotchas

Common issues found during render validation with proven fixes.

## 1. Fan-Out Label Collisions
**Problem**: Multiple arrows from one source overlap their labels.
**Fix**: Stagger destination y-positions by 60-80px. Use alternating label positions (above/below arrow).

## 2. Zone Opacity Too High
**Problem**: Background zones obscure elements inside them.
**Fix**: Use opacity 30-35 for zone rectangles. Never exceed 50.

## 3. Arrow-Label Overlap
**Problem**: Arrow labels overlap with nearby elements.
**Fix**: Keep arrow labels short (1-3 words). Increase arrow length to 150px+ for labeled arrows.

## 4. Column Alignment Drift
**Problem**: Elements in a vertical column gradually drift left/right.
**Fix**: Use exact same x-coordinate for all elements in a column. Check after each section.

## 5. Text Overflow in Shapes
**Problem**: Text extends beyond shape boundaries.
**Fix**: Size shapes to at least `text.length * fontSize * 0.5 + 40` width. Use label (auto-resize) instead of manual text.

## 6. Inconsistent Spacing
**Problem**: Gaps between elements vary randomly.
**Fix**: Pick one gap size (40px or 60px) and use it everywhere. Vertical and horizontal.

## 7. Arrow Binding Mismatch
**Problem**: Arrows visually connect to shapes but bindings reference wrong IDs.
**Fix**: Double-check elementId in startBinding/endBinding matches the target shape's id.

## 8. Overlapping Coordinates
**Problem**: Two elements share the same x,y position.
**Fix**: After generating each section, scan for coordinate conflicts. Minimum 20px separation.

## 9. Title Not Centered
**Problem**: Title text appears off-center relative to diagram content.
**Fix**: Calculate total diagram width, then set title x = diagramLeft + (diagramWidth - titleWidth) / 2.

## 10. Camera Too Tight
**Problem**: Elements are clipped at viewport edges.
**Fix**: Add 50-100px padding around content. If content is 500px wide, use 700px+ camera width.
