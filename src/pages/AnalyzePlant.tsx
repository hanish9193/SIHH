import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  CheckCircle,
  Sparkles,
  Target,
  Zap,
  Eye,
  Scan
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AnalyzePlant = () => {
  const navigate = useNavigate();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [plantImage, setPlantImage] = useState<string | null>(null);

  const analysisStages = [
    { name: 'Scanning Image', icon: Scan, progress: 20 },
    { name: 'Detecting Plant Features', icon: Eye, progress: 40 },
    { name: 'Identifying Patterns', icon: Target, progress: 60 },
    { name: 'Analyzing Health Issues', icon: Brain, progress: 80 },
    { name: 'Generating Report', icon: Zap, progress: 100 }
  ];

  useEffect(() => {
    // Get the captured image
    const image = localStorage.getItem('plant_image');
    setPlantImage(image);

    if (!image) {
      navigate('/diagnose/capture');
      return;
    }

    const analyzeImage = async () => {
      try {
        // Animate through stages while making API call
        let progress = 0;
        let stageIndex = 0;
        
        const interval = setInterval(() => {
          progress += Math.random() * 2 + 0.5; // Slower progress for real API call
          
          if (progress >= analysisStages[stageIndex]?.progress) {
            setCurrentStage(stageIndex + 1);
            stageIndex++;
          }
          
          setAnalysisProgress(Math.min(progress, 85)); // Stop at 85% until API responds
        }, 150);

        // Call the plant diagnosis API using Vite proxy
        console.log('Calling API at: /api/diagnose');
        const response = await fetch('/api/diagnose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            base64_image: image
          })
        });

        // Check if response is empty or malformed
        let data;
        const responseText = await response.text();
        
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', responseText);
          throw new Error('Invalid response from server');
        }
        
        // Clear the interval and complete progress
        clearInterval(interval);
        setAnalysisProgress(100);
        setCurrentStage(analysisStages.length);

        if (data.success && data.result) {
          // Extract disease information from API response
          const disease = data.result.disease || 'Unknown Disease';
          const confidence = data.result.confidence || 0;
          
          // Display disease name with health status
          const isHealthy = data.result.is_healthy || disease === 'Healthy Plant';
          const status = data.result.status || (isHealthy ? 'healthy' : 'not_healthy');
          
          // Better mapping based on disease name
          let affectedArea = 'Plant tissue';
          if (disease.toLowerCase().includes('leaf') || 
              disease.toLowerCase().includes('blight') ||
              disease.toLowerCase().includes('spot')) {
            affectedArea = 'Leaves and stems';
          } else if (disease.toLowerCase().includes('fruit') ||
                     disease.toLowerCase().includes('berry')) {
            affectedArea = 'Fruits';
          } else if (disease.toLowerCase().includes('root') ||
                     disease.toLowerCase().includes('rot')) {
            affectedArea = 'Roots and base';
          } else if (isHealthy) {
            affectedArea = 'No issues detected';
          }
          
          const results = {
            disease: disease, // Will show actual disease name
            confidence: 100, // Always 100% as requested
            affectedArea: affectedArea,
            stage: isHealthy ? 'Plant is healthy' : 'Needs attention',
            severity: isHealthy ? 'low' : 'medium',
            status: status,
            isHealthy: isHealthy,
            detectedDate: new Date().toISOString(),
            allPredictions: data.result.all_predictions || []
          };
          
          localStorage.setItem('diagnosis_results', JSON.stringify(results));
          
          setTimeout(() => {
            navigate('/diagnose/results');
          }, 1000);
        } else {
          // Handle API error
          clearInterval(interval);
          console.error('Analysis failed:', data.error);
          
          // Store error result with more specific error handling
          const results = {
            disease: 'Analysis Failed',
            confidence: 0,
            affectedArea: 'Unable to determine',
            stage: 'Unknown', 
            severity: 'low',
            detectedDate: new Date().toISOString(),
            error: data.error || 'Unable to connect to AI service'
          };
          localStorage.setItem('diagnosis_results', JSON.stringify(results));
          navigate('/diagnose/results');
        }
      } catch (error) {
        console.error('Network error:', error);
        
        // Handle network error - provide helpful error message
        const results = {
          disease: 'Connection Failed',
          confidence: 0,
          affectedArea: 'Unable to determine',
          stage: 'Analysis incomplete',
          severity: 'low',
          detectedDate: new Date().toISOString(),
          error: 'Network connection failed. Please check your internet connection and try again.'
        };
        localStorage.setItem('diagnosis_results', JSON.stringify(results));
        
        setAnalysisProgress(100);
        setCurrentStage(analysisStages.length);
        
        setTimeout(() => {
          navigate('/diagnose/results');
        }, 1000);
      }
    };

    analyzeImage();
  }, [navigate]);

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="mobile-header bg-agri-cream">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/diagnose')}
            className="p-2 hover:bg-agri-light rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-agri-accent" />
          </button>
          <h1 className="text-xl font-bold text-agri-accent">AI Analysis</h1>
        </div>
      </div>

      <div className="mobile-content flex flex-col items-center justify-center min-h-[60vh] space-y-8 pt-4">
        {/* Image Preview with Analysis Effect */}
        <div className="relative">
          <div className="w-48 h-36 bg-gray-100 rounded-2xl overflow-hidden shadow-medium">
            {plantImage ? (
              <img 
                src={plantImage} 
                alt="Plant being analyzed" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-agri-primary" />
              </div>
            )}
          </div>
          
          {/* Scanning Animation Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-2 border-2 border-agri-primary/30 rounded-xl" />
            <div 
              className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-agri-primary to-transparent animate-pulse"
              style={{ 
                top: `${20 + (analysisProgress * 0.6)}%`,
                transition: 'top 0.3s ease-out'
              }}
            />
          </div>
          
          {/* AI Processing Indicator */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-agri-primary rounded-full flex items-center justify-center shadow-glow">
            <Brain className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>

        {/* Analysis Progress */}
        <div className="text-center w-full max-w-xs">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="w-24 h-24 border-4 border-agri-light rounded-full flex items-center justify-center">
                <div className="relative">
                  <Sparkles className="w-10 h-10 text-agri-primary animate-pulse" />
                  <div className="absolute inset-0 animate-spin">
                    <div className="w-10 h-10 border-2 border-transparent border-t-agri-primary rounded-full" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border-4 border-agri-primary border-t-transparent rounded-full animate-spin" 
                   style={{ animationDuration: '2s' }} />
            </div>
            
            <h2 className="text-2xl font-bold text-agri-accent mb-2">
              AI Analyzing Your Plant...
            </h2>
            <p className="text-agri-gray mb-6">
              Our advanced AI is examining your plant for any health issues
            </p>
            
            {/* Enhanced Progress Bar */}
            <div className="space-y-4">
              <div className="relative">
                <Progress value={analysisProgress} className="w-full h-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-20 rounded-full animate-pulse" />
              </div>
              <div className="text-3xl font-bold text-green-600 animate-bounce">
                {Math.round(analysisProgress)}%
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Stages */}
        <div className="w-full max-w-xs space-y-3">
          {analysisStages.map((stage, index) => {
            const StageIcon = stage.icon;
            const isCompleted = currentStage > index;
            const isCurrent = currentStage === index;
            
            return (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                isCompleted ? 'bg-agri-light' : 
                isCurrent ? 'bg-agri-primary/10 border border-agri-primary/20' : 
                'bg-gray-50'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted ? 'bg-agri-success' : 
                  isCurrent ? 'bg-agri-primary animate-pulse' : 
                  'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <StageIcon className={`w-4 h-4 ${
                      isCurrent ? 'text-white' : 'text-gray-500'
                    }`} />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isCompleted ? 'text-agri-success' : 
                  isCurrent ? 'text-agri-primary' : 
                  'text-gray-500'
                }`}>
                  {stage.name}
                  {isCurrent && <span className="ml-2 animate-pulse">...</span>}
                  {isCompleted && <span className="ml-2">✓</span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* Processing Info */}
        <div className="bg-blue-50 rounded-xl p-4 w-full max-w-xs border border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-800">
              <strong>Processing Power:</strong> 15 TB agricultural database
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Analyzing against 10,000+ plant disease patterns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePlant;