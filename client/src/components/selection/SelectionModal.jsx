import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMe } from "../../redux/slice/getmeslice";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import RegisterInstitution from "./RegisterInstitution";
import JoinStaff from "./JoinStaff";
import PendingApproval from "./PendingApproval";

export default function SelectionModal({ isOpen, onClose, type }) {
  const dispatch = useDispatch();

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent
        className={`w-full bg-white border-0 shadow-2xl p-0 overflow-hidden ${
          type === 'register' ? 'sm:max-w-4xl' : 'sm:max-w-md'
        }`}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Selection Modal</DialogTitle>
        <DialogDescription className="sr-only">Enter required information.</DialogDescription>

        {type === 'register' && (
          <RegisterInstitution
            onClose={() => onClose(false)}
            onSuccess={() => {
              onClose(false);         // close modal
              dispatch(fetchMe());    // AppGate handles the rest
            }}
          />
        )}
        {type === 'join' && <JoinStaff onClose={() => onClose(false)} />}
      </DialogContent>
    </Dialog>
  );
}