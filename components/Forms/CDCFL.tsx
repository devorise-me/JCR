import React from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <p>{message}</p>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
            onClick={onClose}
          >
            الغاء
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            نعم , احذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
