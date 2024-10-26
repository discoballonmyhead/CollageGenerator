import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import CanvasDisplay from './components/CanvasDisplay';
import ResetButton from './components/ResetButton';
import ChunkSizeSlider from './components/ChunkSizeSlider';
import ImageScaleSlider from './components/ImageScaleSlider';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [chunkSize, setChunkSize] = useState<number>(32);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [mosaicReady, setMosaicReady] = useState<boolean>(false);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setMosaicReady(false);
  };

  const handleReset = () => {
    setImageFile(null);
    setMosaicReady(false);
    setChunkSize(32);
    setScaleFactor(1);
  };

  const handleProcessingChange = (isProcessing: boolean) => {
    setProcessing(isProcessing);
  };

  const handleMosaicReady = (isReady: boolean) => {
    setMosaicReady(isReady);
  };

  const isSliderDisabled = !imageFile || processing || mosaicReady;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Image to Dota 2 Ability Icons Collage Generator
        </h1>
        {!imageFile ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <>
            <ImageScaleSlider
              scaleFactor={scaleFactor}
              onScaleFactorChange={setScaleFactor}
              disabled={isSliderDisabled}
            />
            <ChunkSizeSlider
              chunkSize={chunkSize}
              onChunkSizeChange={setChunkSize}
              disabled={isSliderDisabled}
            />
            <CanvasDisplay
              imageFile={imageFile}
              chunkSize={chunkSize}
              scaleFactor={scaleFactor}
              processing={processing}
              mosaicReady={mosaicReady}
              onProcessingChange={handleProcessingChange}
              onMosaicReady={handleMosaicReady}
            />
            <ResetButton onReset={handleReset} />
          </>
        )}
      </div>
    </div>
  );
};

export default App;