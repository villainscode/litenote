# Litenote

A lightweight, modern text editor with floating toolbar functionality.

## Features

- Text selection with floating toolbar
- Bold text formatting
- Selection range indicators
- Clean and minimal UI
- Customizable editor container

## Usage

```javascript
// Create an editor instance
const editor = new Editor('#editor-container', {
  initialContent: 'Your initial content here',
  onChange: (content) => {
    console.log('Content changed:', content);
  }
});
```

## Requirements

- Modern web browser with ES6+ support
- Google Material Icons font

## License

MIT 