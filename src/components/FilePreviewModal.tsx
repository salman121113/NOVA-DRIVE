import React, { useEffect, useState } from 'react';
import { X, Download, File } from 'lucide-react';
import { DriveFile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface FilePreviewModalProps {
  file: DriveFile | null;
  onClose: () => void;
  onDownload: (file: DriveFile) => void;
}

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const headerVariants = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -50, opacity: 0 }
};

const contentVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

export function FilePreviewModal({ file, onClose, onDownload }: FilePreviewModalProps) {
  const [url, setUrl] = useState(null as string | null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file.data);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setUrl(null);
    }
  }, [file]);

  const isImage = file?.type.startsWith('image/');
  const isVideo = file?.type.startsWith('video/');
  const isAudio = file?.type.startsWith('audio/');

  return (
    <AnimatePresence>
      {file && url && (
        <motion.div 
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        >
          {/* Header */}
          <motion.div 
            variants={headerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/60 to-transparent z-10"
          >
            <span className="truncate max-w-[70%] font-medium">{file.name}</span>
            <div className="flex gap-4">
              <button 
                onClick={() => onDownload(file)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full h-full flex items-center justify-center p-4 md:p-12"
          >
            {isImage && (
              <img src={url} alt={file.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
            )}
            {isVideo && (
              <video src={url} controls autoPlay className="max-w-full max-h-full drop-shadow-2xl rounded-lg" />
            )}
            {isAudio && (
              <div className="bg-gray-900 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-2xl w-full max-w-md">
                <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <File className="w-12 h-12 text-blue-500" />
                </div>
                <p className="text-white text-center font-medium truncate w-full">{file.name}</p>
                <audio src={url} controls autoPlay className="w-full" />
              </div>
            )}
            {!isImage && !isVideo && !isAudio && (
              <div className="bg-gray-900 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-2xl">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                  <File className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-2">No preview available</p>
                  <p className="text-gray-400 text-sm mb-6 max-w-xs truncate">{file.name}</p>
                  <button 
                    onClick={() => onDownload(file)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
