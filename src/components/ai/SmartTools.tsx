import React, { useState, useRef } from 'react';
import { 
  Camera, 
  FileText, 
  Search, 
  Lightbulb, 
  Scan, 
  Upload,
  Download,
  Zap,
  Brain,
  Eye,
  Target
} from 'lucide-react';

interface SmartToolsProps {
  onPartRecognition: (imageData: string) => Promise<any>;
  onDimensionExtraction: (pdfData: string) => Promise<any>;
  onOCRProcessing: (imageData: string) => Promise<string>;
  onSimilarPartSearch: (partId: string) => Promise<any[]>;
  onPredictiveSearch: (query: string) => Promise<string[]>;
}

const SmartTools: React.FC<SmartToolsProps> = ({
  onPartRecognition,
  onDimensionExtraction,
  onOCRProcessing,
  onSimilarPartSearch,
  onPredictiveSearch
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setActiveTool('camera');
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      setIsProcessing(true);
      try {
        const recognition = await onPartRecognition(imageData);
        setResults(recognition);
      } catch (error) {
        console.error('Part recognition failed:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageData = e.target?.result as string;
          
          if (activeTool === 'recognition') {
            const recognition = await onPartRecognition(imageData);
            setResults(recognition);
          } else if (activeTool === 'ocr') {
            const text = await onOCRProcessing(imageData);
            setResults({ extractedText: text });
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.includes('pdf')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const pdfData = e.target?.result as string;
          const dimensions = await onDimensionExtraction(pdfData);
          setResults(dimensions);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('File processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePredictiveSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length > 2) {
      try {
        const predictions = await onPredictiveSearch(query);
        setSuggestions(predictions);
      } catch (error) {
        console.error('Predictive search failed:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const ToolButton: React.FC<{
    id: string;
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    onClick: () => void;
  }> = ({ id, icon: Icon, title, description, onClick }) => (
    <button
      onClick={onClick}
        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
          activeTool === id
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="w-6 h-6 text-blue-500" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </button>
  );

  const RecognitionResults: React.FC<{ data: any }> = ({ data }) => (
    <div className="space-y-4">
      <h3 className="font-medium">Recognition Results</h3>
      
      {data.matches && data.matches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Potential Matches ({data.confidence}% confidence)
          </h4>
          {data.matches.map((match: any, index: number) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{match.name}</span>
                <span className="text-sm text-gray-500">{match.confidence}%</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {match.manufacturer} • {match.category}
              </div>
              {match.partNumbers && (
                <div className="text-xs text-gray-500 mt-1">
                  Part #: {match.partNumbers.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.extractedFeatures && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Detected Features
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data.extractedFeatures).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                <span className="ml-1 font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Smart Tools</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          AI-powered part recognition and analysis
        </p>
      </div>

      {/* Tools Grid */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToolButton
            id="camera"
            icon={Camera}
            title="Photo Recognition"
            description="Take a photo to identify parts automatically"
            onClick={startCamera}
          />
          
          <ToolButton
            id="recognition"
            icon={Eye}
            title="Image Recognition"
            description="Upload an image for part identification"
            onClick={() => {
              setActiveTool('recognition');
              fileInputRef.current?.click();
            }}
          />
          
          <ToolButton
            id="pdf"
            icon={FileText}
            title="PDF Dimension Extraction"
            description="Extract dimensions from technical drawings"
            onClick={() => {
              setActiveTool('pdf');
              fileInputRef.current?.click();
            }}
          />
          
          <ToolButton
            id="ocr"
            icon={Scan}
            title="OCR Part Numbers"
            description="Extract text and part numbers from images"
            onClick={() => {
              setActiveTool('ocr');
              fileInputRef.current?.click();
            }}
          />
        </div>

        {/* Predictive Search */}
        <div className="space-y-2">
          <h3 className="font-medium flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Predictive Search</span>
          </h3>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handlePredictiveSearch(e.target.value)}
              placeholder="Start typing to get AI suggestions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setSuggestions([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera View */}
      {activeTool === 'camera' && (
        <div className="flex-1 p-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              autoPlay
              playsInline
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={capturePhoto}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Capture & Analyze'}
              </button>
            </div>
            
            {/* Overlay guides */}
            <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
              <div className="absolute top-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                Center part in frame
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {results.matches && <RecognitionResults data={results} />}
          
          {results.extractedText && (
            <div className="space-y-2">
              <h3 className="font-medium">Extracted Text</h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{results.extractedText}</pre>
              </div>
            </div>
          )}
          
          {results.dimensions && (
            <div className="space-y-2">
              <h3 className="font-medium">Extracted Dimensions</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(results.dimensions).map(([key, value]) => (
                  <div key={key} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{key}</div>
                    <div className="font-medium">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Processing with AI...
            </span>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={activeTool === 'pdf' ? '.pdf' : 'image/*'}
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default SmartTools;