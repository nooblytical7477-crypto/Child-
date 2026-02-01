import React, { useState } from 'react';
import { Layout } from './Layout';
import { ImageUploader } from './components/ImageUploader';
import { CameraCapture } from './components/CameraCapture';
import { Button } from './components/Button';
import { generateFutureSelf } from './services/geminiService';
import { AppState } from './types';

// Helper to resize image and convert to Base64
const resizeImage = (file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Get Base64, remove prefix
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      img.onerror = (error) => reject(new Error("Failed to load image for resizing"));
    };
    reader.onerror = (error) => reject(new Error("Failed to read file"));
  });
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAppState(AppState.PREVIEW);
  };

  const handleCameraCapture = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAppState(AppState.PREVIEW);
  };

  const handleGenerate = async () => {
    if (!selectedFile || !prompt.trim()) return;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      let base64;
      try {
        base64 = await resizeImage(selectedFile);
      } catch (resizeError) {
        throw new Error("Failed to process image. Please try a different photo.");
      }
      
      const resultUrl = await generateFutureSelf(base64, 'image/jpeg', prompt);
      
      setGeneratedImage(resultUrl);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please try again.");
      setAppState(AppState.PREVIEW);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-14 px-4 animate-fade-in">
          <div className="inline-block px-3 py-1 bg-red-50 text-[#c02126] text-xs font-bold tracking-wider uppercase rounded-full mb-4 border border-red-100">
            Powered by Gemini AI
          </div>
          <h1 className="text-4xl sm:text-6xl font-oswald font-bold text-slate-900 mb-4 tracking-tight leading-tight">
            EMBRACE YOUR <span className="text-[#c02126]">BEGINNINGS</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Travel back in time. Upload a photo and describe your childhood dream to see your younger self brought to life.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-red-900/5 overflow-hidden border border-slate-100 min-h-[500px] flex flex-col relative transition-all duration-500">
          
          {/* STEP 1: UPLOAD or CAMERA */}
          {appState === AppState.IDLE && (
            <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-12 animate-fade-in bg-gradient-to-b from-white to-slate-50">
              <div className="w-full max-w-xl">
                 <ImageUploader 
                  onFileSelect={handleFileSelect} 
                  onCameraSelect={() => setAppState(AppState.CAPTURING)} 
                />
              </div>
              <p className="mt-8 text-slate-400 text-sm">Safe & Secure processing on Vercel</p>
            </div>
          )}

          {/* STEP 2: CAMERA CAPTURE */}
          {appState === AppState.CAPTURING && (
            <div className="flex-grow bg-black animate-fade-in relative">
              <CameraCapture 
                onCapture={handleCameraCapture} 
                onCancel={() => setAppState(AppState.IDLE)} 
              />
            </div>
          )}

          {/* STEP 3: PREVIEW & PROMPT */}
          {appState === AppState.PREVIEW && previewUrl && (
            <div className="flex-grow flex flex-col lg:flex-row animate-fade-in h-full">
              {/* Image Side */}
              <div className="w-full lg:w-5/12 bg-slate-100 flex flex-col items-center justify-center p-6 lg:border-r border-slate-200 relative">
                 <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 rotate-1 transform hover:rotate-0 transition-transform duration-300">
                   <img 
                    src={previewUrl} 
                    alt="Current You" 
                    className="w-full h-auto max-h-[350px] rounded-lg object-contain" 
                  />
                 </div>
                 <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Original Photo</p>
                 
                 <button 
                    onClick={resetApp}
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-600 hover:text-[#c02126] px-3 py-1.5 rounded-lg shadow-sm text-sm font-medium transition-colors border border-slate-200"
                  >
                    ← Back
                  </button>
              </div>

              {/* Prompt Side */}
              <div className="w-full lg:w-7/12 p-8 lg:p-12 flex flex-col justify-center bg-white">
                <div className="max-w-lg mx-auto w-full">
                  <h3 className="text-2xl font-oswald font-bold text-slate-900 mb-2">The Memory</h3>
                  <p className="text-slate-500 mb-6">What did you love doing as a kid? Or what was your biggest dream?</p>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <textarea
                        id="prompt"
                        rows={4}
                        className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-[#c02126] transition-colors resize-none bg-slate-50 text-slate-800 placeholder-slate-400 text-lg leading-relaxed"
                        placeholder="e.g. Playing with a toy spaceship in the backyard, wearing an astronaut helmet..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                      <div className="absolute top-3 right-3 text-[#c02126] opacity-20 pointer-events-none">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H7.19934C9.13982 16 10.9791 14.8858 11.9654 13.1787L14.017 9.62776L16.0687 13.1787C17.0549 14.8858 18.8942 16 20.8347 16H16.017C14.9124 16 14.017 16.8954 14.017 18L14.017 21H14.017ZM12.017 6.37224L9.96543 2.82129C8.97911 1.11417 7.13982 0 5.19934 0H10.017C11.1216 0 12.017 0.895431 12.017 2V5H12.017C12.017 6.10457 12.9124 7 14.017 7H19.017C18.9175 7 18.8188 6.99615 18.721 6.9885C18.817 6.98319 18.9149 6.98595 19.0108 6.99672C20.8407 7.20233 22.4287 8.24587 23.3614 9.86047L21.3098 13.4115C20.3235 15.1186 18.4842 16.2328 16.5437 16.2328H14.017V18C14.017 19.1046 13.1216 20 12.017 20H4.01697C2.9124 20 2.01697 19.1046 2.01697 18V16.2328H0.199341C1.22906 14.451 3.10906 13.2328 5.19934 13.2328H10.017C11.1216 13.2328 12.017 12.3374 12.017 11.2328V6.37224Z" /></svg>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 text-[#c02126] rounded-xl text-sm border border-red-100 flex items-start gap-2">
                         <span className="text-xl">⚠️</span>
                         <span className="mt-0.5">{error}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button 
                        onClick={handleGenerate} 
                        fullWidth 
                        disabled={!prompt.trim()}
                        className="h-14 text-lg shadow-red-200"
                      >
                        Generate Vision
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GENERATING */}
          {appState === AppState.GENERATING && (
            <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-12 text-center animate-fade-in bg-white">
              <div className="relative w-32 h-32 mb-8">
                {/* Custom Spinner */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#c02126] border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">✨</span>
                </div>
              </div>
              <h3 className="text-2xl font-oswald font-bold text-slate-800 mb-3">Recreating Childhood...</h3>
              <p className="text-slate-500 max-w-md px-4 leading-relaxed">
                Traveling back to when you were young. <br/>
                <span className="italic text-[#c02126] font-medium">"{prompt}"</span>
              </p>
            </div>
          )}

          {/* STEP 5: RESULT */}
          {appState === AppState.RESULT && generatedImage && (
            <div className="flex-grow flex flex-col lg:flex-row animate-fade-in h-full bg-slate-900">
              
              {/* Image Container */}
              <div className="w-full lg:w-2/3 relative flex items-center justify-center bg-black/50 p-4 md:p-10 order-2 lg:order-1">
                 <img 
                    src={generatedImage} 
                    alt="Younger Self" 
                    className="w-auto h-auto max-h-[70vh] max-w-full rounded-lg shadow-2xl shadow-black/50 border border-white/10"
                  />
              </div>

              {/* Sidebar Controls */}
              <div className="w-full lg:w-1/3 bg-white p-8 flex flex-col justify-center order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-slate-200">
                  <div className="mb-8">
                    <h2 className="text-3xl font-oswald font-bold text-[#c02126] mb-2">IT'S YOU.</h2>
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Age: Approx 7 Years</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                    <p className="text-slate-600 italic leading-relaxed">"{prompt}"</p>
                  </div>
                  
                  <div className="space-y-4">
                    <a href={generatedImage} download="young-vision.png" className="block w-full">
                      <Button fullWidth className="h-12">Download Photo</Button>
                    </a>
                    <Button onClick={resetApp} variant="outline" fullWidth className="h-12 border-slate-300">
                      Try Another Memory
                    </Button>
                  </div>
              </div>

            </div>
          )}
        </div>
        
        {/* Footer Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-[#c02126] rounded-full flex items-center justify-center mb-3 text-xl">📸</div>
                <h4 className="font-oswald font-bold text-slate-800 text-lg">Upload</h4>
                <p className="text-sm text-slate-500">Share your current self</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-[#c02126] rounded-full flex items-center justify-center mb-3 text-xl">🎈</div>
                <h4 className="font-oswald font-bold text-slate-800 text-lg">Remember</h4>
                <p className="text-sm text-slate-500">Recall a childhood dream</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-[#c02126] rounded-full flex items-center justify-center mb-3 text-xl">✨</div>
                <h4 className="font-oswald font-bold text-slate-800 text-lg">Magic</h4>
                <p className="text-sm text-slate-500">See the child within</p>
             </div>
        </div>

      </div>
    </Layout>
  );
};

export default App;