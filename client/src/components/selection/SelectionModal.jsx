import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RegisterInstitution from "./RegisterInstitution";
import JoinStaff from "./JoinStaff";
import PendingApproval from "./PendingApproval";

export default function SelectionModal({ isOpen, onClose, type }) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPending(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose(false);
  };

  const showRegister = type === 'register' && !isPending;
  const showJoin = type === 'join' && !isPending;
  const showPending = isPending;

  let maxWidthClass = 'sm:max-w-md';
  if (showRegister) maxWidthClass = 'sm:max-w-4xl';
  else if (showPending) maxWidthClass = 'sm:max-w-md md:sm:max-w-lg'; // slightly wider for pending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`w-full bg-white border-0 ring-0 shadow-2xl p-0 overflow-hidden ${maxWidthClass} transition-all duration-300`}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Selection Modal</DialogTitle>
        <DialogDescription className="sr-only">Please select or enter the required information.</DialogDescription>
        
        {showRegister && <RegisterInstitution onClose={handleClose} onSuccess={() => setIsPending(true)} />}
        {showJoin && <JoinStaff onClose={handleClose} />}
        {showPending && <PendingApproval onLogout={handleClose} onRefresh={() => console.log('refreshing status...')} />}
      </DialogContent>
    </Dialog>
  );
}
