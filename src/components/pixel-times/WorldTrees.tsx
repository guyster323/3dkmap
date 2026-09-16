"use client";

import { useMemo, useState } from "react";
import { FACTION_TREE_ORDER, REGION_TREE_ORDER } from "@/data/pixel-times";
import { getCharacters, getEpisodesByVolume, getPlaces, getVolumes } from "@/lib/content";
import type { Character, Episode, RegionId, Volume, WorldEvent } from "@/lib/types";
import { TreeNode } from "./TreeNode";

export function BookTree({
  current,
  onPickEpisode,
}: {
  current: Episode;
  onPickEpisode: (id: string) => void;
}) {
  const volumes = getVolumes();
  const [openVol, setOpenVol] = useState(current.volume);
  const episodes = useMemo(() => getEpisodesByVolume(openVol), [openVol]);

  return (
    <div>
      {volumes.map((v: Volume) => {
        const expanded = openVol === v.number;
        return (
          <TreeNode
            key={v.number}
            label={`${v.number}권 ${v.title}`}
            level={0}
            expanded={expanded}
            selected={current.volume === v.number}
            onToggle={() => setOpenVol(expanded ? 0 : v.number)}
            onSelect={() => setOpenVol(v.number)}
          >
            {expanded
              ? episodes.map((ep) => (
                  <TreeNode
                    key={ep.id}
                    label={`${ep.order}장 ${ep.title}`}
                    level={1}
                    selected={ep.id === current.id}
                    onSelect={() => onPickEpisode(ep.id)}
                  />
                ))
              : null}
          </TreeNode>
        );
      })}
    </div>
  );
}

export function RegionTree({
  filter,
  onFilter,
  onFocusPlace,
}: {
  filter: RegionId | null;
  onFilter: (region: RegionId | null) => void;
  onFocusPlace: (placeId: string) => void;
}) {
  const places = getPlaces();
  const [open, setOpen] = useState<RegionId | null>(filter ?? "korea");

  return (
    <div>
      {REGION_TREE_ORDER.map((g) => {
        const expanded = open === g.id;
        const kids = places.filter((p) => p.region === g.id);
        return (
          <TreeNode
            key={g.id}
            label={g.label}
            level={0}
            expanded={expanded}
            selected={filter === g.id}
            onToggle={() => setOpen(expanded ? null : g.id)}
            onSelect={() => {
              setOpen(g.id);
              onFilter(filter === g.id ? null : g.id);
            }}
          >
            {expanded
              ? kids.map((p) => (
                  <TreeNode
                    key={p.id}
                    label={p.nameKo}
                    level={1}
                    onSelect={() => onFocusPlace(p.id)}
                  />
                ))
              : null}
          </TreeNode>
        );
      })}
    </div>
  );
}

export function EventTree({
  events,
  onPick,
}: {
  events: WorldEvent[];
  onPick: (placeId?: string) => void;
}) {
  if (!events.length) {
    return (
      <p className="eik-body px-2 py-2" style={{ color: "var(--color-eik-text-dim)" }}>
        이 순간에 매핑된 동시 사건이 없습니다.
      </p>
    );
  }
  return (
    <div>
      {events.map((ev) => (
        <TreeNode
          key={ev.id}
          label={ev.headline}
          level={0}
          onSelect={() => onPick(ev.placeId)}
        />
      ))}
    </div>
  );
}

export function PeopleTree({ onPick }: { onPick?: (id: string) => void }) {
  const chars = getCharacters();
  const [open, setOpen] = useState<string | null>("liu");
  return (
    <div>
      {FACTION_TREE_ORDER.map((g) => {
        const kids = chars.filter((c: Character) => c.faction === g.id);
        if (!kids.length) return null;
        const expanded = open === g.id;
        return (
          <TreeNode
            key={g.id}
            label={g.label}
            level={0}
            expanded={expanded}
            onToggle={() => setOpen(expanded ? null : g.id)}
            onSelect={() => setOpen(g.id)}
          >
            {expanded
              ? kids.map((c) => (
                  <TreeNode key={c.id} label={c.nameKo} level={1} onSelect={() => onPick?.(c.id)} />
                ))
              : null}
          </TreeNode>
        );
      })}
    </div>
  );
}
