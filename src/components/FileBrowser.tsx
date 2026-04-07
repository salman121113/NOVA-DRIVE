import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Folder, File, FileImage, FileText, FileVideo, FileAudio, Download, Trash2, ChevronRight, Star, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { format } from 'date-fns';
import { DriveFile, DriveFolder } from '../types';
import { formatBytes } from '../lib/utils';
import { ViewType } from '../App';

interface FileBrowserProps {
  files: DriveFile[];
  folders: DriveFolder[];
  breadcrumbs: { id: string | null; name: string }[];
  onNavigate: (folderId: string | null) => void;
  onUpload: (files: File[]) => void;
  onDeleteFile: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onBulkDelete: (fileIds: string[], folderIds: string[]) => void;
  onBulkToggleTrash: (itemIds: {id: string, isFolder: boolean}[], forceRestore?: boolean) => void;
  onEmptyTrash: () => void;
  onToggleStar: (id: string, isFolder: boolean) => void;
  onToggleTrash: (id: string, isFolder: boolean) => void;
  onDownloadFile: (file: DriveFile) => void;
  onPreviewFile: (file: DriveFile) => void;
  currentView: ViewType;
}

export function FileBrowser({
  files,
  folders,
  breadcrumbs,
  onNavigate,
  onUpload,
  onDeleteFile,
  onDeleteFolder,
  onBulkDelete,
  onBulkToggleTrash,
  onEmptyTrash,
  onToggleStar,
  onToggleTrash,
  onDownloadFile,
  onPreviewFile,
  currentView
}: FileBrowserProps) {
  const [selectedIds, setSelectedIds] = useState<set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const timerRef = useRef<nodejs.timeout |="" null="">(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: onDrop as any, 
    noClick: true 
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <fileimage classname="w-6 h-6 text-red-500"/>;
    if (type.startsWith('video/')) return <filevideo classname="w-6 h-6 text-red-500"/>;
    if (type.startsWith('audio/')) return <fileaudio classname="w-6 h-6 text-red-500"/>;
    if (type.includes('pdf') || type.includes('document')) return <filetext classname="w-6 h-6 text-blue-500"/>;
    return <file classname="w-6 h-6 text-gray-500"/>;
  };

  let displayFiles = files;
  let displayFolders = folders;

  if (currentView === 'recent') {
    displayFolders = [];
    displayFiles = [...files].sort((a, b) => b.lastModified - a.lastModified);
  } else if (currentView === 'starred') {
    displayFolders = folders.filter(f => f.starred);
    displayFiles = files.filter(f => f.starred);
  } else if (currentView === 'trash') {
    displayFolders = folders.filter(f => f.trashed);
    displayFiles = files.filter(f => f.trashed);
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      return newSet;
    });
  };

  const handleTouchStart = (id: string) => {
    timerRef.current = setTimeout(() => {
      setIsSelectionMode(true);
      toggleSelection(id);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleItemClick = (item: DriveFile | DriveFolder, isFolder: boolean) => {
    if (isSelectionMode) {
      toggleSelection(item.id);
    } else {
      if (isFolder) {
        if (currentView === 'drive') onNavigate(item.id);
      } else {
        if (currentView !== 'trash') onPreviewFile(item as DriveFile);
      }
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = () => {
    if (currentView === 'trash') {
      const fileIds: string[] = [];
      const folderIds: string[] = [];
      selectedIds.forEach(id => {
        if (folders.some(f => f.id === id)) folderIds.push(id);
        else fileIds.push(id);
      });
      onBulkDelete(fileIds, folderIds);
    } else {
      const items = Array.from(selectedIds).map((id: string) => ({
        id,
        isFolder: folders.some(f => f.id === id)
      }));
      onBulkToggleTrash(items);
    }
    clearSelection();
  };

  const handleBulkRestore = () => {
    const items = Array.from(selectedIds).map((id: string) => ({
      id,
      isFolder: folders.some(f => f.id === id)
    }));
    onBulkToggleTrash(items, true);
    clearSelection();
  };

  return (
    <div classname="flex-1 flex flex-col bg-white overflow-hidden" {...getrootprops()}="">
      <input {...getinputprops()}="" id="file-upload-input"/>
      
      {/* Selection Action Bar */}
      {isSelectionMode && (
        <div classname="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
          <div classname="flex items-center gap-3">
            <button onclick="{clearSelection}" classname="p-1 hover:bg-blue-700 rounded-full">
              <x classname="w-5 h-5"/>
            </button>
            <span classname="font-medium">{selectedIds.size} selected</span>
          </div>
          <div classname="flex items-center gap-2">
            {currentView === 'trash' && (
              <button onclick="{handleBulkRestore}" classname="p-2 hover:bg-blue-700 rounded-full" title="Restore Selected">
                <rotateccw classname="w-5 h-5"/>
              </button>
            )}
            <button onclick="{handleBulkDelete}" classname="p-2 hover:bg-blue-700 rounded-full" title="{currentView" =="=" 'trash'="" ?="" "delete="" permanently"="" :="" "move="" to="" trash"}="">
              <trash2 classname="w-5 h-5"/>
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      {!isSelectionMode && currentView === 'drive' && (
        <div classname="flex items-center px-4 md:px-6 py-4 border-b border-gray-200 overflow-x-auto shrink-0">
          {breadcrumbs.map((crumb, index) => (
            <react.fragment key="{crumb.id" ||="" 'root'}="">
              <button onclick="{()" ==""> onNavigate(crumb.id)}
                className={`text-base md:text-lg hover:bg-gray-100 px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                  index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'
                }`}
              >
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <chevronright classname="w-4 h-4 md:w-5 md:h-5 text-gray-400 mx-1 shrink-0"/>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      
      {!isSelectionMode && currentView !== 'drive' && (
        <div classname="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 classname="text-lg font-medium text-gray-900 capitalize">{currentView}</h2>
          {currentView === 'trash' && (displayFiles.length > 0 || displayFolders.length > 0) && (
            <button onclick="{onEmptyTrash}" classname="text-sm text-red-600 hover:text-red-700 font-medium">
              Empty Trash
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <div classname="flex-1 overflow-y-auto p-4 md:p-6 relative">
        {isDragActive && (
          <div classname="absolute inset-0 bg-blue-50/90 border-2 border-blue-400 border-dashed z-10 flex items-center justify-center m-4 rounded-xl transition-opacity">
            <p classname="text-xl md:text-2xl text-blue-600 font-medium">
              Drop files here to upload
            </p>
          </div>
        )}

        {displayFolders.length === 0 && displayFiles.length === 0 ? (
          <div classname="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center transition-opacity">
            <div classname="w-32 h-32 md:w-48 md:h-48 mb-6 opacity-20">
              <svg viewbox="0 0 24 24" fill="none" stroke="currentColor" strokewidth="1" strokelinecap="round" strokelinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p classname="text-lg md:text-xl font-medium text-gray-700">
              {currentView === 'drive' ? 'A place for all of your files' : `No ${currentView} items`}
            </p>
            {currentView === 'drive' && (
              <p classname="mt-2 text-sm md:text-base">Drag and drop files here, or click the New button.</p>
            )}
          </div>
        ) : (
          <div classname="space-y-8">
            {/* Folders Section */}
            {displayFolders.length > 0 && (
              <div classname="transition-opacity">
                <h2 classname="text-sm font-medium text-gray-500 mb-4">Folders</h2>
                <div classname="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayFolders.map(folder => {
                    const isSelected = selectedIds.has(folder.id);
                    return (
                      <div key="{folder.id}" onmousedown="{()" ==""> handleTouchStart(folder.id)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        onTouchStart={() => handleTouchStart(folder.id)}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => handleItemClick(folder, true)}
                        className={`group flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {isSelectionMode && (
                          <div classname="{`w-5" h-5="" rounded-full="" border="" flex="" items-center="" justify-center="" mr-3="" shrink-0="" ${isselected="" ?="" 'bg-blue-600="" border-blue-600'="" :="" 'border-gray-300'}`}="">
                            {isSelected && <checkcircle2 classname="w-4 h-4 text-white"/>}
                          </div>
                        )}
                        {!isSelectionMode && <folder classname="w-6 h-6 text-gray-600 mr-3 fill-gray-600 shrink-0"/>}
                        <span classname="flex-1 truncate text-sm font-medium text-gray-700">{folder.name}</span>
                        {!isSelectionMode && (
                          <div classname="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="{(e)" ==""> { e.stopPropagation(); onToggleStar(folder.id, true); }}
                              className={`p-2 text-gray-400 hover:text-yellow-500 ${folder.starred ? 'text-yellow-500' : ''}`}
                            >
                              <star classname="{`w-4" h-4="" ${folder.starred="" ?="" 'fill-yellow-500'="" :="" ''}`}=""/>
                            </button>
                            {currentView === 'trash' ? (
                              <>
                                <button onclick="{(e)" ==""> { e.stopPropagation(); onToggleTrash(folder.id, true); }}
                                  className="p-2 text-gray-400 hover:text-green-600"
                                  title="Restore"
                                >
                                  <rotateccw classname="w-4 h-4"/>
                                </button>
                                <button onclick="{(e)" ==""> { e.stopPropagation(); onDeleteFolder(folder.id); }}
                                  className="p-2 text-gray-400 hover:text-red-600"
                                  title="Delete Permanently"
                                >
                                  <trash2 classname="w-4 h-4"/>
                                </button>
                              </>
                            ) : (
                              <button onclick="{(e)" ==""> { e.stopPropagation(); onToggleTrash(folder.id, true); }}
                                className="p-2 -mr-2 text-gray-400 hover:text-red-600"
                                title="Move to Trash"
                              >
                                <trash2 classname="w-4 h-4"/>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Files Section */}
            {displayFiles.length > 0 && (
              <div classname="transition-opacity">
                <h2 classname="text-sm font-medium text-gray-500 mb-4">Files</h2>
                <div classname="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table classname="min-w-full divide-y divide-gray-200">
                    <thead classname="bg-gray-50">
                      <tr>
                        <th scope="col" classname="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" classname="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Last modified</th>
                        <th scope="col" classname="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">File size</th>
                        {!isSelectionMode && <th scope="col" classname="relative px-4 md:px-6 py-3"><span classname="sr-only">Actions</span></th>}
                      </tr>
                    </thead>
                    <tbody classname="bg-white divide-y divide-gray-200">
                      {displayFiles.map(file => {
                        const isSelected = selectedIds.has(file.id);
                        return (
                          <tr key="{file.id}" onmousedown="{()" ==""> handleTouchStart(file.id)}
                            onMouseUp={handleTouchEnd}
                            onMouseLeave={handleTouchEnd}
                            onTouchStart={() => handleTouchStart(file.id)}
                            onTouchEnd={handleTouchEnd}
                            onClick={() => handleItemClick(file, false)}
                            className={`group cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          >
                            <td classname="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div classname="flex items-center">
                                {isSelectionMode && (
                                  <div classname="{`w-5" h-5="" rounded-full="" border="" flex="" items-center="" justify-center="" mr-3="" shrink-0="" ${isselected="" ?="" 'bg-blue-600="" border-blue-600'="" :="" 'border-gray-300'}`}="">
                                    {isSelected && <checkcircle2 classname="w-4 h-4 text-white"/>}
                                  </div>
                                )}
                                {!isSelectionMode && (
                                  <div classname="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                                    {getFileIcon(file.type)}
                                  </div>
                                )}
                                <div classname="ml-3 md:ml-4">
                                  <div classname="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px] lg:max-w-md">{file.name}</div>
                                </div>
                              </div>
                            </td>
                            <td classname="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {format(file.lastModified, 'MMM d, yyyy')}
                            </td>
                            <td classname="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                              {formatBytes(file.size)}
                            </td>
                            {!isSelectionMode && (
                              <td classname="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div classname="flex items-center justify-end gap-1 md:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onclick="{(e)" ==""> { e.stopPropagation(); onToggleStar(file.id, false); }}
                                    className={`p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 ${file.starred ? 'text-yellow-500' : ''}`}
                                    title="Star"
                                  >
                                    <star classname="{`w-4" h-4="" ${file.starred="" ?="" 'fill-yellow-500'="" :="" ''}`}=""/>
                                  </button>
                                  <button onclick="{(e)" ==""> { e.stopPropagation(); onDownloadFile(file); }}
                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                    title="Download"
                                  >
                                    <download classname="w-4 h-4"/>
                                  </button>
                                  {currentView === 'trash' ? (
                                    <>
                                      <button onclick="{(e)" ==""> { e.stopPropagation(); onToggleTrash(file.id, false); }}
                                        className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100"
                                        title="Restore"
                                      >
                                        <rotateccw classname="w-4 h-4"/>
                                      </button>
                                      <button onclick="{(e)" ==""> { e.stopPropagation(); onDeleteFile(file.id); }}
                                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                        title="Delete Permanently"
                                      >
                                        <trash2 classname="w-4 h-4"/>
                                      </button>
                                    </>
                                  ) : (
                                    <button onclick="{(e)" ==""> { e.stopPropagation(); onToggleTrash(file.id, false); }}
                                      className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                      title="Move to Trash"
                                    >
                                      <trash2 classname="w-4 h-4"/>
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
