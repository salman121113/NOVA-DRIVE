import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { DriveFile, DriveFolder } from '../types';

const INITIAL_QUOTA_GB = 3;
const BYTES_PER_GB = 1024 * 1024 * 1024;

// Initialize localforage stores
const filesStore = localforage.createInstance({
  name: 'LocalDrive',
  storeName: 'files'
});

const foldersStore = localforage.createInstance({
  name: 'LocalDrive',
  storeName: 'folders'
});

const settingsStore = localforage.createInstance({
  name: 'LocalDrive',
  storeName: 'settings'
});

export interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

export function useDrive() {
  const [files, setFiles] = useState([] as DriveFile[]);
  const [folders, setFolders] = useState([] as DriveFolder[]);
  const [currentFolderId, setCurrentFolderId] = useState(null as string | null);
  const [quotaBytes, setQuotaBytes] = useState(INITIAL_QUOTA_GB * BYTES_PER_GB as number);
  const [usedBytes, setUsedBytes] = useState(0 as number);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyPromoUsage, setDailyPromoUsage] = useState(0 as number);
  const [lastPromoDate, setLastPromoDate] = useState('' as string);
  const [uploadingFiles, setUploadingFiles] = useState([] as UploadingFile[]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load settings
      const savedQuota = await settingsStore.getItem<number>('quotaBytes');
      if (savedQuota) {
        setQuotaBytes(savedQuota);
      } else {
        await settingsStore.setItem('quotaBytes', quotaBytes);
      }

      const savedDailyUsage = await settingsStore.getItem<number>('dailyPromoUsage') || 0;
      const savedLastDate = await settingsStore.getItem<string>('lastPromoDate') || '';
      
      setDailyPromoUsage(savedDailyUsage);
      setLastPromoDate(savedLastDate);

      // Load folders
      const loadedFolders: DriveFolder[] = [];
      await foldersStore.iterate((value: DriveFolder) => {
        loadedFolders.push(value);
      });
      setFolders(loadedFolders);

      // Load files
      const loadedFiles: DriveFile[] = [];
      let totalUsed = 0;
      await filesStore.iterate((value: DriveFile) => {
        loadedFiles.push(value);
        if (!value.trashed) {
          totalUsed += value.size;
        }
      });
      setFiles(loadedFiles);
      setUsedBytes(totalUsed);
    } catch (error) {
      console.error("Error loading drive data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addFiles = async (newFiles: File[]) => {
    let currentUsed = usedBytes;
    
    // Setup upload tracking
    const newUploads = newFiles.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      progress: 0,
      file: f
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      const file = upload.file;
      
      if (currentUsed + file.size > quotaBytes) {
        alert(`Not enough storage space to upload ${file.name}. Please watch an ad to get more storage!`);
        setUploadingFiles(prev => prev.filter(u => u.id !== upload.id));
        continue;
      }

      // Simulate upload progress
      const chunks = 10;
      for (let i = 1; i <= chunks; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms per chunk
        setUploadingFiles(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress: (i / chunks) * 100 } : u
        ));
      }

      const driveFile: DriveFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: file,
        parentId: currentFolderId,
      };

      await filesStore.setItem(driveFile.id, driveFile);
      currentUsed += file.size;
      
      // Remove from uploading list
      setUploadingFiles(prev => prev.filter(u => u.id !== upload.id));
    }
    
    await loadData();
  };

  const createFolder = async (name: string) => {
    const newFolder: DriveFolder = {
      id: crypto.randomUUID(),
      name,
      parentId: currentFolderId,
      createdAt: Date.now(),
    };
    await foldersStore.setItem(newFolder.id, newFolder);
    await loadData();
  };

  const deleteFile = async (id: string) => {
    await filesStore.removeItem(id);
    await loadData();
  };

  const deleteFolder = async (id: string) => {
    const deleteRecursive = async (folderId: string) => {
      const subfolders = folders.filter(f => f.parentId === folderId);
      for (const sf of subfolders) {
        await deleteRecursive(sf.id);
      }
      const folderFiles = files.filter(f => f.parentId === folderId);
      for (const ff of folderFiles) {
        await filesStore.removeItem(ff.id);
      }
      await foldersStore.removeItem(folderId);
    };
    await deleteRecursive(id);
    await loadData();
  };

  const bulkDelete = async (fileIds: string[], folderIds: string[]) => {
    for (const id of fileIds) {
      await filesStore.removeItem(id);
    }
    for (const id of folderIds) {
      const deleteRecursive = async (folderId: string) => {
        const subfolders = folders.filter(f => f.parentId === folderId);
        for (const sf of subfolders) {
          await deleteRecursive(sf.id);
        }
        const folderFiles = files.filter(f => f.parentId === folderId);
        for (const ff of folderFiles) {
          await filesStore.removeItem(ff.id);
        }
        await foldersStore.removeItem(folderId);
      };
      await deleteRecursive(id);
    }
    await loadData();
  };

  const bulkToggleTrash = async (itemIds: {id: string, isFolder: boolean}[], forceRestore: boolean = false) => {
    let foldersChanged = false;
    let filesChanged = false;
    
    for (const {id, isFolder} of itemIds) {
      if (isFolder) {
        const folder = folders.find(f => f.id === id);
        if (folder) {
          const updated = { ...folder, trashed: forceRestore ? false : !folder.trashed };
          await foldersStore.setItem(id, updated);
          foldersChanged = true;
        }
      } else {
        const file = files.find(f => f.id === id);
        if (file) {
          const updated = { ...file, trashed: forceRestore ? false : !file.trashed };
          await filesStore.setItem(id, updated);
          filesChanged = true;
        }
      }
    }
    
    if (foldersChanged || filesChanged) {
      await loadData();
    }
  };

  const emptyTrash = async () => {
    const trashedFiles = files.filter(f => f.trashed);
    const trashedFolders = folders.filter(f => f.trashed);
    
    for (const f of trashedFiles) {
      await filesStore.removeItem(f.id);
    }
    for (const f of trashedFolders) {
      await foldersStore.removeItem(f.id);
    }
    await loadData();
  };

  const addStorageQuota = async (gbToAdd: number = 2) => {
    const newQuota = quotaBytes + (gbToAdd * BYTES_PER_GB);
    setQuotaBytes(newQuota);
    await settingsStore.setItem('quotaBytes', newQuota);
  };

  const setExactStorageQuota = async (gb: number) => {
    const newQuota = gb * BYTES_PER_GB;
    setQuotaBytes(newQuota);
    await settingsStore.setItem('quotaBytes', newQuota);
  };

  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const upperCode = code.trim().toUpperCase();
    
    // Admin unlimited code
    if (upperCode === 'SAIFULLAHIMRANMAHMUD7') {
      const massiveQuota = 1000000000 * BYTES_PER_GB; // 1 Billion GB
      setQuotaBytes(massiveQuota);
      await settingsStore.setItem('quotaBytes', massiveQuota);
      return { success: true, message: 'Unlimited Storage Unlocked!' };
    }

    // Dynamic IMRAN<number>GB code
    const match = upperCode.match(/^IMRAN(\d+)GB$/);
    if (match) {
      const requestedGB = parseInt(match[1], 10);
      const today = new Date().toDateString();
      
      let currentUsage = dailyPromoUsage;
      if (lastPromoDate !== today) {
        currentUsage = 0; // Reset for a new day
      }

      if (currentUsage + requestedGB > 100) {
        const remaining = Math.max(0, 100 - currentUsage);
        return { 
          success: false, 
          message: `Daily limit of 100GB exceeded. You can only claim ${remaining}GB more today.` 
        };
      }

      // Apply storage
      const newQuota = quotaBytes + (requestedGB * BYTES_PER_GB);
      setQuotaBytes(newQuota);
      await settingsStore.setItem('quotaBytes', newQuota);
      
      // Update daily usage
      setDailyPromoUsage(currentUsage + requestedGB);
      setLastPromoDate(today);
      await settingsStore.setItem('dailyPromoUsage', currentUsage + requestedGB);
      await settingsStore.setItem('lastPromoDate', today);

      return { success: true, message: `${requestedGB} GB Storage Added!` };
    }

    return { success: false, message: 'Invalid promo code.' };
  };

  const toggleStar = async (id: string, isFolder: boolean) => {
    if (isFolder) {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        const updated = { ...folder, starred: !folder.starred };
        await foldersStore.setItem(id, updated);
        setFolders(prev => prev.map(f => f.id === id ? updated : f));
      }
    } else {
      const file = files.find(f => f.id === id);
      if (file) {
        const updated = { ...file, starred: !file.starred };
        await filesStore.setItem(id, updated);
        setFiles(prev => prev.map(f => f.id === id ? updated : f));
      }
    }
  };

  const toggleTrash = async (id: string, isFolder: boolean) => {
    if (isFolder) {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        const updated = { ...folder, trashed: !folder.trashed };
        await foldersStore.setItem(id, updated);
        setFolders(prev => prev.map(f => f.id === id ? updated : f));
      }
    } else {
      const file = files.find(f => f.id === id);
      if (file) {
        const updated = { ...file, trashed: !file.trashed };
        await filesStore.setItem(id, updated);
        setFiles(prev => prev.map(f => f.id === id ? updated : f));
      }
    }
    await loadData();
  };

  const currentFiles = files.filter(f => f.parentId === currentFolderId && !f.trashed);
  const currentFolders = folders.filter(f => f.parentId === currentFolderId && !f.trashed);

  const getBreadcrumbs = () => {
    const breadcrumbs: { id: string | null; name: string }[] = [{ id: null, name: 'My Drive' }];
    let currId = currentFolderId;
    const path = [];
    
    while (currId) {
      const folder = folders.find(f => f.id === currId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currId = folder.parentId;
      } else {
        break;
      }
    }
    
    return [...breadcrumbs, ...path];
  };

  const downloadFile = (file: DriveFile) => {
    const url = URL.createObjectURL(file.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    files: currentFiles,
    folders: currentFolders,
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
    setExactStorageQuota,
    applyPromoCode,
    getBreadcrumbs,
    downloadFile
  };
}
