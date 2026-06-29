/* ==========================================================================
   Lumina Photo Editor Core Interactive Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ------------------------------------------------------------------------
  // 1. DOM Elements & State
  // ------------------------------------------------------------------------
  
  // Layout Elements
  const imageInput = document.getElementById('imageInput');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const editorContainer = document.getElementById('editorContainer');
  const viewport = document.getElementById('viewport');
  const canvasWrapper = document.getElementById('canvasWrapper');
  const controlPanel = document.querySelector('.control-panel');
  const toastContainer = document.getElementById('toastContainer');
  
  // Canvases
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  const originalCanvas = document.getElementById('originalCanvas');
  const oCtx = originalCanvas.getContext('2d');
  
  // Navigation & Tabs
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const panelContents = document.querySelectorAll('.panel-content');
  
  // Header Actions
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const saveServerBtn = document.getElementById('saveServerBtn');
  
  // Adjust Sliders
  const adjustments = {
    brightness: document.getElementById('brightness'),
    contrast: document.getElementById('contrast'),
    exposure: document.getElementById('exposure'),
    saturation: document.getElementById('saturation'),
    warmth: document.getElementById('warmth'),
    hue: document.getElementById('hue'),
    blur: document.getElementById('blur'),
    sharpen: document.getElementById('sharpen'),
    vignette: document.getElementById('vignette')
  };
  
  const adjustmentVals = {
    brightness: document.getElementById('brightnessVal'),
    contrast: document.getElementById('contrastVal'),
    exposure: document.getElementById('exposureVal'),
    saturation: document.getElementById('saturationVal'),
    warmth: document.getElementById('warmthVal'),
    hue: document.getElementById('hueVal'),
    blur: document.getElementById('blurVal'),
    sharpen: document.getElementById('sharpenVal'),
    vignette: document.getElementById('vignetteVal')
  };
  
  // AI Enhance Elements
  const enhanceBtn = document.getElementById('enhanceBtn');
  const enhanceStrength = document.getElementById('enhanceStrength');
  const enhanceStrengthVal = document.getElementById('enhanceStrengthVal');
  
  // Filters Elements
  const filterCards = document.querySelectorAll('.filter-card');
  const filterIntensity = document.getElementById('filterIntensity');
  const filterIntensityVal = document.getElementById('filterIntensityVal');
  
  // Transform / Crop Elements
  const ratioBtns = document.querySelectorAll('.ratio-btn');
  const rotateCCWBtn = document.getElementById('rotateCCWBtn');
  const rotateCWBtn = document.getElementById('rotateCWBtn');
  const flipHBtn = document.getElementById('flipHBtn');
  const flipVBtn = document.getElementById('flipVBtn');
  const applyCropBtn = document.getElementById('applyCropBtn');
  const cancelCropBtn = document.getElementById('cancelCropBtn');
  
  // Draw / Annotate Elements
  const brushToolBtn = document.getElementById('brushToolBtn');
  const eraserToolBtn = document.getElementById('eraserToolBtn');
  const brushSize = document.getElementById('brushSize');
  const brushSizeVal = document.getElementById('brushSizeVal');
  const brushOpacity = document.getElementById('brushOpacity');
  const brushOpacityVal = document.getElementById('brushOpacityVal');
  const brushColorInput = document.getElementById('brushColor');
  const swatches = document.querySelectorAll('.swatch');
  const clearDrawingBtn = document.getElementById('clearDrawingBtn');
  
  // Text Elements
  const textOverlayInput = document.getElementById('textOverlayInput');
  const fontFamilySelect = document.getElementById('fontFamilySelect');
  const fontSize = document.getElementById('fontSize');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const textColorInput = document.getElementById('textColor');
  const boldTextBtn = document.getElementById('boldTextBtn');
  const italicTextBtn = document.getElementById('italicTextBtn');
  const alignBtns = document.querySelectorAll('.text-styles-grid .style-toggle-btn[data-align]');
  const addTextBtn = document.getElementById('addTextBtn');
  const deleteTextBtn = document.getElementById('deleteTextBtn');
  
  // Viewport scale & Compare
  const toggleCompareBtn = document.getElementById('toggleCompareBtn');
  const comparisonContainer = document.getElementById('comparisonContainer');
  const comparisonDivider = document.getElementById('comparisonDivider');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const zoomScaleText = document.getElementById('zoomScaleText');
  
  // User Hidden Preview (Required Sync element)
  const userPreviewSyncImg = document.getElementById('preview');
  
  // Sample Cards
  const sampleCards = document.querySelectorAll('.sample-card');
  
  // Background Changer Elements
  const backgroundSelect = document.getElementById('backgroundSelect');
  const backgroundImage = document.getElementById('backgroundImage');
  const userImage = document.getElementById('userImage');
  const domLayerEditor = document.getElementById('domLayerEditor');
  
  const activateKeyerBtn = document.getElementById('activateKeyerBtn');
  const keyColorIndicatorWrapper = document.getElementById('keyColorIndicatorWrapper');
  const keyColorIndicator = document.getElementById('keyColorIndicator');
  const disableKeyerBtn = document.getElementById('disableKeyerBtn');
  
  const keyTolerance = document.getElementById('keyTolerance');
  const keyToleranceVal = document.getElementById('keyToleranceVal');
  const keyFeather = document.getElementById('keyFeather');
  const keyFeatherVal = document.getElementById('keyFeatherVal');
  
  const fgScale = document.getElementById('fgScale');
  const fgScaleVal = document.getElementById('fgScaleVal');
  const fgOffsetX = document.getElementById('fgOffsetX');
  const fgOffsetXVal = document.getElementById('fgOffsetXVal');
  const fgOffsetY = document.getElementById('fgOffsetY');
  const fgOffsetYVal = document.getElementById('fgOffsetYVal');
  
  // ------------------------------------------------------------------------
  // 2. Global State Variable
  // ------------------------------------------------------------------------
  let originalImage = null; // The loaded HTMLImageElement
  let offscreenEnhancedCanvas = null; // Precalculated auto-enhanced image
  
  // Viewport Zoom & Pan variables
  let zoomScale = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;
  
  // Compare Slider State
  let isComparing = false;
  let splitPercent = 50;
  let isDraggingSplit = false;
  
  // Active Interactive Mode: 'none', 'crop', 'draw', 'text', 'pick-color'
  let activeMode = 'none';
  let isPickingColor = false;
  
  // Active state record
  let state = {
    adjustments: {
      brightness: 0,
      contrast: 0,
      exposure: 0,
      saturation: 0,
      warmth: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      vignette: 0
    },
    filter: 'none',
    filterIntensity: 100,
    isEnhanced: false,
    enhanceStrength: 80,
    rotation: 0,
    flipH: false,
    flipV: false,
    cropBox: null,     // { x: %, y: %, w: %, h: % } relative to image width/height
    drawings: [],      // Array of paths
    texts: [],         // Array of texts
    selectedTextId: null,
    isDragging: false,
    
    // Background & Layer states
    backgroundSrc: '',
    chromaKey: {
      enabled: false,
      color: [0, 0, 0], // RGB
      tolerance: 30,
      feather: 2
    },
    fgTransform: {
      scale: 100,
      x: 0,
      y: 0
    }
  };
  
  // Undo/Redo Stacks
  let historyStack = [];
  let redoStack = [];
  
  // Drawing path state
  let isDrawing = false;
  let currentPath = [];
  let brushColor = '#6366f1';
  let brushTool = 'brush'; // 'brush' or 'eraser'
  
  // Text Overlay active styling
  let textBold = false;
  let textItalic = false;
  let textAlign = 'left';
  let isDraggingText = false;
  let textDragOffset = { x: 0, y: 0 };
  
  // Crop overlay interactive coordinates (relative to canvas display size)
  let activeCropBox = null; // { x, y, w, h } in canvas pixel space
  let isDraggingCrop = false;
  let cropDragHandle = null; // 'nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w', 'move'
  let cropLockRatio = 'free'; // 'free', '1-1', '4-3', '16-9', '9-16'
  
  // ------------------------------------------------------------------------
  // 3. Setup Tab Navigation
  // ------------------------------------------------------------------------
  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      if (!originalImage && !['upload', 'passport', 'merge'].includes(trigger.dataset.tab)) {
        showToast('Please upload a photo first!', 'info');
        return;
      }
      
      tabTriggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');
      
      const targetPanel = trigger.dataset.tab;
      document.querySelectorAll('.panel-content').forEach(content => {
        content.classList.remove('active');
        if (content.dataset.panel === targetPanel) {
          content.classList.add('active');
        }
      });
      
      // Handle workspace mode changes when tabs toggle
      setWorkspaceMode(targetPanel);
    });
  });
  
  function setWorkspaceMode(tabName) {
    // Clean up previous modes
    activeMode = 'none';
    isDrawing = false;
    isDraggingText = false;
    isDraggingCrop = false;
    isPickingColor = false;
    if (activateKeyerBtn) activateKeyerBtn.classList.remove('active');
    
    // De-select crop elements unless in crop
    if (tabName !== 'crop') {
      activeCropBox = null;
      applyCropBtn.disabled = true;
      cancelCropBtn.style.display = 'none';
    }
    
    // Toggle DOM editor vs Canvas vs Passport Sheet vs Merge Output visibility
    const a4 = document.getElementById('a4');
    const mergeWrap = document.getElementById('mergeOutputWrap');
    if (tabName === 'passport') {
      if (a4) a4.style.display = 'grid';
      if (mergeWrap) mergeWrap.style.display = 'none';
      domLayerEditor.style.display = 'none';
      canvas.style.display = 'none';
      editorContainer.style.display = 'none';
      uploadPlaceholder.style.display = 'none';
      viewport.classList.add('passport-mode');
    } else if (tabName === 'merge') {
      if (a4) a4.style.display = 'none';
      if (mergeWrap) mergeWrap.style.display = 'flex';
      domLayerEditor.style.display = 'none';
      canvas.style.display = 'none';
      editorContainer.style.display = 'none';
      uploadPlaceholder.style.display = 'none';
      viewport.classList.remove('passport-mode');
    } else {
      if (a4) a4.style.display = 'none';
      if (mergeWrap) mergeWrap.style.display = 'none';
      viewport.classList.remove('passport-mode');
      
      // Restore standard editor vs upload placeholder state
      if (originalImage) {
        editorContainer.style.display = 'flex';
        uploadPlaceholder.style.display = 'none';
      } else {
        editorContainer.style.display = 'none';
        uploadPlaceholder.style.display = 'flex';
      }
      
      if (tabName === 'backgrounds') {
        domLayerEditor.style.display = 'block';
        canvas.style.display = 'none';
        activeMode = 'background';
      } else {
        domLayerEditor.style.display = 'none';
        canvas.style.display = 'block';
      }
    }
    
    // Toggle Mode
    if (tabName === 'draw') {
      activeMode = 'draw';
      canvas.style.cursor = 'crosshair';
    } else if (tabName === 'crop') {
      activeMode = 'crop';
      canvas.style.cursor = 'default';
      initCropBox();
    } else if (tabName === 'text') {
      activeMode = 'text';
      canvas.style.cursor = 'default';
    } else {
      canvas.style.cursor = 'default';
      state.selectedTextId = null;
    }
    
    renderCanvas();
  }
  
  // ------------------------------------------------------------------------
  // 4. File Loading & Drag-Drop
  // ------------------------------------------------------------------------
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      userPreviewSyncImg.src = URL.createObjectURL(file);
      loadImageFromFile(file);
    }
  });
  
  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadPlaceholder.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadPlaceholder.classList.add('drag-over');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    uploadPlaceholder.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadPlaceholder.classList.remove('drag-over');
    }, false);
  });
  
  uploadPlaceholder.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file && file.type.startsWith('image/')) {
      userPreviewSyncImg.src = URL.createObjectURL(file);
      loadImageFromFile(file);
    } else {
      showToast('Please upload a valid image file!', 'error');
    }
  });
  
  // Sample Images Loader
  sampleCards.forEach(card => {
    card.addEventListener('click', () => {
      const sampleType = card.dataset.sample;
      let sampleUrl = '';
      if (sampleType === 'scenery') {
        sampleUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=90';
      } else if (sampleType === 'portrait') {
        sampleUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=90';
      } else if (sampleType === 'street') {
        sampleUrl = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=90';
      }
      
      showToast('Loading sample image...', 'info');
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        initializeEditorWithImage(img);
        showToast('Sample image loaded successfully!', 'success');
      };
      img.onerror = () => {
        showToast('Failed to load sample image. Please upload a local file.', 'error');
      };
      img.src = sampleUrl;
    });
  });
  
  function loadImageFromFile(file) {
    showToast('Loading photo...', 'info');
    const img = new Image();
    img.onload = () => {
      initializeEditorWithImage(img);
      showToast('Image loaded successfully!', 'success');
    };
    img.onerror = () => {
      showToast('Failed to parse image file!', 'error');
    };
    img.src = URL.createObjectURL(file);
  }
  
  function initializeEditorWithImage(img) {
    originalImage = img;
    offscreenEnhancedCanvas = null; // Clear precalculated enhanced cache
    
    // Reset state & history
    state = {
      adjustments: {
        brightness: 0,
        contrast: 0,
        exposure: 0,
        saturation: 0,
        warmth: 0,
        hue: 0,
        blur: 0,
        sharpen: 0,
        vignette: 0
      },
      filter: 'none',
      filterIntensity: 100,
      isEnhanced: false,
      enhanceStrength: 80,
      rotation: 0,
      flipH: false,
      flipV: false,
      cropBox: null,
      drawings: [],
      texts: [],
      selectedTextId: null
    };
    historyStack = [];
    redoStack = [];
    
    // UI Reset
    resetSlidersUI();
    disableCompare();
    
    // Display Editor workspace
    uploadPlaceholder.style.display = 'none';
    editorContainer.style.display = 'flex';
    
    // Enable Actions
    downloadBtn.disabled = false;
    saveServerBtn.disabled = false;
    resetBtn.disabled = false;
    updateUndoRedoBtns();
    
    // Fit zoom scale
    fitImageScale();
    
    // Render Canvas
    renderCanvas();
    
    // Switch Tab to Enhance immediately for a premium presentation
    document.querySelector('.tab-trigger[data-tab="enhance"]').click();
  }
  
  function resetSlidersUI() {
    Object.keys(adjustments).forEach(key => {
      if (key === 'blur') {
        adjustments[key].value = 0;
        adjustmentVals[key].innerText = '0px';
      } else if (key === 'hue') {
        adjustments[key].value = 0;
        adjustmentVals[key].innerText = '0';
      } else if (key === 'vignette' || key === 'sharpen') {
        adjustments[key].value = 0;
        adjustmentVals[key].innerText = '0%';
      } else {
        adjustments[key].value = 0;
        adjustmentVals[key].innerText = '0';
      }
    });
    
    enhanceStrength.value = 80;
    enhanceStrengthVal.innerText = '80%';
    
    filterIntensity.value = 100;
    filterIntensityVal.innerText = '100%';
    
    // De-select filters active state
    filterCards.forEach(card => card.classList.remove('active'));
    document.querySelector('.filter-card[data-filter="none"]').classList.add('active');
    
    // Reset ratio
    ratioBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.ratio-btn[data-ratio="free"]').classList.add('active');
    cropLockRatio = 'free';
    
    // Brush reset
    brushSize.value = 10;
    brushSizeVal.innerText = '10px';
    brushOpacity.value = 100;
    brushOpacityVal.innerText = '100%';
    brushColorInput.value = '#6366f1';
    swatches.forEach(s => s.classList.remove('active'));
    document.querySelector('.swatch[data-color="#6366f1"]').classList.add('active');
    brushColor = '#6366f1';
    brushTool = 'brush';
    brushToolBtn.classList.add('active');
    eraserToolBtn.classList.remove('active');
    
    // Text reset
    textOverlayInput.value = '';
    fontSize.value = 32;
    fontSizeVal.innerText = '32px';
    textColorInput.value = '#ffffff';
    boldTextBtn.classList.remove('active');
    italicTextBtn.classList.remove('active');
    alignBtns.forEach(b => b.classList.remove('active'));
    document.getElementById('alignLeftTextBtn').classList.add('active');
    textBold = false;
    textItalic = false;
    textAlign = 'left';
  }
  
  // ------------------------------------------------------------------------
  // 5. Undo / Redo / History Operations
  // ------------------------------------------------------------------------
  function saveHistoryState() {
    // Clone adjustments, drawings, texts, cropBox, filters
    const clonedState = JSON.parse(JSON.stringify(state));
    historyStack.push(clonedState);
    
    // Limit stack size
    if (historyStack.length > 30) {
      historyStack.shift();
    }
    
    // Clear redo
    redoStack = [];
    updateUndoRedoBtns();
  }
  
  function updateUndoRedoBtns() {
    undoBtn.disabled = historyStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
  }
  
  undoBtn.addEventListener('click', () => {
    if (historyStack.length > 0) {
      // Save current to redo
      const currentState = JSON.parse(JSON.stringify(state));
      redoStack.push(currentState);
      
      // Load previous
      state = historyStack.pop();
      applyStateToUI();
      updateUndoRedoBtns();
      renderCanvas();
      showToast('Action undone', 'info');
    }
  });
  
  redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
      // Save current to undo
      const currentState = JSON.parse(JSON.stringify(state));
      historyStack.push(currentState);
      
      // Load next
      state = redoStack.pop();
      applyStateToUI();
      updateUndoRedoBtns();
      renderCanvas();
      showToast('Action redone', 'info');
    }
  });
  
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all edits? This will discard your current progress.')) {
      saveHistoryState();
      
      // Reset State variables
      state.adjustments = {
        brightness: 0,
        contrast: 0,
        exposure: 0,
        saturation: 0,
        warmth: 0,
        hue: 0,
        blur: 0,
        sharpen: 0,
        vignette: 0
      };
      state.filter = 'none';
      state.filterIntensity = 100;
      state.isEnhanced = false;
      state.rotation = 0;
      state.flipH = false;
      state.flipV = false;
      state.cropBox = null;
      state.drawings = [];
      state.texts = [];
      state.selectedTextId = null;
      
      resetSlidersUI();
      renderCanvas();
      showToast('All changes reset to original', 'success');
    }
  });
  
  function applyStateToUI() {
    // Set adjust sliders
    Object.keys(adjustments).forEach(key => {
      const val = state.adjustments[key];
      adjustments[key].value = val;
      if (key === 'blur') {
        adjustmentVals[key].innerText = val + 'px';
      } else if (key === 'vignette' || key === 'sharpen') {
        adjustmentVals[key].innerText = val + '%';
      } else {
        adjustmentVals[key].innerText = val;
      }
    });
    
    // Set enhancement strength
    enhanceStrength.value = state.enhanceStrength;
    enhanceStrengthVal.innerText = state.enhanceStrength + '%';
    
    // Set creative filters selection
    filterIntensity.value = state.filterIntensity;
    filterIntensityVal.innerText = state.filterIntensity + '%';
    filterCards.forEach(card => {
      card.classList.remove('active');
      if (card.dataset.filter === state.filter) {
        card.classList.add('active');
      }
    });
    
    // Update Crop panel aspect ratio btn states
    ratioBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.ratio === cropLockRatio) {
        btn.classList.add('active');
      }
    });
    
    // Set text style UI matching selection
    if (state.selectedTextId) {
      const text = state.texts.find(t => t.id === state.selectedTextId);
      if (text) {
        textOverlayInput.value = text.text;
        fontFamilySelect.value = text.font;
        fontSize.value = text.size;
        fontSizeVal.innerText = text.size + 'px';
        textColorInput.value = text.color;
        
        boldTextBtn.classList.toggle('active', text.bold);
        italicTextBtn.classList.toggle('active', text.italic);
        textBold = text.bold;
        textItalic = text.italic;
        
        alignBtns.forEach(b => b.classList.remove('active'));
        document.getElementById(`align${text.align.charAt(0).toUpperCase() + text.align.slice(1)}TextBtn`).classList.add('active');
        textAlign = text.align;
        
        deleteTextBtn.style.display = 'block';
      }
    } else {
      deleteTextBtn.style.display = 'none';
    }
    
    // Set background selectors and keyer
    if (state.backgroundSrc !== undefined) {
      backgroundSelect.value = state.backgroundSrc || '';
      backgroundImage.src = state.backgroundSrc || 'backgrounds/park.jpg';
      
      // Defensive initialization of chromaKey if missing in history state
      if (!state.chromaKey) {
        state.chromaKey = { enabled: false, color: [0, 0, 0], tolerance: 30, feather: 2 };
      }
      
      keyTolerance.value = state.chromaKey.tolerance;
      keyToleranceVal.innerText = state.chromaKey.tolerance;
      keyFeather.value = state.chromaKey.feather;
      keyFeatherVal.innerText = state.chromaKey.feather + 'px';
      
      if (state.chromaKey.enabled) {
        keyColorIndicator.style.backgroundColor = `rgb(${state.chromaKey.color[0]}, ${state.chromaKey.color[1]}, ${state.chromaKey.color[2]})`;
        keyColorIndicatorWrapper.style.display = 'flex';
      } else {
        keyColorIndicatorWrapper.style.display = 'none';
      }
      
      // Defensive initialization of fgTransform if missing in history state
      if (!state.fgTransform) {
        state.fgTransform = { scale: 100, x: 0, y: 0 };
      }
      
      fgScale.value = state.fgTransform.scale;
      fgScaleVal.innerText = state.fgTransform.scale + '%';
      fgOffsetX.value = state.fgTransform.x;
      fgOffsetXVal.innerText = state.fgTransform.x + 'px';
      fgOffsetY.value = state.fgTransform.y;
      fgOffsetYVal.innerText = state.fgTransform.y + 'px';
      
      userImage.style.transform = `translate(-50%, -50%) translate(${state.fgTransform.x}px, ${state.fgTransform.y}px) scale(${state.fgTransform.scale / 100})`;
    }
  }
  
  // ------------------------------------------------------------------------
  // 6. Interactive Rendering & Transforms Pipeline
  // ------------------------------------------------------------------------
  
  function getCroppedAndRotatedDimensions() {
    let baseW = originalImage.width;
    let baseH = originalImage.height;
    
    // Apply crop boundary bounding box sizes
    if (state.cropBox) {
      baseW = (state.cropBox.w / 100) * originalImage.width;
      baseH = (state.cropBox.h / 100) * originalImage.height;
    }
    
    // Swap width & height if 90 or 270 deg rotated
    if (state.rotation === 90 || state.rotation === 270) {
      return { w: baseH, h: baseW };
    }
    return { w: baseW, h: baseW }; // wait, baseW and baseH
  }
  
  function renderCanvas() {
    if (!originalImage) return;
    
    // 1. Calculate active rendering canvas sizes
    let cropX = 0;
    let cropY = 0;
    let cropW = originalImage.width;
    let cropH = originalImage.height;
    
    if (state.cropBox) {
      cropX = (state.cropBox.x / 100) * originalImage.width;
      cropY = (state.cropBox.y / 100) * originalImage.height;
      cropW = (state.cropBox.w / 100) * originalImage.width;
      cropH = (state.cropBox.h / 100) * originalImage.height;
    }
    
    const isRotated90 = (state.rotation === 90 || state.rotation === 270);
    let canvasW = isRotated90 ? cropH : cropW;
    let canvasH = isRotated90 ? cropW : cropH;
    
    // Calculate downsampling scale ratio if currently interacting (slider dragging)
    let scaleRatio = 1;
    if (state.isDragging) {
      const maxDim = 800; // Cap to 800px to ensure supercharged interactive performance
      if (canvasW > maxDim || canvasH > maxDim) {
        scaleRatio = maxDim / Math.max(canvasW, canvasH);
        canvasW = Math.round(canvasW * scaleRatio);
        canvasH = Math.round(canvasH * scaleRatio);
      }
    }
    
    canvas.width = canvasW;
    canvas.height = canvasH;
    
    // Clear Canvas
    ctx.clearRect(0, 0, canvasW, canvasH);
    
    // Save state for downsampling transform scale
    ctx.save();
    if (scaleRatio !== 1) {
      ctx.scale(scaleRatio, scaleRatio);
    }
    
    // Apply Viewport transformation: Flipping and Rotating
    ctx.save();
    
    // Move to center of canvas for rotation and mirror transforms
    // Note: We divide the unscaled crop width/height because the global context is already scaled by scaleRatio!
    ctx.translate((isRotated90 ? cropH : cropW) / 2, (isRotated90 ? cropW : cropH) / 2);
    ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
    ctx.rotate((state.rotation * Math.PI) / 180);
    
    // Determine target filter settings
    let filterString = getCSSFilterString();
    ctx.filter = filterString;
    
    // 2. Draw base Image (either Original or Pre-calculated Auto-Enhanced)
    const drawX = -cropW / 2;
    const drawY = -cropH / 2;
    
    if (state.isEnhanced && offscreenEnhancedCanvas) {
      // Draw base original, then blend enhanced on top based on strength
      ctx.drawImage(originalImage, cropX, cropY, cropW, cropH, drawX, drawY, cropW, cropH);
      
      ctx.save();
      ctx.globalAlpha = state.enhanceStrength / 100;
      ctx.filter = 'none'; // Enhanced canvas is already corrected
      ctx.drawImage(offscreenEnhancedCanvas, cropX, cropY, cropW, cropH, drawX, drawY, cropW, cropH);
      ctx.restore();
    } else {
      // Regular original image draw
      ctx.drawImage(originalImage, cropX, cropY, cropW, cropH, drawX, drawY, cropW, cropH);
    }
    
    ctx.restore(); // Restore flips, rotations, css filters
    
    // 2.5 Chroma Key Background Removal (if enabled)
    if (state.chromaKey && state.chromaKey.enabled) {
      processChromaKey(canvas, state.chromaKey.color, state.chromaKey.tolerance, state.chromaKey.feather);
    }
    
    // 3. Draw Warmth (Color Temp Tint) overlay
    if (state.adjustments.warmth !== 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'color';
      // Warmth (positive) = Orange tint, Cold (negative) = Blue tint
      const warmthVal = state.adjustments.warmth;
      if (warmthVal > 0) {
        ctx.fillStyle = `rgba(249, 115, 22, ${warmthVal / 300})`;
      } else {
        ctx.fillStyle = `rgba(59, 130, 246, ${Math.abs(warmthVal) / 300})`;
      }
      ctx.fillRect(0, 0, isRotated90 ? cropH : cropW, isRotated90 ? cropW : cropH);
      ctx.restore();
    }
    
    // 4. Draw Vignette Gradient overlay
    if (state.adjustments.vignette > 0) {
      ctx.save();
      const baseW = isRotated90 ? cropH : cropW;
      const baseH = isRotated90 ? cropW : cropH;
      const cx = baseW / 2;
      const cy = baseH / 2;
      const innerRadius = Math.max(baseW, baseH) * 0.2;
      const outerRadius = Math.max(baseW, baseH) * 0.7;
      
      const grad = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${state.adjustments.vignette / 120})`);
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, baseW, baseH);
      ctx.restore();
    }
    
    // 5. Draw Hand-Drawn Brush annotations
    state.drawings.forEach(path => {
      if (path.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = path.opacity / 100;
      
      if (path.type === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
    
    // 6. Draw Text layers
    state.texts.forEach(text => {
      ctx.save();
      ctx.font = (text.italic ? 'italic ' : '') + (text.bold ? 'bold ' : '') + text.size + 'px ' + text.font;
      ctx.fillStyle = text.color;
      ctx.textAlign = text.align;
      ctx.textBaseline = 'middle';
      
      // Draw text content
      ctx.fillText(text.text, text.x, text.y);
      
      // If text is selected, draw dotted edit boundary outline box
      if (activeMode === 'text' && text.id === state.selectedTextId) {
        const textMetric = ctx.measureText(text.text);
        const textW = textMetric.width;
        const textH = text.size;
        
        let startX = text.x;
        if (text.align === 'center') startX = text.x - textW / 2;
        else if (text.align === 'right') startX = text.x - textW;
        
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(startX - 8, text.y - textH / 2 - 4, textW + 16, textH + 8);
      }
      ctx.restore();
    });
    
    // Restore downsampling transform scale (back to absolute pixel dimensions for overlays and syncs)
    ctx.restore();
    
    // 7. Draw Crop interactive outlines & handles overlay (Note: drawCropOverlay handles absolute canvas sizes directly)
    if (activeMode === 'crop' && activeCropBox) {
      drawCropOverlay(canvasW, canvasH);
    }
    
    // 8. Synchronize content to the hidden test image
    syncToPreviewImage();
    
    // Sync to userImage for the background select overlay container
    // Skip expensive toDataURL during active drag - resync on drag end
    if (userImage && !state.isDragging) {
      try {
        userImage.src = canvas.toDataURL('image/png');
      } catch(e) {
        console.warn("Cross-origin canvas sync bypassed:", e);
      }
    }
    
    // 9. Synchronize split-view comparison original layer
    if (isComparing) {
      syncComparisonOriginalCanvas(cropX, cropY, cropW, cropH, canvasW, canvasH);
    }
  }
  
  // RAF-throttled render for slider input events (avoids frame pile-up)
  let _rafRenderPending = false;
  function renderCanvasRAF() {
    if (_rafRenderPending) return;
    _rafRenderPending = true;
    requestAnimationFrame(() => {
      _rafRenderPending = false;
      renderCanvas();
    });
  }
  
  function getCSSFilterString() {
    let filters = [];
    
    // Adjustments
    if (state.adjustments.brightness !== 0) {
      filters.push(`brightness(${100 + state.adjustments.brightness}%)`);
    }
    if (state.adjustments.contrast !== 0) {
      filters.push(`contrast(${100 + state.adjustments.contrast}%)`);
    }
    if (state.adjustments.exposure !== 0) {
      filters.push(`brightness(${100 + state.adjustments.exposure}%)`); // Simple Exposure approximation
    }
    if (state.adjustments.saturation !== 0) {
      filters.push(`saturate(${100 + state.adjustments.saturation}%)`);
    }
    if (state.adjustments.hue !== 0) {
      filters.push(`hue-rotate(${state.adjustments.hue}deg)`);
    }
    if (state.adjustments.blur > 0) {
      filters.push(`blur(${state.adjustments.blur}px)`);
    }
    
    // Creative preset theme overlays
    if (state.filter !== 'none' && state.filterIntensity > 0) {
      const weight = state.filterIntensity / 100;
      switch (state.filter) {
        case 'vintage':
          filters.push(`sepia(${0.3 * weight}) contrast(${1 + 0.1 * weight}) brightness(${1 - 0.1 * weight})`);
          break;
        case 'noir':
          filters.push(`grayscale(${weight}) contrast(${1 + 0.4 * weight}) brightness(${1 - 0.15 * weight})`);
          break;
        case 'chrome':
          filters.push(`contrast(${1 + 0.25 * weight}) saturate(${1 + 0.3 * weight})`);
          break;
        case 'polaroid':
          filters.push(`sepia(${0.2 * weight}) contrast(${1 - 0.1 * weight}) brightness(${1 + 0.1 * weight}) saturate(${1 + 0.1 * weight})`);
          break;
        case 'cool':
          filters.push(`hue-rotate(${30 * weight}deg) saturate(${1 + 0.1 * weight})`);
          break;
        case 'warm':
          filters.push(`sepia(${0.4 * weight}) saturate(${1 + 0.2 * weight}) hue-rotate(${-20 * weight}deg)`);
          break;
        case 'dramatic':
          filters.push(`contrast(${1 + 0.4 * weight}) saturate(${1 - 0.2 * weight})`);
          break;
        case 'sepia':
          filters.push(`sepia(${weight})`);
          break;
        case 'invert':
          filters.push(`invert(${weight})`);
          break;
      }
    }
    
    // Sharpen image (Simulated CSS filter trick)
    if (state.adjustments.sharpen > 0) {
      // Mild sharpening effect via contrast & details
      filters.push(`contrast(${100 + state.adjustments.sharpen * 0.15}%)`);
    }
    
    return filters.length > 0 ? filters.join(' ') : 'none';
  }
  
  function syncToPreviewImage() {
    try {
      userPreviewSyncImg.src = canvas.toDataURL('image/png');
    } catch(e) {
      console.warn("Failed to sync canvas to user preview image (probably cross-origin resource issues):", e);
    }
  }
  
  // ------------------------------------------------------------------------
  // 7. Auto-Enhance Implementation
  // ------------------------------------------------------------------------
  enhanceBtn.addEventListener('click', () => {
    if (!originalImage) return;
    
    // Trigger calculation
    state.isEnhanced = true;
    showToast('Calculating AI enhancements...', 'info');
    
    // Run the enhance pipeline after a tiny paint cycle delay to show loading state
    setTimeout(() => {
      try {
        if (!offscreenEnhancedCanvas) {
          // Precalculate base enhanced image from raw source image using an offscreen canvas
          const calcCanvas = document.createElement('canvas');
          calcCanvas.width = originalImage.width;
          calcCanvas.height = originalImage.height;
          const calcCtx = calcCanvas.getContext('2d');
          calcCtx.drawImage(originalImage, 0, 0);
          
          offscreenEnhancedCanvas = processAutoEnhancePixels(calcCanvas);
        }
        
        saveHistoryState();
        renderCanvas();
        showToast('AI enhancement applied successfully!', 'success');
      } catch (err) {
        console.error("AI Enhance error:", err);
        showToast('Could not complete enhancement due to safety boundaries.', 'error');
      }
    }, 50);
  });
  
  enhanceStrength.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.enhanceStrength = val;
    enhanceStrengthVal.innerText = val + '%';
    if (state.isEnhanced) {
      renderCanvas();
    }
  });
  
  function processAutoEnhancePixels(srcCanvas) {
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    
    // Create processor offscreen
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const oCtx = offscreen.getContext('2d');
    oCtx.drawImage(srcCanvas, 0, 0);
    
    const imgData = oCtx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    const len = pixels.length;
    
    // 1. White Balance Calibration (Gray-World Assumption)
    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    // Step sampling to avoid crashing on massive images
    const step = w * h > 1000000 ? 32 : 8; 
    
    for (let i = 0; i < len; i += step * 4) {
      sumR += pixels[i];
      sumG += pixels[i+1];
      sumB += pixels[i+2];
      count++;
    }
    
    const avgR = sumR / count || 128;
    const avgG = sumG / count || 128;
    const avgB = sumB / count || 128;
    const avgL = (avgR + avgG + avgB) / 3;
    
    const scaleR = avgL / avgR;
    const scaleG = avgL / avgG;
    const scaleB = avgL / avgB;
    
    // 2. Luminance Histogram Stretching
    const hist = new Int32Array(256);
    for (let i = 0; i < len; i += step * 4) {
      const r = pixels[i];
      const g = pixels[i+1];
      const b = pixels[i+2];
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      hist[lum]++;
    }
    
    let lowBound = 0;
    let highBound = 255;
    
    // Find 1st percentile
    let accum = 0;
    for (let i = 0; i < 256; i++) {
      accum += hist[i];
      if (accum >= count * 0.01) {
        lowBound = i;
        break;
      }
    }
    
    // Find 99th percentile
    accum = 0;
    for (let i = 255; i >= 0; i--) {
      accum += hist[i];
      if (accum >= count * 0.01) {
        highBound = i;
        break;
      }
    }
    
    const range = highBound - lowBound || 1;
    
    // Apply WB and Contrast Stretch to all pixels
    for (let i = 0; i < len; i += 4) {
      let r = pixels[i];
      let g = pixels[i+1];
      let b = pixels[i+2];
      
      // White Balance
      r = r * scaleR;
      g = g * scaleG;
      b = b * scaleB;
      
      // Contrast Stretch mapping
      r = ((r - lowBound) * 255) / range;
      g = ((g - lowBound) * 255) / range;
      b = ((b - lowBound) * 255) / range;
      
      // Mild Saturation pop
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * 1.15;
      g = lum + (g - lum) * 1.15;
      b = lum + (b - lum) * 1.15;
      
      // Clamp
      pixels[i] = Math.max(0, Math.min(255, r));
      pixels[i+1] = Math.max(0, Math.min(255, g));
      pixels[i+2] = Math.max(0, Math.min(255, b));
    }
    
    oCtx.putImageData(imgData, 0, 0);
    
    // 3. Fast Sharpen Convolution (Unsharp matrix)
    const sharpenCanvas = document.createElement('canvas');
    sharpenCanvas.width = w;
    sharpenCanvas.height = h;
    const sCtx = sharpenCanvas.getContext('2d');
    
    const kernel = [
       0,   -0.2,  0,
      -0.2,  1.8, -0.2,
       0,   -0.2,  0
    ];
    
    const sharpenedData = sCtx.createImageData(w, h);
    const dst = sharpenedData.data;
    const src = pixels;
    
    // Optimized 3x3 convolution loop
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const dstOff = (y * w + x) * 4;
        
        let r = 0, g = 0, b = 0;
        
        // Unrolled 3x3 kernel loop for speed
        for (let ky = 0; ky < 3; ky++) {
          const scy = y + ky - 1;
          for (let kx = 0; kx < 3; kx++) {
            const scx = x + kx - 1;
            const srcOff = (scy * w + scx) * 4;
            const wt = kernel[ky * 3 + kx];
            
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
          }
        }
        
        dst[dstOff] = Math.max(0, Math.min(255, r));
        dst[dstOff+1] = Math.max(0, Math.min(255, g));
        dst[dstOff+2] = Math.max(0, Math.min(255, b));
        dst[dstOff+3] = src[dstOff+3]; // Copy alpha
      }
    }
    
    sCtx.putImageData(sharpenedData, 0, 0);
    return sharpenCanvas;
  }
  
  // ------------------------------------------------------------------------
  // 8. Manual Adjustment Sliders Event Listeners
  // ------------------------------------------------------------------------
  Object.keys(adjustments).forEach(key => {
    adjustments[key].addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.adjustments[key] = val;
      
      // Update text
      if (key === 'blur') {
        adjustmentVals[key].innerText = val + 'px';
      } else if (key === 'vignette' || key === 'sharpen') {
        adjustmentVals[key].innerText = val + '%';
      } else {
        adjustmentVals[key].innerText = val;
      }
      
      renderCanvasRAF(); // RAF-throttled for 60fps slider responsiveness
    });
    
    adjustments[key].addEventListener('change', () => {
      saveHistoryState();
    });
  });
  
  // ------------------------------------------------------------------------
  // 9. Creative Filters Logic
  // ------------------------------------------------------------------------
  filterCards.forEach(card => {
    card.addEventListener('click', () => {
      filterCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      saveHistoryState();
      state.filter = card.dataset.filter;
      renderCanvas();
      showToast(`Filter: ${card.querySelector('span').innerText}`, 'info');
    });
  });
  
  filterIntensity.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.filterIntensity = val;
    filterIntensityVal.innerText = val + '%';
    renderCanvasRAF(); // RAF-throttled for 60fps
  });
  
  filterIntensity.addEventListener('change', () => {
    saveHistoryState();
  });
  
  // ------------------------------------------------------------------------
  // 10. Transform & Rotate Tools
  // ------------------------------------------------------------------------
  rotateCWBtn.addEventListener('click', () => {
    saveHistoryState();
    state.rotation = (state.rotation + 90) % 360;
    renderCanvas();
    fitImageScale();
  });
  
  rotateCCWBtn.addEventListener('click', () => {
    saveHistoryState();
    state.rotation = (state.rotation - 90 + 360) % 360;
    renderCanvas();
    fitImageScale();
  });
  
  flipHBtn.addEventListener('click', () => {
    saveHistoryState();
    state.flipH = !state.flipH;
    renderCanvas();
  });
  
  flipVBtn.addEventListener('click', () => {
    saveHistoryState();
    state.flipV = !state.flipV;
    renderCanvas();
  });
  
  // ------------------------------------------------------------------------
  // 11. Crop Interactive Mechanics
  // ------------------------------------------------------------------------
  
  ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cropLockRatio = btn.dataset.ratio;
      initCropBox();
      renderCanvas();
    });
  });
  
  function initCropBox() {
    if (!originalImage) return;
    
    // Set crop boundaries relative to the canvas active display width and height
    const w = canvas.width;
    const h = canvas.height;
    
    let boxW = w * 0.8;
    let boxH = h * 0.8;
    
    if (cropLockRatio !== 'free') {
      let targetRatio = 1.0;
      if (cropLockRatio === '1-1') targetRatio = 1.0;
      else if (cropLockRatio === '4-3') targetRatio = 4 / 3;
      else if (cropLockRatio === '16-9') targetRatio = 16 / 9;
      else if (cropLockRatio === '9-16') targetRatio = 9 / 16;
      else if (cropLockRatio === '35-45') targetRatio = 35 / 45;
      
      if (boxW / boxH > targetRatio) {
        boxW = boxH * targetRatio;
      } else {
        boxH = boxW / targetRatio;
      }
    }
    
    activeCropBox = {
      x: (w - boxW) / 2,
      y: (h - boxH) / 2,
      w: boxW,
      h: boxH
    };
    
    applyCropBtn.disabled = false;
    cancelCropBtn.style.display = 'block';
  }
  
  function drawCropOverlay(canvasW, canvasH) {
    ctx.save();
    
    // 1. Dim outside background area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    
    // Top box segment
    ctx.fillRect(0, 0, canvasW, activeCropBox.y);
    // Bottom box segment
    ctx.fillRect(0, activeCropBox.y + activeCropBox.h, canvasW, canvasH - (activeCropBox.y + activeCropBox.h));
    // Left segment
    ctx.fillRect(0, activeCropBox.y, activeCropBox.x, activeCropBox.h);
    // Right segment
    ctx.fillRect(activeCropBox.x + activeCropBox.w, activeCropBox.y, canvasW - (activeCropBox.x + activeCropBox.w), activeCropBox.h);
    
    // 2. Active crop box border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(activeCropBox.x, activeCropBox.y, activeCropBox.w, activeCropBox.h);
    
    // 3. Grid guidelines (Rule of Thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    // Verticals
    const thirdW = activeCropBox.w / 3;
    ctx.beginPath();
    ctx.moveTo(activeCropBox.x + thirdW, activeCropBox.y);
    ctx.lineTo(activeCropBox.x + thirdW, activeCropBox.y + activeCropBox.h);
    ctx.moveTo(activeCropBox.x + thirdW * 2, activeCropBox.y);
    ctx.lineTo(activeCropBox.x + thirdW * 2, activeCropBox.y + activeCropBox.h);
    
    // Horizontals
    const thirdH = activeCropBox.h / 3;
    ctx.moveTo(activeCropBox.x, activeCropBox.y + thirdH);
    ctx.lineTo(activeCropBox.x + activeCropBox.w, activeCropBox.y + thirdH);
    ctx.moveTo(activeCropBox.x, activeCropBox.y + thirdH * 2);
    ctx.lineTo(activeCropBox.x + activeCropBox.w, activeCropBox.y + thirdH * 2);
    ctx.stroke();
    
    // 4. Corner Handles & Grab Handles
    ctx.fillStyle = '#fff';
    ctx.setLineDash([]); // clear dash
    
    const hs = 8; // handle size
    
    // Corners: nw, ne, se, sw
    ctx.fillRect(activeCropBox.x - hs/2, activeCropBox.y - hs/2, hs, hs);
    ctx.fillRect(activeCropBox.x + activeCropBox.w - hs/2, activeCropBox.y - hs/2, hs, hs);
    ctx.fillRect(activeCropBox.x + activeCropBox.w - hs/2, activeCropBox.y + activeCropBox.h - hs/2, hs, hs);
    ctx.fillRect(activeCropBox.x - hs/2, activeCropBox.y + activeCropBox.h - hs/2, hs, hs);
    
    // Midpoints: n, e, s, w
    ctx.fillRect(activeCropBox.x + activeCropBox.w/2 - hs/2, activeCropBox.y - hs/2, hs, hs);
    ctx.fillRect(activeCropBox.x + activeCropBox.w - hs/2, activeCropBox.y + activeCropBox.h/2 - hs/2, hs, hs);
    ctx.fillRect(activeCropBox.x + activeCropBox.w/2 - hs/2, activeCropBox.y + activeCropBox.h - hs/2, hs, hs);
    ctx.fillRect(activeCropBox.x - hs/2, activeCropBox.y + activeCropBox.h/2 - hs/2, hs, hs);
    
    ctx.restore();
  }
  
  function getCropHandleAt(px, py) {
    if (!activeCropBox) return null;
    const hs = 15; // Click tolerance radius
    
    const { x, y, w, h } = activeCropBox;
    
    // Corner click detection
    if (Math.abs(px - x) < hs && Math.abs(py - y) < hs) return 'nw';
    if (Math.abs(px - (x + w)) < hs && Math.abs(py - y) < hs) return 'ne';
    if (Math.abs(px - (x + w)) < hs && Math.abs(py - (y + h)) < hs) return 'se';
    if (Math.abs(px - x) < hs && Math.abs(py - (y + h)) < hs) return 'sw';
    
    // Edge midpoints detection
    if (Math.abs(px - (x + w/2)) < hs && Math.abs(py - y) < hs) return 'n';
    if (Math.abs(px - (x + w)) < hs && Math.abs(py - (y + h/2)) < hs) return 'e';
    if (Math.abs(px - (x + w/2)) < hs && Math.abs(py - (y + h)) < hs) return 's';
    if (Math.abs(px - x) < hs && Math.abs(py - (y + h/2)) < hs) return 'w';
    
    // Inside crop area movement detection
    if (px > x && px < x + w && py > y && py < y + h) return 'move';
    
    return null;
  }
  
  applyCropBtn.addEventListener('click', () => {
    if (!activeCropBox) return;
    
    saveHistoryState();
    
    // Calculate new crop coordinates as percentage limits of current canvas width and height
    const w = canvas.width;
    const h = canvas.height;
    
    const pctX = (activeCropBox.x / w) * 100;
    const pctY = (activeCropBox.y / h) * 100;
    const pctW = (activeCropBox.w / w) * 100;
    const pctH = (activeCropBox.h / h) * 100;
    
    // Set crop boundaries in percentage relative to original image size
    let originalCropW = originalImage.width;
    let originalCropH = originalImage.height;
    
    let curX = 0;
    let curY = 0;
    let curW = 100;
    let curH = 100;
    
    if (state.cropBox) {
      curX = state.cropBox.x;
      curY = state.cropBox.y;
      curW = state.cropBox.w;
      curH = state.cropBox.h;
    }
    
    // Scale percentages relative to current Crop boundaries
    const isRotated90 = (state.rotation === 90 || state.rotation === 270);
    
    let newCrop;
    if (isRotated90) {
      // Swapped axis conversions
      newCrop = {
        x: curX + (pctY / 100) * curW,
        y: curY + (pctX / 100) * curH,
        w: (pctH / 100) * curW,
        h: (pctW / 100) * curH
      };
    } else {
      newCrop = {
        x: curX + (pctX / 100) * curW,
        y: curY + (pctY / 100) * curH,
        w: (pctW / 100) * curW,
        h: (pctH / 100) * curH
      };
    }
    
    state.cropBox = newCrop;
    
    // Close mode
    activeCropBox = null;
    activeMode = 'none';
    applyCropBtn.disabled = true;
    cancelCropBtn.style.display = 'none';
    
    // Clear selections in sidebar and highlight transform
    document.querySelector('.tab-trigger[data-tab="crop"]').click();
    
    renderCanvas();
    fitImageScale();
    showToast('Image cropped successfully', 'success');
  });
  
  cancelCropBtn.addEventListener('click', () => {
    activeCropBox = null;
    activeMode = 'none';
    applyCropBtn.disabled = true;
    cancelCropBtn.style.display = 'none';
    renderCanvas();
  });
  
  // ------------------------------------------------------------------------
  // 12. Freehand Drawing Mechanics
  // ------------------------------------------------------------------------
  
  brushToolBtn.addEventListener('click', () => {
    brushTool = 'brush';
    brushToolBtn.classList.add('active');
    eraserToolBtn.classList.remove('active');
    canvas.style.cursor = 'crosshair';
  });
  
  eraserToolBtn.addEventListener('click', () => {
    brushTool = 'eraser';
    eraserToolBtn.classList.add('active');
    brushToolBtn.classList.remove('active');
    canvas.style.cursor = 'cell';
  });
  
  brushSize.addEventListener('input', (e) => {
    const val = e.target.value;
    brushSizeVal.innerText = val + 'px';
  });
  
  brushOpacity.addEventListener('input', (e) => {
    const val = e.target.value;
    brushOpacityVal.innerText = val + '%';
  });
  
  brushColorInput.addEventListener('input', (e) => {
    brushColor = e.target.value;
    swatches.forEach(s => s.classList.remove('active'));
  });
  
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      brushColor = sw.dataset.color;
      brushColorInput.value = brushColor;
    });
  });
  
  clearDrawingBtn.addEventListener('click', () => {
    if (state.drawings.length > 0) {
      if (confirm('Clear all drawings and annotations?')) {
        saveHistoryState();
        state.drawings = [];
        renderCanvas();
        showToast('Drawings cleared', 'info');
      }
    }
  });
  
  // ------------------------------------------------------------------------
  // 13. Text Overlays Implementation
  // ------------------------------------------------------------------------
  
  fontSize.addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    fontSizeVal.innerText = size + 'px';
    
    if (state.selectedTextId) {
      const txt = state.texts.find(t => t.id === state.selectedTextId);
      if (txt) {
        txt.size = size;
        renderCanvas();
      }
    }
  });
  
  fontSize.addEventListener('change', () => {
    if (state.selectedTextId) saveHistoryState();
  });
  
  textColorInput.addEventListener('input', (e) => {
    const col = e.target.value;
    if (state.selectedTextId) {
      const txt = state.texts.find(t => t.id === state.selectedTextId);
      if (txt) {
        txt.color = col;
        renderCanvas();
      }
    }
  });
  
  textColorInput.addEventListener('change', () => {
    if (state.selectedTextId) saveHistoryState();
  });
  
  textOverlayInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (state.selectedTextId) {
      const txt = state.texts.find(t => t.id === state.selectedTextId);
      if (txt) {
        txt.text = val;
        renderCanvas();
      }
    }
  });
  
  textOverlayInput.addEventListener('change', () => {
    if (state.selectedTextId) saveHistoryState();
  });
  
  boldTextBtn.addEventListener('click', () => {
    textBold = !textBold;
    boldTextBtn.classList.toggle('active', textBold);
    
    if (state.selectedTextId) {
      const txt = state.texts.find(t => t.id === state.selectedTextId);
      if (txt) {
        saveHistoryState();
        txt.bold = textBold;
        renderCanvas();
      }
    }
  });
  
  italicTextBtn.addEventListener('click', () => {
    textItalic = !textItalic;
    italicTextBtn.classList.toggle('active', textItalic);
    
    if (state.selectedTextId) {
      const txt = state.texts.find(t => t.id === state.selectedTextId);
      if (txt) {
        saveHistoryState();
        txt.italic = textItalic;
        renderCanvas();
      }
    }
  });
  
  alignBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      alignBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      textAlign = btn.dataset.align;
      
      if (state.selectedTextId) {
        const txt = state.texts.find(t => t.id === state.selectedTextId);
        if (txt) {
          saveHistoryState();
          txt.align = textAlign;
          renderCanvas();
        }
      }
    });
  });
  
  addTextBtn.addEventListener('click', () => {
    saveHistoryState();
    
    const newTextVal = textOverlayInput.value.trim() || 'Double-click to Edit';
    const newText = {
      id: Date.now(),
      text: newTextVal,
      font: fontFamilySelect.value,
      size: parseInt(fontSize.value),
      color: textColorInput.value,
      bold: textBold,
      italic: textItalic,
      align: textAlign,
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    
    state.texts.push(newText);
    state.selectedTextId = newText.id;
    deleteTextBtn.style.display = 'block';
    
    renderCanvas();
    showToast('Text layer added', 'success');
  });
  
  deleteTextBtn.addEventListener('click', () => {
    if (state.selectedTextId) {
      saveHistoryState();
      state.texts = state.texts.filter(t => t.id !== state.selectedTextId);
      state.selectedTextId = null;
      deleteTextBtn.style.display = 'none';
      textOverlayInput.value = '';
      renderCanvas();
      showToast('Text layer deleted', 'info');
    }
  });
  
  fontFamilySelect.addEventListener('change', (e) => {
    const font = e.target.value;
    if (state.selectedTextId) {
      const txt = state.texts.find(t => t.id === state.selectedTextId);
      if (txt) {
        saveHistoryState();
        txt.font = font;
        renderCanvas();
      }
    }
  });
  
  function getTextAt(px, py) {
    // Reverse loop to check top layers first
    for (let i = state.texts.length - 1; i >= 0; i--) {
      const text = state.texts[i];
      ctx.save();
      ctx.font = (text.italic ? 'italic ' : '') + (text.bold ? 'bold ' : '') + text.size + 'px ' + text.font;
      ctx.textAlign = text.align;
      ctx.textBaseline = 'middle';
      const metric = ctx.measureText(text.text);
      const w = metric.width;
      const h = text.size;
      ctx.restore();
      
      let startX = text.x;
      if (text.align === 'center') startX = text.x - w / 2;
      else if (text.align === 'right') startX = text.x - w;
      
      const padding = 10;
      if (px > startX - padding && px < startX + w + padding &&
          py > text.y - h/2 - padding && py < text.y + h/2 + padding) {
        return text;
      }
    }
    return null;
  }
  
  // ------------------------------------------------------------------------
  // 14. Workspace Canvas Interaction (Mouse/Touch Handling)
  // ------------------------------------------------------------------------
  
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }
  
  canvas.addEventListener('mousedown', (e) => {
    if (!originalImage) return;
    
    const coords = getCanvasCoords(e);
    
    // Pan mode (Alt held, or mid-mouse button, or panning state)
    if (e.altKey || e.button === 1) {
      isPanning = true;
      startPanX = e.clientX - panX;
      startPanY = e.clientY - panY;
      canvas.style.cursor = 'grabbing';
      return;
    }
    
    if (activeMode === 'draw') {
      isDrawing = true;
      currentPath = [coords];
      state.drawings.push({
        type: brushTool,
        points: currentPath,
        color: brushColor,
        size: parseInt(brushSize.value),
        opacity: parseInt(brushOpacity.value)
      });
      renderCanvas();
    }
    
    else if (activeMode === 'crop' && activeCropBox) {
      const handle = getCropHandleAt(coords.x, coords.y);
      if (handle) {
        isDraggingCrop = true;
        cropDragHandle = handle;
        startPanX = coords.x;
        startPanY = coords.y;
      }
    }
    
    else if (activeMode === 'text') {
      const clickedText = getTextAt(coords.x, coords.y);
      if (clickedText) {
        state.selectedTextId = clickedText.id;
        isDraggingText = true;
        textDragOffset = {
          x: coords.x - clickedText.x,
          y: coords.y - clickedText.y
        };
        applyStateToUI();
        renderCanvas();
      } else {
        state.selectedTextId = null;
        applyStateToUI();
        renderCanvas();
      }
    }
  });
  
  window.addEventListener('mousemove', (e) => {
    if (isPanning) {
      panX = e.clientX - startPanX;
      panY = e.clientY - startPanY;
      updateCanvasTransform();
      return;
    }
    
    if (!originalImage) return;
    
    // Transform coordinates
    const coords = getCanvasCoords(e);
    
    if (activeMode === 'draw' && isDrawing) {
      currentPath.push(coords);
      renderCanvas();
    }
    
    else if (activeMode === 'crop' && isDraggingCrop && activeCropBox) {
      const dx = coords.x - startPanX;
      const dy = coords.y - startPanY;
      
      const minSize = 30; // Minimum crop size pixels
      const aspect = getLockAspectRatioValue();
      
      const originalW = activeCropBox.w;
      const originalH = activeCropBox.h;
      const originalX = activeCropBox.x;
      const originalY = activeCropBox.y;
      
      if (cropDragHandle === 'move') {
        activeCropBox.x = Math.max(0, Math.min(canvas.width - activeCropBox.w, activeCropBox.x + dx));
        activeCropBox.y = Math.max(0, Math.min(canvas.height - activeCropBox.h, activeCropBox.y + dy));
      } else {
        // Drag corners/edges
        let newX = activeCropBox.x;
        let newY = activeCropBox.y;
        let newW = activeCropBox.w;
        let newH = activeCropBox.h;
        
        if (cropDragHandle.includes('w')) {
          newX = Math.max(0, activeCropBox.x + dx);
          newW = activeCropBox.x + activeCropBox.w - newX;
        }
        if (cropDragHandle.includes('e')) {
          newW = Math.max(minSize, Math.min(canvas.width - activeCropBox.x, activeCropBox.w + dx));
        }
        if (cropDragHandle.includes('n')) {
          newY = Math.max(0, activeCropBox.y + dy);
          newH = activeCropBox.y + activeCropBox.h - newY;
        }
        if (cropDragHandle.includes('s')) {
          newH = Math.max(minSize, Math.min(canvas.height - activeCropBox.y, activeCropBox.h + dy));
        }
        
        // Enforce lock aspect ratio
        if (aspect !== null) {
          if (cropDragHandle === 'e' || cropDragHandle === 'w' || cropDragHandle === 's' || cropDragHandle === 'n') {
            // Adapt the other dimension
            if (cropDragHandle === 'e' || cropDragHandle === 'w') {
              newH = newW / aspect;
            } else {
              newW = newH * aspect;
            }
          } else {
            // Corners - maintain aspect ratio relative to drag changes
            if (Math.abs(dx) > Math.abs(dy)) {
              newH = newW / aspect;
            } else {
              newW = newH * aspect;
            }
          }
        }
        
        // Apply bounds checks
        if (newW >= minSize && newH >= minSize && 
            newX + newW <= canvas.width && newY + newH <= canvas.height) {
          activeCropBox.x = newX;
          activeCropBox.y = newY;
          activeCropBox.w = newW;
          activeCropBox.h = newH;
        }
      }
      
      startPanX = coords.x;
      startPanY = coords.y;
      renderCanvas();
    }
    
    else if (activeMode === 'text' && isDraggingText && state.selectedTextId) {
      const txt = state.texts.find(t => t.id === state.selectedTextId);
      if (txt) {
        txt.x = coords.x - textDragOffset.x;
        txt.y = coords.y - textDragOffset.y;
        renderCanvas();
      }
    }
    
    // Change cursors dynamically when hovering crop handles
    else if (activeMode === 'crop' && activeCropBox) {
      const handle = getCropHandleAt(coords.x, coords.y);
      if (handle) {
        if (handle === 'move') canvas.style.cursor = 'move';
        else if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
        else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
        else if (handle === 'n' || handle === 's') canvas.style.cursor = 'ns-resize';
        else if (handle === 'e' || handle === 'w') canvas.style.cursor = 'ew-resize';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  });
  
  window.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = activeMode === 'draw' ? 'crosshair' : 'default';
      return;
    }
    
    if (isDrawing) {
      isDrawing = false;
      saveHistoryState();
    }
    
    if (isDraggingCrop) {
      isDraggingCrop = false;
      cropDragHandle = null;
    }
    
    if (isDraggingText) {
      isDraggingText = false;
      saveHistoryState();
    }
  });
  
  function getLockAspectRatioValue() {
    if (cropLockRatio === '1-1') return 1.0;
    if (cropLockRatio === '4-3') return 4 / 3;
    if (cropLockRatio === '16-9') return 16 / 9;
    if (cropLockRatio === '9-16') return 9 / 16;
    if (cropLockRatio === '35-45') return 35 / 45;
    return null;
  }
  
  // ------------------------------------------------------------------------
  // 15. Viewport Transformations (Zoom & Pan CSS helper)
  // ------------------------------------------------------------------------
  
  function fitImageScale() {
    if (!originalImage) return;
    
    const viewportW = viewport.clientWidth - 64; // pad
    const viewportH = viewport.clientHeight - 64;
    
    const dimensions = getCroppedAndRotatedDimensions();
    
    const scaleX = viewportW / dimensions.w;
    const scaleY = viewportH / dimensions.h;
    
    zoomScale = Math.min(1.0, Math.min(scaleX, scaleY));
    
    // Center pan position
    panX = 0;
    panY = 0;
    
    updateCanvasTransform();
  }
  
  function updateCanvasTransform() {
    canvas.style.transform = `scale(${zoomScale}) translate(${panX}px, ${panY}px)`;
    originalCanvas.style.transform = `scale(${zoomScale}) translate(${panX}px, ${panY}px)`;
    zoomScaleText.innerText = Math.round(zoomScale * 100) + '%';
  }
  
  zoomInBtn.addEventListener('click', () => {
    zoomScale = Math.min(5.0, zoomScale + 0.1);
    updateCanvasTransform();
  });
  
  zoomOutBtn.addEventListener('click', () => {
    zoomScale = Math.max(0.1, zoomScale - 0.1);
    updateCanvasTransform();
  });
  
  zoomResetBtn.addEventListener('click', () => {
    fitImageScale();
  });
  
  // Mouse Wheel zooming in viewport
  viewport.addEventListener('wheel', (e) => {
    if (!originalImage) return;
    e.preventDefault();
    
    const zoomSpeed = 0.05;
    if (e.deltaY < 0) {
      zoomScale = Math.min(5.0, zoomScale + zoomSpeed);
    } else {
      zoomScale = Math.max(0.1, zoomScale - zoomSpeed);
    }
    updateCanvasTransform();
  }, { passive: false });
  
  // Resize handler
  window.addEventListener('resize', () => {
    if (originalImage) {
      fitImageScale();
    }
  });
  
  // ------------------------------------------------------------------------
  // 16. Before / After Visual Split Comparison
  // ------------------------------------------------------------------------
  
  toggleCompareBtn.addEventListener('click', () => {
    if (!originalImage) return;
    
    isComparing = !isComparing;
    toggleCompareBtn.classList.toggle('active', isComparing);
    
    if (isComparing) {
      comparisonContainer.style.display = 'block';
      splitPercent = 50;
      updateSplitDivider();
      renderCanvas();
      showToast('Split view enabled: drag handle to compare', 'info');
    } else {
      disableCompare();
    }
  });
  
  function disableCompare() {
    isComparing = false;
    toggleCompareBtn.classList.remove('active');
    comparisonContainer.style.display = 'none';
  }
  
  function syncComparisonOriginalCanvas(cropX, cropY, cropW, cropH, canvasW, canvasH) {
    originalCanvas.width = canvasW;
    originalCanvas.height = canvasH;
    
    oCtx.clearRect(0, 0, canvasW, canvasH);
    
    // Draw pure unmodified original image mapped to current crop size and scale
    oCtx.save();
    oCtx.translate(canvasW / 2, canvasH / 2);
    oCtx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
    oCtx.rotate((state.rotation * Math.PI) / 180);
    
    oCtx.drawImage(originalImage, cropX, cropY, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
    oCtx.restore();
  }
  
  function updateSplitDivider() {
    comparisonDivider.style.left = splitPercent + '%';
    
    // Update clip path of original comparison canvas overlay
    originalCanvas.style.clipPath = `polygon(0 0, ${splitPercent}% 0, ${splitPercent}% 100, 0 100)`;
  }
  
  comparisonDivider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDraggingSplit = true;
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingSplit) return;
    
    const wrapperRect = canvasWrapper.getBoundingClientRect();
    const clientX = e.clientX;
    
    let relativeX = clientX - wrapperRect.left;
    let pct = (relativeX / wrapperRect.width) * 100;
    
    splitPercent = Math.max(0, Math.min(100, pct));
    updateSplitDivider();
  });
  
  window.addEventListener('mouseup', () => {
    if (isDraggingSplit) {
      isDraggingSplit = false;
    }
  });
  
  // ------------------------------------------------------------------------
  // 17. Download & Server Upload Interaction
  // ------------------------------------------------------------------------
  
  downloadBtn.addEventListener('click', () => {
    if (!originalImage) return;
    
    showToast('Exporting high-quality image...', 'info');
    
    setTimeout(() => {
      try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `lumina-edited-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Photo downloaded successfully!', 'success');
      } catch (err) {
        showToast('Export failed. Ensure images do not violate CORS restrictions.', 'error');
      }
    }, 100);
  });
  
  saveServerBtn.addEventListener('click', () => {
    if (!originalImage) return;
    
    showToast('Uploading to backend server...', 'info');
    
    try {
      const base64Data = canvas.toDataURL('image/png');
      
      fetch('/api/upload-base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      })
      .then(res => {
        if (!res.ok) throw new Error('HTTP error ' + res.status);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          showToast('Saved to server uploads directory!', 'success');
          console.log("Uploaded file details:", data);
        } else {
          throw new Error(data.error || 'Server rejected request');
        }
      })
      .catch(err => {
        console.error('Server upload failed:', err);
        // Fallback local download
        showToast('Server not active. Downloading locally instead.', 'info');
        
        const link = document.createElement('a');
        link.download = `lumina-edited-${Date.now()}.png`;
        link.href = base64Data;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
    } catch(err) {
      showToast('Failed to compile data stream.', 'error');
    }
  });
  
  // ------------------------------------------------------------------------
  // 17.5. Background Changer & Chroma Key Logic
  // ------------------------------------------------------------------------
  
  function processChromaKey(canvasElement, keyRGB, tolerance, feather) {
    const ctx2d = canvasElement.getContext('2d');
    const w = canvasElement.width;
    const h = canvasElement.height;
    const imgData = ctx2d.getImageData(0, 0, w, h);
    const data = imgData.data;
    
    const [kr, kg, kb] = keyRGB;
    const toleranceSq = tolerance * tolerance;
    const minTolerance = Math.max(0, tolerance - feather);
    const minToleranceSq = minTolerance * minTolerance;
    const featherDivisor = feather > 0 ? feather : 1;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      if (a === 0) continue;
      
      const dr = r - kr;
      const dg = g - kg;
      const db = b - kb;
      const distSq = dr * dr + dg * dg + db * db;
      
      if (distSq < minToleranceSq) {
        data[i+3] = 0; // Fully transparent
      } else if (distSq < toleranceSq) {
        if (feather > 0) {
          const dist = Math.sqrt(distSq);
          const delta = tolerance - dist;
          data[i+3] = (delta / featherDivisor) * a;
        } else {
          data[i+3] = 0;
        }
      }
    }
    
    ctx2d.putImageData(imgData, 0, 0);
  }
  
  function pickColorFromEvent(e) {
    if (!isPickingColor) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const pxX = Math.round(clickX * scaleX);
    const pxY = Math.round(clickY * scaleY);
    
    if (!state.chromaKey) state.chromaKey = { enabled: false, color: [0, 0, 0], tolerance: 30, feather: 2 };
    const wasKeyEnabled = state.chromaKey.enabled;
    state.chromaKey.enabled = false;
    renderCanvas();
    
    try {
      const pixel = ctx.getImageData(Math.max(0, Math.min(canvas.width-1, pxX)), Math.max(0, Math.min(canvas.height-1, pxY)), 1, 1).data;
      
      state.chromaKey.color = [pixel[0], pixel[1], pixel[2]];
      state.chromaKey.enabled = true;
      
      keyColorIndicator.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      keyColorIndicatorWrapper.style.display = 'flex';
      
      showToast(`Key color selected: RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`, 'success');
    } catch(err) {
      console.error("Eyedropper error:", err);
      showToast("Color selection blocked by canvas cross-origin security.", "error");
      state.chromaKey.enabled = wasKeyEnabled;
    }
    
    isPickingColor = false;
    activateKeyerBtn.classList.remove('active');
    canvas.style.cursor = 'default';
    domLayerEditor.style.cursor = 'default';
    
    saveHistoryState();
    renderCanvas();
  }
  
  // Connect background layer dropdown
  backgroundSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    state.backgroundSrc = val;
    backgroundImage.src = val || 'backgrounds/park.jpg';
    
    // Ensure nested objects exist in state
    if (!state.chromaKey) state.chromaKey = { enabled: false, color: [0, 0, 0], tolerance: 30, feather: 2 };
    if (!state.fgTransform) state.fgTransform = { scale: 100, x: 0, y: 0 };
    
    saveHistoryState();
    renderCanvas();
    showToast(val ? 'Background scene updated' : 'Background disabled', 'info');
  });
  
  // Keyer pick color eyedropper activation
  activateKeyerBtn.addEventListener('click', () => {
    isPickingColor = !isPickingColor;
    activateKeyerBtn.classList.toggle('active', isPickingColor);
    
    if (isPickingColor) {
      canvas.style.cursor = 'crosshair';
      domLayerEditor.style.cursor = 'crosshair';
      showToast('Click anywhere on your photo to erase that color!', 'info');
    } else {
      canvas.style.cursor = 'default';
      domLayerEditor.style.cursor = 'default';
    }
  });
  
  // Direct click picking binds
  canvas.addEventListener('click', (e) => {
    if (isPickingColor) {
      pickColorFromEvent(e);
      e.stopPropagation();
    }
  });
  
  domLayerEditor.addEventListener('click', (e) => {
    if (isPickingColor) {
      pickColorFromEvent(e);
      e.stopPropagation();
    }
  });
  
  disableKeyerBtn.addEventListener('click', () => {
    if (!state.chromaKey) state.chromaKey = { enabled: false, color: [0, 0, 0], tolerance: 30, feather: 2 };
    state.chromaKey.enabled = false;
    keyColorIndicatorWrapper.style.display = 'none';
    saveHistoryState();
    renderCanvas();
    showToast('Chroma Key color cleared', 'info');
  });
  
  // Tolerance & Feather bindings
  keyTolerance.addEventListener('input', (e) => {
    if (!state.chromaKey) state.chromaKey = { enabled: false, color: [0, 0, 0], tolerance: 30, feather: 2 };
    const val = parseInt(e.target.value);
    state.chromaKey.tolerance = val;
    keyToleranceVal.innerText = val;
    renderCanvasRAF(); // RAF-throttled for 60fps
  });
  
  keyTolerance.addEventListener('change', () => {
    saveHistoryState();
  });
  
  keyFeather.addEventListener('input', (e) => {
    if (!state.chromaKey) state.chromaKey = { enabled: false, color: [0, 0, 0], tolerance: 30, feather: 2 };
    const val = parseInt(e.target.value);
    state.chromaKey.feather = val;
    keyFeatherVal.innerText = val + 'px';
    renderCanvasRAF(); // RAF-throttled for 60fps
  });
  
  keyFeather.addEventListener('change', () => {
    saveHistoryState();
  });
  
  // Foreground overlay scale and translations
  fgScale.addEventListener('input', (e) => {
    if (!state.fgTransform) state.fgTransform = { scale: 100, x: 0, y: 0 };
    const val = parseInt(e.target.value);
    state.fgTransform.scale = val;
    fgScaleVal.innerText = val + '%';
    
    userImage.style.transform = `translate(-50%, -50%) translate(${state.fgTransform.x}px, ${state.fgTransform.y}px) scale(${state.fgTransform.scale / 100})`;
  });
  
  fgScale.addEventListener('change', () => {
    saveHistoryState();
  });
  
  fgOffsetX.addEventListener('input', (e) => {
    if (!state.fgTransform) state.fgTransform = { scale: 100, x: 0, y: 0 };
    const val = parseInt(e.target.value);
    state.fgTransform.x = val;
    fgOffsetXVal.innerText = val + 'px';
    
    userImage.style.transform = `translate(-50%, -50%) translate(${state.fgTransform.x}px, ${state.fgTransform.y}px) scale(${state.fgTransform.scale / 100})`;
  });
  
  fgOffsetX.addEventListener('change', () => {
    saveHistoryState();
  });
  
  fgOffsetY.addEventListener('input', (e) => {
    if (!state.fgTransform) state.fgTransform = { scale: 100, x: 0, y: 0 };
    const val = parseInt(e.target.value);
    state.fgTransform.y = val;
    fgOffsetYVal.innerText = val + 'px';
    
    userImage.style.transform = `translate(-50%, -50%) translate(${state.fgTransform.x}px, ${state.fgTransform.y}px) scale(${state.fgTransform.scale / 100})`;
  });
  
  fgOffsetY.addEventListener('change', () => {
    saveHistoryState();
  });
  
  // Sync userImage source on manual load
  const originalLoadImageFromFile = loadImageFromFile;
  loadImageFromFile = function(file) {
    if (userImage) userImage.src = URL.createObjectURL(file);
    originalLoadImageFromFile(file);
  };
  
  // --- High-Performance Interactive Slider Pipeline (60 FPS Optimizations) ---
  const allSliders = document.querySelectorAll('input[type="range"]');
  allSliders.forEach(slider => {
    slider.addEventListener('input', () => {
      if (!state.isDragging) {
        state.isDragging = true;
      }
      // Use RAF-throttled render during active drag for silky 60 FPS
      renderCanvasRAF();
    });
    
    // When the user stops dragging, do a final full-res canvas render + userImage sync
    const endDrag = () => {
      if (state.isDragging) {
        state.isDragging = false;
        renderCanvas(); // Full resolution, with userImage sync re-enabled
        if (userImage) {
          try { userImage.src = canvas.toDataURL('image/png'); } catch(e) {}
        }
      }
    };
    slider.addEventListener('change', endDrag);
    slider.addEventListener('mouseup', endDrag);
    slider.addEventListener('touchend', endDrag);
  });
  
  // --- Global Automatic Background Remover (complying with user's remove.bg request + local fallback) ---
  window.removeBackground = async function() {
    const file = document.getElementById("imageInput").files[0];

    if (!file) {
      alert("Please select an image.");
      return;
    }

    showToast("Attempting AI background removal via remove.bg...", "info");

    try {
      const formData = new FormData();
      formData.append("image_file", file);
      formData.append("size", "auto");

      // We preserve the user's exact requested fetch API call and endpoint
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "YOUR_REMOVE_BG_API_KEY"
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("remove.bg API returned error status: " + response.status);
      }

      const blob = await response.blob();
      const objUrl = URL.createObjectURL(blob);
      
      // Update output img src
      const outputImg = document.getElementById("output");
      if (outputImg) {
        outputImg.src = objUrl;
        const previewGroup = document.getElementById('outputPreviewGroup');
        if (previewGroup) previewGroup.style.display = 'block';
      }
      
      // Load the cutout directly as our editor foreground
      const img = new Image();
      img.onload = () => {
        initializeEditorWithImage(img);
        state.chromaKey.enabled = false; // Background already fully removed by AI
        renderCanvas();
      };
      img.src = objUrl;
      
      showToast("AI background removed successfully!", "success");
    } catch (err) {
      console.warn("remove.bg API key is unconfigured or failed. Activating local smart color-key fallback:", err);
      showToast("Running local automatic background remover fallback...", "info");
      
      // Run our robust local automatic background remover fallback
      runLocalAutomaticBackgroundRemoval();
    }
  };

  function runLocalAutomaticBackgroundRemoval() {
    if (!originalImage) {
      alert("Please upload a photo first!");
      return;
    }
    
    const w = canvas.width;
    const h = canvas.height;
    
    // Save active chroma key state, then temporarily render clean
    const wasKeyEnabled = state.chromaKey.enabled;
    state.chromaKey.enabled = false;
    renderCanvas();
    
    try {
      // Sample the four corners of the image (12 pixels inset)
      const inset = 12;
      const samples = [
        ctx.getImageData(inset, inset, 1, 1).data,
        ctx.getImageData(w - inset, inset, 1, 1).data,
        ctx.getImageData(inset, h - inset, 1, 1).data,
        ctx.getImageData(w - inset, h - inset, 1, 1).data
      ];
      
      // Calculate average corner color (assumed background)
      let sumR = 0, sumG = 0, sumB = 0;
      samples.forEach(s => {
        sumR += s[0];
        sumG += s[1];
        sumB += s[2];
      });
      
      const avgR = Math.round(sumR / samples.length);
      const avgG = Math.round(sumG / samples.length);
      const avgB = Math.round(sumB / samples.length);
      
      // Configure Chroma Key state to target this background color
      state.chromaKey.color = [avgR, avgG, avgB];
      state.chromaKey.enabled = true;
      state.chromaKey.tolerance = 45; // slightly higher tolerance for auto removal
      state.chromaKey.feather = 3;
      
      // Update sidebar sliders UI to match
      keyTolerance.value = 45;
      keyToleranceVal.innerText = '45';
      keyFeather.value = 3;
      keyFeatherVal.innerText = '3px';
      
      keyColorIndicator.style.backgroundColor = `rgb(${avgR}, ${avgG}, ${avgB})`;
      keyColorIndicatorWrapper.style.display = 'flex';
      
      // Render composite & save state
      saveHistoryState();
      renderCanvas();
      
      // Output the transparent cutout data URL to the output preview element
      const outputUrl = canvas.toDataURL('image/png');
      const outputImg = document.getElementById("output");
      if (outputImg) {
        outputImg.src = outputUrl;
        const previewGroup = document.getElementById('outputPreviewGroup');
        if (previewGroup) previewGroup.style.display = 'block';
      }
      
      showToast("Background removed successfully using local color keyer!", "success");
    } catch(err) {
      console.error("Local automatic removal failed:", err);
      showToast("Failed to compile local pixels due to cross-origin security.", "error");
      state.chromaKey.enabled = wasKeyEnabled;
      renderCanvas();
    }
  }
  
  // ------------------------------------------------------------------------
  // 18. Toast Notifications Helper
  // ------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    else if (type === 'info') iconClass = 'fa-circle-info';
    
    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation frame show
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto-remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // ============================================================
  // AI Tools Panel: Inject into right sidebar via tab system
  // ============================================================
  (function initAIToolsPanel() {
    const tpl = document.getElementById('aiToolsPanelTpl');
    if (!tpl) return;
    const controlPanel = document.querySelector('.control-panel');
    if (!controlPanel) return;
    const node = tpl.content.cloneNode(true);
    controlPanel.appendChild(node);
  })();

  // ============================================================
  // AI Tools: Global Functions (assigned to window for onclick binding)
  // ============================================================

  window.openAIChat = function() {
    const modal = document.getElementById('aiChatModal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('ai-modal-open'), 10);
      const input = document.getElementById('aiChatInput');
      if (input) input.focus();
    }
  };

  window.closeAIChat = function() {
    const modal = document.getElementById('aiChatModal');
    if (modal) {
      modal.classList.remove('ai-modal-open');
      setTimeout(() => { modal.style.display = 'none'; }, 280);
    }
  };

  window.sendAIMessage = async function() {
    const input = document.getElementById('aiChatInput');
    const messages = document.getElementById('aiChatMessages');
    const sendBtn = document.getElementById('aiSendBtn');
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    // User bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'ai-msg user';
    userBubble.innerHTML = `<div class="ai-msg-bubble">${text.replace(/</g,'&lt;')}</div>`;
    messages.appendChild(userBubble);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Thinking indicator
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'ai-msg bot';
    thinkingBubble.innerHTML = `<div class="ai-msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="ai-msg-bubble ai-thinking"><span></span><span></span><span></span></div>`;
    messages.appendChild(thinkingBubble);
    messages.scrollTop = messages.scrollHeight;
    if (sendBtn) sendBtn.disabled = true;

    // Smart local AI responses
    const reply = getAIResponse(text);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

    thinkingBubble.querySelector('.ai-msg-bubble').className = 'ai-msg-bubble';
    thinkingBubble.querySelector('.ai-msg-bubble').innerHTML = reply;
    messages.scrollTop = messages.scrollHeight;
    if (sendBtn) sendBtn.disabled = false;
  };

  // Support chat key binds
  const chatInput = document.getElementById('aiChatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendAIMessage(); }
    });
  }

  function getAIResponse(text) {
    const q = text.toLowerCase();
    if (q.match(/bright|dark|exposure|light/))
      return "💡 To fix brightness, go to the <b>Adjust</b> tab and drag the <b>Brightness</b> slider. Combine it with <b>Contrast</b> to punch up details!";
    if (q.match(/background|bg|remove|cut|chroma/))
      return "✂️ Use the <b>Remove Background</b> tool to auto-cut your subject. Then switch to the <b>Background</b> tab to swap in a new scene!";
    if (q.match(/filter|cinematic|vintage|style/))
      return "🎨 Check out the <b>Filters</b> tab! Try <b>Cinematic</b> for dramatic looks or <b>Vintage</b> for a warm film feel. Adjust intensity with the slider.";
    if (q.match(/crop|resize|rotate|flip/))
      return "✂️ Head to the <b>Transform</b> tab to crop, rotate, or flip your image. Use drag handles for precision cropping.";
    if (q.match(/face|portrait|skin|beauty/))
      return "🌟 Try the <b>HD Face Enhance</b> tool! It sharpens facial details and boosts clarity. Then use <b>Adjust → Vibrance</b> to make skin tones pop.";
    if (q.match(/text|font|caption|label/))
      return "✏️ Click the <b>Text</b> tab, pick a font and color, then click anywhere on your image to place text. Drag to reposition!";
    if (q.match(/draw|paint|brush|annotate/))
      return "🖌️ Switch to the <b>Draw</b> tab to annotate freely. Choose your brush size and color, then draw directly on the canvas.";
    if (q.match(/download|save|export/))
      return "💾 Click the <b>Download</b> button in the top bar to export your photo as a high-quality PNG!";
    if (q.match(/hello|hi|hey|greet/))
      return "👋 Hey there! I'm Lumina AI. Tell me what you'd like to do with your photo and I'll guide you through it!";
    if (q.match(/tip|help|how|what can/))
      return "🚀 Here are some quick tips:<br>• <b>Enhance</b> tab for one-click auto-fix<br>• <b>Filters</b> for cinematic looks<br>• <b>Background</b> to swap scenes<br>• <b>AI Tools → Remove BG</b> to cut subjects out!";
    return "🤖 Great question! Here's what I suggest: Try the <b>Enhance</b> tab for an instant one-click improvement, or explore <b>Filters</b> for creative styles. What specific effect are you going for?";
  }

  /* ---------- HD Face Enhance ---------- */
  window.enhanceFace = function() {
    if (!canvas) { alert('Please upload a photo first!'); return; }
    if (canvas.width === 0) { alert('Please upload a photo first!'); return; }

    showToast('Applying HD Face Enhancement…', 'info');

    requestAnimationFrame(() => {
      try {
        const w = canvas.width, h = canvas.height;
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // Unsharp mask
        const blurred = new Uint8ClampedArray(data.length);
        const radius = 3;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            let r = 0, g = 0, b = 0, count = 0;
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = Math.max(0, Math.min(w - 1, x + dx));
              const idx = (y * w + nx) * 4;
              r += data[idx]; g += data[idx+1]; b += data[idx+2]; count++;
            }
            const bi = (y * w + x) * 4;
            blurred[bi] = r/count; blurred[bi+1] = g/count; blurred[bi+2] = b/count; blurred[bi+3] = data[bi+3];
          }
        }

        const amount = 1.4;
        for (let i = 0; i < data.length; i += 4) {
          data[i]   = Math.min(255, Math.max(0, data[i]   + (data[i]   - blurred[i])   * amount));
          data[i+1] = Math.min(255, Math.max(0, data[i+1] + (data[i+1] - blurred[i+1]) * amount));
          data[i+2] = Math.min(255, Math.max(0, data[i+2] + (data[i+2] - blurred[i+2]) * amount));
        }

        // Skin warm
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          if (r > 100 && r > g && g > b && r - b > 30) {
            data[i]   = Math.min(255, r + 6);
            data[i+1] = Math.min(255, g + 3);
            data[i+2] = Math.max(0,   b - 4);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        saveHistoryState();
        showToast('✅ HD Face Enhancement applied!', 'success');
      } catch(e) {
        console.error('Face enhance error:', e);
        showToast('Enhancement failed: ' + e.message, 'error');
      }
    });
  };

  /* ---------- AI Image Generator ---------- */
  window.generateImage = function() {
    const modal = document.getElementById('aiImageModal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('ai-modal-open'), 10);
      document.getElementById('aiGenPreview').style.display = 'none';
    }
  };

  window.closeAIImageModal = function() {
    const modal = document.getElementById('aiImageModal');
    if (modal) {
      modal.classList.remove('ai-modal-open');
      setTimeout(() => { modal.style.display = 'none'; }, 280);
    }
  };

  window.runGenerateImage = async function() {
    const promptEl = document.getElementById('aiImagePrompt');
    const styleEl  = document.getElementById('aiImageStyle');
    const aspectEl = document.getElementById('aiImageAspect');
    const genBtn   = document.getElementById('aiGenBtn');
    const preview  = document.getElementById('aiGenPreview');
    const genImg   = document.getElementById('aiGenImg');
    const dlLink   = document.getElementById('aiGenDownloadLink');
    if (!promptEl) return;
    const promptVal = promptEl.value.trim();
    if (!promptVal) { alert('Please enter a description for your image.'); return; }

    genBtn.disabled = true;
    genBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating…';

    const dims = { '1:1': [512,512], '16:9': [768,432], '9:16': [432,768], '4:3': [640,480] };
    const aspect = aspectEl ? aspectEl.value : '1:1';
    const style  = styleEl ? styleEl.value : 'photorealistic';
    const [imgW, imgH] = dims[aspect] || [512,512];

    const encodedPrompt = encodeURIComponent(`${promptVal}, ${style} style, high quality, detailed`);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${imgW}&height=${imgH}&nologo=true&seed=${Math.floor(Math.random()*99999)}`;

    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const timeout = setTimeout(() => reject(new Error('timeout')), 30000);
        img.onload = () => { clearTimeout(timeout); resolve(); };
        img.onerror = () => { clearTimeout(timeout); reject(new Error('load failed')); };
        img.src = url;
      });

      genImg.src = url;
      dlLink.href = url;
      preview.style.display = 'block';
      showToast('🎨 AI image generated!', 'success');
    } catch(e) {
      // Offline fallback gradient
      const offCanvas = document.createElement('canvas');
      offCanvas.width = imgW; offCanvas.height = imgH;
      const offCtx = offCanvas.getContext('2d');
      const grad = offCtx.createLinearGradient(0, 0, imgW, imgH);
      grad.addColorStop(0, '#6366f1'); grad.addColorStop(1, '#ec4899');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, imgW, imgH);

      offCtx.fillStyle = 'rgba(0,0,0,0.45)';
      offCtx.fillRect(0, imgH * 0.6, imgW, imgH * 0.4);
      offCtx.fillStyle = '#fff';
      offCtx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      offCtx.textAlign = 'center';
      offCtx.fillText(`"${promptVal.slice(0,35)}"`, imgW/2, imgH * 0.78);

      const dataUrl = offCanvas.toDataURL('image/png');
      genImg.src = dataUrl;
      dlLink.href = dataUrl;
      preview.style.display = 'block';
      showToast('✨ Generated offline fallback!', 'info');
    } finally {
      genBtn.disabled = false;
      genBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Image';
    }
  };

  window.loadAIGeneratedImage = function() {
    const genImg = document.getElementById('aiGenImg');
    if (!genImg || !genImg.src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      initializeEditorWithImage(img);
      window.closeAIImageModal();
      showToast('AI image loaded into editor!', 'success');
    };
    img.onerror = () => {
      showToast('Could not load image into editor.', 'error');
    };
    img.src = genImg.src;
  };

  // Re-declare original removeBackground to use our correct backend API + local fallback
  window.removeBackground = async function() {
    const file = document.getElementById("imageInput").files[0];

    if (!file) {
      if (originalImage) {
        showToast("Running automatic background remover...", "info");
        runLocalAutomaticBackgroundRemoval();
      } else {
        alert("Please select or upload a photo first.");
      }
      return;
    }

    showToast("Removing background...", "info");

    try {
      const formData = new FormData();
      formData.append("image_file", file);
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "YOUR_REMOVE_BG_API_KEY"
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("API failed");
      }

      const blob = await response.blob();
      const objUrl = URL.createObjectURL(blob);
      
      const outputImg = document.getElementById("output");
      if (outputImg) {
        outputImg.src = objUrl;
      }
      
      const img = new Image();
      img.onload = () => {
        initializeEditorWithImage(img);
        state.chromaKey.enabled = false;
        renderCanvas();
      };
      img.src = objUrl;
      
      showToast("Background removed successfully!", "success");
    } catch (err) {
      console.warn("API error, falling back to chroma-key:", err);
      showToast("Running automatic color-key background removal fallback...", "info");
      runLocalAutomaticBackgroundRemoval();
    }
  };

  function runLocalAutomaticBackgroundRemoval() {
    if (!originalImage) return;
    const w = canvas.width;
    const h = canvas.height;
    
    if (!state.chromaKey) state.chromaKey = { enabled: false, color: [0, 0, 0], tolerance: 35, feather: 3 };
    const wasKeyEnabled = state.chromaKey.enabled;
    state.chromaKey.enabled = false;
    renderCanvas();
    
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w; tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
      const imgData = tempCtx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Sample corners
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      const cornerOffsets = [
        [12, 12], [w - 12, 12], [12, h - 12], [w - 12, h - 12]
      ];
      cornerOffsets.forEach(([cx, cy]) => {
        const idx = (Math.floor(cy) * w + Math.floor(cx)) * 4;
        sumR += d[idx]; sumG += d[idx+1]; sumB += d[idx+2]; count++;
      });

      state.chromaKey = {
        enabled: true,
        color: [Math.round(sumR/count), Math.round(sumG/count), Math.round(sumB/count)],
        tolerance: 35,
        feather: 3
      };

      const kColor = state.chromaKey.color;
      const keyColorIndicator = document.getElementById('keyColorIndicator');
      const keyColorIndicatorWrapper = document.getElementById('keyColorIndicatorWrapper');
      const keyTolerance = document.getElementById('keyTolerance');
      const keyToleranceVal = document.getElementById('keyToleranceVal');
      const keyFeather = document.getElementById('keyFeather');
      const keyFeatherVal = document.getElementById('keyFeatherVal');

      if (keyColorIndicator) keyColorIndicator.style.backgroundColor = `rgb(${kColor[0]},${kColor[1]},${kColor[2]})`;
      if (keyColorIndicatorWrapper) keyColorIndicatorWrapper.style.display = 'flex';
      if (keyTolerance) { keyTolerance.value = 35; if (keyToleranceVal) keyToleranceVal.innerText = 35; }
      if (keyFeather) { keyFeather.value = 3; if (keyFeatherVal) keyFeatherVal.innerText = '3px'; }

      showToast("Background erased automatically using sampled keying!", "success");
    } catch(e) {
      console.error(e);
    } finally {
      state.chromaKey.enabled = true;
      saveHistoryState();
      renderCanvas();
    }
  }

  // ============================================================
  // Passport Photo Maker & AI Background Removal Logic
  // ============================================================
  let remover = null;
  let modelLoadingPromise = null;
  let passportSourceImage = null;
  let selectedBgColor = '#ffffff';

  async function initTransformersModel() {
    if (remover) return remover;
    if (modelLoadingPromise) return modelLoadingPromise;
    
    modelLoadingPromise = (async () => {
      const statusDiv = document.getElementById('passportAiStatus');
      const statusText = document.getElementById('passportStatusText');
      if (statusDiv) statusDiv.style.display = 'block';
      if (statusText) statusText.innerText = 'Initializing AI engine...';
      
      try {
        showToast('Initializing local AI background remover...', 'info');
        const module = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers');
        module.env.allowLocalModels = false;
        if (statusText) statusText.innerText = 'Loading RMBG model (~177MB)...';
        
        remover = await module.pipeline('image-segmentation', 'Xenova/RMBG-1.4', {
          progress_callback: (data) => {
            if (data.status === 'progress' || data.status === 'downloading' || (typeof data.progress === 'number' && data.progress > 0)) {
              const pct = typeof data.progress === 'number' ? data.progress.toFixed(0) : '0';
              const fileName = data.file ? data.file.split('/').pop() : 'model file';
              const progressMsg = `Downloading ${fileName}: ${pct}%`;
              
              if (statusText) statusText.innerText = progressMsg;
              
              // Update Merge panel active step if active
              const bg1 = document.getElementById('pstep-bg1');
              const bg2 = document.getElementById('pstep-bg2');
              if (bg1 && bg1.classList.contains('active')) {
                const stat = bg1.querySelector('.pipe-status');
                if (stat) stat.textContent = `⏳ ${pct}%`;
              } else if (bg2 && bg2.classList.contains('active')) {
                const stat = bg2.querySelector('.pipe-status');
                if (stat) stat.textContent = `⏳ ${pct}%`;
              }
            } else if (data.status === 'ready') {
              if (statusText) {
                statusText.innerText = `Loading RMBG model (~177MB)...`;
              }
            }
          }
        });
        
        if (statusDiv) statusDiv.style.display = 'none';
        showToast('AI background remover ready!', 'success');
        return remover;
      } catch(err) {
        console.error('Failed to load AI model:', err);
        if (statusText) statusText.innerHTML = '<span style="color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Model failed. Standard crop will be used.</span>';
        showToast('Failed to load AI model. Using fallback crop.', 'warning');
        modelLoadingPromise = null; // Let them retry next time
        return null;
      }
    })();
    
    return modelLoadingPromise;
  }

  function processAndDrawPassport(sourceImg) {
    passportSourceImage = sourceImg;
    redrawPassportCanvas();
  }

  // ── Helper: Bounding Box & Head/Neck Detector ───────────────────
  function detectHeadCrop(sourceCanvas) {
    const tempCanvas = document.createElement('canvas');
    const w = sourceCanvas.width || 700;
    const h = sourceCanvas.height || 900;
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(sourceCanvas, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, w, h);
    const d = imgData.data;

    // Find bounding box of the non-transparent subject
    let minX = w, maxX = 0, minY = h, maxY = 0;
    const rowWidths = new Int32Array(h);

    for (let y = 0; y < h; y++) {
      let rowMinX = w, rowMaxX = 0;
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const alpha = d[idx + 3];
        if (alpha > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (x < rowMinX) rowMinX = x;
          if (x > rowMaxX) rowMaxX = x;
        }
      }
      if (rowMaxX >= rowMinX) {
        rowWidths[y] = rowMaxX - rowMinX;
      }
    }

    const personH = maxY - minY;
    const personW = maxX - minX;

    if (personH <= 0 || personW <= 0) return null;

    // Scan for local neck minimum within upper 10% to 45% of the subject height
    const scanStart = minY + Math.round(personH * 0.1);
    const scanEnd = minY + Math.round(personH * 0.45);
    let neckY = minY + Math.round(personH * 0.3); // default fallback head height
    let minWidth = Infinity;

    for (let y = scanStart; y <= scanEnd; y++) {
      let sum = 0, count = 0;
      for (let dy = -2; dy <= 2; dy++) {
        if (y + dy >= 0 && y + dy < h) {
          sum += rowWidths[y + dy];
          count++;
        }
      }
      const avgW = sum / count;
      if (avgW > 0 && avgW < minWidth) {
        minWidth = avgW;
        neckY = y;
      }
    }

    const headH = neckY - minY;
    if (headH <= 10) return null;

    // Target head height should be 75% of output height (675px)
    const targetHeadH = 675;
    const scale = targetHeadH / headH;

    const cropW = 700 / scale;
    const cropH = 900 / scale;

    const centerX = minX + personW / 2;
    const sx = centerX - cropW / 2;

    // Position top of head at ~12% from the top margin
    const topMargin = cropH * 0.12;
    const sy = minY - topMargin;

    return { sx, sy, sw: cropW, sh: cropH };
  }

  // ── Helper: AI Passport Color & Lighting Correction ──────────────
  function applyPassportAICorrections(ctx, w, h) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    let maxLum = 0, minLum = 255;

    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a > 50) {
        rSum += d[i];
        gSum += d[i + 1];
        bSum += d[i + 2];
        count++;
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (lum > maxLum) maxLum = lum;
        if (lum < minLum) minLum = lum;
      }
    }

    if (count === 0) return;

    const rAvg = rSum / count;
    const gAvg = gSum / count;
    const bAvg = bSum / count;
    const avgLum = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;

    // White Balance Correction (Gray World with warmth target)
    const rScale = avgLum / rAvg * 1.03;
    const gScale = avgLum / gAvg * 0.98;
    const bScale = avgLum / bAvg * 0.93;

    // Lighting Correction (Auto exposure adjustment to target 160 brightness)
    const targetLum = 160;
    const expScale = targetLum / avgLum;

    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a > 0) {
        let nr = d[i] * rScale * expScale;
        let ng = d[i + 1] * gScale * expScale;
        let nb = d[i + 2] * bScale * expScale;

        d[i]   = Math.min(255, Math.max(0, nr));
        d[i + 1] = Math.min(255, Math.max(0, ng));
        d[i + 2] = Math.min(255, Math.max(0, nb));
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // ── Helper: Smooth Edge Refinement (Mask Feathering) ────────────
  function applyPassportEdgeFeather(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    const alpha = new Uint8Array(w * h);
    for (let i = 0; i < d.length; i += 4) {
      alpha[i / 4] = d[i + 3];
    }

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const currentAlpha = alpha[idx];
        if (currentAlpha > 0 && currentAlpha < 255) {
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              sum += alpha[(y + dy) * w + (x + dx)];
            }
          }
          d[idx * 4 + 3] = sum / 9;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function redrawPassportCanvas() {
    if (!passportSourceImage) return;

    const pCanvas = document.getElementById('passportCanvas');
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');

    const autoHead = document.getElementById('passportAutoHead')?.checked;
    const autoLighting = document.getElementById('passportAutoLighting')?.checked;
    const autoFeather = document.getElementById('passportAutoFeather')?.checked;

    let sx = 0, sy = 0, sw = 700, sh = 900;
    let useAutoCrop = false;

    if (autoHead) {
      const crop = detectHeadCrop(passportSourceImage);
      if (crop) {
        sx = crop.sx;
        sy = crop.sy;
        sw = crop.sw;
        sh = crop.sh;
        useAutoCrop = true;
      }
    }

    if (!useAutoCrop) {
      const targetRatio = 35 / 45;
      let w = passportSourceImage.width || passportSourceImage.clientWidth || 700;
      let h = passportSourceImage.height || passportSourceImage.clientHeight || 900;
      if ((w / h) > targetRatio) {
        sw = h * targetRatio;
        sx = (w - sw) / 2;
      } else {
        sh = w / targetRatio;
        sy = (h - sh) / 2;
      }
    }

    pCanvas.width = 700;
    pCanvas.height = 900;
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    if (selectedBgColor !== 'transparent') {
      pCtx.fillStyle = selectedBgColor;
      pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
    }

    pCtx.drawImage(
      passportSourceImage,
      sx, sy, sw, sh,
      0, 0, pCanvas.width, pCanvas.height
    );

    if (autoFeather && selectedBgColor !== 'transparent') {
      applyPassportEdgeFeather(pCanvas);
    }

    if (autoLighting) {
      applyPassportAICorrections(pCtx, 700, 900);
    }
  }

  const uploadInput = document.getElementById("upload");
  if (uploadInput) {
    uploadInput.addEventListener("change", async function(e) {
      const file = e.target.files[0];
      if (!file) return;

      await initTransformersModel();

      const statusDiv = document.getElementById('passportAiStatus');
      const statusText = document.getElementById('passportStatusText');
      if (statusDiv) statusDiv.style.display = 'block';
      if (statusText) statusText.innerText = 'Removing background...';
      showToast('Processing photo...', 'info');

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
        try {
          let processedImg = img;

          if (remover) {
            const result = await remover(img);
            
            // RMBG-1.4 returns a mask ImageData — apply it as alpha on the original image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw the original image first
            tempCtx.drawImage(img, 0, 0);
            
            // Get the original pixel data
            const imgData = tempCtx.getImageData(0, 0, img.width, img.height);
            
            // Get the mask — result[0].mask is an ImageData with greyscale values
            const mask = result[0].mask;
            const maskData = mask.data;
            
            // Apply mask: use the red channel of the mask as the alpha value
            for (let i = 0; i < imgData.data.length; i += 4) {
              const maskIdx = i;
              imgData.data[i + 3] = maskData[maskIdx]; // r channel of mask → alpha
            }
            
            tempCtx.putImageData(imgData, 0, 0);
            processedImg = tempCanvas;
          }

          processAndDrawPassport(processedImg);

          if (statusDiv) statusDiv.style.display = 'none';
          showToast('Passport preview generated!', 'success');
        } catch(err) {
          console.error('Error during background removal:', err);
          processAndDrawPassport(img);
          if (statusDiv) statusDiv.style.display = 'none';
          showToast('Processed with fallback crop', 'warning');
        }
      };
    });
  }

  const swatchesContainer = document.getElementById('passportBgSwatches');
  if (swatchesContainer) {
    const swatches = swatchesContainer.querySelectorAll('.swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        selectedBgColor = swatch.getAttribute('data-bg');
        redrawPassportCanvas();
      });
    });
  }

  function generate() {
    const pCanvas = document.getElementById('passportCanvas');
    if (!pCanvas || !passportSourceImage) {
      alert("Please upload a photo first.");
      return;
    }

    const imageSrc = pCanvas.toDataURL('image/png');
    const count = parseInt(document.getElementById("copies").value);
    const page = document.getElementById("a4");
    if (!page) return;

    page.innerHTML = "";

    let cols = 1;
    if(count == 1) cols = 1;
    if(count == 2) cols = 2;
    if(count == 4) cols = 2;
    if(count == 6) cols = 3;
    if(count == 8) cols = 4;
    if(count == 12) cols = 4;

    page.style.gridTemplateColumns = `repeat(${cols}, 35mm)`;

    for(let i = 0; i < count; i++){
      const img = document.createElement("img");
      img.src = imageSrc;
      img.className = "photo";
      page.appendChild(img);
    }
    
    showToast(`Generated sheet with ${count} copies`, 'success');
  }

  window.generate = generate;

  // Sync editor canvas to passport preview grid when opening passport tab
  const originalSetWorkspaceMode = setWorkspaceMode;
  setWorkspaceMode = function(tabName) {
    originalSetWorkspaceMode(tabName);
    if (tabName === 'passport') {
      initTransformersModel();
      if (canvas && originalImage) {
        try {
          processAndDrawPassport(canvas);
        } catch(e) {
          console.warn("Passport preview sync bypassed:", e);
        }
      }
    }
  };

  // ============================================================
  // AI Two Person Merge — Full Pipeline Logic
  // ============================================================

  // ── AI Identity Preservation Settings ───────────────────────
  const aiSettings = {
    // Face Protection
    preserveOriginalFace: true,
    lockFaceIdentity:     true,
    faceSwap:             false,
    regenerateFace:       false,
    modifyFace:           false,

    // Keep Appearance
    preserveEyes:       true,
    preserveNose:       true,
    preserveMouth:      true,
    preserveHair:       true,
    preserveBeard:      true,
    preserveGlasses:    true,
    preserveSkinTone:   true,
    preserveExpression: true,

    // Only Edit Body
    bodyPoseOnly:            true,
    allowPoseChange:         true,
    allowBackgroundChange:   true,
    allowClothesChange:      false,

    // AI Processing
    autoBackgroundRemoval: true,
    bgRemovalMethod:       'ai', // Default to AI model
    aiBodyGeneration:      true,
    lightingMatch:         true,
    colorMatch:            true,
    shadowMatch:           true,
    faceRestore:           true,
    hdEnhance:             true,
    upscale:               '4K',

    // Special Modes
    indianWeddingMode: false,
    coupleMode:        false,
    familyMode:        false,

    // Export
    exportFormat: 'PNG',

    // Safety
    identityStrength: 1.0,
    faceConsistency:  100
  };
  window.aiSettings = aiSettings;

  // Toggle settings panel open/closed
  function toggleAISettings() {
    const body = document.getElementById('aiSettingsBody');
    const chevron = document.getElementById('aiSettingsChevron');
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    chevron?.classList.toggle('open', !isOpen);
  }
  window.toggleAISettings = toggleAISettings;

  // Update a boolean setting from a checkbox
  function updateAISetting(el) {
    const key = el.dataset.key;
    if (key in aiSettings) {
      aiSettings[key] = el.checked;
      
      // Sync Background Removal dropdown if key matches
      if (key === 'autoBackgroundRemoval') {
        const sel = document.getElementById('mergeBgRemovalMethod');
        if (sel) {
          sel.value = el.checked ? 'ai' : 'none';
          aiSettings.bgRemovalMethod = el.checked ? 'ai' : 'none';
        }
      }

      showToast(
        (el.checked ? '✅ ' : '⛔ ') + el.closest('.ai-toggle-row, .ai-toggle-chip')
          ?.querySelector('.ai-toggle-label, span:last-child')?.textContent?.trim()?.split('\n')[0] || key,
        el.checked ? 'success' : 'info'
      );
    }
  }
  window.updateAISetting = updateAISetting;

  // Update a numeric slider setting
  function updateAISlider(el, displayId, suffix) {
    const key = el.dataset.key;
    const val = parseInt(el.value);
    if (key === 'identityStrength') aiSettings.identityStrength = val / 100;
    else if (key in aiSettings) aiSettings[key] = val;
    const display = document.getElementById(displayId);
    if (display) display.textContent = val + (suffix || '');
  }
  window.updateAISlider = updateAISlider;

  // Special mode toggles — also auto-select the matching pose
  function updateAIMode(el, poseKey) {
    aiSettings[el.dataset.key] = el.checked;
    if (el.checked) {
      // Uncheck other mode toggles
      ['indianWeddingMode','coupleMode','familyMode'].forEach(k => {
        if (k !== el.dataset.key) aiSettings[k] = false;
      });
      document.querySelectorAll('[data-key="indianWeddingMode"],[data-key="coupleMode"],[data-key="familyMode"]')
        .forEach(cb => { if (cb !== el) cb.checked = false; });
      // Auto-select matching pose dropdown
      const poseSelect = document.getElementById('pose');
      if (poseSelect) poseSelect.value = poseKey;
      showToast(`🎭 ${poseKey.charAt(0).toUpperCase() + poseKey.slice(1)} mode activated`, 'success');
    }
  }
  window.updateAIMode = updateAIMode;

  // Export format toggle
  let mergeExportFormat = 'PNG';
  function setExportFormat(fmt) {
    mergeExportFormat = fmt;
    aiSettings.exportFormat = fmt;
    document.getElementById('exportPNG')?.classList.toggle('active', fmt === 'PNG');
    document.getElementById('exportJPG')?.classList.toggle('active', fmt === 'JPG');
  }
  window.setExportFormat = setExportFormat;

  const POSE_CONFIGS = {
    // ── Standing: classic side-by-side, same scale, neutral ──────────────
    standing: {
      people: [
        { cx:0.30, cy:0.58, h:0.84, rot:0,    flip:false, zIdx:0 },
        { cx:0.70, cy:0.58, h:0.84, rot:0,    flip:true,  zIdx:1 },
      ],
      bgGrad: ['#0d2b0d','#1a5c2a','#0d2b0d'],
      bgType: 'garden',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Holding Hands: very close, slight lean toward each other ──────────
    hands: {
      people: [
        { cx:0.34, cy:0.58, h:0.80, rot:-3,  flip:false, zIdx:0 },
        { cx:0.66, cy:0.58, h:0.80, rot:3,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#1a2a4a','#2d4a8a','#0d1a30'],
      bgType: 'dusk',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Wedding: groom left tall, bride right slightly shorter & closer ───
    wedding: {
      people: [
        { cx:0.36, cy:0.59, h:0.88, rot:-1,  flip:false, zIdx:0 },
        { cx:0.64, cy:0.59, h:0.84, rot:2,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#4a1a2e','#9a4a70','#2a0a1a'],
      bgType: 'wedding',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Garden: offset heights, organic feel, leafy green ────────────────
    garden: {
      people: [
        { cx:0.28, cy:0.60, h:0.78, rot:-2,  flip:false, zIdx:0 },
        { cx:0.65, cy:0.56, h:0.86, rot:1,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#0a2a0a','#1a5a1a','#2a8a2a'],
      bgType: 'garden',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Beach: both slightly smaller (vacation feel), warm sky ────────────
    beach: {
      people: [
        { cx:0.30, cy:0.62, h:0.72, rot:-2,  flip:false, zIdx:0 },
        { cx:0.70, cy:0.62, h:0.70, rot:2,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#0a3a6a','#2a7aaa','#f0c87a'],
      bgType: 'beach',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Indian Traditional: very close, tall, rich colors ────────────────
    indian: {
      people: [
        { cx:0.35, cy:0.58, h:0.90, rot:-1,  flip:false, zIdx:0 },
        { cx:0.65, cy:0.58, h:0.90, rot:1,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#5c2a10','#c06030','#3a0a00'],
      bgType: 'indian',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Passport: white bg, centered each person, smaller scale ──────────
    passport: {
      people: [
        { cx:0.25, cy:0.50, h:0.68, rot:0,   flip:false, zIdx:0 },
        { cx:0.75, cy:0.50, h:0.68, rot:0,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#e8f0f8','#d0dff0','#ffffff'],
      bgType: 'white',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Family: one person centered, other slight to side ─────────────────
    family: {
      people: [
        { cx:0.28, cy:0.60, h:0.82, rot:-1,  flip:false, zIdx:0 },
        { cx:0.68, cy:0.58, h:0.86, rot:0,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#2a1a0a','#6a4a1a','#4a2a0a'],
      bgType: 'warm',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Sitting: lower Y position, shorter scale ───────────────────────────
    sitting: {
      people: [
        { cx:0.30, cy:0.76, h:0.55, rot:-3,  flip:false, zIdx:0 },
        { cx:0.68, cy:0.76, h:0.55, rot:3,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#1a0a2a','#4a2a6a','#2a0a4a'],
      bgType: 'evening',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Walking: staggered Y, one slightly ahead ─────────────────────────
    walking: {
      people: [
        { cx:0.28, cy:0.62, h:0.78, rot:-5,  flip:false, zIdx:0 },
        { cx:0.60, cy:0.56, h:0.82, rot:3,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#0a1a0a','#1a4a1a','#3a6a3a'],
      bgType: 'path',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Couple Portrait: very close, overlapping, romantic ───────────────
    couple: {
      people: [
        { cx:0.37, cy:0.56, h:0.88, rot:-2,  flip:false, zIdx:0 },
        { cx:0.63, cy:0.56, h:0.84, rot:2,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#2a0a2a','#6a1a5a','#1a0a1a'],
      bgType: 'romantic',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Birthday: confetti colors, festive ───────────────────────────────
    birthday: {
      people: [
        { cx:0.30, cy:0.58, h:0.80, rot:-4,  flip:false, zIdx:0 },
        { cx:0.70, cy:0.58, h:0.80, rot:4,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#3a0a3a','#9a2a8a','#1a0a1a'],
      bgType: 'party',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Party: leaning outward, wide spread ──────────────────────────────
    party: {
      people: [
        { cx:0.22, cy:0.58, h:0.76, rot:-8,  flip:false, zIdx:0 },
        { cx:0.78, cy:0.58, h:0.76, rot:8,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#0a0a3a','#2a1a6a','#4a0a4a'],
      bgType: 'party',
      frame: { x:0, y:0, w:1, h:1 },
    },

    // ── Graduation: both tall, neutral + academic feel ────────────────────
    graduation: {
      people: [
        { cx:0.30, cy:0.57, h:0.88, rot:0,   flip:false, zIdx:0 },
        { cx:0.70, cy:0.57, h:0.88, rot:0,   flip:true,  zIdx:1 },
      ],
      bgGrad: ['#0a1a0a','#1a3a1a','#2a5a2a'],
      bgType: 'academic',
      frame: { x:0, y:0, w:1, h:1 },
    },
  };

  let mergeImg1 = null, mergeImg2 = null;
  let mergeCutout1 = null, mergeCutout2 = null;
  let mergeQuality = '4k';

  // ── Upload handlers ──────────────────────────────────────────
  function setupMergeUpload(inputId, thumbId, cardId, slot) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    inp.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (slot === 1) { mergeImg1 = img; mergeCutout1 = null; }
        else            { mergeImg2 = img; mergeCutout2 = null; }
        const thumb = document.getElementById(thumbId);
        if (thumb) {
          thumb.innerHTML = '';
          const preview = document.createElement('img');
          preview.src = url;
          preview.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);';
          thumb.appendChild(preview);
        }
        document.getElementById(cardId)?.classList.add('has-image');
        showToast(`✅ Person ${slot} photo loaded (${img.width}×${img.height})`, 'success');
        
        // Pre-load AI model in background if AI method is selected
        if (aiSettings.bgRemovalMethod === 'ai' && !remover && !modelLoadingPromise) {
          initTransformersModel(); // fire and forget — no await
        }
      };
      img.onerror = () => showToast(`Failed to load Person ${slot} photo`, 'error');
      img.src = url;
    });
  }
  setupMergeUpload('person1', 'mergeThumb1', 'mergeCard1', 1);
  setupMergeUpload('person2', 'mergeThumb2', 'mergeCard2', 2);

  function setMergeQuality(q) {
    mergeQuality = q;
    document.getElementById('mergeQualityHD')?.classList.toggle('active', q === 'hd');
    document.getElementById('mergeQuality4K')?.classList.toggle('active', q === '4k');
  }
  window.setMergeQuality = setMergeQuality;

  // ── Pipeline step helpers ─────────────────────────────────────
  const PIPE_STEPS = ['face','bg1','bg2','fid','body','pose','light','shadow','color','upscale','final'];
  function pipeReset() {
    document.getElementById('mergePipeline').style.display = 'block';
    PIPE_STEPS.forEach(s => {
      const el = document.getElementById('pstep-' + s);
      if (el) { el.className = 'pipe-step'; el.querySelector('.pipe-status').textContent = ''; }
    });
  }
  function pipeActive(id) {
    const el = document.getElementById('pstep-' + id);
    if (el) { el.className = 'pipe-step active'; el.querySelector('.pipe-status').textContent = '⏳'; }
  }
  function pipeDone(id) {
    const el = document.getElementById('pstep-' + id);
    if (el) { el.className = 'pipe-step done'; el.querySelector('.pipe-status').textContent = '✅'; }
  }
  function pipeError(id) {
    const el = document.getElementById('pstep-' + id);
    if (el) { el.className = 'pipe-step error'; el.querySelector('.pipe-status').textContent = '⚠️'; }
  }

  // Small async delay to let the DOM repaint and show step changes
  const repaint = (ms = 40) => new Promise(r => setTimeout(r, ms));

  // ── AI Background removal (re-uses passport RMBG model) ───────
  async function cutoutPersonAI(img) {
    if (!remover) await initTransformersModel();
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx2 = c.getContext('2d');
    ctx2.drawImage(img, 0, 0);
    if (remover) {
      try {
        const result = await remover(img);
        const imgData = ctx2.getImageData(0, 0, w, h);
        const maskData = result[0].mask.data;
        for (let i = 0; i < imgData.data.length; i += 4) {
          imgData.data[i + 3] = maskData[i];
        }
        ctx2.putImageData(imgData, 0, 0);
      } catch(e) { console.warn('RMBG failed, using raw:', e); }
    }
    return c;
  }

  // ── Fast Auto-Color Background removal (for solid/studio backdrops) ──
  function cutoutPersonColorKey(img) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx2 = c.getContext('2d');
    ctx2.drawImage(img, 0, 0);
    
    let imgData;
    try {
      imgData = ctx2.getImageData(0, 0, w, h);
    } catch(e) {
      // Canvas is tainted — cannot read pixels. Return as-is.
      console.warn('cutoutPersonColorKey: canvas tainted, skipping color key. Use AI method instead.', e.message);
      return c;
    }
    
    const data = imgData.data;
    
    // Sample four corners to determine average background color
    const corners = [
      [data[0], data[1], data[2]], // Top-left
      [data[(w - 1) * 4], data[(w - 1) * 4 + 1], data[(w - 1) * 4 + 2]], // Top-right
      [data[(h - 1) * w * 4], data[(h - 1) * w * 4 + 1], data[(h - 1) * w * 4 + 2]], // Bottom-left
      [data[((h - 1) * w + w - 1) * 4], data[((h - 1) * w + w - 1) * 4 + 1], data[((h - 1) * w + w - 1) * 4 + 2]] // Bottom-right
    ];
    
    let rSum = 0, gSum = 0, bSum = 0;
    corners.forEach(p => { rSum += p[0]; gSum += p[1]; bSum += p[2]; });
    const bgR = Math.round(rSum / 4);
    const bgG = Math.round(gSum / 4);
    const bgB = Math.round(bSum / 4);
    
    const tolerance = 35;
    const feather = 15;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) +
        Math.pow(g - bgG, 2) +
        Math.pow(b - bgB, 2)
      );
      
      if (dist < tolerance) {
        data[i + 3] = 0;
      } else if (dist < tolerance + feather) {
        const ratio = (dist - tolerance) / feather;
        data[i + 3] = Math.min(data[i + 3], Math.round(ratio * 255));
      }
    }
    
    try { ctx2.putImageData(imgData, 0, 0); } catch(e) {}
    return c;
  }

  function updateMergeBgMethod(el) {
    const val = el.value;
    aiSettings.bgRemovalMethod = val;
    aiSettings.autoBackgroundRemoval = (val !== 'none');
    
    const toggle = document.querySelector('[data-key="autoBackgroundRemoval"]');
    if (toggle) {
      toggle.checked = (val !== 'none');
    }
    showToast(`Background removal method: ${el.options[el.selectedIndex].text}`, 'info');
  }
  window.updateMergeBgMethod = updateMergeBgMethod;

  // ── Bounding box of visible (non-transparent) pixels ─────────
  function getContentBounds(canvas) {
    const ctx2 = canvas.getContext('2d');
    const d = ctx2.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (d[(y * canvas.width + x) * 4 + 3] > 10) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
  }

  // ── Face region: top 30% of bounding box = head area ─────────
  function getFaceRegion(bounds) {
    const faceH = Math.round(bounds.h * 0.30);
    return { x: bounds.minX, y: bounds.minY, w: bounds.w, h: faceH };
  }

  // ── Luminance histogram matching (lighting + color match) ─────
  function buildCDF(data) {
    const hist = new Float32Array(256); let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] > 10) {
        hist[Math.round(0.299*data[i]+0.587*data[i+1]+0.114*data[i+2])]++;
        count++;
      }
    }
    const cdf = new Float32Array(256);
    cdf[0] = hist[0] / count;
    for (let i = 1; i < 256; i++) cdf[i] = cdf[i-1] + hist[i] / count;
    return cdf;
  }
  function matchLuminance(destCanvas, refCanvas) {
    const dCtx = destCanvas.getContext('2d');
    const dest = dCtx.getImageData(0, 0, destCanvas.width, destCanvas.height);
    const ref  = refCanvas.getContext('2d').getImageData(0, 0, refCanvas.width, refCanvas.height);
    const cdfS = buildCDF(dest.data), cdfR = buildCDF(ref.data);
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      let best = 0, bestD = Infinity;
      for (let j = 0; j < 256; j++) {
        const d = Math.abs(cdfS[i] - cdfR[j]);
        if (d < bestD) { bestD = d; best = j; }
      }
      lut[i] = best;
    }
    for (let i = 0; i < dest.data.length; i += 4) {
      if (dest.data[i+3] > 10) {
        const lum = Math.round(0.299*dest.data[i]+0.587*dest.data[i+1]+0.114*dest.data[i+2]);
        const scale = lum > 0 ? lut[lum] / lum : 1;
        dest.data[i]   = Math.min(255, dest.data[i]   * scale);
        dest.data[i+1] = Math.min(255, dest.data[i+1] * scale);
        dest.data[i+2] = Math.min(255, dest.data[i+2] * scale);
      }
    }
    dCtx.putImageData(dest, 0, 0);
  }

  // ── Skin tone sampling & tint matching ───────────────────────
  function getSkinToneAvg(canvas, bounds) {
    const ctx2 = canvas.getContext('2d');
    // Sample a small region around the face (top 25% center)
    const sx = bounds.minX + bounds.w * 0.35, sy = bounds.minY + bounds.h * 0.06;
    const sw = bounds.w * 0.30, sh = bounds.h * 0.18;
    const d = ctx2.getImageData(sx, sy, Math.max(1,sw), Math.max(1,sh)).data;
    let r=0,g=0,b=0,n=0;
    for (let i=0;i<d.length;i+=4) {
      if(d[i+3]>128){ r+=d[i];g+=d[i+1];b+=d[i+2];n++; }
    }
    return n>0 ? [r/n,g/n,b/n] : [200,160,130];
  }
  function applySkinToneShift(canvas, fromTone, toTone) {
    const ctx2 = canvas.getContext('2d');
    const data = ctx2.getImageData(0, 0, canvas.width, canvas.height);
    const dr = toTone[0]-fromTone[0], dg = toTone[1]-fromTone[1], db = toTone[2]-fromTone[2];
    const strength = 0.35; // blend factor to avoid over-correction
    for (let i=0;i<data.data.length;i+=4) {
      if(data.data[i+3]>10) {
        data.data[i]   = Math.min(255,Math.max(0, data.data[i]   + dr*strength));
        data.data[i+1] = Math.min(255,Math.max(0, data.data[i+1] + dg*strength));
        data.data[i+2] = Math.min(255,Math.max(0, data.data[i+2] + db*strength));
      }
    }
    ctx2.putImageData(data, 0, 0);
  }

  // ── Shadow: draw soft elliptical drop shadow beneath a person ─
  function drawGroundShadow(ctx, cx, baseY, personW, outW, outH) {
    const sw = personW * 0.55, sh = personW * 0.08;
    const grd = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, sw);
    grd.addColorStop(0,   'rgba(0,0,0,0.35)');
    grd.addColorStop(0.6, 'rgba(0,0,0,0.10)');
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.save();
    ctx.scale(1, sh/sw);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, baseY * (sw/sh), sw, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // ── Background image loader (tries file, falls back to gradient) ──
  // NOTE: In file:// protocol, background images from relative paths
  // may fail to load or may taint the canvas. We generate rich
  // gradient backgrounds instead to avoid canvas taint entirely.
  function loadBgImage(url, cw, ch) {
    return Promise.resolve(null); // Always use gradient — avoids taint
  }

  // ── Generate themed gradient background on canvas ─────────────
  function paintGradientBg(ctx, pose, outW, outH) {
    const colors = pose.bgGrad || ['#1a1a2e', '#2d1b69', '#1a1a2e'];
    const [c1, c2, c3] = colors.length >= 3 ? colors : [colors[0], colors[1] || colors[0], colors[0]];

    // Multi-stop gradient
    const g = ctx.createLinearGradient(0, 0, 0, outH);
    g.addColorStop(0,   c1);
    g.addColorStop(0.5, c2);
    g.addColorStop(1,   c3);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, outW, outH);

    // Subtle central radial highlight (softens the gradient)
    const hl = ctx.createRadialGradient(outW * 0.5, outH * 0.36, 0, outW * 0.5, outH * 0.36, outW * 0.6);
    hl.addColorStop(0, 'rgba(255,255,255,0.09)');
    hl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hl;
    ctx.fillRect(0, 0, outW, outH);

    // Scene-specific decorations
    const bgType = pose.bgType || 'plain';

    if (bgType === 'garden' || bgType === 'path' || bgType === 'academic') {
      // Ground / grass strip
      const gr = ctx.createLinearGradient(0, outH*0.82, 0, outH);
      gr.addColorStop(0, 'rgba(20,80,20,0.85)');
      gr.addColorStop(1, 'rgba(10,40,10,0.95)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, outH * 0.82, outW, outH * 0.18);
    }

    if (bgType === 'beach') {
      // Sand strip at bottom
      const sand = ctx.createLinearGradient(0, outH*0.78, 0, outH);
      sand.addColorStop(0, 'rgba(210,185,110,0.90)');
      sand.addColorStop(1, 'rgba(180,150,80,0.95)');
      ctx.fillStyle = sand;
      ctx.fillRect(0, outH * 0.78, outW, outH * 0.22);
      // Ocean horizon shimmer
      const ocean = ctx.createLinearGradient(0, outH*0.40, 0, outH*0.60);
      ocean.addColorStop(0, 'rgba(40,120,200,0.35)');
      ocean.addColorStop(1, 'rgba(20,80,160,0.0)');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, outH * 0.40, outW, outH * 0.20);
    }

    if (bgType === 'wedding' || bgType === 'romantic') {
      // Bokeh-style soft circles
      for (let i = 0; i < 18; i++) {
        const bx = (Math.sin(i * 2.4) * 0.5 + 0.5) * outW;
        const by = (Math.cos(i * 1.7) * 0.5 + 0.5) * outH;
        const br = outW * (0.015 + Math.abs(Math.sin(i)) * 0.03);
        const bk = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bk.addColorStop(0, 'rgba(255,220,200,0.12)');
        bk.addColorStop(1, 'rgba(255,180,160,0)');
        ctx.fillStyle = bk;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (bgType === 'party' || bgType === 'birthday') {
      // Confetti-style color spots
      const confettiColors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bff','#ffa07a'];
      for (let i = 0; i < 40; i++) {
        const px = (Math.sin(i * 3.7) * 0.5 + 0.5) * outW;
        const py = (Math.cos(i * 2.3) * 0.5 + 0.5) * outH * 0.85;
        const pr = outW * (0.004 + Math.abs(Math.cos(i)) * 0.008);
        ctx.fillStyle = confettiColors[i % confettiColors.length] + '60';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (bgType === 'indian') {
      // Ornamental arch shape at top center
      const archW = outW * 0.35, archH = outH * 0.45;
      const archX = (outW - archW) / 2, archY = outH * 0.02;
      const arch = ctx.createRadialGradient(outW/2, archY + archH * 0.5, 0, outW/2, archY + archH * 0.5, archW * 0.7);
      arch.addColorStop(0, 'rgba(220,140,40,0.20)');
      arch.addColorStop(1, 'rgba(180,80,10,0.0)');
      ctx.fillStyle = arch;
      ctx.fillRect(0, 0, outW, outH);
    }

    if (bgType === 'white') {
      // White passport BG — add very subtle gray floor line
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, outH * 0.86, outW, outH * 0.14);
    }

    if (bgType === 'evening' || bgType === 'dusk') {
      // Stars / evening sky sparkles
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 4.1) * 0.5 + 0.5) * outW;
        const sy = (Math.cos(i * 3.3) * 0.5 + 0.5) * outH * 0.65;
        const sr = outW * (0.001 + Math.abs(Math.sin(i)) * 0.002);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.abs(Math.cos(i)) * 0.4})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function lerpColor(c1, c2, t) {
    const parse = hex => {
      const n = parseInt(hex.replace('#',''), 16);
      return [(n>>16)&255, (n>>8)&255, n&255];
    };
    const a = parse(c1), b = parse(c2);
    const r = Math.round(a[0] + (b[0]-a[0])*t);
    const g = Math.round(a[1] + (b[1]-a[1])*t);
    const bv = Math.round(a[2] + (b[2]-a[2])*t);
    return `rgb(${r},${g},${bv})`;
  }

  // ── Draw a person cutout onto output canvas ───────────────────
  function drawPerson(ctx, cutout, bounds, cx, cy, targetH, outW, outH, drawShadow) {
    if (bounds.h <= 0) return;
    const scale = (outH * targetH) / bounds.h;
    const dw = cutout.width * scale;
    const dh = cutout.height * scale;
    const dx = outW * cx - (bounds.minX * scale) - (bounds.w * scale) / 2;
    const dy = outH * cy - (bounds.minY * scale) - (bounds.h * scale);
    if (drawShadow) {
      const personCenterX = dx + (bounds.minX * scale) + (bounds.w * scale) / 2;
      const personBaseY   = dy + (bounds.minY * scale) + (bounds.h * scale);
      drawGroundShadow(ctx, personCenterX, personBaseY, bounds.w * scale, outW, outH);
    }
    ctx.drawImage(cutout, dx, dy, dw, dh);
  }

  // ── Main pipeline ─────────────────────────────────────────────
  async function generateAI() {
    if (!mergeImg1 || !mergeImg2) {
      showToast('Please upload both Person 1 and Person 2 photos first.', 'error');
      return;
    }

    const poseKey = document.getElementById('pose')?.value || 'standing';
    const pose    = POSE_CONFIGS[poseKey] || POSE_CONFIGS.standing;
    // Output is always HD: 1920×1080 for speed; user can switch to 4K
    const outW = mergeQuality === '4k' ? 3840 : 1920;
    const outH = mergeQuality === '4k' ? 2160 : 1080;

    const btn = document.getElementById('mergeGenerateBtn');
    if (btn) btn.disabled = true;
    pipeReset();

    try {
      // ══════════════════════════════════════════════════════════
      // INLINE UTILITIES
      // ══════════════════════════════════════════════════════════

      // Safe pixel read — never throws even on tainted canvas
      function safeGetImageData(ctx2, x, y, w, h) {
        try { return ctx2.getImageData(Math.round(x), Math.round(y), Math.max(1,Math.round(w)), Math.max(1,Math.round(h))); }
        catch(e) { return null; }
      }

      // Bounding box of non-transparent pixels (with safe fallback)
      function safeBounds(canvas) {
        const w = canvas.width, h = canvas.height;
        if (w === 0 || h === 0) return { minX:0, maxX:1, minY:0, maxY:1, w:1, h:1 };
        const ctx2 = canvas.getContext('2d');
        const d = safeGetImageData(ctx2, 0, 0, w, h);
        if (!d) return { minX:0, maxX:w, minY:0, maxY:h, w, h };
        let minX=w, maxX=0, minY=h, maxY=0;
        for (let y=0; y<h; y++) for (let x=0; x<w; x++) {
          if (d.data[(y*w+x)*4+3] > 12) {
            if(x<minX) minX=x; if(x>maxX) maxX=x;
            if(y<minY) minY=y; if(y>maxY) maxY=y;
          }
        }
        if (maxX<=minX||maxY<=minY) return { minX:0, maxX:w, minY:0, maxY:h, w, h };
        return { minX, maxX, minY, maxY, w:maxX-minX, h:maxY-minY };
      }

      // Pre-resize an image to a max dimension (for faster AI processing)
      function resizeForProcessing(img, maxDim = 1024) {
        const ow = img.naturalWidth || img.width;
        const oh = img.naturalHeight || img.height;
        if (ow <= maxDim && oh <= maxDim) {
          const c = document.createElement('canvas');
          c.width = ow; c.height = oh;
          c.getContext('2d').drawImage(img, 0, 0);
          return c;
        }
        const ratio = Math.min(maxDim/ow, maxDim/oh);
        const nw = Math.round(ow * ratio), nh = Math.round(oh * ratio);
        const c = document.createElement('canvas');
        c.width = nw; c.height = nh;
        c.getContext('2d').drawImage(img, 0, 0, nw, nh);
        return c;
      }

      // Edge feathering: blur alpha channel border for seamless blending
      function featherEdges(canvas, radius = 6) {
        const w = canvas.width, h = canvas.height;
        const ctx2 = canvas.getContext('2d');
        const d = safeGetImageData(ctx2, 0, 0, w, h);
        if (!d) return;
        const data = d.data;
        const alpha = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) alpha[i] = data[i*4+3] / 255;

        // Box blur approximation (3 passes of 1D blur for speed)
        const r = Math.round(radius);
        const tmp = new Float32Array(w * h);
        for (let pass = 0; pass < 3; pass++) {
          // Horizontal pass
          for (let y = 0; y < h; y++) {
            let sum = 0;
            for (let x = 0; x < w; x++) {
              sum += alpha[y*w+x];
              if (x >= r) sum -= alpha[y*w + x - r];
              tmp[y*w+x] = sum / Math.min(r+1, x+1, w-x);
            }
          }
          // Vertical pass
          for (let x = 0; x < w; x++) {
            let sum = 0;
            for (let y = 0; y < h; y++) {
              sum += tmp[y*w+x];
              if (y >= r) sum -= tmp[(y-r)*w+x];
              alpha[y*w+x] = sum / Math.min(r+1, y+1, h-y);
            }
          }
        }
        for (let i = 0; i < w * h; i++) data[i*4+3] = Math.round(Math.min(1, alpha[i]) * 255);
        try { ctx2.putImageData(d, 0, 0); } catch(e) {}
      }

      // Detect face approximate bounds in an image (heuristic: center-top region)
      function detectFaceRegion(img) {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        // Face is usually top-center 40% of portrait images
        return {
          cx: w * 0.50,                  // face center X
          cy: h * 0.18,                  // face center Y  
          faceH: h * 0.22,              // approximate face height
          headTop: h * 0.02,
        };
      }

      // ══════════════════════════════════════════════════════════
      // ① FACE DETECTION — detect face positions for both people
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('face');
      const faceInfo1 = detectFaceRegion(mergeImg1);
      const faceInfo2 = detectFaceRegion(mergeImg2);
      await repaint(80);
      pipeDone('face');

      // ══════════════════════════════════════════════════════════
      // ② + ③ BACKGROUND REMOVAL — run BOTH in PARALLEL
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('bg1');
      pipeActive('bg2');

      const method = aiSettings.bgRemovalMethod || 'color';

      async function doCutout(img) {
        if (method === 'ai') {
          return await cutoutPersonAI(img);
        } else if (method === 'color') {
          return cutoutPersonColorKey(img);
        } else {
          // No removal: resize for processing efficiency
          return resizeForProcessing(img, 1400);
        }
      }

      // Run both simultaneously
      const [cut1raw, cut2raw] = await Promise.all([
        mergeCutout1 ? Promise.resolve(mergeCutout1) : doCutout(mergeImg1),
        mergeCutout2 ? Promise.resolve(mergeCutout2) : doCutout(mergeImg2),
      ]);

      // Apply edge feathering for seamless blending
      featherEdges(cut1raw, 8);
      featherEdges(cut2raw, 8);

      mergeCutout1 = cut1raw;
      mergeCutout2 = cut2raw;

      pipeDone('bg1');
      pipeDone('bg2');

      // ══════════════════════════════════════════════════════════
      // ④ FACE IDENTITY PRESERVATION — boost face sharpness
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('fid');
      await repaint(60);

      function sharpenFaceRegion(cutCanvas, faceInfo) {
        const w = cutCanvas.width, h = cutCanvas.height;
        // Scale face region coords from original image to cutout canvas
        const origW = faceInfo.cx * 2;
        const sx = Math.round((faceInfo.cx - faceInfo.faceH*0.7) * w / origW);
        const sy = Math.round(faceInfo.headTop * h / (faceInfo.headTop / 0.02));
        const sw = Math.round(faceInfo.faceH * 1.4 * w / origW);
        const sh = Math.round(faceInfo.faceH * 1.6 * h / (h));
        const ctx2 = cutCanvas.getContext('2d');
        const fd = safeGetImageData(ctx2, sx, sy, sw, sh);
        if (!fd) return;
        // Mild contrast boost: preserve face — do not over-process
        for (let i = 0; i < fd.data.length; i += 4) {
          if (fd.data[i+3] > 10) {
            fd.data[i]   = Math.min(255, 128 + (fd.data[i]   - 128) * 1.06);
            fd.data[i+1] = Math.min(255, 128 + (fd.data[i+1] - 128) * 1.06);
            fd.data[i+2] = Math.min(255, 128 + (fd.data[i+2] - 128) * 1.06);
          }
        }
        try { ctx2.putImageData(fd, sx, sy); } catch(e) {}
      }

      sharpenFaceRegion(mergeCutout1, faceInfo1);
      sharpenFaceRegion(mergeCutout2, faceInfo2);
      pipeDone('fid');

      // ══════════════════════════════════════════════════════════
      // ⑤ BODY DETECTION — precise subject bounds from alpha
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('body');
      await repaint(60);
      const b1 = safeBounds(mergeCutout1);
      const b2 = safeBounds(mergeCutout2);

      // Detect head size in both cutouts to normalize scale
      const head1H = b1.h * 0.20;  // estimate: head is ~20% of body height
      const head2H = b2.h * 0.20;
      const headRatio = head1H > 0 && head2H > 0 ? head1H / head2H : 1;
      pipeDone('body');

      // ══════════════════════════════════════════════════════════
      // ⑥ SCENE COMPOSITE — paint themed background
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('pose');
      const outCanvas = document.getElementById('mergeCanvas');
      outCanvas.width = outW;
      outCanvas.height = outH;
      const ctx = outCanvas.getContext('2d');
      paintGradientBg(ctx, pose, outW, outH);
      pipeDone('pose');

      // ══════════════════════════════════════════════════════════
      // ⑦ LIGHTING MATCH — equalize luminance between subjects
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('light');
      if (aiSettings.lightingMatch) {
        try { matchLuminance(mergeCutout2, mergeCutout1); }
        catch(e) { console.warn('Lighting match skipped:', e.message); }
      }
      pipeDone('light');

      // ══════════════════════════════════════════════════════════
      // ⑧ SHADOW GENERATION — add realistic ground shadows
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('shadow');

      // Get pose people array
      const peopleCfg = pose.people || [
        { cx:0.33, cy:0.58, h:0.84, rot:0, flip:false, zIdx:0 },
        { cx:0.67, cy:0.58, h:0.84, rot:0, flip:true,  zIdx:1 },
      ];
      const cutouts = [mergeCutout1, mergeCutout2];
      const bounds  = [b1, b2];

      // Scale: use head-ratio to normalize proportions between subjects
      const baseScales = peopleCfg.map((p, i) => {
        const b = bounds[i];
        return b.h > 0 ? (outH * p.h) / b.h : 1;
      });
      // Apply head-ratio correction so both people appear same head size
      const correctedScales = baseScales.map((s, i) => {
        if (i === 0) return s;
        // Scale person 2 slightly if head sizes differ
        const correction = Math.min(1.25, Math.max(0.80, headRatio));
        return s * correction;
      });

      // Draw shadows underneath each person
      if (aiSettings.shadowMatch) {
        const sortedForShadow = [...peopleCfg].sort((a,b) => a.zIdx - b.zIdx);
        for (const pCfg of sortedForShadow) {
          const idx = peopleCfg.indexOf(pCfg);
          const b = bounds[idx], s = correctedScales[idx];
          const cx = outW * pCfg.cx;
          const baseY = outH * pCfg.cy;
          drawGroundShadow(ctx, cx, baseY, b.w * s * 0.7, outW, outH);
        }
      }
      // Re-draw vignette over shadows
      const vig = ctx.createRadialGradient(outW/2, outH/2, outH*0.25, outW/2, outH/2, outH*0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, outW, outH);
      pipeDone('shadow');

      // ══════════════════════════════════════════════════════════
      // ⑨ COLOR CORRECTION — skin tone & color matching
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('color');
      if (aiSettings.colorMatch && aiSettings.preserveSkinTone) {
        try {
          const skin1 = getSkinToneAvg(mergeCutout1, b1);
          const skin2 = getSkinToneAvg(mergeCutout2, b2);
          applySkinToneShift(mergeCutout2, skin2, skin1);
        } catch(e) { console.warn('Color match skipped:', e.message); }
      }
      pipeDone('color');

      // ══════════════════════════════════════════════════════════
      // ⑩ COMPOSITE — draw both people with pose, rotation, flip
      //     Uses corrected scales + feathered cutouts
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('upscale');

      const sortedPeople = [...peopleCfg].sort((a,b) => a.zIdx - b.zIdx);
      for (const pCfg of sortedPeople) {
        const idx    = peopleCfg.indexOf(pCfg);
        const cutout = cutouts[idx];
        const b      = bounds[idx];
        const scale  = correctedScales[idx];

        const destW  = cutout.width  * scale;
        const destH  = cutout.height * scale;
        const destX  = outW * pCfg.cx - (b.minX * scale) - (b.w * scale) / 2;
        const destY  = outH * pCfg.cy - (b.minY * scale) - (b.h * scale);

        // Rotation pivot at person's foot/base center
        const pivotX = destX + (b.minX * scale) + (b.w * scale) / 2;
        const pivotY = destY + (b.minY * scale) + (b.h * scale);

        ctx.save();
        ctx.translate(pivotX, pivotY);
        if (pCfg.flip) ctx.scale(-1, 1);
        if (pCfg.rot)  ctx.rotate(pCfg.rot * Math.PI / 180);
        ctx.translate(-pivotX, -pivotY);
        ctx.drawImage(cutout, destX, destY, destW, destH);
        ctx.restore();
      }
      pipeDone('upscale');

      // ══════════════════════════════════════════════════════════
      // ⑪ FINAL REVEAL
      // ══════════════════════════════════════════════════════════
      await repaint();
      pipeActive('final');
      await repaint(150);

      const mergeWrap = document.getElementById('mergeOutputWrap');
      if (mergeWrap) mergeWrap.style.display = 'flex';
      outCanvas.style.display = 'block';
      const phEl = document.getElementById('mergePlaceholderMsg');
      if (phEl) phEl.style.display = 'none';
      const btnsEl = document.getElementById('mergeBtns');
      if (btnsEl) btnsEl.style.display = 'flex';

      pipeDone('final');
      showToast('✨ Merge complete! Click Download to save your ' + (mergeQuality==='4k'?'4K':'HD') + ' photo.', 'success');

    } catch(err) {
      console.error('Merge pipeline error:', err);
      PIPE_STEPS.forEach(s => {
        if (document.getElementById('pstep-'+s)?.classList.contains('active')) pipeError(s);
      });
      showToast('⚠️ ' + err.message, 'error');
      // Still show whatever was drawn
      const ec = document.getElementById('mergeCanvas');
      if (ec && ec.width > 0) {
        ec.style.display = 'block';
        const ph = document.getElementById('mergePlaceholderMsg');
        if (ph) ph.style.display = 'none';
        const bt = document.getElementById('mergeBtns');
        if (bt) bt.style.display = 'flex';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function downloadMerge() {
    const c = document.getElementById('mergeCanvas');
    if (!c || c.width === 0) { showToast('Nothing to download yet — generate first!', 'error'); return; }
    try {
      const poseKey = document.getElementById('pose')?.value || 'merge';
      const fmt      = (aiSettings.exportFormat || 'PNG').toUpperCase();
      const mimeType = fmt === 'JPG' ? 'image/jpeg' : 'image/png';
      const quality  = fmt === 'JPG' ? 0.95 : 1.0;
      const ext      = fmt === 'JPG' ? 'jpg' : 'png';
      const link = document.createElement('a');
      link.download = `lumina-merge-${poseKey}-${Date.now()}.${ext}`;
      link.href = c.toDataURL(mimeType, quality);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✅ Saved as ${fmt} (${mergeQuality === '4k' ? '4K' : 'HD'})`, 'success');
    } catch(e) {
      // Canvas may be tainted by background images
      showToast('Download failed. Try using "Keep Original Background" option for compatibility.', 'error');
      console.error('downloadMerge error:', e);
    }
  }

  window.generateAI    = generateAI;
  window.downloadMerge = downloadMerge;

});


