import { Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { useState, useRef } from "react";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

interface AvatarMenuProps {
  avatarUrl?: string;
  onSelectFile: (file: File) => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function AvatarCompress({
  avatarUrl,
  onSelectFile,
  onDelete,
  onView,
}: AvatarMenuProps) {

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onSelectFile(file);
  };

  return (
    <>
      <Avatar
        src={avatarUrl}
        sx={{
          width: 140,
          height: 140,
          cursor: "pointer",
          margin: "0 auto",
          mb: 3,
          border: "3px solid #DBD515",
        }}
        onClick={openMenu}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>

        <MenuItem
          onClick={() => {
            onView?.();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          Ver foto
        </MenuItem>

        <MenuItem
          onClick={() => {
            fileInputRef.current?.click();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <PhotoCameraIcon fontSize="small" />
          </ListItemIcon>
          Cambiar foto
        </MenuItem>

        <MenuItem
          onClick={() => {
            onDelete?.();
            closeMenu();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Eliminar foto
        </MenuItem>

      </Menu>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={handleFileChange}
      />
    </>
  );
}