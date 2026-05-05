"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Space } from "@/lib/types";
import { newId } from "@/lib/utils";

interface NewSpaceModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (space: Space) => void;
}

export function NewSpaceModal({ open, onClose, onCreate }: NewSpaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id: newId("space"),
      name: name.trim(),
      description: description.trim() || "新的学习空间",
      color: "#4f6df5"
    });
    setName("");
    setDescription("");
    onClose();
  }

  return (
    <Modal open={open} title="新建学习空间" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-medium text-neutral-700">
          名称
          <input
            className="lk-focus rounded-app border border-line px-3 py-2"
            value={name}
            placeholder="例如：高等数学"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-neutral-700">
          描述
          <textarea
            className="lk-focus min-h-24 rounded-app border border-line px-3 py-2"
            value={description}
            placeholder="这个空间用来整理什么内容？"
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="primary">
            创建
          </Button>
        </div>
      </form>
    </Modal>
  );
}
