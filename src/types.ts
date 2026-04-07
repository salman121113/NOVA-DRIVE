export interface DriveFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  data: Blob; // The actual file data
  parentId: string | null; // null means root
  starred?: boolean;
  trashed?: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  starred?: boolean;
  trashed?: boolean;
}
