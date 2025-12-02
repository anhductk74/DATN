"use client";

import React, { useState } from "react";
import { Modal, App as AntApp } from "antd";
import { 
  Wand2, 
  Layers, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Info,
  Maximize2,
  X
} from "lucide-react";
import {
  GarmentItem,
  ProcessingStatus,
  GARMENT_TYPES,
} from "@/types/virtualTryOn";
import FileUploader from "./virtualTryOn/FileUploader";
import GarmentItemComponent from "./virtualTryOn/GarmentItem";
import ImageModal from "./virtualTryOn/ImageModal";
import { VirtualTryOnService } from "@/services/VirtualTryOnService";

interface VirtualTryOnProps {
  open: boolean;
  onClose: () => void;
}

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ open, onClose }) => {
  const { message: messageApi } = AntApp.useApp();
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string>("");
  const [garments, setGarments] = useState<GarmentItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractingAll, setExtractingAll] = useState(false);
  const [resultImage, setResultImage] = useState<string>("");
  const [globalError, setGlobalError] = useState<string>("");
  const [expandedImage, setExpandedImage] = useState<string>("");
  
  // Temporary storage for images (persists during session)
  const [savedImages, setSavedImages] = useState<{
    model?: string;
    garments: Array<{ id: string; type: string; preview: string; extracted?: string }>;
    results: Array<{ timestamp: number; image: string }>;
  }>({ garments: [], results: [] });

  const handleReset = () => {
    // Save current state before reset
    if (modelPreview) {
      setSavedImages(prev => ({ ...prev, model: modelPreview }));
    }
    if (garments.length > 0) {
      setSavedImages(prev => ({
        ...prev,
        garments: garments.map(g => ({
          id: g.id,
          type: g.type,
          preview: g.preview,
          extracted: g.extractedBase64
        }))
      }));
    }
    if (resultImage) {
      setSavedImages(prev => ({
        ...prev,
        results: [...prev.results, { timestamp: Date.now(), image: resultImage }]
      }));
    }
    
    setModelImage(null);
    setModelPreview("");
    setGarments([]);
    setResultImage("");
    setGlobalError("");
    setProcessing(false);
    setExtractingAll(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const loadSavedModel = () => {
    if (savedImages.model) {
      setModelPreview(savedImages.model);
      fetch(savedImages.model)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "saved-model.png", { type: "image/png" });
          setModelImage(file);
        });
      messageApi.success("Model image restored!");
    }
  };

  const loadSavedGarment = (garmentData: { id: string; type: string; preview: string; extracted?: string }) => {
    const newGarment: GarmentItem = {
      id: crypto.randomUUID(),
      file: null,
      type: garmentData.type as GarmentItem["type"],
      preview: garmentData.preview,
      status: garmentData.extracted ? ProcessingStatus.COMPLETED : ProcessingStatus.PENDING,
      customPrompt: "",
      extractedBase64: garmentData.extracted
    };
    
    fetch(garmentData.preview)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "saved-garment.png", { type: "image/png" });
        setGarments(prev => [...prev, { ...newGarment, file }]);
      });
    messageApi.success("Garment restored!");
  };

  const loadSavedResult = (resultData: { timestamp: number; image: string }) => {
    setResultImage(resultData.image);
    messageApi.success("Result image restored!");
  };

  const clearAllSaved = () => {
    setSavedImages({ garments: [], results: [] });
    messageApi.info("All saved images cleared!");
  };

  const handleModelUpload = (file: File, preview: string) => {
    const validation = VirtualTryOnService.validateImageFile(file);
    if (!validation.valid) {
      messageApi.error(validation.error);
      return;
    }
    setModelImage(file);
    setModelPreview(preview);
  };

  const addGarment = (type: typeof GARMENT_TYPES[number]["value"]) => {
    const newGarment: GarmentItem = {
      id: crypto.randomUUID(),
      file: null,
      type: type as GarmentItem["type"],
      preview: "",
      status: ProcessingStatus.PENDING,
      customPrompt: "",
    };
    setGarments([...garments, newGarment]);
  };

  const removeGarment = (id: string) => {
    setGarments(garments.filter((g) => g.id !== id));
  };

  const updateGarmentImage = (id: string, file: File, preview: string) => {
    const validation = VirtualTryOnService.validateImageFile(file);
    if (!validation.valid) {
      messageApi.error(validation.error);
      return;
    }

    setGarments(
      garments.map((g) =>
        g.id === id
          ? {
              ...g,
              file,
              preview,
              status: ProcessingStatus.PENDING,
              extractedBase64: undefined,
            }
          : g
      )
    );
  };

  const updateGarmentPrompt = (id: string, prompt: string) => {
    setGarments(
      garments.map((g) => (g.id === id ? { ...g, customPrompt: prompt } : g))
    );
  };

  const retryExtraction = async (id: string) => {
    setGarments((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: ProcessingStatus.PROCESSING,
              extractedBase64: undefined,
              errorMessage: undefined,
            }
          : g
      )
    );

    const garment = garments.find((g) => g.id === id);
    if (!garment || !garment.file) return;

    try {
      const extractResult = await VirtualTryOnService.extractGarment({
        garmentImage: garment.file,
        garmentType: garment.type,
        customPrompt: garment.customPrompt,
      });

      if (extractResult.success && extractResult.image_base64) {
        setGarments((prev) =>
          prev.map((g) =>
            g.id === id
              ? {
                  ...g,
                  status: ProcessingStatus.COMPLETED,
                  extractedBase64: extractResult.image_base64,
                }
              : g
          )
        );
      } else {
        throw new Error("Extraction failed");
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Extraction failed";
      const displayError = errMsg.includes('400') 
        ? "Invalid image file" 
        : errMsg.includes('500')
        ? "AI extraction error"
        : "Extraction failed";
      
      setGarments((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                status: ProcessingStatus.FAILED,
                errorMessage: displayError,
              }
            : g
        )
      );
    }
  };

  const processExtraction = async () => {
    const pendingGarments = garments.filter(
      (g) =>
        (g.status === ProcessingStatus.PENDING ||
          g.status === ProcessingStatus.FAILED) &&
        g.file
    );

    if (pendingGarments.length === 0) return;

    setExtractingAll(true);
    setGlobalError("");

    await Promise.all(
      garments.map(async (garment) => {
        if (
          (garment.status === ProcessingStatus.PENDING ||
            garment.status === ProcessingStatus.FAILED) &&
          garment.file
        ) {
          setGarments((prev) =>
            prev.map((g) =>
              g.id === garment.id
                ? { ...g, status: ProcessingStatus.PROCESSING }
                : g
            )
          );

          try {
            const extractResult = await VirtualTryOnService.extractGarment({
              garmentImage: garment.file,
              garmentType: garment.type,
              customPrompt: garment.customPrompt,
            });

            if (extractResult.success && extractResult.image_base64) {
              setGarments((prev) =>
                prev.map((g) =>
                  g.id === garment.id
                    ? {
                        ...g,
                        status: ProcessingStatus.COMPLETED,
                        extractedBase64: extractResult.image_base64,
                      }
                    : g
                )
              );
            } else {
              throw new Error("Extraction failed");
            }
          } catch (error) {
            console.error(`Failed to extract garment ${garment.id}`, error);
            const errMsg = error instanceof Error ? error.message : "Extraction failed";
            const displayError = errMsg.includes('400') 
              ? "Invalid image file" 
              : errMsg.includes('500')
              ? "AI extraction error"
              : "Extraction failed";
            
            setGarments((prev) =>
              prev.map((g) =>
                g.id === garment.id
                  ? {
                      ...g,
                      status: ProcessingStatus.FAILED,
                      errorMessage: displayError,
                    }
                  : g
              )
            );
          }
        }
      })
    );

    setExtractingAll(false);
  };

  const processMix = async () => {
    if (!modelImage) {
      setGlobalError("Please upload a model image first.");
      return;
    }

    const readyGarments = garments.filter(
      (g) => g.status === ProcessingStatus.COMPLETED && g.extractedBase64
    );
    if (readyGarments.length === 0) {
      setGlobalError(
        "Please extract at least one outfit item successfully before mixing."
      );
      return;
    }

    setProcessing(true);
    setGlobalError("");
    setResultImage("");

    try {
      // Convert base64 to Blob files
      const extractedFiles = readyGarments.map((g) => ({
        type: g.type,
        file: VirtualTryOnService.base64ToBlob(g.extractedBase64!),
      }));

      const mixResult = await VirtualTryOnService.mixOutfit({
        modelImage,
        extractedFiles,
      });

      if (mixResult.success && mixResult.image_base64) {
        setResultImage(mixResult.image_base64);
        messageApi.success("Try-on successful! 🎉");
      } else {
        throw new Error(mixResult.error || "Unable to mix outfit");
      }
    } catch (error) {
      console.error("Mixing failed", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Parse specific API errors
      let displayError = errorMessage;
      if (errorMessage.includes('413')) {
        displayError = "Image too large. Try compressing your images to under 5MB each.";
      } else if (errorMessage.includes('400')) {
        displayError = "Invalid request. Ensure all files are valid images (JPG/PNG/WEBP).";
      } else if (errorMessage.includes('500')) {
        displayError = "AI processing error. Try again or use different images.";
      } else if (errorMessage.includes('Network')) {
        displayError = "Cannot connect to AI server. Ensure Python backend is running on localhost:5001.";
      }
      
      setGlobalError(`❌ ${displayError}`);
      messageApi.error(displayError);
    } finally {
      setProcessing(false);
    }
  };

  const hasPendingItems = garments.some(
    (g) =>
      (g.status === ProcessingStatus.PENDING ||
        g.status === ProcessingStatus.FAILED) &&
      g.file
  );
  const hasReadyItems = garments.some(
    (g) => g.status === ProcessingStatus.COMPLETED && g.extractedBase64
  );

  return (
    <>
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={1200}
        closeIcon={<X className="text-gray-500 hover:text-gray-700" />}
        destroyOnClose
        centered
        className="virtual-tryon-modal"
        styles={{
          content: {
            background: "white",
            borderRadius: "16px",
            padding: 0,
          },
        }}
      >
        <div className="bg-white text-gray-900">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-b p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Layers className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Virtual Try-On</h1>
                <p className="text-xs text-blue-100">Powered by Gemini AI - Preserves Your Model 100%</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[70vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="lg:col-span-7 space-y-6">
              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">1</span>
                  Upload Model
                </h2>
                <div className="h-80">
                  <FileUploader
                    label="Upload Photo of Person"
                    onFileSelect={handleModelUpload}
                    preview={modelPreview}
                    imageFit="contain"
                    className="h-full"
                  />
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">2</span>
                    Prepare Outfit
                  </h2>
                  <select
                    className="bg-white border border-gray-300 text-sm rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    onChange={(e) => {
                      if (e.target.value) {
                        addGarment(e.target.value as typeof GARMENT_TYPES[number]["value"]);
                        e.target.value = "";
                      }
                    }}
                    value=""
                  >
                    <option value="">+ Add Item</option>
                    {GARMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 mb-6">
                  {garments.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl text-gray-500">
                      Select a type above to add outfit pieces
                    </div>
                  )}
                  {garments.map((garment) => (
                    <GarmentItemComponent
                      key={garment.id}
                      garment={garment}
                      onRemove={removeGarment}
                      onUpdateImage={updateGarmentImage}
                      onUpdatePrompt={updateGarmentPrompt}
                      onRetry={retryExtraction}
                    />
                  ))}
                </div>

                {garments.length > 0 && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={processExtraction}
                      disabled={!hasPendingItems || extractingAll}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        !hasPendingItems
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                      }`}
                    >
                      {extractingAll ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
                      {extractingAll ? "Extracting..." : "Separate & Process Items"}
                    </button>
                  </div>
                )}
              </section>
            </div>

            <div className="lg:col-span-5">
              <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sticky top-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">3</span>
                  Final Result
                </h2>

                {globalError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-sm flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {globalError}
                  </div>
                )}

                <div
                  className={`h-96 bg-gray-50 rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-200 group mb-4 ${
                    resultImage ? "cursor-zoom-in" : ""
                  }`}
                  onClick={() => resultImage && setExpandedImage(resultImage)}
                >
                  {resultImage ? (
                    <>
                      <img src={resultImage} alt="Final Try On" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white text-sm font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                          <Maximize2 size={16} /> Click to Expand
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 max-w-xs">
                      {processing ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Wand2 size={20} className="text-indigo-500" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-gray-900 font-medium">Mixing Outfit...</h3>
                            <p className="text-gray-500 text-sm">AI is blending your selected items onto the model.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                            <Layers size={32} />
                          </div>
                          <h3 className="text-gray-900 font-medium mb-2">Ready to Mix</h3>
                          <p className="text-gray-500 text-sm">Upload model, extract items, then generate the final result.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={processMix}
                  disabled={!modelImage || !hasReadyItems || processing || extractingAll}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-md ${
                    !modelImage || !hasReadyItems
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {processing ? "Generating..." : "Generate Try-On"}
                </button>

                {resultImage && (
                  <a
                    href={resultImage}
                    download="virtual-tryon-result.png"
                    className="mt-3 block w-full py-3 text-center rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Download size={16} className="inline mr-2" />
                    Download Result
                  </a>
                )}

                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs space-y-2">
                  <div className="flex gap-2 text-blue-700">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p><strong>Model Preservation:</strong> Your model&apos;s face, pose, lighting & background stay 100% unchanged - only outfit changes.</p>
                  </div>
                  <p className="text-blue-600 pl-5">💡 For better results, use clear full-body photos and high-quality outfit images.</p>
                </div>

                {/* Saved Images Section */}
                {(savedImages.model || savedImages.garments.length > 0 || savedImages.results.length > 0) && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <RefreshCw size={14} className="text-purple-600" />
                        Saved Images (Session)
                      </h3>
                      <button
                        onClick={clearAllSaved}
                        className="text-[10px] text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {savedImages.model && (
                        <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-purple-100">
                          <div className="flex items-center gap-2">
                            <img src={savedImages.model} alt="Saved model" className="w-10 h-10 rounded object-cover" />
                            <span className="text-xs text-gray-700 font-medium">Model Photo</span>
                          </div>
                          <button
                            onClick={loadSavedModel}
                            className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Restore
                          </button>
                        </div>
                      )}

                      {savedImages.garments.map((garment, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-2 border border-purple-100">
                          <div className="flex items-center gap-2">
                            <img src={garment.preview} alt={garment.type} className="w-10 h-10 rounded object-cover" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-700 font-medium capitalize">{garment.type}</span>
                              {garment.extracted && (
                                <span className="text-[10px] text-green-600">✓ Extracted</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => loadSavedGarment(garment)}
                            className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Restore
                          </button>
                        </div>
                      ))}

                      {savedImages.results.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-2 border border-purple-100">
                          <div className="flex items-center gap-2">
                            <img src={result.image} alt="Result" className="w-10 h-10 rounded object-cover" />
                            <span className="text-xs text-gray-700 font-medium">
                              Result {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <button
                            onClick={() => loadSavedResult(result)}
                            className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </Modal>

      <ImageModal
        isOpen={!!expandedImage}
        imageUrl={expandedImage}
        onClose={() => setExpandedImage("")}
        title="Virtual Try-On Result"
      />

      <style jsx global>{`
        .virtual-tryon-modal .ant-modal-content {
          padding: 0 !important;
        }
      `}</style>
    </>
  );
};

export default VirtualTryOn;
