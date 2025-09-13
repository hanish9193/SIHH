import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Store,
  MapPin,
  Plus,
  Leaf,
  Calendar,
  Award,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

interface DiagnosisResult {
  disease: string;
  confidence: number;
  affectedArea: string;
  stage: string;
  severity: 'low' | 'medium' | 'high';
  detectedDate: string;
  status?: string;
  isHealthy?: boolean;
}

interface Fertilizer {
  name: string;
  price: string;
  availability: string;
}

interface TreatmentStep {
  step: number;
  title: string;
  description: string;
}

const DiagnoseResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [treatmentDuration, setTreatmentDuration] = useState<string>('14-21 days');
  const [successRate, setSuccessRate] = useState<number>(87);
  const [loadingFertilizers, setLoadingFertilizers] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(false);

  useEffect(() => {
    const savedResults = localStorage.getItem('diagnosis_results');
    const savedImage = localStorage.getItem('plant_image');
    
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      
      // Load Gemini AI data for the diagnosed disease
      if (parsedResults.disease && !parsedResults.isHealthy) {
        loadFertilizerRecommendations(parsedResults.disease);
        loadTreatmentSteps(parsedResults.disease);
        loadTreatmentDuration(parsedResults.disease);
      }
    }
    if (savedImage) {
      setPlantImage(savedImage);
    }
  }, []);

  const loadFertilizerRecommendations = async (diseaseName: string) => {
    setLoadingFertilizers(true);
    try {
      const response = await fetch('/api/treatment/fertilizers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disease: diseaseName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.fertilizers) {
          setFertilizers(data.fertilizers);
        }
      }
    } catch (error) {
      console.error('Error loading fertilizers:', error);
      // Use fallback fertilizers
      setFertilizers([
        { name: 'Copper Fungicide Spray', price: '₹450', availability: 'In Stock' },
        { name: 'Organic Disease Control', price: '₹320', availability: 'In Stock' },
        { name: 'Plant Immunity Booster', price: '₹280', availability: 'Out of Stock' }
      ]);
    } finally {
      setLoadingFertilizers(false);
    }
  };

  const loadTreatmentSteps = async (diseaseName: string) => {
    setLoadingSteps(true);
    try {
      const response = await fetch('/api/treatment/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disease: diseaseName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.steps) {
          setTreatmentSteps(data.steps);
        }
      }
    } catch (error) {
      console.error('Error loading treatment steps:', error);
      // Use fallback steps
      setTreatmentSteps([
        { step: 1, title: 'Remove Affected Parts', description: 'Carefully remove all affected leaves and stems. Dispose away from healthy plants.' },
        { step: 2, title: 'Apply Treatment', description: 'Apply appropriate fungicide or treatment as recommended. Follow label instructions.' },
        { step: 3, title: 'Improve Conditions', description: 'Improve air circulation and avoid overhead watering to prevent reinfection.' },
        { step: 4, title: 'Monitor Progress', description: 'Check daily for new symptoms. Recovery should begin within 5-7 days.' },
        { step: 5, title: 'Follow-up Care', description: 'Continue monitoring and apply follow-up treatments as needed.' }
      ]);
    } finally {
      setLoadingSteps(false);
    }
  };

  const loadTreatmentDuration = async (diseaseName: string) => {
    setLoadingDuration(true);
    try {
      const response = await fetch('/api/treatment/duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disease: diseaseName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTreatmentDuration(data.duration || '14-21 days');
          setSuccessRate(data.success_rate || 87);
        }
      }
    } catch (error) {
      console.error('Error loading treatment duration:', error);
      // Keep fallback values
    } finally {
      setLoadingDuration(false);
    }
  };

  const addToActiveTreatments = () => {
    if (results) {
      const treatment = {
        id: Date.now().toString(),
        disease: results.disease,
        startDate: new Date().toISOString(),
        status: 'active',
        progress: 0,
        duration: treatmentDuration,
        successRate: successRate,
        nextAction: treatmentSteps.length > 0 ? treatmentSteps[0].title : 'Remove affected parts and apply treatment',
        image: plantImage,
        severity: results.severity,
        confidence: results.confidence,
        fertilizers: fertilizers,
        steps: treatmentSteps.map((step, index) => ({
          step: step.step,
          title: step.title,
          description: step.description,
          completed: false,
          dueDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString()
        }))
      };
      
      const existingTreatments = JSON.parse(localStorage.getItem('active_treatments') || '[]');
      existingTreatments.push(treatment);
      localStorage.setItem('active_treatments', JSON.stringify(existingTreatments));
      
      toast({
        title: "✅ Treatment Saved!",
        description: "Added to your active treatments with AI-powered guidance and fertilizer recommendations."
      });
      
      // No automatic navigation - user stays on results page
    }
  };

  const handleFertilizerRecommendation = (fertilizerName: string) => {
    // Store fertilizer search query and navigate to shop
    localStorage.setItem('fertilizer_search', fertilizerName);
    navigate('/shop?search=' + encodeURIComponent(fertilizerName));
  };

  const getStepColor = (stepNumber: number) => {
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[(stepNumber - 1) % colors.length];
  };

  if (!results) {
    return (
      <div className="mobile-container">
        <div className="mobile-content flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-agri-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold text-agri-accent mb-2">No Results Found</h2>
            <p className="text-agri-gray mb-4">Please diagnose a plant first.</p>
            <Button onClick={() => navigate('/diagnose')}>
              Start Diagnosis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
          <h1 className="text-xl font-bold text-agri-accent">Diagnosis Results</h1>
        </div>
      </div>

      <div className="mobile-content space-y-6 pt-4">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-agri-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-agri-success animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold text-agri-accent mb-2">Diagnosis Complete</h1>
          <p className="text-agri-gray">
            Analyzed on {new Date(results.detectedDate).toLocaleDateString()}
          </p>
        </div>

        {/* Plant Image */}
        {plantImage && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            <img 
              src={plantImage} 
              alt="Diagnosed plant" 
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 bg-green-500 rounded-full p-3 shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm font-medium opacity-90">Analyzed Image</div>
              <div className="text-xs opacity-70">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        )}

        {/* Disease Detection */}
        <div className={`plant-card border-l-4 ${results.isHealthy ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-2 ${results.isHealthy ? 'text-green-700' : 'text-red-700'}`}>
                {results.disease}
              </h2>
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Progress value={100} className="w-20 h-2" />
                  <span className={`text-sm font-medium ${results.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    100% Confidence
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  results.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {results.isHealthy ? 'HEALTHY' : 'NEEDS ATTENTION'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-agri-accent">Affected Area:</span>
                  <p className="text-agri-gray">{results.affectedArea}</p>
                </div>
                <div>
                  <span className="font-medium text-agri-accent">Stage:</span>
                  <p className="text-agri-gray">{results.stage}</p>
                </div>
              </div>
            </div>
            <AlertTriangle className={`w-8 h-8 ${results.isHealthy ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>

        {/* Treatment Timeline */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            {loadingDuration ? (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            ) : (
              <Clock className="w-6 h-6 text-blue-600" />
            )}
            <h3 className="font-bold text-blue-900">Treatment Timeline</h3>
            {loadingDuration && <span className="text-xs text-blue-600">Loading AI insights...</span>}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Recovery Duration:</span>
              <span className="font-semibold text-blue-900">{treatmentDuration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Success Rate:</span>
              <span className="font-semibold text-agri-success">{successRate}% farmers recovered</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Best Treatment Time:</span>
              <span className="font-semibold text-blue-900">Early morning</span>
            </div>
          </div>
          
          <Progress value={successRate} className="w-full h-2 mt-4" />
        </div>

        {/* Treatment Steps */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-500 rounded-full p-3">
              {loadingSteps ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Target className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Treatment Steps</h3>
              <p className="text-sm text-gray-600">
                {loadingSteps ? 'Loading AI-powered treatment plan...' : 'AI-generated steps for best results'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {loadingSteps ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                <span className="ml-2 text-gray-600">Generating personalized treatment steps...</span>
              </div>
            ) : (
              treatmentSteps.map((step) => (
                <div key={step.step} className="flex items-start space-x-4 p-4 bg-white rounded-2xl shadow-sm">
                  <div className={`${getStepColor(step.step)} text-white rounded-full p-2 text-sm font-bold flex-shrink-0`}>
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Add to Active Treatments */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Save Treatment Plan</h3>
              <p className="text-green-100 text-sm">Track progress with daily reminders and monitoring</p>
            </div>
            <Calendar className="w-10 h-10 text-green-200" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-white/20 rounded-2xl p-3">
              <div className="font-semibold mb-1">Duration</div>
              <div className="text-green-100">{treatmentDuration}</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-3">
              <div className="font-semibold mb-1">Success Rate</div>
              <div className="text-green-100">{successRate}% recovery</div>
            </div>
          </div>
          
          <Button 
            onClick={addToActiveTreatments}
            className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Save to My Treatments
          </Button>
        </div>

        {/* Fertilizer Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-agri-accent">Recommended Fertilizers</h2>
            {loadingFertilizers && (
              <Loader2 className="w-5 h-5 text-agri-accent animate-spin" />
            )}
          </div>
          {loadingFertilizers && (
            <p className="text-sm text-gray-600">Getting AI-powered fertilizer recommendations...</p>
          )}
          
          {loadingFertilizers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading fertilizer recommendations...</span>
            </div>
          ) : (
            fertilizers.map((fertilizer, index) => (
              <div key={index} className="plant-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-agri-accent">{fertilizer.name}</h3>
                    <p className="text-lg font-bold text-agri-primary">{fertilizer.price}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      fertilizer.availability === 'In Stock' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {fertilizer.availability}
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleFertilizerRecommendation(fertilizer.name)}
                  disabled={fertilizer.availability !== 'In Stock'}
                  className="w-full"
                  variant={fertilizer.availability === 'In Stock' ? "default" : "outline"}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {fertilizer.availability === 'In Stock' ? 'Order Now' : 'Check Alternatives'}
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Alternative Options */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-agri-accent">Alternative Options</h2>
          
          {/* Nearby Shops */}
          <div className="plant-card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Visit Nearby Fertilizer Shops</h3>
                <p className="text-white/90 text-sm mb-4">Get directions and contact details</p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>3 shops within 5km</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>GPS navigation available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Expert advice included</span>
                  </div>
                </div>
              </div>
              <MapPin className="w-8 h-8 opacity-80" />
            </div>
            
            <Button 
              onClick={() => navigate('/nearby-shops')}
              className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find Nearest Shops
            </Button>
          </div>

        </div>

        {/* Action Summary */}
        <div className="bg-agri-cream rounded-xl p-4 border border-agri-primary/20">
          <h3 className="font-semibold text-agri-accent mb-2">Next Steps Summary:</h3>
          <ol className="space-y-1 text-sm text-agri-gray">
            <li>1. Add to active treatments for monitoring</li>
            <li>2. Order recommended fertilizers</li>
            <li>3. Apply treatment in early morning</li>
            <li>4. Monitor progress daily</li>
            <li>5. Expect recovery in {treatmentDuration}</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DiagnoseResults;