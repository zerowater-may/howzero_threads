# Excalidraw JSON Element Schema

## File Wrapper
```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "mezcorp-claude-code",
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": null
  },
  "files": {}
}
```

## Common Properties (all elements)
| Property | Type | Required | Default |
|----------|------|----------|---------|
| type | string | yes | - |
| id | string | yes | unique |
| x | number | yes | - |
| y | number | yes | - |
| width | number | yes | - |
| height | number | yes | - |
| strokeColor | string | no | "#1e1e1e" |
| backgroundColor | string | no | "transparent" |
| fillStyle | string | no | "solid" |
| strokeWidth | number | no | 2 |
| roughness | number | no | 1 (use 0 for clean) |
| opacity | number | no | 100 |
| roundness | object | no | null |
| strokeStyle | string | no | "solid" |

## Rectangle
```json
{
  "type": "rectangle",
  "id": "unique-id",
  "x": 100, "y": 100,
  "width": 200, "height": 100,
  "roundness": { "type": 3 },
  "backgroundColor": "#a5d8ff",
  "fillStyle": "solid",
  "roughness": 0
}
```

## Ellipse
```json
{
  "type": "ellipse",
  "id": "unique-id",
  "x": 100, "y": 100,
  "width": 150, "height": 150
}
```

## Diamond
```json
{
  "type": "diamond",
  "id": "unique-id",
  "x": 100, "y": 100,
  "width": 150, "height": 150
}
```

## Text
```json
{
  "type": "text",
  "id": "unique-id",
  "x": 100, "y": 100,
  "text": "Hello World",
  "fontSize": 20,
  "fontFamily": 3,
  "strokeColor": "#1e1e1e"
}
```

## Arrow
```json
{
  "type": "arrow",
  "id": "unique-id",
  "x": 100, "y": 100,
  "width": 200, "height": 0,
  "points": [[0, 0], [200, 0]],
  "endArrowhead": "arrow",
  "startBinding": {
    "elementId": "source-id",
    "fixedPoint": [1, 0.5]
  },
  "endBinding": {
    "elementId": "target-id",
    "fixedPoint": [0, 0.5]
  }
}
```

### fixedPoint Reference
| Position | fixedPoint |
|----------|-----------|
| Top | [0.5, 0] |
| Bottom | [0.5, 1] |
| Left | [0, 0.5] |
| Right | [1, 0.5] |

### endArrowhead Options
- `"arrow"` - standard arrowhead
- `"bar"` - flat bar
- `"dot"` - circle
- `"triangle"` - filled triangle
- `null` - no arrowhead

## Label (on shapes or arrows)
```json
{
  "label": {
    "text": "Label Text",
    "fontSize": 16
  }
}
```
