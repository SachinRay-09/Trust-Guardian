# OCR Scanner Feature

## Overview
The OCR (Optical Character Recognition) Scanner allows users to upload screenshots or images containing text, automatically extract the text using AI, and analyze it for threats using Trust Guardian's detection system.

## Features

### 📸 Image Upload
- Drag & drop or click to upload images
- Supports: JPG, PNG, GIF, BMP, TIFF
- Perfect for email screenshots, printed documents, or photos

### 🔍 Text Extraction
- Powered by Tesseract.js OCR engine
- Real-time progress tracking
- Automatic text recognition from images
- Works entirely in the browser (no server required)

### 🛡️ Threat Analysis
- Automatically analyzes extracted text
- Uses all 4 AI detection agents:
  - Spam Detector
  - Deepfake Detector
  - Toxicity Detector
  - Scam Detector
- Respects user's strictness settings
- Saves results to history

### 🎨 Theme Support
- **Day Theme**: Bright purple/pink gradient, friendly interface
- **Night Theme**: Dark blue professional look
- **Haunted Theme**: Horror-themed with spectral effects

## How to Use

1. **Open OCR Scanner**
   - Click the "SCAN IMAGE (OCR)" / "IMAGE EXORCIST" button on the main page

2. **Upload Image**
   - Click the upload area or drag an image file
   - Wait for text extraction (progress bar shows status)

3. **Review Results**
   - View extracted text in a scrollable text box
   - See threat analysis scores for all 4 detection types
   - Check overall threat level (low/medium/high)

4. **Scan Another**
   - Click "Scan Another Image" to analyze more images

## Use Cases

### 📧 Email Screenshots
- Analyze suspicious emails from mobile devices
- Check forwarded email images
- Verify promotional content

### 📄 Printed Documents
- Scan physical letters or flyers
- Check printed advertisements
- Verify paper-based communications

### 💬 Social Media Screenshots
- Analyze DM screenshots
- Check suspicious messages
- Verify social media content

### 🖼️ Any Text Image
- Business cards
- Posters and flyers
- Text from photos
- Scanned documents

## Technical Details

### OCR Engine
- **Library**: Tesseract.js v5
- **Language**: English (eng)
- **Processing**: Client-side (browser-based)
- **Performance**: ~2-5 seconds per image

### Integration
- Seamlessly integrates with existing threat detection
- Saves to analysis history with type 'ocr_image'
- Triggers notifications for detected threats
- Updates user statistics and leaderboard

### Privacy
- All processing happens in your browser
- Images are never uploaded to external servers
- Text extraction is completely local
- Only analysis results are saved to database

## Configuration

The OCR Scanner respects your Trust Guardian settings:

- **Detection Strictness**: Adjusts confidence thresholds
- **Active Agents**: Only enabled detectors run
- **Visual Haunting**: Controls UI animation intensity
- **Theme**: Adapts to your selected theme

## Tips

✅ **Best Results**:
- Use clear, high-contrast images
- Ensure text is readable and not too small
- Avoid heavily stylized fonts
- Good lighting in photos

⚠️ **Limitations**:
- Handwritten text may not be recognized
- Very small text (<12pt) may be difficult
- Heavy image compression can reduce accuracy
- Non-English text requires language pack

## Future Enhancements

Potential improvements for future versions:
- Multi-language support
- Batch image processing
- Image preprocessing (contrast, rotation)
- PDF support
- Mobile camera integration
- OCR accuracy confidence scores

---

**Built for Kiroween Hackathon** 🎃👻
Protecting users from threats in any format!
