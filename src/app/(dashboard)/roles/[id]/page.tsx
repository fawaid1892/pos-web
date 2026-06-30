"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRolesStore } from "@/hooks/useRoles";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types";
import {
  Settings,
  Save,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = Number(params.id);

  const {
    roles,
    allPermissions,
    isLoading,
    error,
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
    updateRole,
    setRolePermissions,
  } = useRolesStore();

  const role = roles.find((r) => r.id === roleId);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  // Permission state
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (roles.length === 0) fetchRoles();
    if (allPermissions.length === 0) fetchPermissions();
  }, [fetchRoles, fetchPermissions, roles.length, allPermissions.length]);

  // Load role data into form
  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
    }
  }, [role]);

  // Load role permissions
  useEffect(() => {
    if (roleId && !initialLoad) return;
    if (roleId && allPermissions.length > 0) {
      fetchRolePermissions(roleId).then((perms) => {
        setSelectedPermissionIds(new Set(perms.map((p) => p.id)));
        setInitialLoad(false);
      });
    }
  }, [roleId, fetchRolePermissions, allPermissions.length, initialLoad]);

  // Group permissions by group
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const perm of allPermissions) {
      if (!groups[perm.group]) {
        groups[perm.group] = [];
      }
      groups[perm.group].push(perm);
    }
    return groups;
  }, [allPermissions]);

  const togglePermission = (permId: number) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const isGroupComplete = (perms: Permission[]) => {
    return perms.every((p) => selectedPermissionIds.has(p.id));
  };

  const toggleGroup = (perms: Permission[]) => {
    const allSelected = isGroupComplete(perms);
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      for (const p of perms) {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      }
      return next;
    });
  };

  const handleSaveInfo = async () => {
    if (!name.trim() || !role) return;
    setIsSavingInfo(true);
    setInfoError(null);
    try {
      await updateRole(roleId, name.trim(), description.trim());
    } catch {
      setInfoError("Gagal menyimpan informasi role");
    }
    setIsSavingInfo(false);
  };

  const handleSavePermissions = async () => {
    setIsSavingPermissions(true);
    setPermError(null);
    try {
      await setRolePermissions(roleId, Array.from(selectedPermissionIds));
    } catch {
      setPermError("Gagal menyimpan permission");
    }
    setIsSavingPermissions(false);
  };

  if (!role && !isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/roles")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <p className="text-muted-foreground">Role tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  const groupKeys = Object.keys(groupedPermissions).sort();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/roles")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {role?.name || "Loading..."}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {role?.is_system ? "System role" : "Kustom role"} — Atur informasi dan izin akses
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Error Banner */}
        {(error || infoError || permError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || infoError || permError}
          </div>
        )}

        {/* Section 1: Role Info */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold mb-4">Informasi Role</h3>
          <div className="space-y-4 max-w-lg">
            <Input
              label="Nama Role"
              placeholder="Masukkan nama role"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role?.is_system}
            />
            <Input
              label="Deskripsi"
              placeholder="Deskripsi role (opsional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end pt-2">
              <Button
                loading={isSavingInfo}
                disabled={!name.trim()}
                onClick={handleSaveInfo}
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Informasi
              </Button>
            </div>
          </div>
        </section>

        {/* Section 2: Permission Grid */}
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Izin Akses</h3>
            <Button
              loading={isSavingPermissions}
              onClick={handleSavePermissions}
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Izin
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Pilih izin akses yang dimiliki role ini. Setiap grup dapat dipilih semua secara bersamaan.
          </p>

          {isLoading && allPermissions.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-accent/50 animate-pulse" />
              ))}
            </div>
          ) : groupKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Tidak ada izin yang tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupKeys.map((group) => {
                const perms = groupedPermissions[group];
                const allSelected = isGroupComplete(perms);
                return (
                  <div
                    key={group}
                    className="border border-border rounded-lg p-4"
                  >
                    {/* Group header with select all */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                      <h4 className="text-sm font-semibold capitalize">
                        {group}
                      </h4>
                      <button
                        onClick={() => toggleGroup(perms)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {allSelected ? (
                            <Check className="w-3.5 h-3.5 text-brand-600" />
                        ) : (
                            <div className="w-3.5 h-3.5 border border-muted-foreground/30 rounded" />
                        )}
                        {allSelected ? "Semua" : "Pilih Semua"}
                      </button>
                    </div>

                    {/* Permission checkboxes */}
                    <div className="space-y-2">
                      {perms.map((perm) => {
                        const isSelected = selectedPermissionIds.has(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className="flex items-start gap-2.5 cursor-pointer group"
                          >
                            <button
                              type="button"
                              onClick={() => togglePermission(perm.id)}
                              className={cn(
                                "mt-0.5 shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center",
                                isSelected
                                  ? "bg-brand-600 border-brand-600 text-white"
                                  : "border-input hover:border-brand-400"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </button>
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              {perm.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
