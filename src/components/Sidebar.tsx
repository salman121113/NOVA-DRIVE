import React from 'react';
import { HardDrive, Plus, Clock, Star, Trash2, PlaySquare } from 'lucide-react';
import { formatBytes } from '../lib/utils';
import { ViewType } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  usedBytes: number;
  quotaBytes: number;
  onGetMoreStorage: () => void;
  onNewFolder: () => void;
  onUploadFile: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const dropdownVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 }
};

export function Sidebar({ isOpen, onClose, usedBytes, quotaBytes, onGetMoreStorage, onNewFolder, onUploadFile, currentView, onViewChange }: SidebarProps) {
  const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-50 h-screen flex flex-col border-r border-gray-200 transform transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 text-gray-800 mb-6 px-2">
            <HardDrive className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-normal">NOVA Drive</span>
          </div>

          <div className="relative group">
            <button className="bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-200 rounded-2xl py-3 px-5 flex items-center gap-3 transition-shadow w-full mb-4">
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New</span>
            </button>
            
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 hidden group-hover:block z-50 overflow-hidden">
              <motion.div 
                variants={dropdownVariants}
                initial="initial"
                whileInView="animate"
                transition={{ duration: 0.2 }}
              >
                <button onClick={() => { onNewFolder(); onClose(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New folder</button>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={() => { onUploadFile(); onClose(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">File upload</button>
              </motion.div>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => { onViewChange('drive'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'drive' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <HardDrive className="w-5 h-5" />
              <span className="text-sm font-medium">My Drive</span>
            </button>
            <button 
              onClick={() => { onViewChange('recent'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'recent' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Recent</span>
            </button>
            <button 
              onClick={() => { onViewChange('starred'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'starred' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">Starred</span>
            </button>
            <button 
              onClick={() => { onViewChange('trash'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'trash' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm font-medium">Trash</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <HardDrive className="w-5 h-5" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            
            {quotaBytes >= 1000000000 * 1024 * 1024 * 1024 ? (
              <div className="mb-4">
                <p className="text-lg font-bold text-blue-600">Unlimited</p>
                <p className="text-xs text-gray-600 mt-1">
                  {formatBytes(usedBytes)} used
                </p>
              </div>
            ) : (
              <>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div 
                    className={`h-1.5 rounded-full ${percentage > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  {formatBytes(usedBytes)} of {formatBytes(quotaBytes)} used
                </p>
                <button 
                  onClick={() => { onGetMoreStorage(); onClose(); }}
                  className="w-full py-2 px-4 bg-white border border-gray-300 rounded-full text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <PlaySquare className="w-4 h-4" />
                  Get more storage
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
