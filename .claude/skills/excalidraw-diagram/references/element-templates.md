# Element Templates

Copy-paste JSON templates for common Excalidraw elements.

## Labeled Rectangle (rounded)
```json
{
  "type": "rectangle",
  "id": "CHANGE-ME",
  "x": 100, "y": 100,
  "width": 200, "height": 80,
  "roundness": { "type": 3 },
  "backgroundColor": "#a5d8ff",
  "fillStyle": "solid",
  "roughness": 0,
  "strokeColor": "#4a9eed",
  "strokeWidth": 2,
  "label": { "text": "Label", "fontSize": 16 }
}
```

## Section Title (free-floating text)
```json
{
  "type": "text",
  "id": "CHANGE-ME",
  "x": 100, "y": 50,
  "text": "Section Title",
  "fontSize": 24,
  "strokeColor": "#1e1e1e"
}
```

## Subtitle Text
```json
{
  "type": "text",
  "id": "CHANGE-ME",
  "x": 100, "y": 80,
  "text": "Subtitle or description",
  "fontSize": 16,
  "strokeColor": "#757575"
}
```

## Arrow with Label
```json
{
  "type": "arrow",
  "id": "CHANGE-ME",
  "x": 300, "y": 140,
  "width": 150, "height": 0,
  "points": [[0, 0], [150, 0]],
  "strokeColor": "#1e1e1e",
  "strokeWidth": 2,
  "roughness": 0,
  "endArrowhead": "arrow",
  "startBinding": { "elementId": "SOURCE-ID", "fixedPoint": [1, 0.5] },
  "endBinding": { "elementId": "TARGET-ID", "fixedPoint": [0, 0.5] },
  "label": { "text": "connects", "fontSize": 14 }
}
```

## Background Zone
```json
{
  "type": "rectangle",
  "id": "CHANGE-ME",
  "x": 50, "y": 50,
  "width": 500, "height": 300,
  "backgroundColor": "#dbe4ff",
  "fillStyle": "solid",
  "roundness": { "type": 3 },
  "strokeColor": "#4a9eed",
  "strokeWidth": 1,
  "roughness": 0,
  "opacity": 30
}
```

## Evidence Artifact (code block)
```json
{
  "type": "rectangle",
  "id": "CHANGE-ME",
  "x": 100, "y": 100,
  "width": 280, "height": 80,
  "backgroundColor": "#2d2d2d",
  "fillStyle": "solid",
  "roundness": { "type": 3 },
  "strokeColor": "#555555",
  "strokeWidth": 1,
  "roughness": 0,
  "label": { "text": "const result = await fetch(url)", "fontSize": 14 }
}
```

## Timeline Dot
```json
{
  "type": "ellipse",
  "id": "CHANGE-ME",
  "x": 195, "y": 195,
  "width": 14, "height": 14,
  "backgroundColor": "#4a9eed",
  "fillStyle": "solid",
  "strokeColor": "#4a9eed",
  "strokeWidth": 1,
  "roughness": 0
}
```

## Decision Diamond
```json
{
  "type": "diamond",
  "id": "CHANGE-ME",
  "x": 100, "y": 100,
  "width": 120, "height": 80,
  "backgroundColor": "#fff3bf",
  "fillStyle": "solid",
  "roughness": 0,
  "strokeColor": "#f59e0b",
  "strokeWidth": 2,
  "label": { "text": "Yes / No?", "fontSize": 16 }
}
```

## Dashed Arrow (return/response)
```json
{
  "type": "arrow",
  "id": "CHANGE-ME",
  "x": 300, "y": 200,
  "width": 150, "height": 0,
  "points": [[0, 0], [150, 0]],
  "strokeColor": "#757575",
  "strokeWidth": 2,
  "strokeStyle": "dashed",
  "roughness": 0,
  "endArrowhead": "arrow",
  "label": { "text": "response", "fontSize": 14 }
}
```
