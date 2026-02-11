
import React, { useState } from 'react';
import { BuilderStep } from './types';
import { MAX_FLOWERS } from './constants';
import DrawingCanvas from './components/DrawingCanvas';
import { generateBouquetFromSketches } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<BuilderStep>('DRAWING');
  const [drawings, setDrawings] = useState<string[]>([]);
  const [details, setDetails] = useState({
    sender: '',
    recipient: '',
    message: ''
  });
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const saveDrawing = (dataUrl: string) => {
    setDrawings(prev => [...prev, dataUrl]);
  };

  const handleCurate = async () => {
    if (!details.sender || !details.recipient) {
      alert("Please fill in the sender and recipient names.");
      return;
    }
    
    setStep('CURATING');
    setIsProcessing(true);
    
    try {
      const imageUrl = await generateBouquetFromSketches(
        drawings,
        details.sender,
        details.recipient
      );
      
      setFinalImage(imageUrl);
      setStep('FINAL');
    } catch (error) {
      console.error(error);
      alert("The floral studio is temporarily closed. Please try again in a moment.");
      setStep('DETAILS');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setStep('DRAWING');
    setDrawings([]);
    setDetails({ sender: '', recipient: '', message: '' });
    setFinalImage(null);
  };

  const canContinue = drawings.length >= 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="w-full text-center mb-8 mt-4">
        <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-2 tracking-tight">Floral Whisper</h1>
        <p className="text-gray-400 italic font-cursive text-xl md:text-2xl">Hand-Painted Digital Bouquet</p>
      </header>

      {/* Progress Stepper */}
      <div className="w-full max-w-xl mb-10 flex items-center justify-between relative px-2 no-print">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
        {[
          { key: 'DRAWING', label: 'Art' },
          { key: 'DETAILS', label: 'Message' },
          { key: 'FINAL', label: 'Gift' }
        ].map((s, idx) => (
          <div key={s.key} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 font-bold border-2 ${
              (step === 'DRAWING' && idx === 0) || 
              (step === 'DETAILS' && idx <= 1) || 
              (step === 'CURATING' && idx <= 1) ||
              (step === 'FINAL') 
              ? 'bg-pink-500 border-pink-500 text-white scale-110 shadow-lg' : 'bg-white border-gray-100 text-gray-300'
            }`}>
              {idx + 1}
            </div>
            <span className="text-[9px] mt-2 font-black text-gray-400 uppercase tracking-[0.3em]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step Contents */}
      <div className="w-full flex-grow flex flex-col items-center justify-center">
        
        {step === 'DRAWING' && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif text-gray-800 mb-2">Create your botanical art</h2>
              <p className="text-gray-500 text-sm">Draw 1 to {MAX_FLOWERS} flowers. Use different colors to make it pop!</p>
            </div>
            
            {drawings.length < MAX_FLOWERS && (
              <DrawingCanvas flowerIndex={drawings.length} onSave={saveDrawing} />
            )}

            {canContinue && (
              <div className="mt-8 flex flex-col items-center gap-4">
                {drawings.length < MAX_FLOWERS && (
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">or</p>
                )}
                <button 
                  onClick={() => setStep('DETAILS')}
                  className="bg-gray-900 text-white px-16 py-4 rounded-full font-bold text-lg hover:bg-black transition-all shadow-2xl hover:-translate-y-1 flex items-center gap-3"
                >
                  Proceed with {drawings.length} Flower{drawings.length > 1 ? 's' : ''}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Gallery */}
            <div className="mt-12 w-full max-w-4xl pb-10">
              <div className="flex flex-wrap justify-center gap-6">
                {drawings.map((src, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute -inset-2 bg-pink-100 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <img 
                      src={src} 
                      className="relative w-28 h-28 md:w-36 md:h-36 object-contain bg-white rounded-3xl border-2 border-white shadow-xl transition-all group-hover:scale-105"
                      alt={`Drawing ${i}`}
                    />
                    <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10">
                      #{i + 1}
                    </div>
                  </div>
                ))}
                {drawings.length < MAX_FLOWERS && (
                   <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 gap-1 bg-white/50">
                      <span className="text-2xl opacity-50">🌸</span>
                      <span className="font-serif italic text-[10px]">Flower {drawings.length + 1}</span>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'DETAILS' && (
          <div className="w-full max-w-xl bg-white p-8 md:p-14 rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-500 border border-gray-50">
            <h2 className="text-3xl font-serif text-gray-900 mb-8 text-center tracking-tight">Personalize Your Gift</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">From</label>
                  <input 
                    type="text" 
                    value={details.sender}
                    onChange={(e) => setDetails(prev => ({ ...prev, sender: e.target.value }))}
                    placeholder="Artist's Name"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-pink-200 focus:outline-none transition-all text-base font-serif"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">To</label>
                  <input 
                    type="text" 
                    value={details.recipient}
                    onChange={(e) => setDetails(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="Someone Special"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-pink-200 focus:outline-none transition-all text-base font-serif"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Message on Card</label>
                <textarea 
                  rows={5}
                  value={details.message}
                  onChange={(e) => setDetails(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Your handwritten note..."
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-pink-200 focus:outline-none transition-all text-base resize-none font-serif leading-relaxed"
                />
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  onClick={() => setStep('DRAWING')}
                  className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Edit Art
                </button>
                <button 
                  onClick={handleCurate}
                  className="flex-1 bg-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-pink-600 shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Create Masterpiece
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'CURATING' && (
          <div className="text-center py-20 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-12">
              <div className="w-48 h-48 border-[10px] border-pink-50 border-t-pink-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-6xl animate-bounce">🎨</span>
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl animate-pulse shadow-lg">✨</div>
            </div>
            <h2 className="text-4xl font-serif text-gray-900 mb-4 tracking-tight">Curating your hand-painted bouquet...</h2>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed font-medium">
              We're translating your specific cartoon sketches into a professionally arranged digital masterpiece.
            </p>
          </div>
        )}

        {step === 'FINAL' && finalImage && (
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center animate-in zoom-in-95 duration-1000">
            {/* Bouquet Display */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-6 bg-gradient-to-tr from-pink-300 via-rose-200 to-indigo-300 rounded-[4rem] blur-3xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border-[16px] border-white ring-1 ring-gray-100 transform transition-transform group-hover:rotate-1">
                <img 
                  src={finalImage} 
                  alt="Curated Bouquet" 
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
            </div>

            {/* Note Display */}
            <div className="bg-white p-12 md:p-16 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[600px] border border-pink-50/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-pink-50/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
              
              <div className="mb-12">
                <span className="text-pink-400 font-black tracking-[0.4em] text-[10px] uppercase block mb-4">Original Digital Art</span>
                <h3 className="text-5xl font-serif text-gray-900 leading-tight">For {details.recipient}</h3>
              </div>

              <div className="relative mb-14 bg-gray-50/50 p-8 rounded-3xl border border-white">
                <div className="absolute -left-4 -top-6 text-8xl text-pink-200 font-serif opacity-40 select-none">“</div>
                <p className="text-2xl font-serif text-gray-700 leading-relaxed italic relative z-10">
                  {details.message || "Thinking of you with these hand-drawn blooms."}
                </p>
                <div className="absolute -right-2 -bottom-10 text-8xl text-pink-200 font-serif opacity-40 select-none rotate-180">“</div>
              </div>

              <div className="mt-auto pt-10 border-t border-gray-100 flex items-end justify-between">
                <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Signed with Love</p>
                  <p className="text-4xl font-serif text-gray-900 leading-none">{details.sender || "An Artist"}</p>
                </div>
                <div className="text-4xl opacity-20 filter grayscale hover:grayscale-0 transition-all cursor-default">🎨</div>
              </div>

              <div className="mt-12 flex gap-4 no-print">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-50 text-gray-500 px-6 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-3 border border-gray-100"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                   Save Card
                </button>
                <button 
                  onClick={reset}
                  className="flex-1 bg-gray-900 text-white px-6 py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl hover:-translate-y-1"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <footer className="w-full mt-16 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.4em] pb-10 no-print">
        &copy; {new Date().getFullYear()} Floral Whisper &bull; Hand-Crafted &bull; AI Polished
      </footer>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #root { padding: 0; }
        }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

export default App;
