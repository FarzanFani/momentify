import { useDeletePackageCover, useUploadPackageCover } from "@/hooks/service";
import { useEffect, useState } from "react";

/**
 * Keeps the cover image chosen in the form until the package is saved.
 * The image is uploaded through its own endpoint once the package exists.
 */
export function useCoverImage(initialUrl: string | null = null) {
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  const { mutateAsync: uploadCover } = useUploadPackageCover();
  const { mutateAsync: deleteCover } = useDeletePackageCover();

  // Release the local preview URL when it is replaced or on unmount.
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const preview = objectUrl ?? (removed ? null : initialUrl);

  const onCoverChange = (nextFile: File | null) => {
    setFile(nextFile);
    setObjectUrl(nextFile ? URL.createObjectURL(nextFile) : null);
    setRemoved(nextFile === null);
  };

  const saveCover = async (id: string, companyId: string) => {
    if (file) {
      await uploadCover({ id, companyId, file });
    } else if (removed && initialUrl) {
      await deleteCover({ id, companyId });
    }
  };

  return { preview, onCoverChange, saveCover };
}
