"use client";

import { useEffect } from "react";

const PROTECTED = "img, picture, video, canvas, svg image, [data-protect]";

/**
 * Dificulta desar les imatges des del navegador: bloqueja el menú contextual
 * ("Desa la imatge com a…"), l'arrossegament cap a l'escriptori, la pulsació
 * llarga al mòbil i la drecera de desar la pàgina (Ctrl/Cmd + S).
 * No pot impedir captures de pantalla ni les eines de desenvolupador.
 */
export default function ImageProtection() {
  useEffect(() => {
    const isProtected = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest(PROTECTED);

    // El menú contextual es bloqueja també sobre els botons i enllaços que embolcallen imatges
    const onContextMenu = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (isProtected(el) || el?.querySelector?.("img")) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (isProtected(e.target)) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
