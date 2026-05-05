"use client";

import { Modal } from "@/components/ui/Modal";
import { SettingsPanel } from "./SettingsPanel";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  return (
    <Modal open={open} title="设置" onClose={onClose}>
      <SettingsPanel />
    </Modal>
  );
}
