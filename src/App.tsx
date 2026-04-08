import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FileBrowser } from './components/FileBrowser';
import { AdModal } from './components/AdModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { BannerAd } from './components/BannerAd';
import { PromoModal } from './components/PromoModal';
import { NewFolderModal } from './components/NewFolderModal';
import { useDrive } from './hooks/useDrive';
import { DriveFile } from './types';
import { Plus, FolderPlus, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ViewType = 'drive' | 'recent' | 'starred' | 'trash';

const fabMenuVariants = {
  initial: { opacity: 0, y: 20, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.8 }
};

const uploadPanelVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 }
};

const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { ease: "linear", duration: 0.1 }
  })
};

const fabVariants = {
  initial: { rotate: 0 },
  animate: (isOpen: boolean) => ({
    rotate: isOpen ? 45 : 0
  })
};

export default function App() {
  const {
    files,
    folders,
    currentFolderId,
    setCurrentFolderId,
    quotaBytes,
    usedBytes,
    isLoading,
    uploadingFiles,
    addFiles,
    createFolder,
    deleteFile,
    deleteFolder,
    bulkDelete,
    bulkToggleTrash,
    emptyTrash,
    toggleStar,
    toggleTrash,
    addStorageQuota,
    applyPromoCode,
    getBreadcrumbs,
    downloadFile
  } = useDrive();

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null as DriveFile | null);
  const [currentView, setCurrentView] = useState('drive' as ViewType);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showUploadProgress, setShowUploadProgress] = useState(true);

  const handleNewFolder = (name: string) => {
    createFolder(name);
  };

  const handleUploadClick = () => {
    document.getElementById('file-upload-input')?.click();
    setIsFabOpen(false);
    setShowUploadProgress(true);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setCurrentFolderId(null);
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans relative">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        usedBytes={usedBytes} 
        quotaBytes={quotaBytes} 
        onGetMoreStorage={() => setIsAdModalOpen(true)}
        onNewFolder={() => setIsNewFolderModalOpen(true)}
        onUploadFile={handleUploadClick}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <BannerAd />
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onProfileClick={() => setIsPromoModalOpen(true)}
        />
        
        <FileBrowser 
          files={files}
          folders={folders}
          breadcrumbs={getBreadcrumbs()}
          onNavigate={setCurrentFolderId}
          onUpload={(files) => {
            setShowUploadProgress(true);
            addFiles(files);
          }}
          onDeleteFile={deleteFile}
          onDeleteFolder={deleteFolder}
          onBulkDelete={bulkDelete}
          onBulkToggleTrash={bulkToggleTrash}
          onEmptyTrash={emptyTrash}
          onToggleStar={toggleStar}
          onToggleTrash={toggleTrash}
          onDownloadFile={downloadFile}
          onPreviewFile={setPreviewFile}
          currentView={currentView}
        />
      </div>

      {/* Mobile Floating Action Button */}
      {currentView === 'drive' && (
        <div className="fixed bottom-6 right-6 md:hidden z-40 flex flex-col items-end gap-3">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div 
                variants={fabMenuVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-end gap-3"
              >
                <button 
                  onClick={() => { setIsNewFolderModalOpen(true); setIsFabOpen(false); }}
                  className="bg-white text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 pr-4"
                >
                  <FolderPlus size={20} className="text-blue-600" />
                  <span className="font-medium text-sm">New Folder</span>
                </button>
                <button 
                  onClick={handleUploadClick}
                  className="bg-white text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 pr-4"
                >
                  <Upload size={20} className="text-blue-600" />
                  <span className="font-medium text-sm">Upload File</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button 
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
            variants={fabVariants}
            initial="initial"
            animate="animate"
            custom={isFabOpen}
          >
            <Plus size={24} />
          </motion.button>
        </div>
      )}

      {/* Upload Progress Panel */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && showUploadProgress && (
          <motion.div 
            variants={uploadPanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium text-sm">Uploading {uploadingFiles.length} item{uploadingFiles.length !== 1 ? 's' : ''}</h3>
              <button onClick={() => setShowUploadProgress(false)} className="text-gray-300 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-4 space-y-4">
              {uploadingFiles.map(file => (
                <div key={file.id} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-700">
                    <span className="truncate pr-2 font-medium">{file.name}</span>
                    <span>{Math.round(file.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <motion.div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      variants={progressVariants}
                      initial="initial"
                      animate="animate"
                      custom={file.progress}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdModal 
        isOpen={isAdModalOpen} 
        onClose={() => setIsAdModalOpen(false)} 
        onReward={() => addStorageQuota(2)} 
      />

      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onApplyCode={applyPromoCode}
      />

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onCreate={handleNewFolder}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={downloadFile}
      />
    </div>
  );
}


