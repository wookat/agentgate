export const DEP_ECOSYSTEMS = ['npm', 'pypi'] as const;
export type DepEcosystem = (typeof DEP_ECOSYSTEMS)[number];

/** Where a dependency reference was found. */
export type DepOrigin = 'manifest' | 'import';

/** A dependency name referenced by a project, before registry verification. */
export interface DependencyRef {
  name: string;
  ecosystem: DepEcosystem;
  origin: DepOrigin;
  /** File (relative to the scan root) the reference came from. */
  file: string;
  /** Manifest section or import statement context. */
  context?: string;
}

/** A dependency declared with a non-registry specifier (git remote, VCS shorthand, or archive URL). */
export interface RemoteDepSpec {
  name: string;
  spec: string;
  /** File (relative to the scan root) the declaration came from. */
  file: string;
  /** Manifest section the declaration came from. */
  context: string;
}

/** Registry metadata for an existing package (fields best-effort per registry). */
export interface RegistryInfo {
  exists: boolean;
  /** Days since first publish. */
  ageDays?: number;
  versionCount?: number;
  weeklyDownloads?: number;
  hasRepository?: boolean;
  hasLicense?: boolean;
  hasDescription?: boolean;
  /** npm only: preinstall/install/postinstall scripts present. */
  hasInstallScripts?: boolean;
}

export interface DepCheckResult {
  ref: DependencyRef;
  info?: RegistryInfo;
  /** Registry lookup error (network/timeout), when neither exists nor metadata is known. */
  error?: string;
}
