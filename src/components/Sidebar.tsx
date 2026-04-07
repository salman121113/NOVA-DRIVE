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

export function Sidebar({ isOpen, onClose, usedBytes, quotaBytes, onGetMoreStorage, onNewFolder, onUploadFile, currentView, onViewChange }: SidebarProps) {
  const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  return (
    <>
      {/* Mobile Overlay */}
      <animatepresence>
        {isOpen && (
          <motion.div initial="{{" opacity:="" 0="" }}="" animate="{{" opacity:="" 1="" }}="" exit="{{" opacity:="" 0="" }}="" classname="fixed inset-0 bg-black/50 z-30 md:hidden" onclick="{onClose}"/>
        )}
      </AnimatePresence>

      <div classname="{`fixed" inset-y-0="" left-0="" z-40="" w-64="" bg-gray-50="" h-screen="" flex="" flex-col="" border-r="" border-gray-200="" transform="" transition-transform="" duration-300="" md:relative="" md:translate-x-0="" ${isopen="" ?="" 'translate-x-0'="" :="" '-translate-x-full'}`}="">
        <div classname="p-4">
          <div classname="flex items-center gap-2 text-gray-800 mb-6 px-2">
            <harddrive classname="w-8 h-8 text-blue-600"/>
            <span classname="text-2xl font-normal">NOVA Drive</span>
          </div>

          <div classname="relative group">
            <button classname="bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-200 rounded-2xl py-3 px-5 flex items-center gap-3 transition-shadow w-full mb-4">
              <plus classname="w-6 h-6"/>
              <span classname="text-sm font-medium">New</span>
            </button>
            
            <div classname="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 hidden group-hover:block z-50 overflow-hidden">
              <motion.div initial="{{" opacity:="" 0,="" y:="" -10="" }}="" whileinview="{{" opacity:="" 1,="" y:="" 0="" }}="" transition="{{" duration:="" 0.2="" }}="">
                <button onclick="{()" ==""> { onNewFolder(); onClose(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New folder</button>
                <div classname="border-t border-gray-100 my-1"></div>
                <button onclick="{()" ==""> { onUploadFile(); onClose(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">File upload</button>
              </motion.div>
            </div>
          </div>

          <nav classname="space-y-1">
            <button onclick="{()" ==""> { onViewChange('drive'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'drive' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <harddrive classname="w-5 h-5"/>
              <span classname="text-sm font-medium">My Drive</span>
            </button>
            <button onclick="{()" ==""> { onViewChange('recent'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'recent' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <clock classname="w-5 h-5"/>
              <span classname="text-sm font-medium">Recent</span>
            </button>
            <button onclick="{()" ==""> { onViewChange('starred'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'starred' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <star classname="w-5 h-5"/>
              <span classname="text-sm font-medium">Starred</span>
            </button>
            <button onclick="{()" ==""> { onViewChange('trash'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-2 rounded-full transition-colors ${currentView === 'trash' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <trash2 classname="w-5 h-5"/>
              <span classname="text-sm font-medium">Trash</span>
            </button>
          </nav>
        </div>

        <div classname="mt-auto p-4">
          <div classname="px-4 py-2">
            <div classname="flex items-center gap-2 text-gray-700 mb-2">
              <harddrive classname="w-5 h-5"/>
              <span classname="text-sm font-medium">Storage</span>
            </div>
            
            {quotaBytes >= 1000000000 * 1024 * 1024 * 1024 ? (
              <div classname="mb-4">
                <p classname="text-lg font-bold text-blue-600">Unlimited</p>
                <p classname="text-xs text-gray-600 mt-1">
                  {formatBytes(usedBytes)} used
                </p>
              </div>
            ) : (
              <>
                <div classname="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div classname="{`h-1.5" rounded-full="" ${percentage=""> 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p classname="text-xs text-gray-600 mb-4">
                  {formatBytes(usedBytes)} of {formatBytes(quotaBytes)} used
                </p>
                <button onclick="{()" ==""> { onGetMoreStorage(); onClose(); }}
                  className="w-full py-2 px-4 bg-white border border-gray-300 rounded-full text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <playsquare classname="w-4 h-4"/>
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
