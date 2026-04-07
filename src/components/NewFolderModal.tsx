import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewFolderModal({ isOpen, onClose, onCreate }: NewFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const inputRef = useRef<htmlinputelement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreate(folderName.trim());
      onClose();
    }
  };

  return (
    <animatepresence>
      {isOpen && (
        <motion.div initial="{{" opacity:="" 0="" }}="" animate="{{" opacity:="" 1="" }}="" exit="{{" opacity:="" 0="" }}="" classname="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial="{{" scale:="" 0.9,="" opacity:="" 0,="" y:="" 20="" }}="" animate="{{" scale:="" 1,="" opacity:="" 1,="" y:="" 0="" }}="" exit="{{" scale:="" 0.9,="" opacity:="" 0,="" y:="" 20="" }}="" transition="{{" type:="" "spring",="" damping:="" 25,="" stiffness:="" 300="" }}="" classname="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
            <div classname="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 classname="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <folderplus classname="w-5 h-5 text-blue-600"/>
                New Folder
              </h3>
              <button onclick="{onClose}" classname="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <x classname="w-5 h-5"/>
              </button>
            </div>
            <div classname="p-6">
              <form onsubmit="{handleSubmit}">
                <input ref="{inputRef}" type="text" value="{folderName}" onchange="{(e)" ==""> setFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-4"
                />
                <div classname="flex gap-3 justify-end">
                  <button type="button" onclick="{onClose}" classname="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled="{!folderName.trim()}" classname="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
