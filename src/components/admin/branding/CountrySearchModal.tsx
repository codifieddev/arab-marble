"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Search, Globe, Loader2, Check, Plus } from "lucide-react";
import { mappedLanguages } from "./languageMapping"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CountrySearchModalProps {
  onSelect: (data: { languages: any[]; currencies: any[]; countryName: string }) => void;
  trigger?: React.ReactNode;
}

export const CountrySearchModal = ({ onSelect, trigger }: CountrySearchModalProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const handleSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`https://restcountries.com/v3.1/name/${search}`);
        if (!resp.ok) throw new Error("Country not found");
        const data = await resp.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setResults([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(handleSearch, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (country: any) => {
    const languages = country.languages
      ? Object.entries(country.languages).map(([code, name]) => {
          const mappedCode = mappedLanguages[code.toLowerCase()] || code;
          return {
            code: mappedCode,
            name: name as string,
            enabled: true,
          };
        })
      : [];

    const currencies = country.currencies
      ? Object.entries(country.currencies).map(([code, info]: [string, any]) => ({
          code,
          name: info.name,
          symbol: info.symbol || code,
          enabled: true
        }))
      : [];

    onSelect({
      languages,
      currencies,
      countryName: country.name.common
    });
    setOpen(false);
    setSearch("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-12 px-8 bg-primary hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-none transition-all shadow-xl shadow-primary/20 active:scale-95">
            <Plus className="w-4 h-4" strokeWidth={3} /> Add Region
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-white border-slate-100 text-slate-900 p-0 overflow-hidden rounded-none shadow-2xl">
        <div className="p-10 bg-white border-b border-slate-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-5">
              <div className="h-14 w-14 bg-primary/5 rounded-none flex items-center justify-center text-primary shadow-inner">
                 <Globe size={28} strokeWidth={2.5} />
              </div>
              Browse <span className="text-primary">Countries</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-8 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" strokeWidth={3} />
            <Input
              placeholder="SEARCH BY COUNTRY NAME..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-12 bg-slate-50 border-slate-100 text-[11px] font-black tracking-widest focus:border-primary/50 rounded-none uppercase shadow-inner"
            />
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 gap-5 text-slate-300">
              <Loader2 className="w-8 h-8 animate-spin" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Retrieving Data...</span>
            </div>
          )}

          {!loading && results.map((country: any) => (
            <button
              key={country.cca3}
              onClick={() => handleSelect(country)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all group text-left border-2 border-transparent hover:border-primary/10 rounded-none"
            >
              <div className="flex items-center gap-5">
                <span className="text-3xl filter saturate-[0.8] group-hover:saturate-100 transition-all">{country.flag}</span>
                <div>
                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{country.name.common}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                    {country.region} • {country.subregion}
                  </p>
                </div>
              </div>
              <div className="h-8 w-8 rounded-none bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all shadow-inner">
                <Check className="w-4 h-4" strokeWidth={3} />
              </div>
            </button>
          ))}

          {!loading && search && results.length === 0 && !error && (
             <div className="p-12 text-center text-slate-300">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No results found for "{search}"</p>
             </div>
          )}

          {error && (
            <div className="p-12 text-center text-red-400">
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">System Error: {error}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-center">
            <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.3em]">
                Source: Global Country Data Index
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
