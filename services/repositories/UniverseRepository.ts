export interface CreateUniverseRecord {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface UniverseRecord extends CreateUniverseRecord {}

export interface UniverseRepository {
  createUniverse(
    universe: CreateUniverseRecord
  ): Promise<UniverseRecord>;

  loadUniverse(
    universeId: string
  ): Promise<UniverseRecord | null>;
}