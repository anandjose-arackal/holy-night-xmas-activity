"use client";

import { useEffect, useState } from "react";
import { addRegion, getParish, listParishes, listRegions, type Region, type RegionLevel, type Regions } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { site } from "@/lib/site";

const select = "min-h-11 w-full rounded-xl border-2 border-rim bg-white/80 px-2 disabled:opacity-50";
const NEW = "__new";

/**
 * Diocese -> meghala -> parish, each list narrowed by the one above, and "+ Add new…" at the end of each
 * for a place that is missing (it is added for everyone). Only the parish is saved; the diocese and
 * meghala start from the saved parish. Parishes load per meghala (there are more than one query returns).
 * On a diocese's own site (lib/site.ts) the diocese is fixed: the picker starts at that diocese's meghalas.
 */
export function RegionPicker({ parishId, onChange }: { parishId: string | null; onChange: (parishId: string | null) => void }) {
  const { t } = useT();
  const [regions, setRegions] = useState<Regions | null>(null);
  const [diocese, setDiocese] = useState("");
  const [meghala, setMeghala] = useState("");
  const [parishes, setParishes] = useState<Region[]>([]);
  const [adding, setAdding] = useState<RegionLevel | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [fixed, setFixed] = useState<string | null>(null); // the site's diocese id, when it is found

  const reloadRegions = () => listRegions().then((r) => setRegions({ dioceses: [...r.dioceses], meghalas: [...r.meghalas] }));
  const openMeghala = (id: string) => {
    setMeghala(id);
    setParishes([]);
    if (id) listParishes(id).then(setParishes, () => {});
  };

  // Load the lists and start at the saved parish.
  useEffect(() => {
    Promise.all([listRegions(), getParish(parishId)]).then(
      ([r, p]) => {
        setRegions({ dioceses: [...r.dioceses], meghalas: [...r.meghalas] });
        const own = site().diocese?.toLowerCase();
        const mine = own ? r.dioceses.find((d) => d.name.trim().toLowerCase() === own) : undefined;
        if (mine) {
          setFixed(mine.id);
          setDiocese(mine.id);
        }
        if (!p?.parent) return;
        setDiocese(r.meghalas.find((m) => m.id === p.parent)?.parent ?? "");
        setMeghala(p.parent);
        listParishes(p.parent).then(setParishes, () => {});
      },
      () => setProblem(t.error),
    );
    // Only on first show: later the parent's own choices drive the lists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add() {
    if (!adding) return;
    setBusy(true);
    setProblem(null);
    try {
      const id = await addRegion(adding, name, adding === "diocese" ? null : adding === "meghala" ? diocese : meghala);
      if (adding === "diocese") {
        await reloadRegions();
        setDiocese(id);
        openMeghala("");
      } else if (adding === "meghala") {
        await reloadRegions();
        openMeghala(id);
      } else {
        setParishes(await listParishes(meghala));
        onChange(id);
      }
      setAdding(null);
      setName("");
    } catch (e) {
      setProblem((e as { code?: string }).code === "23505" ? t.nameTaken : t.error);
    }
    setBusy(false);
  }

  if (!regions) return <p className="text-sm text-ink-soft">{problem ?? t.loading}</p>;
  const meghalas = regions.meghalas.filter((m) => m.parent === diocese);
  const pick = (level: RegionLevel, value: string, set: (v: string) => void) => {
    if (value === NEW) {
      setAdding(level);
      setName("");
      setProblem(null);
    } else set(value);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className={`grid w-full gap-2 ${fixed ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <label className={`flex flex-col gap-0.5 text-xs font-semibold ${fixed ? "hidden" : ""}`}>
          {t.diocese}
          <select
            className={select}
            value={diocese}
            onChange={(e) =>
              pick("diocese", e.target.value, (v) => {
                setDiocese(v);
                openMeghala("");
              })
            }
          >
            <option value="">{t.choose}</option>
            {regions.dioceses.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
            <option value={NEW}>{t.addNew}</option>
          </select>
        </label>
        <label className="flex flex-col gap-0.5 text-xs font-semibold">
          {t.meghala}
          <select className={select} value={meghala} disabled={!diocese} onChange={(e) => pick("meghala", e.target.value, openMeghala)}>
            <option value="">{t.choose}</option>
            {meghalas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
            <option value={NEW}>{t.addNew}</option>
          </select>
        </label>
        <label className="flex flex-col gap-0.5 text-xs font-semibold">
          {t.parish}
          <select
            className={select}
            value={parishes.some((p) => p.id === parishId) ? (parishId ?? "") : ""}
            disabled={!meghala}
            onChange={(e) => pick("parish", e.target.value, (v) => onChange(v || null))}
          >
            <option value="">{t.choose}</option>
            {parishes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value={NEW}>{t.addNew}</option>
          </select>
        </label>
      </div>

      {adding && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border-2 border-[#f5c542] bg-[#fff6dc] p-2">
          <label className="flex min-w-40 flex-1 flex-col gap-0.5 text-xs font-semibold">
            {t.newName}: {adding === "diocese" ? t.diocese : adding === "meghala" ? t.meghala : t.parish}
            <input
              className="min-h-11 rounded-xl border-2 border-rim bg-white px-2 text-base"
              value={name}
              maxLength={80}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void add();
                }
              }}
            />
          </label>
          <button type="button" className="min-h-11 rounded-full bg-crimson px-4 font-bold text-white disabled:opacity-50" disabled={busy || name.trim().length < 2} onClick={add}>
            {t.add}
          </button>
          <button type="button" className="min-h-11 px-2 text-sm underline" onClick={() => setAdding(null)}>
            {t.cancel}
          </button>
        </div>
      )}
      {problem && (
        <p role="alert" className="text-sm font-semibold text-crimson-dark">
          {problem}
        </p>
      )}
    </div>
  );
}
